import { Routes } from '@angular/router';
import { MusicianLayoutComponent } from './features/musician/musician-layout/musician-layout.component';
import { OrganizerLayoutComponent } from './features/organizer/organizer-layout/organizer-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { organizerGuard } from './core/guards/organizer.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'musician',
    component: MusicianLayoutComponent,
    canActivate: [authGuard],
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
      },
      {
        path: 'm/:id',
        loadComponent: () =>
          import('./features/musician/public-musician/public-musician.component').then(
            m => m.PublicMusicianComponent
          )
      },
      {
        path: 'b/:id',
        loadComponent: () =>
          import('./features/musician/public-band/public-band.component').then(
            m => m.PublicBandComponent
          )
      }
    ]
  },
  {
    path: 'organizer',
    component: OrganizerLayoutComponent,
    canActivate: [organizerGuard],
    children: [
      { path: '', redirectTo: 'my-events', pathMatch: 'full' },
      {
        path: 'my-events',
        loadComponent: () =>
          import('./features/organizer/my-events/my-events.component').then(
            m => m.MyEventsComponent
          )
      },
      {
        path: 'my-profile',
        loadComponent: () =>
          import('./features/organizer/my-profile/organizer-profile.component').then(
            m => m.OrganizerProfileComponent
          )
      }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
