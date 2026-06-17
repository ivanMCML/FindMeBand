import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type BandRole = 'Admin' | 'Member';
export type GigStatus = 'Upcoming' | 'Completed' | 'Cancelled';
export type BandTab = 'overview' | 'members' | 'gigs' | 'posts';

export interface BandMemberEntry {
  id: number;
  name: string;
  username: string;
  initials: string;
  color: string;
  instrument: string;
  role: BandRole;
  joinedDate: string;
}

export interface Gig {
  id: number;
  title: string;
  venue: string;
  location: string;
  date: string;
  payment: number | null;
  status: GigStatus;
  notes?: string;
}

export interface BandPost {
  id: number;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface MyBand {
  id: number;
  name: string;
  initials: string;
  color: string;
  description: string;
  genres: string[];
  locations: string[];
  averageRating: number;
  numberOfReviews: number;
  myRole: BandRole;
  myInstrument: string;
  foundedAt: string;
  members: BandMemberEntry[];
  gigs: Gig[];
  posts: BandPost[];
}

// Backend odgovori
interface BandMembershipResponse {
  id: number;
  bandId: number;
  bandName: string;
  musicianId: number;
  role: string;
  joinedDate: string;
  leftDate?: string;
  instrument?: { id: number; name: string; type: string };
}

interface BandResponse {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  performerId?: number;
  averageRating?: number;
  numberOfReviews?: number;
  genres: { id: number; name: string }[];
  locations: { id: number; name: string }[];
  members: {
    id: number;
    musicianId: number;
    musicianFirstName: string;
    musicianLastName: string;
    musicianUserName: string;
    role: string;
    joinedDate: string;
    leftDate?: string;
    instrument?: { id: number; name: string; type: string };
  }[];
}

interface BandPostResponse {
  id: number;
  content: string;
  createdAt: string;
}

const API = environment.apiBaseUrl;

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function profileColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function toInitials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();
}

function memberInitials(first: string, last: string): string {
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
}

