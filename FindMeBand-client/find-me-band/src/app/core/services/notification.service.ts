import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface AppNotification {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actorProfileId: number | null;
  actorName: string | null;
  eventId: number | null;
}

const API = environment.apiBaseUrl;
const POLL_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly notifications = signal<AppNotification[]>([]);
  readonly isOpen = signal(false);
  readonly unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.load(user.profileId);
        this.startPolling(user.profileId);
      } else {
        this.notifications.set([]);
        this.stopPolling();
        this.isOpen.set(false);
      }
    });
  }

  load(profileId: number): void {
    this.http.get<AppNotification[]>(`${API}/notification/${profileId}`)
      .pipe(catchError(() => of([])))
      .subscribe(ns => this.notifications.set(ns));
  }

  markRead(id: number): void {
    this.http.patch(`${API}/notification/${id}/read`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.notifications.update(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
      });
  }

  markAllRead(): void {
    const profileId = this.auth.currentUser()?.profileId;
    if (!profileId) return;
    this.http.patch(`${API}/notification/read-all/${profileId}`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.notifications.update(ns => ns.map(n => ({ ...n, isRead: true })));
      });
  }

  toggleOpen(): void {
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  private startPolling(profileId: number): void {
    this.stopPolling();
    this.pollTimer = setInterval(() => this.load(profileId), POLL_MS);
  }

  private stopPolling(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return 'upravo sada';
    if (diffMin < 60) return `prije ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `prije ${diffH} h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `prije ${diffD} d`;
    const months = ['sij.', 'velj.', 'ožu.', 'tra.', 'svi.', 'lip.', 'srp.', 'kol.', 'ruj.', 'lis.', 'stu.', 'pro.'];
    return `${date.getDate()}. ${months[date.getMonth()]}`;
  }
}
