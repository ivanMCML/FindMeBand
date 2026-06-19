import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface OrganizerData {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
  initials: string;
  color: string;
}

export interface GenreOption {
  id: number;
  name: string;
}

export type OrgEventStatus = 'Open' | 'Closed' | 'Canceled';
export type OrgAppStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface OrgApplication {
  id: number;
  performerId: number;
  status: OrgAppStatus;
  message: string | null;
  appliedAt: string;
  applicantName: string;
  applicantInitials: string;
  applicantColor: string;
  applicantType: 'Musician' | 'Band';
}

export interface OrgEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  scheduledAt: string;
  status: OrgEventStatus;
  genreId: number | null;
  genreName: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  requiredPerformers: number | null;
  preferredPerformerType: string | null;
  minReviewRequired: number | null;
  applicationCount: number;
  applications: OrgApplication[];
  applicationsLoaded: boolean;
  isExpanded: boolean;
}

interface OrganizerResponse {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
}

interface EventResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  scheduledAt: string;
  status: string;
  genre: { id: number; name: string } | null;
  budgetMin: number | null;
  budgetMax: number | null;
  requiredPerformers: number | null;
  preferredPerformerType: string | null;
  minReviewRequired: number | null;
  applicationCount: number;
}

interface ApplicationResponse {
  id: number;
  performerId: number;
  message: string | null;
  status: string;
  appliedAt: string;
  applicantName: string;
  applicantType: string;
}

const API = environment.apiBaseUrl;
const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function profileColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function toInitials(firstName: string, lastName: string): string {
  return ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase();
}

