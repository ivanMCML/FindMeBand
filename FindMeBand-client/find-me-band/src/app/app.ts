import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 64px);
      background: #1a1a2e;
    }
  `]
})
export class App {}
