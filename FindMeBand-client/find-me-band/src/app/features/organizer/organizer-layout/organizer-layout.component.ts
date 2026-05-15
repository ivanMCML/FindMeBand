import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeftSidebarComponent } from '../../../shared/components/left-sidebar/left-sidebar.component';
import { RightSidebarComponent } from '../../../shared/components/right-sidebar/right-sidebar.component';

@Component({
  selector: 'app-organizer-layout',
  standalone: true,
  imports: [RouterOutlet, LeftSidebarComponent, RightSidebarComponent],
  templateUrl: './organizer-layout.component.html',
  styleUrl: './organizer-layout.component.scss'
})
export class OrganizerLayoutComponent {}
