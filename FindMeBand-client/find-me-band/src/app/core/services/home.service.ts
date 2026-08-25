import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BandOption, FeedPost } from '../models/feed.model';
import { PostResponse, toFeedPost } from '../utils/post.mapper';
import { AuthService } from './auth.service';
import { PostInteractionService } from './post-interaction.service';
import { ToastService } from './toast.service';

// Modeli su preseljeni u `core/models/feed.model.ts` jer ih dijele i druge
// značajke; ponovni izvoz čuva postojeće uvoze iz ovog servisa.
export type { BandOption, FeedPost, FeedPostMedia, PostComment } from '../models/feed.model';

interface MusicianBandInResponse {
  bandId: number;
  bandName: string;
  role: string;
}

interface MusicianResponse {
  performerId: number | null;
  bands: MusicianBandInResponse[];
}

const API = environment.apiBaseUrl;
const PAGE_SIZE = 20;

/**
 * Naslovni feed — objave profila koje korisnik prati i objave za istraživanje.
 *
 * Dohvat i stranicenje objava su ovdje; lajkovi, komentari i brisanje žive u
 * `PostInteractionService` jer ih dijele svi zasloni koji prikazuju objave.
 */
@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly interactions = inject(PostInteractionService);

  readonly activeTab = signal<'following' | 'explore'>('following');
  readonly followingPosts = signal<FeedPost[]>([]);
  readonly explorePosts = signal<FeedPost[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submittingPost = signal(false);
  readonly bandOptions = signal<BandOption[]>([]);
  readonly loadingMore = signal(false);
  readonly myProfileId = computed(() => this.auth.currentUser()?.profileId ?? null);

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
    this.interactions.registerFeed(this.followingPosts, this.explorePosts);

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
      explore: this.http.get<PostResponse[]>(
        `${API}/post?profileId=${user.profileId}&pageSize=${PAGE_SIZE}`
      ),
      following: this.http
        .get<PostResponse[]>(`${API}/post/feed/${user.profileId}?pageSize=${PAGE_SIZE}`)
        .pipe(catchError(() => of([]))),
      musician: this.http
        .get<MusicianResponse>(`${API}/musician/${user.profileId}`)
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ explore, following, musician }) => {
        this.explorePosts.set(explore.map(toFeedPost));
        this.followingPosts.set(following.map(toFeedPost));
        this._explorePage.set(1);
        this._followingPage.set(1);
        this.exploreHasMore.set(explore.length === PAGE_SIZE);
        this.followingHasMore.set(following.length === PAGE_SIZE);

        // Objaviti u ime benda smije samo njegov administrator
        this.bandOptions.set(
          (musician?.bands ?? [])
            .filter(b => b.role === 'Admin')
            .map(b => ({ bandId: b.bandId, bandName: b.bandName }))
        );

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Greška pri učitavanju objava.');
        this.loading.set(false);
      },
    });
  }

  setTab(tab: 'following' | 'explore'): void {
    this.activeTab.set(tab);
  }

  loadMore(): void {
    const user = this.auth.currentUser();
    if (!user || this.loadingMore()) return;

    this.loadingMore.set(true);

    const isExplore = this.activeTab() === 'explore';
    const pageSignal = isExplore ? this._explorePage : this._followingPage;
    const postsSignal = isExplore ? this.explorePosts : this.followingPosts;
    const hasMoreSignal = isExplore ? this.exploreHasMore : this.followingHasMore;
    const nextPage = pageSignal() + 1;

    const url = isExplore
      ? `${API}/post?profileId=${user.profileId}&page=${nextPage}&pageSize=${PAGE_SIZE}`
      : `${API}/post/feed/${user.profileId}?page=${nextPage}&pageSize=${PAGE_SIZE}`;

    this.http
      .get<PostResponse[]>(url)
      .pipe(catchError(() => of([])))
      .subscribe(posts => {
        postsSignal.update(existing => [...existing, ...posts.map(toFeedPost)]);
        pageSignal.set(nextPage);
        hasMoreSignal.set(posts.length === PAGE_SIZE);
        this.loadingMore.set(false);
      });
  }

  createPost(
    content: string,
    bandId: number | null,
    imageUrls: string[],
    onSuccess: () => void
  ): void {
    const user = this.auth.currentUser();
    if (!user || !content.trim()) return;

    this.submittingPost.set(true);

    this.http
      .post<PostResponse>(`${API}/post`, {
        profileId: user.profileId,
        bandId: bandId ?? null,
        content: content.trim(),
        media: imageUrls.map(url => ({ url, type: 0 })),
      })
      .subscribe({
        next: created => {
          const newPost = toFeedPost(created);
          this.followingPosts.update(posts => [newPost, ...posts]);
          this.explorePosts.update(posts => [newPost, ...posts]);
          this.submittingPost.set(false);
          onSuccess();
        },
        error: () => {
          this.submittingPost.set(false);
          this.toast.error('Objava nije spremljena. Pokušaj ponovno.');
        },
      });
  }

  uploadPostImage(file: File, onSuccess: (url: string) => void): void {
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<{ url: string }>(`${API}/upload/post-image`, formData).subscribe({
      next: ({ url }) => onSuccess(url),
      error: () => this.toast.error('Slika nije prenesena.'),
    });
  }
}
