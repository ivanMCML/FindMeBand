import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface SearchResult {
  id: number;
  name: string;
  username: string;
  initials: string;
  color: string;
  subtitle: string;
  type: 'musician' | 'band' | 'organizer';
  followId: number | null;
}

interface MusicianResponse {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
  instruments: { name: string }[];
}

interface BandResponse {
  id: number;
  name: string;
  description: string;
  genres: { name: string }[];
}

interface OrganizerResponse {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
}

interface FollowResponse {
  id: number;
  followeeProfileId: number | null;
  followeeBandId: number | null;
}

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function itemColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function initials(first: string, last: string): string {
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
}

const API = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class FollowService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly searchTerm = signal('');

  private readonly allMusicians = signal<SearchResult[]>([]);
  private readonly allBands = signal<SearchResult[]>([]);
  private readonly allOrganizers = signal<SearchResult[]>([]);
  private readonly followMap = signal<Record<string, number>>({});

  readonly filteredMusicians = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const map = this.followMap();
    const myId = this.auth.currentUser()?.profileId;
    const pool = this.allMusicians().filter(m => m.id !== myId);
    const results = term
      ? pool.filter(m => m.name.toLowerCase().includes(term) || m.username.toLowerCase().includes(term))
      : pool.slice(0, 3);
    return results.map(m => ({ ...m, followId: map[`p${m.id}`] ?? null }));
  });

  readonly filteredBands = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const map = this.followMap();
    const results = term
      ? this.allBands().filter(b => b.name.toLowerCase().includes(term) || b.username.toLowerCase().includes(term))
      : this.allBands().slice(0, 3);
    return results.map(b => ({ ...b, followId: map[`b${b.id}`] ?? null }));
  });

  readonly filteredOrganizers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const map = this.followMap();
    const myId = this.auth.currentUser()?.profileId;
    const pool = this.allOrganizers().filter(o => o.id !== myId);
    const results = term
      ? pool.filter(o => o.name.toLowerCase().includes(term) || o.username.toLowerCase().includes(term))
      : pool.slice(0, 3);
    return results.map(o => ({ ...o, followId: map[`p${o.id}`] ?? null }));
  });

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.load(user.profileId);
      } else {
        this.allMusicians.set([]);
        this.allBands.set([]);
        this.allOrganizers.set([]);
        this.followMap.set({});
      }
    });
  }

  followIdFor(type: 'musician' | 'band', id: number): number | null {
    const key = type === 'band' ? `b${id}` : `p${id}`;
    return this.followMap()[key] ?? null;
  }

  followById(type: 'musician' | 'band', id: number): void {
    this.follow({
      id, name: '', username: '', initials: '', color: '', subtitle: '', followId: null,
      type: type === 'band' ? 'band' : 'musician',
    });
  }

  unfollowById(followId: number, type: 'musician' | 'band', id: number): void {
    this.unfollow(followId, {
      id, name: '', username: '', initials: '', color: '', subtitle: '', followId: null,
      type: type === 'band' ? 'band' : 'musician',
    });
  }

  toggleFollow(item: SearchResult): void {
    if (item.followId !== null) {
      this.unfollow(item.followId, item);
    } else {
      this.follow(item);
    }
  }

  private follow(item: SearchResult): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const dto: Record<string, unknown> = { followerId: user.profileId };
    if (item.type === 'band') {
      dto['followeeBandId'] = item.id;
    } else {
      dto['followeeProfileId'] = item.id;
    }

    this.http.post<FollowResponse>(`${API}/follow`, dto).subscribe({
      next: (res) => {
        const key = item.type === 'band' ? `b${item.id}` : `p${item.id}`;
        this.followMap.update(map => ({ ...map, [key]: res.id }));
      },
    });
  }

  private unfollow(followId: number, item: SearchResult): void {
    this.http.delete(`${API}/follow/${followId}`).subscribe({
      next: () => {
        const key = item.type === 'band' ? `b${item.id}` : `p${item.id}`;
        this.followMap.update(map => {
          const next = { ...map };
          delete next[key];
          return next;
        });
      },
    });
  }

  private load(profileId: number): void {
    forkJoin({
      musicians: this.http.get<MusicianResponse[]>(`${API}/musician`).pipe(catchError(() => of([]))),
      bands: this.http.get<BandResponse[]>(`${API}/band`).pipe(catchError(() => of([]))),
      organizers: this.http.get<OrganizerResponse[]>(`${API}/organizer`).pipe(catchError(() => of([]))),
      following: this.http.get<FollowResponse[]>(`${API}/follow/following/${profileId}`).pipe(catchError(() => of([]))),
    }).subscribe(({ musicians, bands, organizers, following }) => {
      this.allMusicians.set(musicians.map(m => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        username: m.userName,
        initials: initials(m.firstName, m.lastName),
        color: itemColor(m.id),
        subtitle: m.instruments?.length
          ? m.instruments[0].name
          : (m.description?.trim().slice(0, 30) || 'Muzičar'),
        type: 'musician' as const,
        followId: null,
      })));

      this.allBands.set(bands.map(b => ({
        id: b.id,
        name: b.name,
        username: b.name.toLowerCase().replace(/\s+/g, '_'),
        initials: b.name.split(' ').map((w: string) => w[0] ?? '').join('').toUpperCase().slice(0, 2),
        color: itemColor(b.id + 1000),
        subtitle: b.genres?.length
          ? b.genres.map((g: { name: string }) => g.name).join(' · ')
          : (b.description?.trim().slice(0, 30) || 'Bend'),
        type: 'band' as const,
        followId: null,
      })));

      this.allOrganizers.set(organizers.map(o => ({
        id: o.id,
        name: `${o.firstName} ${o.lastName}`,
        username: o.userName,
        initials: initials(o.firstName, o.lastName),
        color: itemColor(o.id + 2000),
        subtitle: o.description?.trim().slice(0, 30) || 'Organizator',
        type: 'organizer' as const,
        followId: null,
      })));

      const map: Record<string, number> = {};
      for (const f of following) {
        if (f.followeeProfileId != null) map[`p${f.followeeProfileId}`] = f.id;
        if (f.followeeBandId != null) map[`b${f.followeeBandId}`] = f.id;
      }
      this.followMap.set(map);
    });
  }
}
