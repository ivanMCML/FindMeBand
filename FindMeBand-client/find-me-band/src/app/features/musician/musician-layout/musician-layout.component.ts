import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeftSidebarComponent } from '../../../shared/components/left-sidebar/left-sidebar.component';
import { RightSidebarComponent } from '../../../shared/components/right-sidebar/right-sidebar.component';

@Component({
  selector: 'app-musician-layout',
  standalone: true,
  imports: [RouterOutlet, LeftSidebarComponent, RightSidebarComponent],
  templateUrl: './musician-layout.component.html',
  styleUrl: './musician-layout.component.scss'
})
export class MusicianLayoutComponent {}
