import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OpportunityFilterService {
  type = signal<string>('all');
  genre = signal<string>('all');
  instrument = signal<string>('all');
  sortBy = signal<string>('newest');

  readonly genres = [
    'Rock', 'Jazz', 'Folk', 'Classical', 'R&B', 'Indie',
    'Pop', 'Funk', 'Blues', 'Metal', 'Soul', 'Acoustic'
  ];

  readonly instruments = [
    'Gitara', 'Bas gitara', 'Bubnjevi', 'Klavijature',
    'Violina', 'Vokal', 'Saksofon', 'Truba', 'Harmonika', 'Cello'
  ];

  reset(): void {
    this.type.set('all');
    this.genre.set('all');
    this.instrument.set('all');
    this.sortBy.set('newest');
  }
}
