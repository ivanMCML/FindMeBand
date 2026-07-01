import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { EventFilterService } from './event-filter.service';

export interface BandOption {
  bandId: number;
  bandName: string;
  bandPerformerId: number;
}

export interface BandEventApplication {
  bandId: number;
  bandName: string;
  bandPerformerId: number;
  applicationId: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

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
  bandApplications: BandEventApplication[];
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

interface MusicianBandInResponse {
  bandId: number;
  bandPerformerId: number | null;
  bandName: string;
  role: string;
}

interface MusicianResponse {
  performerId: number | null;
  bands: MusicianBandInResponse[];
}

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function orgColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function toInitials(first: string, last: string): string {
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
}

const API = environment.apiBaseUrl;
const PAGE_SIZE = 20;

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private filterService = inject(EventFilterService);

  readonly events = signal<MusicianEvent[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly bandOptions = signal<BandOption[]>([]);
  readonly hasMore = signal(false);
  readonly loadingMore = signal(false);

  private readonly _performerId = signal<number | null>(null);
  readonly performerId = this._performerId.asReadonly();
  private readonly _page = signal(1);
  private _appliedMap = new Map<number, { id: number; status: string }>();
  private _bandAppsMap = new Map<number, BandEventApplication[]>();

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
        this.bandOptions.set([]);
      }
    });
  }

  load(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      events: this.http.get<EventResponse[]>(`${API}/event?pageSize=${PAGE_SIZE}`),
      musician: this.http.get<MusicianResponse>(`${API}/musician/${user.profileId}`).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ events, musician }) => {
        const pid = musician?.performerId ?? null;
        this._performerId.set(pid);

        const adminBands = (musician?.bands ?? [])
          .filter(b => b.role === 'Admin' && b.bandPerformerId !== null)
          .map(b => ({ bandId: b.bandId, bandName: b.bandName, bandPerformerId: b.bandPerformerId! }));
        this.bandOptions.set(adminBands);

        const appRequests: Record<string, Observable<MyApplicationResponse[]>> = {};
        if (pid !== null) {
          appRequests['personal'] = this.http
            .get<MyApplicationResponse[]>(`${API}/eventapplication/performer/${pid}`)
            .pipe(catchError(() => of([])));
        }
        for (const band of adminBands) {
          appRequests[`band_${band.bandPerformerId}`] = this.http
            .get<MyApplicationResponse[]>(`${API}/eventapplication/performer/${band.bandPerformerId}`)
            .pipe(catchError(() => of([])));
        }

        if (Object.keys(appRequests).length === 0) {
          this._appliedMap = new Map();
          this._bandAppsMap = new Map();
          this.events.set(events.map(e => this.toEvent(e, new Map(), new Map())));
          this._page.set(1);
          this.hasMore.set(events.length === PAGE_SIZE);
          this.loading.set(false);
          return;
        }

        forkJoin(appRequests).subscribe(results => {
          const personalApps: MyApplicationResponse[] = pid !== null ? (results['personal'] ?? []) : [];
          const appliedMap = new Map(personalApps.map(a => [a.eventId, { id: a.id, status: a.status }]));

          const bandAppsMap = new Map<number, BandEventApplication[]>();
          for (const band of adminBands) {
            const bandApps: MyApplicationResponse[] = results[`band_${band.bandPerformerId}`] ?? [];
            for (const app of bandApps) {
              if (!bandAppsMap.has(app.eventId)) bandAppsMap.set(app.eventId, []);
              bandAppsMap.get(app.eventId)!.push({
                bandId: band.bandId,
                bandName: band.bandName,
                bandPerformerId: band.bandPerformerId,
                applicationId: app.id,
                status: app.status as 'Pending' | 'Accepted' | 'Rejected',
              });
            }
          }

          this._appliedMap = appliedMap;
          this._bandAppsMap = bandAppsMap;
          this.events.set(events.map(e => this.toEvent(e, appliedMap, bandAppsMap)));
          this._page.set(1);
          this.hasMore.set(events.length === PAGE_SIZE);
          this.loading.set(false);
        });
      },
      error: () => {
        this.error.set('Greška pri učitavanju događaja.');
        this.loading.set(false);
      }
    });
  }

  loadMore(): void {
    if (this.loadingMore()) return;
    const nextPage = this._page() + 1;
    this.loadingMore.set(true);
    this.http.get<EventResponse[]>(`${API}/event?page=${nextPage}&pageSize=${PAGE_SIZE}`)
      .pipe(catchError(() => of([])))
      .subscribe(newEvents => {
        this.events.update(existing => [
          ...existing,
          ...newEvents.map(e => this.toEvent(e, this._appliedMap, this._bandAppsMap)),
        ]);
        this._page.set(nextPage);
        this.hasMore.set(newEvents.length === PAGE_SIZE);
        this.loadingMore.set(false);
      });
  }

  readonly applyError = signal<string | null>(null);

  applyToEvent(eventId: number, performerId: number): void {
    this.applyError.set(null);
    this.http.post<{ id: number; eventId: number }>(`${API}/eventapplication`, {
      eventId,
      performerId,
      message: null,
    }).subscribe({
      next: (res) => {
        if (performerId === this._performerId()) {
          this.events.update(evts =>
            evts.map(e => e.id === eventId
              ? { ...e, isApplied: true, myApplicationId: res.id, myApplicationStatus: 'Pending', applicationCount: e.applicationCount + 1 }
              : e
            )
          );
        } else {
          const band = this.bandOptions().find(b => b.bandPerformerId === performerId);
          if (band) {
            const newApp: BandEventApplication = {
              bandId: band.bandId,
              bandName: band.bandName,
              bandPerformerId: band.bandPerformerId,
              applicationId: res.id,
              status: 'Pending',
            };
            this.events.update(evts =>
              evts.map(e => e.id === eventId
                ? { ...e, bandApplications: [...e.bandApplications, newApp], applicationCount: e.applicationCount + 1 }
                : e
              )
            );
          }
        }
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.error ?? 'Greška pri prijavi na događaj.';
        this.applyError.set(typeof msg === 'string' ? msg : 'Greška pri prijavi na događaj.');
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

  withdrawBandApplication(eventId: number, applicationId: number): void {
    this.http.delete(`${API}/eventapplication/${applicationId}`)
      .subscribe({
        next: () => {
          this.events.update(evts =>
            evts.map(e => {
              if (e.id !== eventId) return e;
              return {
                ...e,
                bandApplications: e.bandApplications.filter(a => a.applicationId !== applicationId),
                applicationCount: Math.max(0, e.applicationCount - 1),
              };
            })
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

  private toEvent(
    e: EventResponse,
    appliedMap: Map<number, { id: number; status: string }>,
    bandAppsMap: Map<number, BandEventApplication[]>
  ): MusicianEvent {
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
      bandApplications: bandAppsMap.get(e.id) ?? [],
    };
  }
}
