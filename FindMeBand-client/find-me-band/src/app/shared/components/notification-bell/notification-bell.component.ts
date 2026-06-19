import { Component, HostListener, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [],
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

  notifIcon(type: string): string {
    switch (type) {
      case 'NewFollower': return 'follow';
      case 'NewApplication': return 'apply';
      case 'ApplicationAccepted': return 'accept';
      case 'ApplicationRejected': return 'reject';
      case 'NewReview': return 'review';
      default: return 'bell';
    }
  }
}
