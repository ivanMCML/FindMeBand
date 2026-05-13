import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EventFilterService {
  status = signal<string>('all');
  genre = signal<string>('all');
  performerType = signal<string>('all');
  sortBy = signal<string>('soonest');

  readonly genres = [
    'Rock', 'Jazz', 'Folk', 'Classical', 'R&B', 'Indie',
    'Pop', 'Funk', 'Blues', 'Metal', 'Soul', 'Acoustic'
  ];

  reset(): void {
    this.status.set('all');
    this.genre.set('all');
    this.performerType.set('all');
    this.sortBy.set('soonest');
  }
}
