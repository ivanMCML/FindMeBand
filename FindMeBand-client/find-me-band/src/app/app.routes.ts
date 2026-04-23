import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'musicians',
    loadComponent: () => import('./features/musicians/musicians-list.component').then(m => m.MusiciansListComponent)
  },
  {
    path: 'bands',
    loadComponent: () => import('./features/bands/bands-list.component').then(m => m.BandsListComponent)
  },
  {
    path: 'performers',
    loadComponent: () => import('./features/performers/performers-list.component').then(m => m.PerformersListComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/events-list.component').then(m => m.EventsListComponent)
  },
  {
    path: 'opportunities',
    loadComponent: () => import('./features/opportunities/opportunities-list.component').then(m => m.OpportunitiesListComponent)
  },
  { path: '**', redirectTo: '' }
];
