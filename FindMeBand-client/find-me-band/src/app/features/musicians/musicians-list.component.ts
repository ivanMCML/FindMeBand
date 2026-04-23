import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MusicianService } from '../../core/services/musician.service';
import { Musician } from '../../core/models/models';

@Component({
  selector: 'app-musicians-list',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './musicians-list.component.html',
  styleUrl: './musicians-list.component.scss'
})
export class MusiciansListComponent implements OnInit {
  private musicianService = inject(MusicianService);

  musicians = signal<Musician[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.musicianService.getAll().subscribe({
      next: (data) => {
        this.musicians.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load musicians. Make sure the API is running.');
        this.loading.set(false);
      }
    });
  }

  getPrimaryInstrument(musician: Musician): string {
    const primary = musician.instruments?.find(i => i.isPrimary);
    return primary?.instrument?.name ?? musician.instruments?.[0]?.instrument?.name ?? '—';
  }

  getInitials(musician: Musician): string {
    return `${musician.firstName?.[0] ?? ''}${musician.lastName?.[0] ?? ''}`.toUpperCase();
  }
}
