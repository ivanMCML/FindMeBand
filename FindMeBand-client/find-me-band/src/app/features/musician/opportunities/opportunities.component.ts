import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpportunityService } from '../../../core/services/opportunity.service';

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './opportunities.component.html',
  styleUrl: './opportunities.component.scss'
})
export class OpportunitiesComponent {
  readonly service = inject(OpportunityService);

  activeTab = signal<'explore' | 'create'>('explore');
  createSuccess = signal(false);

  createFormData = {
    type: 'SeekingMusician',
    description: '',
    genreId: 0,
    instrumentId: 0,
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

  get filteredOpportunities() {
    return this.service.filteredOpportunities;
  }

  submitCreate(): void {
    this.service.createOpportunity(
      this.createFormData.type,
      this.createFormData.description,
      this.createFormData.genreId || null,
      this.createFormData.instrumentId || null,
      () => {
        this.createSuccess.set(true);
        setTimeout(() => {
          this.createSuccess.set(false);
          this.createFormData = { type: 'SeekingMusician', description: '', genreId: 0, instrumentId: 0 };
          this.activeTab.set('explore');
        }, 1800);
      }
    );
  }
}
