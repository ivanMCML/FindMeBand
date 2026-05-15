import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.scss'
})
export class LeftSidebarComponent {
  private auth = inject(AuthService);

  readonly role = computed(() => this.auth.currentUser()?.role ?? 'Musician');

  readonly currentUser = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return { name: '', username: '', initials: '?', color: '#7c3aed' };
    const initials = ((u.firstName[0] ?? '') + (u.lastName[0] ?? '')).toUpperCase();
    const colors = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af'];
    const color = colors[Math.abs(u.profileId) % colors.length];
    return { name: `${u.firstName} ${u.lastName}`, username: u.userName, initials, color };
  });

  logout(): void {
    this.auth.logout();
  }
}
