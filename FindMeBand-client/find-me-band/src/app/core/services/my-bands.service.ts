import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type BandRole = 'Admin' | 'Member';
export type GigStatus = 'Upcoming' | 'Completed' | 'Cancelled';
export type BandTab = 'overview' | 'members' | 'gigs' | 'posts';
export type BandMode = 'view' | 'edit' | 'add-member' | 'create-post';

export interface BandGenre {
  genreId: number;
  playsGenreId: number;
  name: string;
}

export interface BandLocation {
  id: number;
  name: string;
}

export interface BandMemberEntry {
  id: number;
  musicianId: number;
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

export interface MusicianEntry {
  id: number;
  name: string;
  username: string;
  initials: string;
  color: string;
  instruments: { id: number; name: string }[];
}

export interface MyBand {
  id: number;
  performerId: number;
  myMemberId: number;
  name: string;
  initials: string;
  color: string;
  avatarUrl: string | null;
  description: string;
  genres: BandGenre[];
  locations: BandLocation[];
  averageRating: number;
  numberOfReviews: number;
  myRole: BandRole;
  myInstrument: string;
  foundedAt: string;
  members: BandMemberEntry[];
  gigs: Gig[];
  posts: BandPost[];
}

// ── Backend response shapes ──────────────────────────────────

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
  avatarUrl?: string;
  createdAt: string;
  performerId?: number;
  averageRating?: number;
  numberOfReviews?: number;
  genres: { id: number; name: string; playsGenreId?: number }[];
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
  likesCount: number;
  isLiked: boolean;
}

interface MusicianResponse {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  instruments: { id: number; name: string; type: string }[];
}

// ── Helpers ──────────────────────────────────────────────────

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

