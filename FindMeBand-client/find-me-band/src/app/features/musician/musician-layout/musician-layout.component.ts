import { Component, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { LeftSidebarComponent } from '../../../shared/components/left-sidebar/left-sidebar.component';
import { RightSidebarComponent } from '../../../shared/components/right-sidebar/right-sidebar.component';

@Component({
  selector: 'app-musician-layout',
  standalone: true,
  imports: [RouterOutlet, LeftSidebarComponent, RightSidebarComponent],
  templateUrl: './musician-layout.component.html',
  styleUrl: './musician-layout.component.scss'
})
export class MusicianLayoutComponent {
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly isMessages = computed(() => this.currentUrl()?.includes('/messages') ?? false);
}
