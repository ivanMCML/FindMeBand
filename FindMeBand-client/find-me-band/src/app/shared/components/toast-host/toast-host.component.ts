import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastTone } from '../../../core/services/toast.service';
import { IconComponent } from '../../ui';
import { IconName } from '../../ui/icon/icon-registry';

const TONE_ICONS: Record<ToastTone, IconName> = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'info',
};

/**
 * Prikazuje poruke iz `ToastService`.
 *
 * Stoji jednom, u korijenu aplikacije, iznad svega ostaloga.
 */
@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="false">
      @for (toast of service.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.tone" role="status">
          <app-icon [name]="icon(toast.tone)" [size]="18" />
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" aria-label="Zatvori" (click)="service.dismiss(toast.id)">
            <app-icon name="x" [size]="14" [strokeWidth]="2.5" />
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-host.component.scss',
})
export class ToastHostComponent {
  readonly service = inject(ToastService);

  protected icon(tone: ToastTone): IconName {
    return TONE_ICONS[tone];
  }
}
