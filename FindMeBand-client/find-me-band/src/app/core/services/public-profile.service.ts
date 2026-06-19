import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const API = environment.apiBaseUrl;

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function profileColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function initials(first: string, last: string): string {
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
}

export type PublicProfileTab = 'overview' | 'posts' | 'reviews';

export interface PublicMusician {
  id: number;
  performerId: number | null;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
  initials: string;
  color: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  averageRating: number;
  numberOfReviews: number;
  instruments: { id: number; name: string; type: string }[];
  genres: { id: number; name: string }[];
  bands: { id: number; name: string; initials: string; color: string; role: string }[];
}

export interface PublicBand {
  id: number;
  performerId: number | null;
  name: string;
  description: string;
  initials: string;
  color: string;
  createdAt: string;
  followersCount: number;
  averageRating: number;
  numberOfReviews: number;
  genres: { id: number; name: string }[];
  locations: { id: number; name: string }[];
  members: {
    id: number;
    musicianId: number;
    name: string;
    initials: string;
    color: string;
    instrument: string;
    username: string;
    role: string;
    joinedDate: string;
  }[];
}

export interface PublicPost {
  id: number;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

export interface PublicReview {
  id: number;
  reviewerId: number | null;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName: string;
  reviewerInitials: string;
  reviewerColor: string;
}

interface MusicianResponse {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
  createdAt: string;
  performerId?: number;
  averageRating?: number;
  numberOfReviews?: number;
  genres: { id: number; name: string }[];
  instruments: { id: number; name: string; type: string }[];
  bands: { bandId: number; bandName: string; role: string; joinedDate: string }[];
}

interface BandMemberResponse {
  id: number;
  musicianId: number;
  musicianFirstName: string;
  musicianLastName: string;
  musicianUserName: string;
  role: string;
  joinedDate: string;
  instrument?: { id: number; name: string; type: string } | null;
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
  members: BandMemberResponse[];
}

interface ReviewResponse {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerId?: number;
  reviewerFirstName?: string;
  reviewerLastName?: string;
  reviewerUserName?: string;
}

interface PostResponse {
  id: number;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
}

interface FollowCountResponse {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class PublicProfileService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly musician = signal<PublicMusician | null>(null);
  readonly band = signal<PublicBand | null>(null);
  readonly posts = signal<PublicPost[]>([]);
  readonly reviews = signal<PublicReview[]>([]);
  readonly activeTab = signal<PublicProfileTab>('overview');
  readonly loading = signal(false);

  readonly showReviewForm = signal(false);
  readonly reviewRating = signal(0);
  readonly reviewComment = signal('');
  readonly reviewSubmitting = signal(false);

