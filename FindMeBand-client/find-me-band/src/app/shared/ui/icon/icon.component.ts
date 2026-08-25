import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FILLED_ICONS, ICONS, IconName } from './icon-registry';

/**
 * Prikazuje ikonu iz registra.
 *
 * ```html
 * <app-icon name="heart" [size]="18" />
 * <app-icon name="trash" label="Obriši objavu" />
 * ```
 *
 * Bez `label` ikona je čisto ukrasna i skriva se od čitača ekrana
 * (`aria-hidden`). Kad ikona sama nosi značenje — recimo u gumbu bez
 * teksta — proslijedi `label` da dobije `role="img"` i pristupačan naziv.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.fill]="isFilled() ? 'currentColor' : 'none'"
      [attr.stroke]="isFilled() ? 'none' : 'currentColor'"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      [attr.aria-hidden]="label() ? null : 'true'"
      [innerHTML]="paths()"
    ></svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 0;
    }

    svg {
      display: block;
    }
  `,
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Naziv ikone iz registra. */
  readonly name = input.required<IconName>();

  /** Širina i visina u pikselima. */
  readonly size = input<number>(20);

  /** Debljina obrisa. */
  readonly strokeWidth = input<number>(2);

  /**
   * Pristupačan naziv. Ostavi prazno za ukrasne ikone koje stoje
   * uz tekst koji već objašnjava značenje.
   */
  readonly label = input<string>('');

  /** Ispuni ikonu umjesto da je iscrtaš obrisom (npr. lajkano srce). */
  readonly filled = input<boolean>(false);

  protected readonly isFilled = computed(
    () => this.filled() || FILLED_ICONS.has(this.name())
  );

  /**
   * Sadržaj je statična konstanta iz registra u ovom repozitoriju, nikad
   * korisnički unos, pa je zaobilaženje sanitizacije ovdje sigurno —
   * potrebno je jer bi sanitizer inače uklonio SVG elemente.
   */
  protected readonly paths = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name()] ?? '')
  );
}
