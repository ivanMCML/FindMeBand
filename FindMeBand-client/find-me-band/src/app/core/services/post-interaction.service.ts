import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FeedPost, PostComment } from '../models/feed.model';
import { avatarColor, toInitials } from '../utils/avatar.util';
import { relativeTime } from '../utils/date.util';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

interface CommentResponse {
  id: number;
  postId: number;
  profileId: number;
  authorFirstName: string;
  authorLastName: string;
  authorUserName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
}

const API = environment.apiBaseUrl;

/**
 * Lajkovi, komentari i brisanje objava — zajednički za svaki zaslon koji
 * prikazuje objave.
 *
 * Zasloni prijavljuju svoje popise objava kroz `registerFeed`, pa promjena
 * napravljena na jednom mjestu odmah osvježi sve ostale: lajk s naslovnice
 * vidi se i na profilu autora bez ponovnog dohvata.
 *
 * Stanje komentara je ključem objave, a ne zaslona, pa otvoreni komentari
 * preživljavaju prijelaz između ruta.
 */
@Injectable({ providedIn: 'root' })
export class PostInteractionService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly expandedPostIds = signal<Set<number>>(new Set());
  readonly commentsMap = signal<Map<number, PostComment[]>>(new Map());
  readonly loadingCommentsIds = signal<Set<number>>(new Set());
  readonly submittingCommentIds = signal<Set<number>>(new Set());
  readonly drafts = signal<Record<number, string>>({});

  private readonly feeds = new Set<WritableSignal<FeedPost[]>>();

  /**
   * Prijavljuje popis objava kao metu osvježavanja.
   *
   * Servisi to pozivaju jednom, u konstruktoru — svi su korijenski i žive
   * koliko i aplikacija, pa odjava nije potrebna.
   */
  registerFeed(...feeds: WritableSignal<FeedPost[]>[]): void {
    feeds.forEach(feed => this.feeds.add(feed));
  }

  /** Primjenjuje preslikavanje na svaki prijavljeni popis objava. */
  private updateFeeds(fn: (posts: FeedPost[]) => FeedPost[]): void {
    this.feeds.forEach(feed => feed.update(fn));
  }

  // ── Lajkovi ────────────────────────────────────────────────

  /**
   * Prebacuje oznaku sviđanja odmah, pa je usklađuje s odgovorom poslužitelja.
   *
   * Ako zahtjev padne, promjena se vraća unatrag istim preslikavanjem.
   */
  toggleLike(postId: number): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const toggle = (posts: FeedPost[]) =>
      posts.map(p =>
        p.id !== postId
          ? p
          : {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
            }
      );

    this.updateFeeds(toggle);

    this.http
      .post<{ liked: boolean }>(`${API}/postlike`, { postId, profileId: user.profileId })
      .pipe(
        catchError(() => {
          this.updateFeeds(toggle);
          this.toast.error('Oznaka sviđanja nije spremljena.');
          return of(null);
        })
      )
      .subscribe(res => {
        if (!res) return;
        // Ispravlja razmimoilaženje između pretpostavljenog i stvarnog stanja
        this.updateFeeds(posts =>
          posts.map(p => {
            if (p.id !== postId || p.isLiked === res.liked) return p;
            return {
              ...p,
              isLiked: res.liked,
              likes: res.liked ? p.likes + 1 : Math.max(0, p.likes - 1),
            };
          })
        );
      });
  }

  // ── Objave ─────────────────────────────────────────────────

  deletePost(postId: number): void {
    this.http.delete(`${API}/post/${postId}`).subscribe({
      next: () => {
        this.updateFeeds(posts => posts.filter(p => p.id !== postId));
        this.toast.success('Objava je obrisana.');
      },
      error: () => this.toast.error('Objava nije obrisana.'),
    });
  }

  // ── Komentari ──────────────────────────────────────────────

  /** Otvara ili zatvara komentare; pri prvom otvaranju ih dohvaća. */
  toggleComments(postId: number): void {
    const expanded = new Set(this.expandedPostIds());

    if (expanded.has(postId)) {
      expanded.delete(postId);
      this.expandedPostIds.set(expanded);
      return;
    }

    expanded.add(postId);
    this.expandedPostIds.set(expanded);

    if (!this.commentsMap().has(postId)) this.loadComments(postId);
  }

  loadComments(postId: number): void {
    this.markLoading(postId, true);

    this.http
      .get<CommentResponse[]>(`${API}/postcomment/post/${postId}`)
      .pipe(
        catchError(() => {
          this.toast.error('Komentare nije bilo moguće učitati.');
          return of([]);
        })
      )
      .subscribe(comments => {
        this.commentsMap.update(map => {
          const next = new Map(map);
          next.set(postId, comments.map(c => this.toComment(c)));
          return next;
        });
        this.markLoading(postId, false);
      });
  }

  draft(postId: number): string {
    return this.drafts()[postId] ?? '';
  }

  setDraft(postId: number, value: string): void {
    this.drafts.update(d => ({ ...d, [postId]: value }));
  }

  /** Šalje komentar iz skice za zadanu objavu i prazni je pri uspjehu. */
  submitComment(postId: number): void {
    const user = this.auth.currentUser();
    const content = this.draft(postId).trim();
    if (!user || !content) return;

    this.markSubmitting(postId, true);

    this.http
      .post<CommentResponse>(`${API}/postcomment`, {
        postId,
        profileId: user.profileId,
        content,
      })
      .subscribe({
        next: created => {
          this.commentsMap.update(map => {
            const next = new Map(map);
            next.set(postId, [...(next.get(postId) ?? []), this.toComment(created)]);
            return next;
          });
          this.shiftCommentCount(postId, 1);
          this.setDraft(postId, '');
          this.markSubmitting(postId, false);
        },
        error: () => {
          this.markSubmitting(postId, false);
          this.toast.error('Komentar nije poslan.');
        },
      });
  }

  deleteComment(postId: number, commentId: number): void {
    this.http.delete(`${API}/postcomment/${commentId}`).subscribe({
      next: () => {
        this.commentsMap.update(map => {
          const next = new Map(map);
          next.set(postId, (next.get(postId) ?? []).filter(c => c.id !== commentId));
          return next;
        });
        this.shiftCommentCount(postId, -1);
      },
      error: () => this.toast.error('Komentar nije obrisan.'),
    });
  }

  // ── Pomoćne ────────────────────────────────────────────────

  private shiftCommentCount(postId: number, delta: number): void {
    this.updateFeeds(posts =>
      posts.map(p =>
        p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount + delta) } : p
      )
    );
  }

  private markLoading(postId: number, loading: boolean): void {
    this.loadingCommentsIds.update(ids => this.withId(ids, postId, loading));
  }

  private markSubmitting(postId: number, submitting: boolean): void {
    this.submittingCommentIds.update(ids => this.withId(ids, postId, submitting));
  }

  private withId(ids: Set<number>, postId: number, present: boolean): Set<number> {
    const next = new Set(ids);
    present ? next.add(postId) : next.delete(postId);
    return next;
  }

  private toComment(c: CommentResponse): PostComment {
    const name = `${c.authorFirstName} ${c.authorLastName}`;
    return {
      id: c.id,
      postId: c.postId,
      profileId: c.profileId,
      authorName: name,
      authorUserName: c.authorUserName,
      authorInitials: toInitials(name),
      authorColor: avatarColor(c.profileId),
      authorAvatarUrl: c.authorAvatarUrl ?? null,
      content: c.content,
      createdAt: c.createdAt,
      timestamp: relativeTime(c.createdAt),
    };
  }
}