  loadMusician(musicianId: number): void {
    this.musician.set(null);
    this.band.set(null);
    this.posts.set([]);
    this.reviews.set([]);
    this.activeTab.set('overview');
    this.showReviewForm.set(false);
    this.reviewRating.set(0);
    this.reviewComment.set('');
    this.loading.set(true);

    const myId = this.auth.currentUser()?.profileId;

    forkJoin({
      musician: this.http.get<MusicianResponse>(`${API}/musician/${musicianId}`),
      followers: this.http.get<FollowCountResponse[]>(`${API}/follow/followers/profile/${musicianId}`).pipe(catchError(() => of([]))),
      following: this.http.get<FollowCountResponse[]>(`${API}/follow/following/${musicianId}`).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ musician, followers, following }) => {
        this.musician.set({
          id: musician.id,
          performerId: musician.performerId ?? null,
          firstName: musician.firstName,
          lastName: musician.lastName,
          userName: musician.userName,
          description: musician.description ?? '',
          initials: initials(musician.firstName, musician.lastName),
          color: profileColor(musician.id),
          createdAt: musician.createdAt,
          followersCount: followers.length,
          followingCount: following.length,
          averageRating: musician.averageRating ?? 0,
          numberOfReviews: musician.numberOfReviews ?? 0,
          instruments: musician.instruments ?? [],
          genres: musician.genres ?? [],
          bands: (musician.bands ?? []).map(b => ({
            id: b.bandId,
            name: b.bandName,
            initials: b.bandName.split(' ').map((w: string) => w[0] ?? '').join('').toUpperCase().slice(0, 2),
            color: profileColor(b.bandId + 1000),
            role: b.role,
          })),
        });

        if (musician.performerId) {
          this.loadReviews(musician.performerId);
        }

        const viewerId = myId ?? musicianId;
        this.http.get<PostResponse[]>(`${API}/post/profile/${musicianId}?viewerProfileId=${viewerId}`)
          .pipe(catchError(() => of([])))
          .subscribe(posts => {
            this.posts.set(posts.map(p => ({
              id: p.id,
              content: p.content,
              createdAt: p.createdAt,
              likes: p.likesCount,
              isLiked: p.isLiked,
            })));
          });

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadBand(bandId: number): void {
    this.musician.set(null);
    this.band.set(null);
    this.posts.set([]);
    this.reviews.set([]);
    this.activeTab.set('overview');
    this.showReviewForm.set(false);
    this.reviewRating.set(0);
    this.reviewComment.set('');
    this.loading.set(true);

    const myId = this.auth.currentUser()?.profileId;

    forkJoin({
      band: this.http.get<BandResponse>(`${API}/band/${bandId}`),
      followers: this.http.get<FollowCountResponse[]>(`${API}/follow/followers/band/${bandId}`).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ band, followers }) => {
        this.band.set({
          id: band.id,
          performerId: band.performerId ?? null,
          name: band.name,
          description: band.description ?? '',
          initials: band.name.split(' ').map((w: string) => w[0] ?? '').join('').toUpperCase().slice(0, 2),
          color: profileColor(band.id + 1000),
          createdAt: band.createdAt,
          followersCount: followers.length,
          averageRating: band.averageRating ?? 0,
          numberOfReviews: band.numberOfReviews ?? 0,
          genres: (band.genres ?? []).map(g => ({ id: g.id, name: g.name })),
          locations: band.locations ?? [],
          members: (band.members ?? []).map(m => ({
            id: m.id,
            musicianId: m.musicianId,
            name: `${m.musicianFirstName} ${m.musicianLastName}`,
            initials: initials(m.musicianFirstName, m.musicianLastName),
            color: profileColor(m.musicianId),
            instrument: m.instrument?.name ?? '',
            username: m.musicianUserName,
            role: m.role,
            joinedDate: m.joinedDate,
          })),
        });

        if (band.performerId) {
          this.loadReviews(band.performerId);
        }

        const viewerId = myId ?? 0;
        this.http.get<PostResponse[]>(`${API}/post/band/${bandId}?viewerProfileId=${viewerId}`)
          .pipe(catchError(() => of([])))
          .subscribe(posts => {
            this.posts.set(posts.map(p => ({
              id: p.id,
              content: p.content,
              createdAt: p.createdAt,
              likes: p.likesCount,
              isLiked: p.isLiked,
            })));
          });

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadReviews(performerId: number): void {
    this.http.get<ReviewResponse[]>(`${API}/review/performer/${performerId}`)
      .pipe(catchError(() => of([])))
      .subscribe(reviews => {
        this.reviews.set(reviews.map(r => ({
          id: r.id,
          reviewerId: r.reviewerId ?? null,
          rating: r.rating,
          comment: r.comment ?? '',
          createdAt: r.createdAt,
          reviewerName: r.reviewerFirstName && r.reviewerLastName
            ? `${r.reviewerFirstName} ${r.reviewerLastName}`
            : r.reviewerUserName ?? 'Anonimni',
          reviewerInitials: r.reviewerFirstName && r.reviewerLastName
            ? initials(r.reviewerFirstName, r.reviewerLastName)
            : '??',
          reviewerColor: profileColor(r.reviewerId ?? 0),
        })));
      });
  }

  openReviewForm(): void {
    this.reviewRating.set(0);
    this.reviewComment.set('');
    this.showReviewForm.set(true);
  }

  closeReviewForm(): void {
    this.showReviewForm.set(false);
  }

  submitReview(performerId: number): void {
    const myId = this.auth.currentUser()?.profileId;
    const rating = this.reviewRating();
    const comment = this.reviewComment().trim();
    if (!myId || rating < 1 || !comment) return;

    this.reviewSubmitting.set(true);

    this.http.post<ReviewResponse>(`${API}/review`, {
      reviewerId: myId,
      performerId,
      rating,
      comment,
    }).subscribe({
      next: (r) => {
        const user = this.auth.currentUser();
        const newReview: PublicReview = {
          id: r.id,
          reviewerId: r.reviewerId ?? null,
          rating: r.rating,
          comment: r.comment ?? '',
          createdAt: r.createdAt,
          reviewerName: r.reviewerFirstName && r.reviewerLastName
            ? `${r.reviewerFirstName} ${r.reviewerLastName}`
            : r.reviewerUserName ?? 'Eu',
          reviewerInitials: r.reviewerFirstName && r.reviewerLastName
            ? initials(r.reviewerFirstName, r.reviewerLastName)
            : initials(user?.firstName ?? '?', user?.lastName ?? '?'),
          reviewerColor: profileColor(myId),
        };
        this.reviews.update(list => [newReview, ...list]);
        this.musician.update(m => m ? { ...m, numberOfReviews: m.numberOfReviews + 1 } : m);
        this.band.update(b => b ? { ...b, numberOfReviews: b.numberOfReviews + 1 } : b);
        this.showReviewForm.set(false);
        this.reviewRating.set(0);
        this.reviewComment.set('');
        this.reviewSubmitting.set(false);
      },
      error: () => this.reviewSubmitting.set(false),
    });
  }

  setTab(tab: PublicProfileTab): void {
    this.activeTab.set(tab);
  }

  togglePostLike(postId: number): void {
    const myId = this.auth.currentUser()?.profileId;
    if (!myId) return;

    const toggle = (posts: PublicPost[]) =>
      posts.map(p => p.id !== postId ? p : {
        ...p,
        isLiked: !p.isLiked,
        likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
      });

    this.posts.update(toggle);

    this.http.post<{ liked: boolean }>(`${API}/postlike`, { postId, profileId: myId })
      .pipe(catchError(() => {
        this.posts.update(toggle);
        return of(null);
      }))
      .subscribe(res => {
        if (res) {
          this.posts.update(posts =>
            posts.map(p => {
              if (p.id !== postId || p.isLiked === res.liked) return p;
              return { ...p, isLiked: res.liked, likes: res.liked ? p.likes + 1 : Math.max(0, p.likes - 1) };
            })
          );
        }
      });
  }

  starsArray(rating: number): { full: boolean; half: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({
      full: i < Math.floor(rating),
      half: i === Math.floor(rating) && rating % 1 >= 0.5,
    }));
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const months = ['sij.', 'velj.', 'ožu.', 'tra.', 'svi.', 'lip.', 'srp.', 'kol.', 'ruj.', 'lis.', 'stu.', 'pro.'];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}.`;
  }
}
