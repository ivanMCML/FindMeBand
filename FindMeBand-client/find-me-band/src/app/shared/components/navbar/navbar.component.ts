import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  navLinks = [
    { path: '/musicians', label: 'Musicians', icon: '🎸' },
    { path: '/bands', label: 'Bands', icon: '🎵' },
    { path: '/performers', label: 'Performers', icon: '⭐' },
    { path: '/events', label: 'Events', icon: '🎤' },
    { path: '/opportunities', label: 'Opportunities', icon: '🔍' },
  ];

  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