function nameToInitials(name: string, type: string): string {
  if (type === 'Band') {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

@Injectable({ providedIn: 'root' })
export class OrganizerService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly organizer = signal<OrganizerData | null>(null);
  readonly events = signal<OrgEvent[]>([]);
  readonly genres = signal<GenreOption[]>([]);
  readonly loading = signal(false);
  readonly eventsLoading = signal(false);

  // Profile editing
  readonly isEditing = signal(false);
  readonly editFirstName = signal('');
  readonly editLastName = signal('');
  readonly editDescription = signal('');

  // Event form
  readonly showEventForm = signal(false);
  readonly editingEventId = signal<number | null>(null);
  readonly formTitle = signal('');
  readonly formDescription = signal('');
  readonly formLocation = signal('');
  readonly formScheduledAt = signal('');
  readonly formGenreId = signal<number | null>(null);
  readonly formBudgetMin = signal<string>('');
  readonly formBudgetMax = signal<string>('');
  readonly formRequiredPerformers = signal<string>('');
  readonly formPreferredType = signal('');
  readonly formMinReview = signal<string>('');
  readonly formLoading = signal(false);

  readonly totalEvents = computed(() => this.events().length);
  readonly openEventsCount = computed(() => this.events().filter(e => e.status === 'Open').length);
  readonly pendingAppCount = computed(() =>
    this.events().reduce((sum, e) => sum + e.applications.filter(a => a.status === 'Pending').length, 0)
  );

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user?.role === 'Organizer') {
        this.loadProfile(user.profileId);
        this.loadGenres();
      } else {
        this.organizer.set(null);
        this.events.set([]);
      }
    });
  }

  loadProfile(organizerId: number): void {
    this.loading.set(true);
    this.http.get<OrganizerResponse>(`${API}/organizer/${organizerId}`).subscribe({
      next: (org) => {
        this.organizer.set({
          id: org.id,
          firstName: org.firstName,
          lastName: org.lastName,
          userName: org.userName,
          description: org.description,
          initials: toInitials(org.firstName, org.lastName),
          color: profileColor(org.id),
        });
        this.loading.set(false);
        this.loadEvents(org.id);
      },
      error: () => this.loading.set(false)
    });
  }

  loadEvents(organizerId: number): void {
    this.eventsLoading.set(true);
    this.http.get<EventResponse[]>(`${API}/event/organizer/${organizerId}`)
      .pipe(catchError(() => of([])))
      .subscribe(events => {
        this.events.set(events.map(e => this.mapEvent(e)));
        this.eventsLoading.set(false);
      });
  }

  private mapEvent(e: EventResponse): OrgEvent {
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      location: e.location,
      scheduledAt: e.scheduledAt,
      status: e.status as OrgEventStatus,
      genreId: e.genre?.id ?? null,
      genreName: e.genre?.name ?? null,
      budgetMin: e.budgetMin,
      budgetMax: e.budgetMax,
      requiredPerformers: e.requiredPerformers,
      preferredPerformerType: e.preferredPerformerType,
      minReviewRequired: e.minReviewRequired,
      applicationCount: e.applicationCount,
      applications: [],
      applicationsLoaded: false,
      isExpanded: false,
    };
  }

  loadApplications(eventId: number): void {
    this.http.get<ApplicationResponse[]>(`${API}/eventapplication/event/${eventId}`)
      .pipe(catchError(() => of([])))
      .subscribe(apps => {
        this.events.update(events =>
          events.map(e => e.id !== eventId ? e : {
            ...e,
            applications: apps.map(a => ({
              id: a.id,
              performerId: a.performerId,
              status: a.status as OrgAppStatus,
              message: a.message ?? null,
              appliedAt: a.appliedAt,
              applicantName: a.applicantName,
              applicantInitials: nameToInitials(a.applicantName, a.applicantType),
              applicantColor: profileColor(a.performerId),
              applicantType: a.applicantType as 'Musician' | 'Band',
            })),
            applicationsLoaded: true,
          })
        );
      });
  }

  toggleExpand(eventId: number): void {
    this.events.update(events =>
      events.map(e => {
        if (e.id !== eventId) return e;
        const willExpand = !e.isExpanded;
        if (willExpand && !e.applicationsLoaded) {
          this.loadApplications(eventId);
        }
        return { ...e, isExpanded: willExpand };
      })
    );
  }

  openCreateForm(): void {
    this.editingEventId.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    this.formLocation.set('');
    this.formScheduledAt.set('');
    this.formGenreId.set(null);
    this.formBudgetMin.set('');
    this.formBudgetMax.set('');
    this.formRequiredPerformers.set('');
    this.formPreferredType.set('');
    this.formMinReview.set('');
    this.showEventForm.set(true);
  }

  openEditForm(event: OrgEvent): void {
    this.editingEventId.set(event.id);
    this.formTitle.set(event.title);
    this.formDescription.set(event.description);
    this.formLocation.set(event.location);
    this.formScheduledAt.set(event.scheduledAt.slice(0, 16));
    this.formGenreId.set(event.genreId);
    this.formBudgetMin.set(event.budgetMin?.toString() ?? '');
    this.formBudgetMax.set(event.budgetMax?.toString() ?? '');
    this.formRequiredPerformers.set(event.requiredPerformers?.toString() ?? '');
    this.formPreferredType.set(event.preferredPerformerType ?? '');
    this.formMinReview.set(event.minReviewRequired?.toString() ?? '');
    this.showEventForm.set(true);
  }

  closeForm(): void {
    this.showEventForm.set(false);
  }

  submitForm(): void {
    const org = this.organizer();
    if (!org) return;
    const title = this.formTitle().trim();
    const description = this.formDescription().trim();
    const location = this.formLocation().trim();
    const scheduledAt = this.formScheduledAt();
    if (!title || !description || !location || !scheduledAt) return;

    const budgetMin = this.formBudgetMin() ? parseFloat(this.formBudgetMin()) : null;
    const budgetMax = this.formBudgetMax() ? parseFloat(this.formBudgetMax()) : null;
    const requiredPerformers = this.formRequiredPerformers() ? parseInt(this.formRequiredPerformers()) : null;
    const minReviewRequired = this.formMinReview() ? parseInt(this.formMinReview()) : null;
    const preferredPerformerType = this.formPreferredType() || null;
    const genreId = this.formGenreId();

    this.formLoading.set(true);
    const editId = this.editingEventId();

    if (editId !== null) {
      const payload = {
        scheduledAt: new Date(scheduledAt).toISOString(),
        title, description, location,
        latitude: 0, longitude: 0,
        genreId, budgetMin, budgetMax,
        requiredPerformers, preferredPerformerType, minReviewRequired,
      };
      this.http.put(`${API}/event/${editId}`, payload).subscribe({
        next: () => {
          this.events.update(events =>
            events.map(e => e.id !== editId ? e : {
              ...e, title, description, location,
              scheduledAt: payload.scheduledAt,
              genreId,
              genreName: this.genres().find(g => g.id === genreId)?.name ?? null,
              budgetMin, budgetMax, requiredPerformers, preferredPerformerType, minReviewRequired,
            })
          );
          this.showEventForm.set(false);
          this.formLoading.set(false);
        },
        error: () => this.formLoading.set(false)
      });
    } else {
      const payload = {
        organizerId: org.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        title, description, location,
        latitude: 0, longitude: 0,
        genreId, budgetMin, budgetMax,
        requiredPerformers, preferredPerformerType, minReviewRequired,
      };
      this.http.post<EventResponse>(`${API}/event`, payload).subscribe({
        next: (created) => {
          this.events.update(events => [this.mapEvent(created), ...events]);
          this.showEventForm.set(false);
          this.formLoading.set(false);
        },
        error: () => this.formLoading.set(false)
      });
    }
  }

  deleteEvent(eventId: number): void {
    this.http.delete(`${API}/event/${eventId}`).subscribe({
      next: () => this.events.update(events => events.filter(e => e.id !== eventId))
    });
  }

  updateEventStatus(eventId: number, status: OrgEventStatus): void {
    this.http.patch(`${API}/event/${eventId}/status`, { status }).subscribe({
      next: () => {
        this.events.update(events =>
          events.map(e => e.id !== eventId ? e : { ...e, status })
        );
      }
    });
  }

  updateApplicationStatus(eventId: number, appId: number, status: OrgAppStatus): void {
    this.http.patch(`${API}/eventapplication/${appId}/status`, { status }).subscribe({
      next: () => {
        this.events.update(events =>
          events.map(e => e.id !== eventId ? e : {
            ...e,
            applications: e.applications.map(a =>
              a.id !== appId ? a : { ...a, status }
            )
          })
        );
      }
    });
  }

  startEditing(): void {
    const org = this.organizer();
    if (!org) return;
    this.editFirstName.set(org.firstName);
    this.editLastName.set(org.lastName);
    this.editDescription.set(org.description);
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  saveEditing(): void {
    const org = this.organizer();
    if (!org) return;
    const firstName = this.editFirstName().trim();
    const lastName = this.editLastName().trim();
    const description = this.editDescription().trim();
    if (!firstName || !lastName) return;

    this.http.put(`${API}/organizer/${org.id}`, {
      firstName, lastName, userName: org.userName, description
    }).subscribe({
      next: () => {
        this.organizer.update(o => o ? {
          ...o, firstName, lastName, description,
          initials: toInitials(firstName, lastName)
        } : null);
        this.isEditing.set(false);
      }
    });
  }

  private loadGenres(): void {
    this.http.get<GenreOption[]>(`${API}/genre`)
      .pipe(catchError(() => of([])))
      .subscribe(genres => this.genres.set(genres));
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const months = ['sij.', 'velj.', 'ožu.', 'tra.', 'svi.', 'lip.', 'srp.', 'kol.', 'ruj.', 'lis.', 'stu.', 'pro.'];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}.`;
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    const months = ['sij.', 'velj.', 'ožu.', 'tra.', 'svi.', 'lip.', 'srp.', 'kol.', 'ruj.', 'lis.', 'stu.', 'pro.'];
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()} u ${h}:${m}`;
  }

  formatBudget(min: number | null, max: number | null): string {
    if (min === null && max === null) return 'Dogovor';
    if (min !== null && max !== null) return `${min.toLocaleString('hr-HR')} – ${max.toLocaleString('hr-HR')} €`;
    if (min !== null) return `od ${min.toLocaleString('hr-HR')} €`;
    return `do ${max!.toLocaleString('hr-HR')} €`;
  }

  statusLabel(status: OrgEventStatus): string {
    const map: Record<OrgEventStatus, string> = { Open: 'Otvoreno', Closed: 'Zatvoreno', Canceled: 'Otkazano' };
    return map[status] ?? status;
  }

  appStatusLabel(status: OrgAppStatus): string {
    const map: Record<OrgAppStatus, string> = { Pending: 'Na čekanju', Accepted: 'Prihvaćeno', Rejected: 'Odbijeno' };
    return map[status] ?? status;
  }

  performerTypeLabel(type: string | null): string {
    if (!type) return '';
    const map: Record<string, string> = { Musician: 'Muzičar', Band: 'Bend' };
    return map[type] ?? type;
  }
}
