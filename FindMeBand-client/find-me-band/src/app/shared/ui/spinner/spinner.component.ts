import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Pokazatelj učitavanja.
 *
 * ```html
 * <app-spinner [size]="16" label="Učitavam komentare" />
 * ```
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="spinner"
      role="status"
      [attr.aria-label]="label()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.border-width.px]="borderWidth()"
    ></span>
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }

    .spinner {
      display: block;
      border-style: solid;
      border-color: var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: var(--radius-full);
      animation: spinner-rotate 0.7s linear infinite;
    }

    @keyframes spinner-rotate {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class SpinnerComponent {
  readonly size = input<number>(20);
  readonly label = input<string>('Učitavanje');

  protected readonly borderWidth = computed(() => Math.max(2, Math.round(this.size() / 10)));
}
