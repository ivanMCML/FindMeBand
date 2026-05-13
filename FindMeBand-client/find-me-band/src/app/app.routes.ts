import { Routes } from '@angular/router';
import { MusicianLayoutComponent } from './features/musician/musician-layout/musician-layout.component';

export const routes: Routes = [
  {
    path: 'musician',
    component: MusicianLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/musician/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'opportunities',
        loadComponent: () =>
          import('./features/musician/opportunities/opportunities.component').then(
            m => m.OpportunitiesComponent
          )
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/musician/events/events.component').then(m => m.EventsComponent)
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/musician/messages/messages.component').then(
            m => m.MessagesComponent
          )
      },
      {
        path: 'my-bands',
        loadComponent: () =>
          import('./features/musician/my-bands/my-bands.component').then(
            m => m.MyBandsComponent
          )
      },
      {
        path: 'my-profile',
        loadComponent: () =>
          import('./features/musician/my-profile/my-profile.component').then(
            m => m.MyProfileComponent
          )
      }
    ]
  },
  { path: '', redirectTo: 'musician/home', pathMatch: 'full' }
];
