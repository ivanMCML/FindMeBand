import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface BandOption {
  bandId: number;
  bandName: string;
}

export interface FeedPostMedia {
  id: number;
  url: string;
  type: string;
}

export interface FeedPost {
  id: number;
  profileId: number;
  authorName: string;
  authorUserName: string;
  authorInitials: string;
  authorColor: string;
  authorAvatarUrl: string | null;
  authorType: 'musician' | 'band';
  bandId: number | null;
  content: string;
  createdAt: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  media: FeedPostMedia[];
}

interface MusicianBandInResponse {
  bandId: number;
  bandName: string;
  role: string;
}

interface MusicianResponse {
  performerId: number | null;
  bands: MusicianBandInResponse[];
}

interface PostResponse {
  id: number;
  profileId: number;
  authorFirstName: string;
  authorLastName: string;
  authorUserName: string;
  authorAvatarUrl?: string;
  bandId: number | null;
  bandName: string | null;
  bandAvatarUrl?: string;
  content: string;
  createdAt: string;
  media: { id: number; url: string; type: string }[];
  likesCount: number;
  isLiked: boolean;
}

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function authorColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function toInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function relativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return 'upravo sad';
  if (mins < 60) return `${mins}min`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'jučer';
  return `${days}d`;
}

const API = environment.apiBaseUrl;
const PAGE_SIZE = 20;

