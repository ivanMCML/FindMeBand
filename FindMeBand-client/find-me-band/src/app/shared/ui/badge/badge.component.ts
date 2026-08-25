import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'info';

/**
 * Sitna oznaka — žanr, uloga, status prijave.
 *
 * ```html
 * <app-badge tone="success">Prihvaćeno</app-badge>
 * <app-badge tone="primary">Rock</app-badge>
 * ```
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styleUrl: './badge.component.scss',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('primary');

  /** Puna ispuna umjesto blagog tonalnog pozadinskog sloja. */
  readonly solid = input<boolean>(false);

  protected readonly hostClasses = computed(() =>
    ['badge', `badge--${this.tone()}`, this.solid() ? 'badge--solid' : ''].filter(Boolean).join(' ')
  );
}
