import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { PerformerService } from '../../core/services/performer.service';
import { Performer } from '../../core/models/models';

@Component({
  selector: 'app-performers-list',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './performers-list.component.html',
  styleUrl: './performers-list.component.scss'
})
export class PerformersListComponent implements OnInit {
  private performerService = inject(PerformerService);

  performers = signal<Performer[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.performerService.getAll().subscribe({
      next: (data) => { this.performers.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load performers. Make sure the API is running.'); this.loading.set(false); }
    });
  }

  starsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i);
  }

  isFilled(index: number, rating: number): boolean {
    return index < Math.round(rating);
  }

  genresList(performer: Performer): string {
    return performer.genres?.slice(0, 3).map(g => g.genre?.name).filter(Boolean).join(', ') || '—';
  }
}
