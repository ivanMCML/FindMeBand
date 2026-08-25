import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { avatarColor, toInitials } from '../../../core/utils/avatar.util';
import { AvatarComponent, ButtonComponent, IconComponent } from '../../ui';
import { IconName } from '../../ui/icon/icon-registry';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

/** Glavna navigacija glazbenika. */
const MUSICIAN_NAV: readonly NavItem[] = [
  { path: '/musician/home', label: 'Naslovnica', icon: 'home' },
  { path: '/musician/explore', label: 'Istraži', icon: 'search' },
  { path: '/musician/opportunities', label: 'Prilike', icon: 'briefcase' },
  { path: '/musician/events', label: 'Događaji', icon: 'calendar' },
  { path: '/musician/messages', label: 'Poruke', icon: 'message' },
  { path: '/musician/my-bands', label: 'Moji bendovi', icon: 'users' },
  { path: '/musician/my-profile', label: 'Moj profil', icon: 'user' },
];

/** Glavna navigacija organizatora. */
const ORGANIZER_NAV: readonly NavItem[] = [
  { path: '/organizer/my-events', label: 'Moji događaji', icon: 'calendar' },
  { path: '/organizer/my-profile', label: 'Moj profil', icon: 'user' },
];

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NotificationBellComponent,
    AvatarComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.scss',
})
export class LeftSidebarComponent {
  private readonly auth = inject(AuthService);

  readonly role = computed(() => this.auth.currentUser()?.role ?? 'Musician');

  /** Stavke navigacije za ulogu prijavljenog korisnika. */
  readonly navItems = computed(() =>
    this.role() === 'Organizer' ? ORGANIZER_NAV : MUSICIAN_NAV
  );

  readonly currentUser = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return { name: '', username: '', initials: '?', color: avatarColor(0), profileId: 0 };

    const name = `${u.firstName} ${u.lastName}`;
    return {
      name,
      username: u.userName,
      initials: toInitials(name),
      color: avatarColor(u.profileId),
      profileId: u.profileId,
    };
  });

  logout(): void {
    this.auth.logout();
  }
}
