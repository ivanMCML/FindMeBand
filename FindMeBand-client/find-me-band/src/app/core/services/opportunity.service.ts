import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { OpportunityFilterService } from './opportunity-filter.service';

export interface Opportunity {
  id: number;
  authorId: number;
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
}

interface MusicianResponse {
  performerId: number | null;
}

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function authorColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function toInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const API = environment.apiBaseUrl;

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

  private readonly _performerId = signal<number | null>(null);
  readonly performerId = this._performerId.asReadonly();

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
      }
    });
  }

  load(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      opportunities: this.http.get<OpportunityResponse[]>(`${API}/opportunity`),
      genres: this.http.get<OpportunityGenreOption[]>(`${API}/genre`),
      instruments: this.http.get<OpportunityInstrumentOption[]>(`${API}/instrument`),
      musician: this.http.get<MusicianResponse>(`${API}/musician/${user.profileId}`).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ opportunities, genres, instruments, musician }) => {
        this.genreOptions.set(genres);
        this.instrumentOptions.set(instruments);

        const pid = musician?.performerId ?? null;
        this._performerId.set(pid);

        if (pid !== null) {
          this.http.get<MyApplicationResponse[]>(`${API}/opportunityapplication/performer/${pid}`)
            .pipe(catchError(() => of([])))
            .subscribe(myApps => {
              const appliedMap = new Map(myApps.map(a => [a.opportunityId, a.id]));
              this.opportunities.set(opportunities.map(o => this.toOpportunity(o, appliedMap)));
              this.loading.set(false);
            });
        } else {
          this.opportunities.set(opportunities.map(o => this.toOpportunity(o, new Map())));
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Greška pri učitavanju oglasa.');
        this.loading.set(false);
      }
    });
  }

  applyToOpportunity(opportunityId: number): void {
    const pid = this._performerId();
    if (pid === null) return;

    this.http.post<{ id: number; opportunityId: number }>(`${API}/opportunityapplication`, {
      opportunityId,
      applicantId: pid,
      message: null,
    }).subscribe({
      next: (res) => {
        this.opportunities.update(opps =>
          opps.map(o => o.id === opportunityId
            ? { ...o, isApplied: true, myApplicationId: res.id, applicationCount: o.applicationCount + 1 }
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
              ? { ...o, isApplied: false, myApplicationId: null, applicationCount: Math.max(0, o.applicationCount - 1) }
              : o
            )
          );
        }
      });
  }

  createOpportunity(
    type: string,
    description: string,
    genreId: number | null,
    instrumentId: number | null,
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

  private toOpportunity(o: OpportunityResponse, appliedMap: Map<number, number>): Opportunity {
    const name = o.authorName ?? 'Nepoznat';
    return {
      id: o.id,
      authorId: o.authorId,
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
      isApplied: appliedMap.has(o.id),
      myApplicationId: appliedMap.get(o.id) ?? null,
    };
  }
}
