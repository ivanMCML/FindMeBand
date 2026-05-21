import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface FeedPost {
  id: number;
  profileId: number;
  authorName: string;
  authorUserName: string;
  authorInitials: string;
  authorColor: string;
  authorType: 'musician' | 'band';
  bandId: number | null;
  content: string;
  createdAt: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface PostResponse {
  id: number;
  profileId: number;
  authorFirstName: string;
  authorLastName: string;
  authorUserName: string;
  bandId: number | null;
  bandName: string | null;
  content: string;
  createdAt: string;
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

  readonly currentPosts = computed(() =>
    this.activeTab() === 'following' ? this.followingPosts() : this.explorePosts()
  );

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.load();
      } else {
        this.followingPosts.set([]);
        this.explorePosts.set([]);
      }
    });
  }

  load(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      explore: this.http.get<PostResponse[]>(`${API}/post?profileId=${user.profileId}`),
      following: this.http.get<PostResponse[]>(`${API}/post/feed/${user.profileId}`)
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ explore, following }) => {
        this.explorePosts.set(explore.map(p => this.toPost(p)));
        this.followingPosts.set(following.map(p => this.toPost(p)));
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

    const wasLiked = post.isLiked;

    const toggle = (posts: FeedPost[]) =>
      posts.map(p => p.id !== postId ? p : {
        ...p,
        isLiked: !p.isLiked,
        likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
      });

    this.followingPosts.update(toggle);
    this.explorePosts.update(toggle);

    const request$ = wasLiked
      ? this.http.delete(`${API}/postlike?postId=${postId}&profileId=${user.profileId}`)
      : this.http.post(`${API}/postlike`, { postId, profileId: user.profileId });

    request$.pipe(catchError(() => {
      this.followingPosts.update(toggle);
      this.explorePosts.update(toggle);
      return of(null);
    })).subscribe();
  }

  createPost(content: string, onSuccess: () => void): void {
    const user = this.auth.currentUser();
    if (!user || !content.trim()) return;

    this.submittingPost.set(true);

    this.http.post<PostResponse>(`${API}/post`, {
      profileId: user.profileId,
      content: content.trim(),
      media: [],
    }).subscribe({
      next: (created) => {
        const newPost = this.toPost(created, this.likedIds());
        this.followingPosts.update(posts => [newPost, ...posts]);
        this.explorePosts.update(posts => [newPost, ...posts]);
        this.submittingPost.set(false);
        onSuccess();
      },
      error: () => this.submittingPost.set(false)
    });
  }

  private toPost(p: PostResponse): FeedPost {
    const isBandPost = p.bandId !== null;
    const displayName = isBandPost ? (p.bandName ?? 'Bend') : `${p.authorFirstName} ${p.authorLastName}`;
    const displayUserName = isBandPost ? (p.bandName ?? '') : p.authorUserName;
    const colorId = isBandPost ? (p.bandId ?? p.profileId) : p.profileId;

    return {
      id: p.id,
      profileId: p.profileId,
      authorName: displayName,
      authorUserName: displayUserName,
      authorInitials: toInitials(displayName),
      authorColor: authorColor(colorId),
      authorType: isBandPost ? 'band' : 'musician',
      bandId: p.bandId,
      content: p.content,
      createdAt: p.createdAt,
      timestamp: relativeTime(p.createdAt),
      likes: p.likesCount,
      isLiked: p.isLiked,
    };
  }
}
