import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { OpportunityFilterService } from './opportunity-filter.service';

export interface Opportunity {
  id: number;
  authorId: number;
  authorProfileId: number;
  authorName: string;
  authorUserName: string;
  authorType: 'musician' | 'band';
  authorInitials: string;
  authorColor: string;
  type: 'SeekingMusician' | 'SeekingBand' | 'SeekingCollaboration';
  description: string | null;
  genre: { id: number; name: string } | null;
  instrument: { id: number; name: string; type: string } | null;
  applicationCount: number;
  createdAt: string;
  isApplied: boolean;
  myApplicationId: number | null;
  myApplicationStatus: 'Pending' | 'Accepted' | 'Rejected' | null;
}

export interface OppApplication {
  id: number;
  performerId: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  message: string | null;
  appliedAt: string;
  applicantName: string;
  applicantInitials: string;
  applicantColor: string;
  applicantType: 'Musician' | 'Band';
}

export interface BandOption {
  bandId: number;
  bandName: string;
  bandPerformerId: number;
}

export interface OpportunityGenreOption {
  id: number;
  name: string;
}

export interface OpportunityInstrumentOption {
  id: number;
  name: string;
  type: string;
}

interface OpportunityResponse {
  id: number;
  authorId: number;
  authorProfileId: number;
  authorName: string | null;
  authorUserName: string | null;
  authorType: string;
  type: string;
  description: string | null;
  genre: { id: number; name: string } | null;
  instrument: { id: number; name: string; type: string } | null;
  applicationCount: number;
  createdAt: string;
}

interface MyApplicationResponse {
  id: number;
  opportunityId: number;
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

interface OppAppRaw {
  id: number;
  opportunityId: number;
  applicantId: number;
  status: string;
  message: string | null;
  appliedAt: string;
  applicantName: string;
  applicantType: 'Musician' | 'Band';
}

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function authorColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function toInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
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

const API = environment.apiBaseUrl;
const PAGE_SIZE = 20;

@Injectable({ providedIn: 'root' })
export class OpportunityService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private filterService = inject(OpportunityFilterService);

