import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type ProfileTab = 'overview' | 'posts' | 'reviews';

export interface ProfileInstrument {
  id: number;
  name: string;
  type: string;
}

export interface ProfileGenre {
  id: number;
  name: string;
}

export interface ProfileReview {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewerName: string;
  reviewerInitials: string;
  reviewerColor: string;
  eventName?: string;
}

export interface ProfileBandEntry {
  id: number;
  name: string;
  initials: string;
  color: string;
  instrument: string;
  role: 'Admin' | 'Member';
  genres: string[];
}

export interface MyProfileData {
  id: number;
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
  instruments: ProfileInstrument[];
  genres: ProfileGenre[];
  bands: ProfileBandEntry[];
}

export interface ProfilePost {
  id: number;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

// Odgovori koje šalje backend
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
  bands: { bandId: number; bandName: string; role: string; joinedDate: string; leftDate?: string }[];
}

interface ReviewResponse {
  id: number;
  performerId: number;
  reviewerId?: number;
  reviewerFirstName?: string;
  reviewerLastName?: string;
  reviewerUserName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface PostResponse {
  id: number;
  profileId: number;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
}

interface FollowResponse {
  id: number;
}

const API = environment.apiBaseUrl;

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function profileColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function initials(firstName: string, lastName: string): string {
  return ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase();
}

@Injectable({ providedIn: 'root' })
export class MyProfileService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly profile = signal<MyProfileData>({
    id: 0, firstName: '', lastName: '', userName: '', description: '',
    initials: '', color: '', createdAt: '', followersCount: 0, followingCount: 0,
    averageRating: 0, numberOfReviews: 0, instruments: [], genres: [], bands: []
  });

  readonly activeTab = signal<ProfileTab>('overview');
  readonly isEditing = signal(false);
  readonly loading = signal(false);

  readonly editFirstName = signal('');
  readonly editLastName = signal('');
  readonly editDescription = signal('');

  readonly reviews = signal<ProfileReview[]>([]);
  readonly posts = signal<ProfilePost[]>([]);

  constructor() {
    // Automatski učitaj profil kad se korisnik prijavi
    effect(() => {
      const user = this.auth.currentUser();
      if (user?.role === 'Musician') {
        this.loadProfile(user.profileId);
      } else {
        this.resetProfile();
      }
    });
  }

  loadProfile(profileId: number): void {
    this.loading.set(true);

    forkJoin({
      musician: this.http.get<MusicianResponse>(`${API}/musician/${profileId}`),
      followers: this.http.get<FollowResponse[]>(`${API}/follow/followers/profile/${profileId}`).pipe(catchError(() => of([]))),
      following: this.http.get<FollowResponse[]>(`${API}/follow/following/${profileId}`).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ musician, followers, following }) => {
        this.profile.set({
          id: musician.id,
          firstName: musician.firstName,
          lastName: musician.lastName,
          userName: musician.userName,
          description: musician.description,
          initials: initials(musician.firstName, musician.lastName),
          color: profileColor(musician.id),
          createdAt: musician.createdAt,
          followersCount: followers.length,
          followingCount: following.length,
          averageRating: musician.averageRating ?? 0,
          numberOfReviews: musician.numberOfReviews ?? 0,
          instruments: musician.instruments,
          genres: musician.genres,
          bands: musician.bands.map(b => ({
            id: b.bandId,
            name: b.bandName,
            initials: b.bandName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            color: profileColor(b.bandId),
            instrument: musician.instruments[0]?.name ?? '',
            role: b.role === 'Admin' ? 'Admin' : 'Member',
            genres: [],
          }))
        });

        // Učitaj recenzije ako postoji performer profil
        if (musician.performerId) {
          this.loadReviews(musician.performerId);
        }

        this.loadPosts(profileId);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadReviews(performerId: number): void {
    this.http.get<ReviewResponse[]>(`${API}/review/performer/${performerId}`)
      .pipe(catchError(() => of([])))
      .subscribe(reviews => {
        this.reviews.set(reviews.map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
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

  private loadPosts(profileId: number): void {
    this.http.get<PostResponse[]>(`${API}/post/profile/${profileId}?viewerProfileId=${profileId}`)
      .pipe(catchError(() => of([])))
      .subscribe(posts => {
        this.posts.set(posts.map(p => ({
          id: p.id,
          content: p.content,
          createdAt: p.createdAt,
          likes: p.likesCount,
          comments: 0,
          isLiked: p.isLiked,
        })));
      });
  }

  private resetProfile(): void {
    this.profile.set({
      id: 0, firstName: '', lastName: '', userName: '', description: '',
      initials: '', color: '', createdAt: '', followersCount: 0, followingCount: 0,
      averageRating: 0, numberOfReviews: 0, instruments: [], genres: [], bands: []
    });
    this.reviews.set([]);
    this.posts.set([]);
  }

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  startEditing(): void {
    const p = this.profile();
    this.editFirstName.set(p.firstName);
    this.editLastName.set(p.lastName);
    this.editDescription.set(p.description);
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  saveEditing(): void {
    const firstName = this.editFirstName().trim();
    const lastName = this.editLastName().trim();
    const description = this.editDescription().trim();
    if (!firstName || !lastName) return;

    const id = this.profile().id;
    const userName = this.profile().userName;

    this.http.put(`${API}/musician/${id}`, { firstName, lastName, userName, description })
      .subscribe({
        next: () => {
          this.profile.update(p => ({
            ...p, firstName, lastName, description,
            initials: initials(firstName, lastName)
          }));
          this.isEditing.set(false);
        }
      });
  }

  togglePostLike(postId: number): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const post = this.posts().find(p => p.id === postId);
    if (!post) return;

    const toggle = (posts: ProfilePost[]) =>
      posts.map(p =>
        p.id !== postId ? p : {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
        }
      );

    this.posts.update(toggle);

    this.http.post<{ liked: boolean }>(`${API}/postlike`, { postId, profileId: user.profileId })
      .pipe(catchError(() => {
        this.posts.update(toggle);
        return of(null);
      }))
      .subscribe(res => {
        if (res) {
          this.posts.update(posts =>
            posts.map(p => {
              if (p.id !== postId || p.isLiked === res.liked) return p;
              return {
                ...p,
                isLiked: res.liked,
                likes: res.liked ? p.likes + 1 : Math.max(0, p.likes - 1),
              };
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
