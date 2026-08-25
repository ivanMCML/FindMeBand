import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { avatarColor, toInitials } from '../../../core/utils/avatar.util';
import { mediaUrl } from '../../../core/utils/media.util';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square';

/**
 * Avatar profila ili benda.
 *
 * ```html
 * <app-avatar [name]="post.authorName" [imageUrl]="post.authorAvatarUrl"
 *             [colorId]="post.profileId" shape="square" size="md" />
 * ```
 *
 * Kad slike nema — ili se ne uspije učitati — prikazuje inicijale na
 * determinističkoj boji izvedenoj iz `colorId`, pa isti profil uvijek
 * izgleda isto. Bendovi se po dogovoru crtaju kao zaobljeni kvadrat.
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (resolvedUrl(); as url) {
      <img
        class="avatar avatar--img"
        [src]="url"
        [alt]="name()"
        loading="lazy"
        (error)="onImageError()"
      />
    } @else {
      <span class="avatar avatar--initials" [style.background]="background()" aria-hidden="true">
        {{ initials() }}
      </span>
      <span class="sr-only">{{ name() }}</span>
    }
  `,
  styleUrl: './avatar.component.scss',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class AvatarComponent {
  /** Puno ime — koristi se za inicijale i kao alternativni tekst. */
  readonly name = input<string>('');

  /** Relativna ili apsolutna putanja slike; prazno pada na inicijale. */
  readonly imageUrl = input<string | null>(null);

  /** Identifikator iz kojeg se izvodi boja pozadine. */
  readonly colorId = input<number>(0);

  readonly size = input<AvatarSize>('md');
  readonly shape = input<AvatarShape>('circle');

  /** Izrijekom zadana boja pozadine; nadjačava `colorId`. */
  readonly color = input<string>('');

  private readonly imageFailed = signal(false);

  protected readonly resolvedUrl = computed(() =>
    this.imageFailed() ? null : mediaUrl(this.imageUrl())
  );

  protected readonly initials = computed(() => toInitials(this.name()) || '?');

  protected readonly background = computed(
    () => this.color() || avatarColor(this.colorId())
  );

  protected readonly hostClasses = computed(
    () => `avatar-host avatar-host--${this.size()} avatar-host--${this.shape()}`
  );

  protected onImageError(): void {
    this.imageFailed.set(true);
  }
}