@Injectable({ providedIn: 'root' })
export class MyBandsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly bands = signal<MyBand[]>([]);
  readonly selectedBandId = signal<number | null>(null);
  readonly activeTab = signal<BandTab>('overview');
  readonly loading = signal(false);

  readonly isCreating = signal(false);
  readonly createName = signal('');
  readonly createDescription = signal('');
  readonly createInstrumentId = signal<number | null>(null);
  readonly submitting = signal(false);

  readonly selectedBand = computed(() => {
    const id = this.selectedBandId();
    return id !== null ? (this.bands().find(b => b.id === id) ?? null) : null;
  });

  readonly upcomingGigs = computed(() => {
    const band = this.selectedBand();
    if (!band) return [];
    const today = new Date().toISOString().split('T')[0];
    return band.gigs
      .filter(g => g.date >= today && g.status !== 'Cancelled')
      .sort((a, b) => a.date.localeCompare(b.date));
  });

  readonly pastGigs = computed(() => {
    const band = this.selectedBand();
    if (!band) return [];
    const today = new Date().toISOString().split('T')[0];
    return band.gigs
      .filter(g => g.date < today || g.status === 'Cancelled')
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user?.role === 'Musician') {
        this.loadBands(user.profileId);
      } else {
        this.bands.set([]);
        this.selectedBandId.set(null);
      }
    });
  }

  loadBands(musicianId: number): void {
    this.loading.set(true);

    // 1. Dohvati sva članstva glazbenika u bendovima
    this.http.get<BandMembershipResponse[]>(`${API}/bandmember/musician/${musicianId}`)
      .pipe(
        catchError(() => of([])),
        // 2. Paralelno dohvati detalje svakog benda i postove
        switchMap(memberships => {
          if (!memberships.length) return of([]);

          const uniqueBandIds = [...new Set(memberships.map(m => m.bandId))];

          const bandRequests = uniqueBandIds.map(bandId =>
            forkJoin({
              band: this.http.get<BandResponse>(`${API}/band/${bandId}`),
              posts: this.http.get<BandPostResponse[]>(`${API}/post/band/${bandId}`).pipe(catchError(() => of([]))),
              membership: of(memberships.find(m => m.bandId === bandId)!)
            })
          );

          return forkJoin(bandRequests);
        })
      )
      .subscribe({
        next: results => {
          const mapped: MyBand[] = results.map(({ band, posts, membership }) => ({
            id: band.id,
            name: band.name,
            initials: toInitials(band.name),
            color: profileColor(band.id),
            description: band.description,
            genres: band.genres.map(g => g.name),
            locations: band.locations.map(l => l.name),
            averageRating: band.averageRating ?? 0,
            numberOfReviews: band.numberOfReviews ?? 0,
            myRole: membership.role === 'Admin' ? 'Admin' : 'Member',
            myInstrument: membership.instrument?.name ?? '',
            foundedAt: band.createdAt,
            members: band.members.map(m => ({
              id: m.id,
              name: `${m.musicianFirstName} ${m.musicianLastName}`,
              username: m.musicianUserName,
              initials: memberInitials(m.musicianFirstName, m.musicianLastName),
              color: profileColor(m.musicianId),
              instrument: m.instrument?.name ?? '',
              role: m.role === 'Admin' ? 'Admin' : 'Member',
              joinedDate: m.joinedDate,
            })),
            gigs: [],
            posts: posts.map(p => ({
              id: p.id,
              content: p.content,
              createdAt: p.createdAt,
              likes: 0,
              comments: 0,
              isLiked: false,
            })),
          }));

          this.bands.set(mapped);

          if (mapped.length && this.selectedBandId() === null) {
            this.selectedBandId.set(mapped[0].id);
          }

          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  selectBand(id: number): void {
    this.selectedBandId.set(id);
    this.activeTab.set('overview');
  }

  setTab(tab: BandTab): void {
    this.activeTab.set(tab);
  }

  togglePostLike(bandId: number, postId: number): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const toggle = () =>
      this.bands.update(bands =>
        bands.map(b =>
          b.id !== bandId ? b : {
            ...b,
            posts: b.posts.map(p =>
              p.id !== postId ? p : {
                ...p,
                isLiked: !p.isLiked,
                likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
              }
            ),
          }
        )
      );

    toggle();

    this.http.post<{ liked: boolean }>(`${API}/postlike`, { postId, profileId: user.profileId })
      .pipe(catchError(() => {
        toggle();
        return of(null);
      }))
      .subscribe(res => {
        if (res) {
          this.bands.update(bands =>
            bands.map(b =>
              b.id !== bandId ? b : {
                ...b,
                posts: b.posts.map(p => {
                  if (p.id !== postId || p.isLiked === res.liked) return p;
                  return {
                    ...p,
                    isLiked: res.liked,
                    likes: res.liked ? p.likes + 1 : Math.max(0, p.likes - 1),
                  };
                }),
              }
            )
          );
        }
      });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const months = ['sij.', 'velj.', 'ožu.', 'tra.', 'svi.', 'lip.', 'srp.', 'kol.', 'ruj.', 'lis.', 'stu.', 'pro.'];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}.`;
  }

  formatPayment(payment: number | null): string {
    if (payment === null) return 'Dogovor';
    return `${payment.toLocaleString('hr-HR')} €`;
  }

  toUsername(name: string): string {
    return name.toLowerCase().split(' ').join('_');
  }

  starsArray(rating: number): { full: boolean; half: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({
      full: i < Math.floor(rating),
      half: i === Math.floor(rating) && rating % 1 >= 0.5,
    }));
  }

  openCreateForm(): void {
    this.createName.set('');
    this.createDescription.set('');
    this.createInstrumentId.set(null);
    this.isCreating.set(true);
  }

  cancelCreate(): void {
    this.isCreating.set(false);
  }

  submitCreate(musicianId: number): void {
    const name = this.createName().trim();
    const description = this.createDescription().trim();
    if (!name || !description) return;

    this.submitting.set(true);

    this.http.post<{ id: number }>(`${API}/band`, { name, description })
      .pipe(
        switchMap(band =>
          this.http.post(`${API}/bandmember`, {
            bandId: band.id,
            musicianId,
            instrumentId: this.createInstrumentId() ?? null,
            role: 1,
          })
        ),
        catchError(() => {
          this.submitting.set(false);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result !== null) {
          this.isCreating.set(false);
          this.submitting.set(false);
          this.loadBands(musicianId);
        }
      });
  }
}
