import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.scss'
})
export class LeftSidebarComponent {
  readonly currentUser = {
    name: 'Pero Perić',
    username: 'pero_peric',
    initials: 'PP',
    color: '#7c3aed'
  };
}
