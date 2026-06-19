import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ExploreTab = 'musicians' | 'bands';

export interface ExploreMusician {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
  initials: string;
  color: string;
  averageRating: number;
  numberOfReviews: number;
  genres: { id: number; name: string }[];
  instruments: { id: number; name: string }[];
}

export interface ExploreBand {
  id: number;
  name: string;
  description: string;
  initials: string;
  color: string;
  averageRating: number;
  numberOfReviews: number;
  memberCount: number;
  genres: { id: number; name: string }[];
}

export interface FilterOption {
  id: number;
  name: string;
}

interface MusicianResp {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
  averageRating: number | null;
  numberOfReviews: number | null;
  genres: { id: number; name: string }[];
  instruments: { id: number; name: string }[];
}

interface BandResp {
  id: number;
  name: string;
  description: string;
  averageRating: number | null;
  numberOfReviews: number | null;
  genres: { id: number; name: string }[];
  members: unknown[];
}

const API = environment.apiBaseUrl;
const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function profileColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function bandColor(id: number): string {
  return PALETTE[Math.abs(id + 1000) % PALETTE.length];
}

@Injectable({ providedIn: 'root' })
export class ExploreService {
  private http = inject(HttpClient);

  readonly loading = signal(false);
  readonly activeTab = signal<ExploreTab>('musicians');
  readonly searchQuery = signal('');
  readonly selectedGenre = signal('');
  readonly selectedInstrument = signal('');

  readonly genres = signal<FilterOption[]>([]);
  readonly instruments = signal<FilterOption[]>([]);

  private readonly _musicians = signal<ExploreMusician[]>([]);
  private readonly _bands = signal<ExploreBand[]>([]);

  readonly filteredMusicians = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const genre = this.selectedGenre();
    const instr = this.selectedInstrument();

    return this._musicians().filter(m => {
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      if (q && !fullName.includes(q) && !m.userName.toLowerCase().includes(q)) return false;
      if (genre && !m.genres.some(g => g.name === genre)) return false;
      if (instr && !m.instruments.some(i => i.name === instr)) return false;
      return true;
    });
  });

  readonly filteredBands = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const genre = this.selectedGenre();

    return this._bands().filter(b => {
      if (q && !b.name.toLowerCase().includes(q)) return false;
      if (genre && !b.genres.some(g => g.name === genre)) return false;
      return true;
    });
  });

  load(): void {
    this.loading.set(true);
    forkJoin({
      musicians: this.http.get<MusicianResp[]>(`${API}/musician`).pipe(catchError(() => of([]))),
      bands: this.http.get<BandResp[]>(`${API}/band`).pipe(catchError(() => of([]))),
      genres: this.http.get<FilterOption[]>(`${API}/genre`).pipe(catchError(() => of([]))),
      instruments: this.http.get<FilterOption[]>(`${API}/instrument`).pipe(catchError(() => of([]))),
    }).subscribe(({ musicians, bands, genres, instruments }) => {
      this._musicians.set(musicians.map(m => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        userName: m.userName,
        description: m.description,
        initials: ((m.firstName[0] ?? '') + (m.lastName[0] ?? '')).toUpperCase(),
        color: profileColor(m.id),
        averageRating: m.averageRating ?? 0,
        numberOfReviews: m.numberOfReviews ?? 0,
        genres: m.genres,
        instruments: m.instruments,
      })));

      this._bands.set(bands.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        initials: b.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase(),
        color: bandColor(b.id),
        averageRating: b.averageRating ?? 0,
        numberOfReviews: b.numberOfReviews ?? 0,
        memberCount: (b.members as unknown[]).length,
        genres: b.genres,
      })));

      this.genres.set(genres);
      this.instruments.set(instruments);
      this.loading.set(false);
    });
  }

  setTab(tab: ExploreTab): void {
    this.activeTab.set(tab);
    this.selectedGenre.set('');
    this.selectedInstrument.set('');
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedGenre.set('');
    this.selectedInstrument.set('');
  }
}
