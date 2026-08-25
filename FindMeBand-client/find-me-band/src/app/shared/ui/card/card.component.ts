import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Površina na kojoj stoji sadržaj — jedinstvena pozadina, zaobljenje i sjena.
 *
 * ```html
 * <app-card padding="lg" [interactive]="true">…</app-card>
 * ```
 */
@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styleUrl: './card.component.scss',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class CardComponent {
  readonly padding = input<CardPadding>('md');

  /** Podiže sjenu na prijelaz mišem — za kartice koje vode nekamo. */
  readonly interactive = input<boolean>(false);

  /** Obrub umjesto sjene, za gušće popise. */
  readonly bordered = input<boolean>(false);

  protected readonly hostClasses = computed(() =>
    [
      'card',
      `card--pad-${this.padding()}`,
      this.interactive() ? 'card--interactive' : '',
      this.bordered() ? 'card--bordered' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );
}
