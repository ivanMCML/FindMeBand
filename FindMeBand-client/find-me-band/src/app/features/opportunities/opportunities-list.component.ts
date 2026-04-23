import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OpportunityService } from '../../core/services/opportunity.service';
import { Opportunity } from '../../core/models/models';
import { OpportunityType } from '../../core/models/enums';

@Component({
  selector: 'app-opportunities-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './opportunities-list.component.html',
  styleUrl: './opportunities-list.component.scss'
})
export class OpportunitiesListComponent implements OnInit {
  private opportunityService = inject(OpportunityService);

  opportunities = signal<Opportunity[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.opportunityService.getAll().subscribe({
      next: (data) => { this.opportunities.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load opportunities. Make sure the API is running.'); this.loading.set(false); }
    });
  }

  typeLabel(type: OpportunityType): string {
    const labels: Record<OpportunityType, string> = {
      [OpportunityType.MusicianLookingForMusician]: 'Musician → Musician',
      [OpportunityType.MusicianLookingForBand]: 'Musician → Band',
      [OpportunityType.BandLookingForMusician]: 'Band → Musician',
    };
    return labels[type] ?? 'Unknown';
  }

  typeIcon(type: OpportunityType): string {
    const icons: Record<OpportunityType, string> = {
      [OpportunityType.MusicianLookingForMusician]: '🎸',
      [OpportunityType.MusicianLookingForBand]: '🎶',
      [OpportunityType.BandLookingForMusician]: '🎵',
    };
    return icons[type] ?? '🔍';
  }

  typeClass(type: OpportunityType): string {
    return ['type-m2m', 'type-m2b', 'type-b2m'][type] ?? '';
  }
}
