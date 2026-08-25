import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeedPost, PostComment } from '../../../core/models/feed.model';
import { fullDateTime } from '../../../core/utils/date.util';
import { mediaUrl } from '../../../core/utils/media.util';
import { AvatarComponent } from '../../ui/avatar/avatar.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { CardComponent } from '../../ui/card/card.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';

/**
 * Objava u feedu — zaglavlje s autorom, sadržaj, slike, komentari i radnje.
 *
 * Komponenta je isključivo prikazna: sve stanje stiže ulazima, a svaka
 * interakcija izlazi kao događaj. Zato je ista kartica upotrebljiva na
 * naslovnici, profilu glazbenika, profilu benda i stranici benda, bez
 * obzira na to koji servis stoji iza njih.
 *
 * ```html
 * <app-post-card
 *   [post]="post"
 *   [currentProfileId]="service.myProfileId()"
 *   [comments]="service.commentsMap().get(post.id) ?? []"
 *   [commentsExpanded]="service.expandedPostIds().has(post.id)"
 *   [commentDraft]="commentInput(post.id)"
 *   (likeToggled)="service.toggleLike(post.id)"
 *   (commentsToggled)="service.toggleComments(post.id)"
 *   (commentDraftChanged)="setCommentInput(post.id, $event)"
 *   (commentSubmitted)="submitComment(post.id)"
 * />
 * ```
 */
@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    RouterLink,
    AvatarComponent,
    ButtonComponent,
    CardComponent,
    IconComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent {
  readonly post = input.required<FeedPost>();

  /** Profil prijavljenog korisnika — određuje što smije brisati. */
  readonly currentProfileId = input<number | null>(null);

  // ── Komentari ────────────────────────────────────────────
  readonly comments = input<PostComment[]>([]);
  readonly commentsExpanded = input<boolean>(false);
  readonly commentsLoading = input<boolean>(false);
  readonly commentSubmitting = input<boolean>(false);
  readonly commentDraft = input<string>('');

  /**
   * Isključi kad kartica već stoji na profilu autora, pa poveznica
   * na taj isti profil ne bi vodila nikamo novo.
   */
  readonly linkToAuthor = input<boolean>(true);

  // ── Događaji ─────────────────────────────────────────────
  readonly likeToggled = output<void>();
  readonly commentsToggled = output<void>();
  readonly postDeleted = output<void>();
  readonly commentDeleted = output<number>();
  readonly commentDraftChanged = output<string>();
  readonly commentSubmitted = output<void>();
  readonly shared = output<void>();

  protected readonly isBand = computed(() => this.post().authorType === 'band');

  protected readonly isOwnPost = computed(
    () => this.currentProfileId() !== null && this.post().profileId === this.currentProfileId()
  );

  protected readonly authorLink = computed(() => {
    if (!this.linkToAuthor()) return null;
    const post = this.post();
    return post.authorType === 'band'
      ? ['/musician/b', post.bandId]
      : ['/musician/m', post.profileId];
  });

  protected readonly exactTime = computed(() => fullDateTime(this.post().createdAt));

  protected readonly canSubmitComment = computed(
    () => this.commentDraft().trim().length > 0 && !this.commentSubmitting()
  );

  protected readonly mediaUrl = mediaUrl;

  protected isOwnComment(comment: PostComment): boolean {
    return this.currentProfileId() !== null && comment.profileId === this.currentProfileId();
  }

  protected onCommentInput(event: Event): void {
    this.commentDraftChanged.emit((event.target as HTMLTextAreaElement).value);
  }

  protected onCommentEnter(event: Event): void {
    event.preventDefault();
    if (this.canSubmitComment()) this.commentSubmitted.emit();
  }
}