  readonly opportunities = signal<Opportunity[]>([]);
  readonly genreOptions = signal<OpportunityGenreOption[]>([]);
  readonly instrumentOptions = signal<OpportunityInstrumentOption[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly authoredApplications = signal<Map<number, OppApplication[]>>(new Map());
  readonly authoredAppLoading = signal(false);
  readonly bandOptions = signal<BandOption[]>([]);
  readonly hasMore = signal(false);
  readonly loadingMore = signal(false);

  private readonly _performerId = signal<number | null>(null);
  readonly performerId = this._performerId.asReadonly();
  private readonly _page = signal(1);
  private _appliedMap = new Map<number, { id: number; status: string }>();

  readonly myOpportunities = computed(() => {
    const pid = this._performerId();
    const bandPids = new Set(this.bandOptions().map(b => b.bandPerformerId));
    return this.opportunities().filter(o =>
      (pid !== null && o.authorId === pid) || bandPids.has(o.authorId)
    );
  });

  readonly filteredOpportunities = computed(() => {
    const type = this.filterService.type();
    const genre = this.filterService.genre();
    const instrument = this.filterService.instrument();
    const sortBy = this.filterService.sortBy();

    let result = [...this.opportunities()];

    if (type !== 'all') result = result.filter(o => o.type === type);
    if (genre !== 'all') result = result.filter(o => o.genre?.name === genre);
    if (instrument !== 'all') result = result.filter(o => o.instrument?.name === instrument);

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'most-applied') return b.applicationCount - a.applicationCount;
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
        this.opportunities.set([]);
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
      opportunities: this.http.get<OpportunityResponse[]>(`${API}/opportunity?pageSize=${PAGE_SIZE}`),
      genres: this.http.get<OpportunityGenreOption[]>(`${API}/genre`),
      instruments: this.http.get<OpportunityInstrumentOption[]>(`${API}/instrument`),
      musician: this.http.get<MusicianResponse>(`${API}/musician/${user.profileId}`).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ opportunities, genres, instruments, musician }) => {
        this.genreOptions.set(genres);
        this.instrumentOptions.set(instruments);

        const pid = musician?.performerId ?? null;
        this._performerId.set(pid);

        const adminBands = (musician?.bands ?? [])
          .filter(b => b.role === 'Admin' && b.bandPerformerId !== null)
          .map(b => ({ bandId: b.bandId, bandName: b.bandName, bandPerformerId: b.bandPerformerId! }));
        this.bandOptions.set(adminBands);

        const appRequests: Record<string, Observable<MyApplicationResponse[]>> = {};
        if (pid !== null) {
          appRequests['personal'] = this.http
            .get<MyApplicationResponse[]>(`${API}/opportunityapplication/performer/${pid}`)
            .pipe(catchError(() => of([])));
        }
        for (const band of adminBands) {
          appRequests[`band_${band.bandPerformerId}`] = this.http
            .get<MyApplicationResponse[]>(`${API}/opportunityapplication/performer/${band.bandPerformerId}`)
            .pipe(catchError(() => of([])));
        }

        if (Object.keys(appRequests).length === 0) {
          this._appliedMap = new Map();
          this.opportunities.set(opportunities.map(o => this.toOpportunity(o, new Map())));
          this._page.set(1);
          this.hasMore.set(opportunities.length === PAGE_SIZE);
          this.loading.set(false);
          return;
        }

        forkJoin(appRequests).subscribe(results => {
          const appliedMap = new Map<number, { id: number; status: string }>();

          if (pid !== null) {
            const personal: MyApplicationResponse[] = results['personal'] ?? [];
            for (const a of personal) appliedMap.set(a.opportunityId, { id: a.id, status: a.status });
          }
          for (const band of adminBands) {
            const bandApps: MyApplicationResponse[] = results[`band_${band.bandPerformerId}`] ?? [];
            for (const a of bandApps) {
              if (!appliedMap.has(a.opportunityId)) {
                appliedMap.set(a.opportunityId, { id: a.id, status: a.status });
              }
            }
          }

          this._appliedMap = appliedMap;
          this.opportunities.set(opportunities.map(o => this.toOpportunity(o, appliedMap)));
          this._page.set(1);
          this.hasMore.set(opportunities.length === PAGE_SIZE);
          this.loading.set(false);
        });
      },
      error: () => {
        this.error.set('Greška pri učitavanju oglasa.');
        this.loading.set(false);
      }
    });
  }

  loadAuthoredApplications(): void {
    const authored = this.myOpportunities();
    this.authoredApplications.set(new Map());
    if (authored.length === 0) return;

    this.authoredAppLoading.set(true);
    const requests: Record<string, Observable<OppAppRaw[]>> = {};
    for (const opp of authored) {
      requests[String(opp.id)] = this.http
        .get<OppAppRaw[]>(`${API}/opportunityapplication/opportunity/${opp.id}`)
        .pipe(catchError(() => of([])));
    }

    forkJoin(requests).subscribe(results => {
      const map = new Map<number, OppApplication[]>();
      for (const [key, apps] of Object.entries(results)) {
        map.set(Number(key), apps.map(a => this.toOppApplication(a)));
      }
      this.authoredApplications.set(map);
      this.authoredAppLoading.set(false);
    });
  }

  loadMore(): void {
    if (this.loadingMore()) return;
    const nextPage = this._page() + 1;
    this.loadingMore.set(true);
    this.http.get<OpportunityResponse[]>(`${API}/opportunity?page=${nextPage}&pageSize=${PAGE_SIZE}`)
      .pipe(catchError(() => of([])))
      .subscribe(opps => {
        this.opportunities.update(existing => [
          ...existing,
          ...opps.map(o => this.toOpportunity(o, this._appliedMap)),
        ]);
        this._page.set(nextPage);
        this.hasMore.set(opps.length === PAGE_SIZE);
        this.loadingMore.set(false);
      });
  }

  applyToOpportunity(opportunityId: number, performerId?: number): void {
    const pid = performerId ?? this._performerId();
    if (pid === null) return;

    this.http.post<{ id: number; opportunityId: number; status: string }>(`${API}/opportunityapplication`, {
      opportunityId,
      applicantId: pid,
      message: null,
    }).subscribe({
      next: (res) => {
        this.opportunities.update(opps =>
          opps.map(o => o.id === opportunityId
            ? { ...o, isApplied: true, myApplicationId: res.id, myApplicationStatus: 'Pending', applicationCount: o.applicationCount + 1 }
            : o
          )
        );
      }
    });
  }

  withdrawApplication(opportunityId: number, applicationId: number): void {
    this.http.delete(`${API}/opportunityapplication/${applicationId}`)
      .subscribe({
        next: () => {
          this.opportunities.update(opps =>
            opps.map(o => o.id === opportunityId
              ? { ...o, isApplied: false, myApplicationId: null, myApplicationStatus: null, applicationCount: Math.max(0, o.applicationCount - 1) }
              : o
            )
          );
        }
      });
  }

  updateOppApplicationStatus(appId: number, oppId: number, status: 'Accepted' | 'Rejected'): void {
    const statusValue = status === 'Accepted' ? 1 : 2;
    this.http.patch(`${API}/opportunityapplication/${appId}/status`, { status: statusValue })
      .subscribe({
        next: () => {
          this.authoredApplications.update(map => {
            const updated = new Map(map);
            const apps = (updated.get(oppId) ?? []).map(a =>
              a.id === appId ? { ...a, status } : a
            );
            updated.set(oppId, apps);
            return updated;
          });
        }
      });
  }

  createOpportunity(
    type: string,
    description: string,
    genreId: number | null,
    instrumentId: number | null,
    authorPerformerId: number | null,
    onSuccess: () => void
  ): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.submitting.set(true);

    const doCreate = (pid: number) => {
      this.http.post<OpportunityResponse>(`${API}/opportunity`, {
        authorId: pid,
        type,
        description,
        genreId: genreId || null,
        instrumentId: instrumentId || null,
      }).subscribe({
        next: (created) => {
          this.opportunities.update(opps => [this.toOpportunity(created, new Map()), ...opps]);
          this.submitting.set(false);
          onSuccess();
        },
        error: () => this.submitting.set(false)
      });
    };

    if (authorPerformerId !== null) {
      doCreate(authorPerformerId);
      return;
    }

    const pid = this._performerId();
    if (pid !== null) {
      doCreate(pid);
    } else {
      this.http.post<{ performerId: number }>(`${API}/musician/${user.profileId}/performer`, {})
        .subscribe({
          next: (res) => {
            this._performerId.set(res.performerId);
            doCreate(res.performerId);
          },
          error: () => this.submitting.set(false)
        });
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime()) || date.getFullYear() < 2020) return '';
    const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'danas';
    if (diff === 1) return 'jučer';
    return `${diff}d`;
  }

  private toOppApplication(a: OppAppRaw): OppApplication {
    const name = a.applicantName ?? 'Nepoznat';
    const type = a.applicantType ?? 'Musician';
    return {
      id: a.id,
      performerId: a.applicantId,
      status: a.status as 'Pending' | 'Accepted' | 'Rejected',
      message: a.message ?? null,
      appliedAt: a.appliedAt,
      applicantName: name,
      applicantInitials: nameToInitials(name, type),
      applicantColor: PALETTE[Math.abs(a.applicantId) % PALETTE.length],
      applicantType: type,
    };
  }

  private toOpportunity(o: OpportunityResponse, appliedMap: Map<number, { id: number; status: string }>): Opportunity {
    const name = o.authorName ?? 'Nepoznat';
    const app = appliedMap.get(o.id) ?? null;
    return {
      id: o.id,
      authorId: o.authorId,
      authorProfileId: o.authorProfileId,
      authorName: name,
      authorUserName: o.authorUserName ?? '',
      authorType: o.authorType === 'band' ? 'band' : 'musician',
      authorInitials: toInitials(name),
      authorColor: authorColor(o.authorId),
      type: o.type as Opportunity['type'],
      description: o.description,
      genre: o.genre,
      instrument: o.instrument,
      applicationCount: o.applicationCount,
      createdAt: o.createdAt,
      isApplied: app !== null,
      myApplicationId: app?.id ?? null,
      myApplicationStatus: (app?.status ?? null) as 'Pending' | 'Accepted' | 'Rejected' | null,
    };
  }
}
