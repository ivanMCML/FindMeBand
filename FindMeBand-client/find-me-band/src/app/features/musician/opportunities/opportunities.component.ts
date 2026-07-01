import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './opportunities.component.html',
  styleUrl: './opportunities.component.scss'
})
export class OpportunitiesComponent {
  readonly service = inject(OpportunityService);

  activeTab = signal<'explore' | 'create' | 'mine'>('explore');
  createSuccess = signal(false);

  createFormData = {
    type: 'SeekingMusician',
    description: '',
    genreId: 0,
    instrumentId: 0,
    authorPerformerId: null as number | null,
  };

  readonly typeLabels: Record<string, string> = {
    SeekingMusician: 'Traži musikanta',
    SeekingBand: 'Traži bend',
    SeekingCollaboration: 'Traži kolaboraciju'
  };

  readonly typeColors: Record<string, string> = {
    SeekingMusician: '#7c3aed',
    SeekingBand: '#0891b2',
    SeekingCollaboration: '#059669'
  };

  readonly appStatusLabels: Record<string, string> = {
    Pending: 'Na čekanju',
    Accepted: 'Prihvaćeno',
    Rejected: 'Odbijeno',
  };

  get filteredOpportunities() {
    return this.service.filteredOpportunities;
  }

  setTab(tab: 'explore' | 'create' | 'mine'): void {
    this.activeTab.set(tab);
    if (tab === 'mine') {
      this.service.loadAuthoredApplications();
    }
  }

  submitCreate(): void {
    this.service.createOpportunity(
      this.createFormData.type,
      this.createFormData.description,
      this.createFormData.genreId || null,
      this.createFormData.instrumentId || null,
      this.createFormData.authorPerformerId,
      () => {
        this.createSuccess.set(true);
        setTimeout(() => {
          this.createSuccess.set(false);
          this.createFormData = { type: 'SeekingMusician', description: '', genreId: 0, instrumentId: 0, authorPerformerId: null };
          this.activeTab.set('explore');
        }, 1800);
      }
    );
  }
}
