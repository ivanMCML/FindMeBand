import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';

/**
 * Poruka kad popis nema sadržaja, kad se učitava ili kad dohvat ne uspije.
 *
 * ```html
 * <app-empty-state icon="users" message="Nema objava od profila koje pratiš.">
 *   <app-button variant="secondary">Pronađi glazbenike</app-button>
 * </app-empty-state>
 * ```
 *
 * Projicirani sadržaj ide ispod poruke i namijenjen je radnji koja
 * korisniku nudi izlaz iz praznog stanja.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty" [attr.role]="tone() === 'error' ? 'alert' : 'status'">
      @if (loading()) {
        <span class="empty__spinner" aria-hidden="true"></span>
      } @else if (icon()) {
        <app-icon [name]="$any(icon())" [size]="40" [strokeWidth]="1.5" />
      }

      @if (title()) {
        <h3 class="empty__title">{{ title() }}</h3>
      }

      <p class="empty__message">{{ message() }}</p>

      <ng-content />
    </div>
  `,
  styleUrl: './empty-state.component.scss',
  host: {
    '[class.empty-host--error]': 'tone() === "error"',
  },
})
export class EmptyStateComponent {
  readonly icon = input<IconName | ''>('');
  readonly title = input<string>('');
  readonly message = input<string>('');

  /** Prikazuje vrtuljak umjesto ikone. */
  readonly loading = input<boolean>(false);

  /** `error` boji poruku upozoravajuće i najavljuje je kao `alert`. */
  readonly tone = input<'neutral' | 'error'>('neutral');
}
