import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { EventFilterService } from './event-filter.service';

export interface MusicianEvent {
  id: number;
  organizerId: number;
  organizerName: string;
  organizerUserName: string;
  organizerInitials: string;
  organizerColor: string;
  title: string;
  description: string;
  genre: { id: number; name: string } | null;
  location: string;
  budgetMin: number | null;
  budgetMax: number | null;
  scheduledAt: string;
  createdAt: string;
  status: string;
  requiredPerformers: number | null;
  preferredPerformerType: string | null;
  minReviewRequired: number | null;
  applicationCount: number;
  isApplied: boolean;
  myApplicationId: number | null;
  myApplicationStatus: 'Pending' | 'Accepted' | 'Rejected' | null;
}

interface EventResponse {
  id: number;
  organizerId: number;
  organizerFirstName: string;
  organizerLastName: string;
  organizerUserName: string;
  title: string;
  description: string;
  genre: { id: number; name: string } | null;
  location: string;
  budgetMin: number | null;
  budgetMax: number | null;
  scheduledAt: string;
  createdAt: string;
  status: string;
  requiredPerformers: number | null;
  preferredPerformerType: string | null;
  minReviewRequired: number | null;
  applicationCount: number;
}

interface MyApplicationResponse {
  id: number;
  eventId: number;
  status: string;
}

interface MusicianResponse {
  performerId: number | null;
}

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function orgColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function toInitials(first: string, last: string): string {
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
}

const API = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private filterService = inject(EventFilterService);

  readonly events = signal<MusicianEvent[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly _performerId = signal<number | null>(null);
  readonly performerId = this._performerId.asReadonly();

  readonly filteredEvents = computed(() => {
    const status = this.filterService.status();
    const genre = this.filterService.genre();
    const type = this.filterService.performerType();
    const sortBy = this.filterService.sortBy();

    let result = [...this.events()];

    if (status !== 'all') result = result.filter(e => e.status === status);
    if (genre !== 'all') result = result.filter(e => e.genre?.name === genre);
    if (type !== 'all') result = result.filter(e =>
      e.preferredPerformerType === type || e.preferredPerformerType === 'Any'
    );

    result.sort((a, b) => {
      if (sortBy === 'soonest') return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'budget-high') return (b.budgetMax ?? b.budgetMin ?? 0) - (a.budgetMax ?? a.budgetMin ?? 0);
      if (sortBy === 'budget-low') return (a.budgetMin ?? 0) - (b.budgetMin ?? 0);
      return 0;
    });

    return result;
  });

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.load();
      } else {
        this.events.set([]);
        this._performerId.set(null);
      }
    });
  }

  load(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      events: this.http.get<EventResponse[]>(`${API}/event`),
      musician: this.http.get<MusicianResponse>(`${API}/musician/${user.profileId}`).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ events, musician }) => {
        const pid = musician?.performerId ?? null;
        this._performerId.set(pid);

        if (pid !== null) {
          this.http.get<MyApplicationResponse[]>(`${API}/eventapplication/performer/${pid}`)
            .pipe(catchError(() => of([])))
            .subscribe(myApps => {
              const appliedMap = new Map(myApps.map(a => [a.eventId, { id: a.id, status: a.status }]));
              this.events.set(events.map(e => this.toEvent(e, appliedMap)));
              this.loading.set(false);
            });
        } else {
          this.events.set(events.map(e => this.toEvent(e, new Map<number, { id: number; status: string }>())));
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Greška pri učitavanju događaja.');
        this.loading.set(false);
      }
    });
  }

  applyToEvent(eventId: number): void {
    const pid = this._performerId();
    if (pid === null) return;

    this.http.post<{ id: number; eventId: number }>(`${API}/eventapplication`, {
      eventId,
      performerId: pid,
      message: null,
    }).subscribe({
      next: (res) => {
        this.events.update(evts =>
          evts.map(e => e.id === eventId
            ? { ...e, isApplied: true, myApplicationId: res.id, myApplicationStatus: 'Pending', applicationCount: e.applicationCount + 1 }
            : e
          )
        );
      }
    });
  }

  withdrawApplication(eventId: number, applicationId: number): void {
    this.http.delete(`${API}/eventapplication/${applicationId}`)
      .subscribe({
        next: () => {
          this.events.update(evts =>
            evts.map(e => e.id === eventId
              ? { ...e, isApplied: false, myApplicationId: null, myApplicationStatus: null, applicationCount: Math.max(0, e.applicationCount - 1) }
              : e
            )
          );
        }
      });
  }

  formatEventDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const months = ['sij.', 'velj.', 'ožu.', 'tra.', 'svi.', 'lip.', 'srp.', 'kol.', 'ruj.', 'lis.', 'stu.', 'pro.'];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}.`;
  }

  formatBudget(min: number | null, max: number | null): string {
    if (!min && !max) return 'Dogovor';
    if (min && max) return `${min.toLocaleString()} – ${max.toLocaleString()} €`;
    if (min) return `od ${min.toLocaleString()} €`;
    if (max) return `do ${max.toLocaleString()} €`;
    return 'Dogovor';
  }

  formatPerformerType(type: string | null): string {
    if (type === 'Musician') return 'Muzičar';
    if (type === 'Band') return 'Bend';
    if (type === 'Any') return 'Svi';
    return '';
  }

  statusLabel(status: string): string {
    if (status === 'Open') return 'Otvoreno';
    if (status === 'Closed') return 'Zatvoreno';
    if (status === 'Canceled') return 'Otkazano';
    return status;
  }

  myAppStatusLabel(status: string | null): string {
    if (status === 'Pending') return 'Na čekanju';
    if (status === 'Accepted') return 'Prihvaćeno';
    if (status === 'Rejected') return 'Odbijeno';
    return '';
  }

  private toEvent(e: EventResponse, appliedMap: Map<number, { id: number; status: string }>): MusicianEvent {
    const myApp = appliedMap.get(e.id) ?? null;
    return {
      id: e.id,
      organizerId: e.organizerId,
      organizerName: `${e.organizerFirstName} ${e.organizerLastName}`,
      organizerUserName: e.organizerUserName,
      organizerInitials: toInitials(e.organizerFirstName, e.organizerLastName),
      organizerColor: orgColor(e.organizerId),
      title: e.title,
      description: e.description,
      genre: e.genre,
      location: e.location,
      budgetMin: e.budgetMin,
      budgetMax: e.budgetMax,
      scheduledAt: e.scheduledAt,
      createdAt: e.createdAt,
      status: e.status,
      requiredPerformers: e.requiredPerformers,
      preferredPerformerType: e.preferredPerformerType,
      minReviewRequired: e.minReviewRequired,
      applicationCount: e.applicationCount,
      isApplied: myApp !== null,
      myApplicationId: myApp?.id ?? null,
      myApplicationStatus: (myApp?.status ?? null) as 'Pending' | 'Accepted' | 'Rejected' | null,
    };
  }
}