@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly activeTab = signal<'following' | 'explore'>('following');
  readonly followingPosts = signal<FeedPost[]>([]);
  readonly explorePosts = signal<FeedPost[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submittingPost = signal(false);
  readonly bandOptions = signal<BandOption[]>([]);
  readonly loadingMore = signal(false);

  private readonly _explorePage = signal(1);
  private readonly _followingPage = signal(1);
  readonly exploreHasMore = signal(false);
  readonly followingHasMore = signal(false);

  readonly currentPosts = computed(() =>
    this.activeTab() === 'following' ? this.followingPosts() : this.explorePosts()
  );

  readonly currentHasMore = computed(() =>
    this.activeTab() === 'following' ? this.followingHasMore() : this.exploreHasMore()
  );

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.load();
      } else {
        this.followingPosts.set([]);
        this.explorePosts.set([]);
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
      explore: this.http.get<PostResponse[]>(`${API}/post?profileId=${user.profileId}&pageSize=${PAGE_SIZE}`),
      following: this.http.get<PostResponse[]>(`${API}/post/feed/${user.profileId}&pageSize=${PAGE_SIZE}`)
        .pipe(catchError(() => of([]))),
      musician: this.http.get<MusicianResponse>(`${API}/musician/${user.profileId}`)
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ explore, following, musician }) => {
        this.explorePosts.set(explore.map(p => this.toPost(p)));
        this.followingPosts.set(following.map(p => this.toPost(p)));
        this._explorePage.set(1);
        this._followingPage.set(1);
        this.exploreHasMore.set(explore.length === PAGE_SIZE);
        this.followingHasMore.set(following.length === PAGE_SIZE);
        const adminBands = (musician?.bands ?? [])
          .filter(b => b.role === 'Admin')
          .map(b => ({ bandId: b.bandId, bandName: b.bandName }));
        this.bandOptions.set(adminBands);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Greška pri učitavanju objava.');
        this.loading.set(false);
      }
    });
  }

  setTab(tab: 'following' | 'explore'): void {
    this.activeTab.set(tab);
  }

  toggleLike(postId: number): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const allPosts = [...this.followingPosts(), ...this.explorePosts()];
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    const toggle = (posts: FeedPost[]) =>
      posts.map(p => p.id !== postId ? p : {
        ...p,
        isLiked: !p.isLiked,
        likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
      });

    this.followingPosts.update(toggle);
    this.explorePosts.update(toggle);

    this.http.post<{ liked: boolean }>(`${API}/postlike`, { postId, profileId: user.profileId })
      .pipe(catchError(() => {
        this.followingPosts.update(toggle);
        this.explorePosts.update(toggle);
        return of(null);
      }))
      .subscribe(res => {
        if (res) {
          // Korigira drift između optimističnog stanja i stvarnog odgovora servera
          const sync = (posts: FeedPost[]) =>
            posts.map(p => {
              if (p.id !== postId || p.isLiked === res.liked) return p;
              return {
                ...p,
                isLiked: res.liked,
                likes: res.liked ? p.likes + 1 : Math.max(0, p.likes - 1),
              };
            });
          this.followingPosts.update(sync);
          this.explorePosts.update(sync);
        }
      });
  }

  loadMore(): void {
    const user = this.auth.currentUser();
    if (!user || this.loadingMore()) return;
    this.loadingMore.set(true);

    if (this.activeTab() === 'explore') {
      const nextPage = this._explorePage() + 1;
      this.http.get<PostResponse[]>(`${API}/post?profileId=${user.profileId}&page=${nextPage}&pageSize=${PAGE_SIZE}`)
        .pipe(catchError(() => of([])))
        .subscribe(posts => {
          this.explorePosts.update(existing => [...existing, ...posts.map(p => this.toPost(p))]);
          this._explorePage.set(nextPage);
          this.exploreHasMore.set(posts.length === PAGE_SIZE);
          this.loadingMore.set(false);
        });
    } else {
      const nextPage = this._followingPage() + 1;
      this.http.get<PostResponse[]>(`${API}/post/feed/${user.profileId}?page=${nextPage}&pageSize=${PAGE_SIZE}`)
        .pipe(catchError(() => of([])))
        .subscribe(posts => {
          this.followingPosts.update(existing => [...existing, ...posts.map(p => this.toPost(p))]);
          this._followingPage.set(nextPage);
          this.followingHasMore.set(posts.length === PAGE_SIZE);
          this.loadingMore.set(false);
        });
    }
  }

  createPost(content: string, bandId: number | null, imageUrls: string[], onSuccess: () => void): void {
    const user = this.auth.currentUser();
    if (!user || !content.trim()) return;

    this.submittingPost.set(true);

    this.http.post<PostResponse>(`${API}/post`, {
      profileId: user.profileId,
      bandId: bandId ?? null,
      content: content.trim(),
      media: imageUrls.map(url => ({ url, type: 0 })),
    }).subscribe({
      next: (created) => {
        const newPost = this.toPost(created);
        this.followingPosts.update(posts => [newPost, ...posts]);
        this.explorePosts.update(posts => [newPost, ...posts]);
        this.submittingPost.set(false);
        onSuccess();
      },
      error: () => this.submittingPost.set(false)
    });
  }

  uploadPostImage(file: File, onSuccess: (url: string) => void): void {
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<{ url: string }>(`${API}/upload/post-image`, formData)
      .subscribe({ next: ({ url }) => onSuccess(url) });
  }

  private toPost(p: PostResponse): FeedPost {
    const isBandPost = p.bandId !== null;
    const displayName = isBandPost ? (p.bandName ?? 'Bend') : `${p.authorFirstName} ${p.authorLastName}`;
    const displayUserName = isBandPost ? (p.bandName ?? '') : p.authorUserName;
    const colorId = isBandPost ? (p.bandId ?? p.profileId) : p.profileId;
    const avatarUrl = isBandPost ? (p.bandAvatarUrl ?? null) : (p.authorAvatarUrl ?? null);

    return {
      id: p.id,
      profileId: p.profileId,
      authorName: displayName,
      authorUserName: displayUserName,
      authorInitials: toInitials(displayName),
      authorColor: authorColor(colorId),
      authorAvatarUrl: avatarUrl,
      authorType: isBandPost ? 'band' : 'musician',
      bandId: p.bandId,
      content: p.content,
      createdAt: p.createdAt,
      timestamp: relativeTime(p.createdAt),
      likes: p.likesCount,
      isLiked: p.isLiked,
      media: (p.media ?? []).map(m => ({ id: m.id, url: m.url, type: m.type })),
    };
  }
}
