import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-registry';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'rounded' | 'pill' | 'circle';

/**
 * Gumb aplikacije.
 *
 * ```html
 * <app-button variant="primary" shape="pill" [loading]="saving()" (click)="save()">
 *   Objavi
 * </app-button>
 *
 * <app-button variant="ghost" shape="circle" icon="trash" label="Obriši objavu" />
 * ```
 *
 * Gumb bez vidljivog teksta mora dobiti `label` — inače ga čitač ekrana
 * pročita kao praznu tipku.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [class]="classes()"
      [disabled]="disabled() || loading()"
      [attr.aria-label]="label() || null"
      [attr.aria-busy]="loading() ? 'true' : null"
    >
      @if (loading()) {
        <span class="btn__spinner" aria-hidden="true"></span>
      } @else if (icon()) {
        <app-icon [name]="$any(icon())" [size]="iconSize()" [filled]="iconFilled()" />
      }
      <ng-content />
    </button>
  `,
  styleUrl: './button.component.scss',
  host: {
    '[class.btn-host--full]': 'fullWidth()',
  },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly shape = input<ButtonShape>('rounded');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);

  /** Neobavezna ikona ispred sadržaja. */
  readonly icon = input<IconName | ''>('');
  readonly iconFilled = input<boolean>(false);

  /** Pristupačan naziv — obavezan kad gumb nema vidljiv tekst. */
  readonly label = input<string>('');

  /** Označava gumb kao trenutno odabran (npr. filter ili tab pilula). */
  readonly active = input<boolean>(false);

  protected readonly iconSize = computed(
    () => ({ sm: 14, md: 16, lg: 18 })[this.size()]
  );

  protected readonly classes = computed(() =>
    [
      'btn',
      `btn--${this.variant()}`,
      `btn--${this.size()}`,
      `btn--${this.shape()}`,
      this.fullWidth() ? 'btn--full' : '',
      this.active() ? 'btn--active' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );
}
