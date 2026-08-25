import { Component, HostListener, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { EmptyStateComponent, IconComponent } from '../../ui';
import { IconName } from '../../ui/icon/icon-registry';

/** Vrsta obavijesti preslikana na ikonu i boju u kojoj se prikazuje. */
type NotifKind = 'follow' | 'apply' | 'accept' | 'reject' | 'review' | 'bell';

const NOTIF_KINDS: Record<string, NotifKind> = {
  NewFollower: 'follow',
  NewApplication: 'apply',
  ApplicationAccepted: 'accept',
  ApplicationRejected: 'reject',
  NewReview: 'review',
};

const NOTIF_ICONS: Record<NotifKind, IconName> = {
  follow: 'user-plus',
  apply: 'calendar',
  accept: 'check',
  reject: 'x',
  review: 'star',
  bell: 'bell',
};

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [IconComponent, EmptyStateComponent],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss',
})
export class NotificationBellComponent {
  readonly s = inject(NotificationService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.s.close();
  }

  onBellClick(event: MouseEvent): void {
    event.stopPropagation();
    this.s.toggleOpen();
  }

  onPanelClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.s.close();
  }

  onNotificationClick(id: number, isRead: boolean): void {
    if (!isRead) this.s.markRead(id);
  }

  /** Kategorija obavijesti — koristi se i za ikonu i za boju pozadine. */
  notifKind(type: string): NotifKind {
    return NOTIF_KINDS[type] ?? 'bell';
  }

  notifIcon(type: string): IconName {
    return NOTIF_ICONS[this.notifKind(type)];
  }
}