// ── Service ──────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class MyBandsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // ── Core state ───────────────────────────────────────────

  readonly bands = signal<MyBand[]>([]);
  readonly selectedBandId = signal<number | null>(null);
  readonly activeTab = signal<BandTab>('overview');
  readonly loading = signal(false);

  // ── Create band state ────────────────────────────────────

  readonly isCreating = signal(false);
  readonly createName = signal('');
  readonly createDescription = signal('');
  readonly createInstrumentId = signal<number | null>(null);
  readonly submitting = signal(false);

  // ── Mode ─────────────────────────────────────────────────

  readonly mode = signal<BandMode>('view');

  // ── Edit state ───────────────────────────────────────────

  readonly editName = signal('');
  readonly editDescription = signal('');
  readonly editSubmitting = signal(false);
  readonly uploadingAvatarBandId = signal<number | null>(null);
  readonly allGenres = signal<{ id: number; name: string }[]>([]);
  readonly addGenreId = signal<number | null>(null);
  readonly addLocationName = signal('');
  readonly genreUpdating = signal(false);
  readonly locationUpdating = signal(false);

  // ── Add member state ─────────────────────────────────────

  readonly memberSearch = signal('');
  readonly allMusicians = signal<MusicianEntry[]>([]);
  readonly pickedMusicianId = signal<number | null>(null);
  readonly pickedInstrumentId = signal<number | null>(null);
  readonly memberSubmitting = signal(false);

  // ── Create post state ────────────────────────────────────

  readonly newPostContent = signal('');
  readonly postSubmitting = signal(false);

  // ── Computed ─────────────────────────────────────────────

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

  readonly genresToAdd = computed(() => {
    const band = this.selectedBand();
    const existingIds = new Set(band?.genres.map(g => g.genreId) ?? []);
    return this.allGenres().filter(g => !existingIds.has(g.id));
  });

  readonly availableMusicians = computed(() => {
    const band = this.selectedBand();
    const search = this.memberSearch().toLowerCase();
    const currentMusicianId = this.auth.currentUser()?.profileId;
    const memberIds = new Set([
      ...(band?.members.map(m => m.musicianId) ?? []),
      ...(currentMusicianId != null ? [currentMusicianId] : [])
    ]);
    return this.allMusicians()
      .filter(m => !memberIds.has(m.id))
      .filter(m =>
        !search ||
        m.name.toLowerCase().includes(search) ||
        m.username.toLowerCase().includes(search)
      );
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

  // ── Load ─────────────────────────────────────────────────

  loadBands(musicianId: number): void {
    this.loading.set(true);

    this.http.get<BandMembershipResponse[]>(`${API}/bandmember/musician/${musicianId}`)
      .pipe(
        catchError(() => of([])),
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
            performerId: band.performerId ?? 0,
            myMemberId: membership.id,
            name: band.name,
            initials: toInitials(band.name),
            color: profileColor(band.id),
            avatarUrl: band.avatarUrl ?? null,
            description: band.description,
            genres: band.genres.map(g => ({
              genreId: g.id,
              playsGenreId: g.playsGenreId ?? 0,
              name: g.name
            })),
            locations: band.locations.map(l => ({ id: l.id, name: l.name })),
            averageRating: band.averageRating ?? 0,
            numberOfReviews: band.numberOfReviews ?? 0,
            myRole: membership.role === 'Admin' ? 'Admin' : 'Member',
            myInstrument: membership.instrument?.name ?? '',
            foundedAt: band.createdAt,
            members: band.members.map(m => ({
              id: m.id,
              musicianId: m.musicianId,
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
              likes: p.likesCount,
              comments: 0,
              isLiked: p.isLiked,
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

  // ── Navigation ───────────────────────────────────────────

  selectBand(id: number): void {
    this.selectedBandId.set(id);
    this.activeTab.set('overview');
    this.mode.set('view');
  }

  setTab(tab: BandTab): void {
    this.activeTab.set(tab);
  }

  setMode(mode: BandMode): void {
    this.mode.set(mode);
  }

  // ── Post likes ───────────────────────────────────────────

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

  // ── Create band ──────────────────────────────────────────

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

  // ── Edit band ────────────────────────────────────────────

  startEdit(): void {
    const band = this.selectedBand();
    if (!band) return;
    this.editName.set(band.name);
    this.editDescription.set(band.description);
    this.addGenreId.set(null);
    this.addLocationName.set('');
    if (!this.allGenres().length) {
      this.http.get<{ id: number; name: string }[]>(`${API}/genre`)
        .pipe(catchError(() => of([])))
        .subscribe(genres => this.allGenres.set(genres));
    }
    this.mode.set('edit');
  }

  submitEdit(bandId: number): void {
    const name = this.editName().trim();
    const description = this.editDescription().trim();
    if (!name || !description) return;

    const avatarUrl = this.bands().find(b => b.id === bandId)?.avatarUrl ?? null;

    this.editSubmitting.set(true);
    this.http.put(`${API}/band/${bandId}`, { name, description, avatarUrl })
      .pipe(catchError(() => { this.editSubmitting.set(false); return EMPTY; }))
      .subscribe(() => {
        this.editSubmitting.set(false);
        this.bands.update(bands =>
          bands.map(b => b.id !== bandId ? b : { ...b, name, description })
        );
        this.mode.set('view');
      });
  }

  uploadBandAvatar(bandId: number, file: File): void {
    this.uploadingAvatarBandId.set(bandId);
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{ url: string }>(`${API}/upload/avatar`, formData)
      .subscribe({
        next: ({ url }) => {
          const band = this.bands().find(b => b.id === bandId);
          if (!band) { this.uploadingAvatarBandId.set(null); return; }
          this.http.put(`${API}/band/${bandId}`, { name: band.name, description: band.description, avatarUrl: url })
            .subscribe({
              next: () => {
                this.bands.update(bands =>
                  bands.map(b => b.id !== bandId ? b : { ...b, avatarUrl: url })
                );
                this.uploadingAvatarBandId.set(null);
              },
              error: () => this.uploadingAvatarBandId.set(null)
            });
        },
        error: () => this.uploadingAvatarBandId.set(null)
      });
  }

  // ── Genres ───────────────────────────────────────────────

  addGenreImmediate(bandId: number, performerId: number, genreId: number): void {
    const genreName = this.allGenres().find(g => g.id === genreId)?.name;
    if (!genreName) return;

    this.genreUpdating.set(true);
    this.http.post<{ id: number }>(`${API}/playsgenre`, { performerId, genreId, skillLevel: 3 })
      .pipe(catchError(() => { this.genreUpdating.set(false); return of(null); }))
      .subscribe(res => {
        this.genreUpdating.set(false);
        if (res) {
          this.addGenreId.set(null);
          this.bands.update(bands =>
            bands.map(b => b.id !== bandId ? b : {
              ...b,
              genres: [...b.genres, { genreId, playsGenreId: res.id, name: genreName }]
            })
          );
        }
      });
  }

  removeGenreImmediate(bandId: number, playsGenreId: number): void {
    const removed = this.bands().find(b => b.id === bandId)?.genres.find(g => g.playsGenreId === playsGenreId);
    if (!removed) return;

    this.bands.update(bands =>
      bands.map(b => b.id !== bandId ? b : {
        ...b,
        genres: b.genres.filter(g => g.playsGenreId !== playsGenreId)
      })
    );

    this.http.delete(`${API}/playsgenre/${playsGenreId}`)
      .pipe(catchError(() => {
        this.bands.update(bands =>
          bands.map(b => b.id !== bandId ? b : {
            ...b,
            genres: [...b.genres, removed]
          })
        );
        return EMPTY;
      }))
      .subscribe();
  }

  // ── Locations ────────────────────────────────────────────

  addLocationImmediate(bandId: number, performerId: number, name: string): void {
    this.locationUpdating.set(true);
    this.http.post<{ id: number }>(`${API}/location`, { performerId, name, address: null, latitude: null, longitude: null })
      .pipe(catchError(() => { this.locationUpdating.set(false); return of(null); }))
      .subscribe(res => {
        this.locationUpdating.set(false);
        if (res) {
          this.addLocationName.set('');
          this.bands.update(bands =>
            bands.map(b => b.id !== bandId ? b : {
              ...b,
              locations: [...b.locations, { id: res.id, name }]
            })
          );
        }
      });
  }

  removeLocationImmediate(bandId: number, locationId: number): void {
    const removed = this.bands().find(b => b.id === bandId)?.locations.find(l => l.id === locationId);
    if (!removed) return;

    this.bands.update(bands =>
      bands.map(b => b.id !== bandId ? b : {
        ...b,
        locations: b.locations.filter(l => l.id !== locationId)
      })
    );

    this.http.delete(`${API}/location/${locationId}`)
      .pipe(catchError(() => {
        this.bands.update(bands =>
          bands.map(b => b.id !== bandId ? b : {
            ...b,
            locations: [...b.locations, removed]
          })
        );
        return EMPTY;
      }))
      .subscribe();
  }

  // ── Add member ───────────────────────────────────────────

  openAddMember(): void {
    this.memberSearch.set('');
    this.pickedMusicianId.set(null);
    this.pickedInstrumentId.set(null);

    if (!this.allMusicians().length) {
      this.http.get<MusicianResponse[]>(`${API}/musician`)
        .pipe(catchError(() => of([])))
        .subscribe(musicians => {
          this.allMusicians.set(musicians.map(m => ({
            id: m.id,
            name: `${m.firstName} ${m.lastName}`,
            username: m.userName,
            initials: memberInitials(m.firstName, m.lastName),
            color: profileColor(m.id),
            instruments: m.instruments.map(i => ({ id: i.id, name: i.name }))
          })));
        });
    }

    this.mode.set('add-member');
  }

  submitAddMember(bandId: number): void {
    const musicianId = this.pickedMusicianId();
    if (!musicianId) return;

    this.memberSubmitting.set(true);
    const currentUser = this.auth.currentUser();

    this.http.post(`${API}/bandmember`, {
      bandId,
      musicianId,
      instrumentId: this.pickedInstrumentId() ?? null,
      role: 0
    })
      .pipe(catchError(() => { this.memberSubmitting.set(false); return EMPTY; }))
      .subscribe(() => {
        this.memberSubmitting.set(false);
        this.pickedMusicianId.set(null);
        this.pickedInstrumentId.set(null);
        if (currentUser) this.loadBands(currentUser.profileId);
        this.mode.set('view');
      });
  }

  // ── Create post ──────────────────────────────────────────

  openCreatePost(): void {
    this.newPostContent.set('');
    this.mode.set('create-post');
  }

  submitPost(bandId: number): void {
    const content = this.newPostContent().trim();
    if (!content) return;

    const user = this.auth.currentUser();
    if (!user) return;

    this.postSubmitting.set(true);

    this.http.post<BandPostResponse>(`${API}/post`, { profileId: user.profileId, bandId, content, media: [] })
      .pipe(catchError(() => { this.postSubmitting.set(false); return of(null); }))
      .subscribe(res => {
        this.postSubmitting.set(false);
        if (res) {
          this.bands.update(bands =>
            bands.map(b => b.id !== bandId ? b : {
              ...b,
              posts: [{ id: res.id, content: res.content, createdAt: res.createdAt, likes: 0, comments: 0, isLiked: false }, ...b.posts]
            })
          );
          this.newPostContent.set('');
          this.activeTab.set('posts');
          this.mode.set('view');
        }
      });
  }

  // ── Members ──────────────────────────────────────────────

  removeMember(bandId: number, memberId: number): void {
    if (!confirm('Ukloniti ovog člana iz benda?')) return;

    this.http.delete(`${API}/bandmember/${memberId}`)
      .pipe(catchError(() => EMPTY))
      .subscribe(() => {
        this.bands.update(bands =>
          bands.map(b => b.id !== bandId ? b : {
            ...b,
            members: b.members.filter(m => m.id !== memberId)
          })
        );
      });
  }

  leaveCurrentBand(): void {
    const band = this.selectedBand();
    if (!band) return;

    if (!confirm(`Napustiti bend "${band.name}"?`)) return;

    this.http.delete(`${API}/bandmember/${band.myMemberId}`)
      .pipe(catchError(() => EMPTY))
      .subscribe(() => {
        const remaining = this.bands().filter(b => b.id !== band.id);
        this.bands.set(remaining);
        this.selectedBandId.set(remaining.length ? remaining[0].id : null);
        this.mode.set('view');
      });
  }

  // ── Formatters ───────────────────────────────────────────

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
}
