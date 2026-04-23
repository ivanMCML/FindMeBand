import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { BandService } from '../../core/services/band.service';
import { Band } from '../../core/models/models';

@Component({
  selector: 'app-bands-list',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './bands-list.component.html',
  styleUrl: './bands-list.component.scss'
})
export class BandsListComponent implements OnInit {
  private bandService = inject(BandService);

  bands = signal<Band[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.bandService.getAll().subscribe({
      next: (data) => { this.bands.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load bands. Make sure the API is running.'); this.loading.set(false); }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  getActiveMembers(band: Band): number {
    return band.members?.filter(m => !m.leftDate).length ?? 0;
  }
}
