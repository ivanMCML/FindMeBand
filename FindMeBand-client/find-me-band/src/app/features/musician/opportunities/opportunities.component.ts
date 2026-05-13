import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpportunityFilterService } from '../../../core/services/opportunity-filter.service';

interface MockOpportunity {
  id: number;
  type: 'SeekingMusician' | 'SeekingBand' | 'SeekingCollaboration';
  description: string;
  genre: string;
  instrument: string | null;
  poster: {
    name: string;
    username: string;
    initials: string;
    color: string;
    type: 'musician' | 'band';
  };
  applicationCount: number;
  createdAt: string;
  isApplied: boolean;
}

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './opportunities.component.html',
  styleUrl: './opportunities.component.scss'
})
export class OpportunitiesComponent {
  private filterService = inject(OpportunityFilterService);

  activeTab = signal<'explore' | 'create'>('explore');
  createSuccess = signal(false);

  createFormData = {
    type: 'SeekingMusician',
    description: '',
    genre: '',
    instrument: ''
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

  readonly genres = this.filterService.genres;
  readonly instruments = this.filterService.instruments;

  private readonly allOpportunities: MockOpportunity[] = [
    {
      id: 1,
      type: 'SeekingMusician',
      description: 'Tražimo iskusnog bubnjara za naš rock/alternative projekt. Probe su jednom tjedno u Zagrebu. Prednost je iskustvo s nastupima na manjim festivalima.',
      genre: 'Rock',
      instrument: 'Bubnjevi',
      poster: { name: 'The Groove Factory', username: 'groove_factory', initials: 'GF', color: '#0891b2', type: 'band' },
      applicationCount: 5,
      createdAt: '2026-04-22',
      isApplied: false
    },
    {
      id: 2,
      type: 'SeekingMusician',
      description: 'Bend traži gitarista za folk i acoustic projekt. Sviranje pred publikom je poželjno. Javi se s kratkim opisom iskustva i video linkom.',
      genre: 'Folk',
      instrument: 'Gitara',
      poster: { name: 'Acoustic Souls', username: 'acoustic_souls', initials: 'AS', color: '#065f46', type: 'band' },
      applicationCount: 3,
      createdAt: '2026-04-21',
      isApplied: false
    },
    {
      id: 3,
      type: 'SeekingBand',
      description: 'Iskusan vokalist traži bend za R&B ili soul projekt. Otvoreni za suradnju s bendovima koji dijele sličnu glazbenu viziju i žele nastupati.',
      genre: 'R&B',
      instrument: null,
      poster: { name: 'Tomislav Kos', username: 'toma_vocal', initials: 'TK', color: '#b45309', type: 'musician' },
      applicationCount: 7,
      createdAt: '2026-04-20',
      isApplied: true
    },
    {
      id: 4,
      type: 'SeekingCollaboration',
      description: 'Producent traži pjevačicu za snimanje EP-a. Žanr je indie pop s elementima elektronike. Studio se nalazi u Rijeci, troškovi su pokriveni.',
      genre: 'Indie',
      instrument: 'Vokal',
      poster: { name: 'Matija Horvat', username: 'matija_prod', initials: 'MH', color: '#1e40af', type: 'musician' },
      applicationCount: 12,
      createdAt: '2026-04-19',
      isApplied: false
    },
    {
      id: 5,
      type: 'SeekingMusician',
      description: 'Jazz bend iz Splita traži basistra s iskustvom. Nastupamo na festivalima i jazz klubovima. Potrebno je iskustvo s jazz repertoarom i improvizacijom.',
      genre: 'Jazz',
      instrument: 'Bas gitara',
      poster: { name: 'Split Rhythm Section', username: 'split_rhythm', initials: 'SR', color: '#dc2626', type: 'band' },
      applicationCount: 2,
      createdAt: '2026-04-18',
      isApplied: false
    },
    {
      id: 6,
      type: 'SeekingCollaboration',
      description: 'Pijanistica traži kolaboraciju s violinistom za klasični/crossover projekt. Cilj je nastupati na komornim koncertima i manjim festivalima.',
      genre: 'Classical',
      instrument: 'Violina',
      poster: { name: 'Nina Kolar', username: 'nina_keys', initials: 'NK', color: '#0891b2', type: 'musician' },
      applicationCount: 4,
      createdAt: '2026-04-17',
      isApplied: false
    },
    {
      id: 7,
      type: 'SeekingBand',
      description: 'Saksofonist s dugogodišnjim iskustvom traži funk ili soul bend za redovite nastupe. Slobodan svake subote za probe. Kontakt putem DM-a.',
      genre: 'Funk',
      instrument: null,
      poster: { name: 'Marko Novak', username: 'marko_novak', initials: 'MN', color: '#7c3aed', type: 'musician' },
      applicationCount: 6,
      createdAt: '2026-04-16',
      isApplied: false
    },
    {
      id: 8,
      type: 'SeekingMusician',
      description: 'Metal bend traži vokalistu/vokalista s iskustvom u heavy metalu. Snimamo album ove jeseni, tražimo nekoga tko može dati sve od sebe.',
      genre: 'Metal',
      instrument: 'Vokal',
      poster: { name: 'Iron Pulse', username: 'iron_pulse', initials: 'IP', color: '#374151', type: 'band' },
      applicationCount: 9,
      createdAt: '2026-04-15',
      isApplied: false
    }
  ];

  filteredOpportunities = computed(() => {
    const type = this.filterService.type();
    const genre = this.filterService.genre();
    const instrument = this.filterService.instrument();
    const sortBy = this.filterService.sortBy();

    let result = [...this.allOpportunities];

    if (type !== 'all') result = result.filter(o => o.type === type);
    if (genre !== 'all') result = result.filter(o => o.genre === genre);
    if (instrument !== 'all') result = result.filter(o => o.instrument === instrument);

    result.sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'most-applied') return b.applicationCount - a.applicationCount;
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      return 0;
    });

    return result;
  });

  applyToOpportunity(opp: MockOpportunity): void {
    if (opp.isApplied) return;
    opp.isApplied = true;
    opp.applicationCount++;
  }

  submitCreate(): void {
    this.createSuccess.set(true);
    const newOpp: MockOpportunity = {
      id: this.allOpportunities.length + 1,
      type: this.createFormData.type as MockOpportunity['type'],
      description: this.createFormData.description,
      genre: this.createFormData.genre || 'Rock',
      instrument: this.createFormData.instrument || null,
      poster: { name: 'Pero Perić', username: 'pero_peric', initials: 'PP', color: '#7c3aed', type: 'musician' },
      applicationCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isApplied: false
    };
    this.allOpportunities.unshift(newOpp);
    setTimeout(() => {
      this.createSuccess.set(false);
      this.createFormData = { type: 'SeekingMusician', description: '', genre: '', instrument: '' };
      this.activeTab.set('explore');
    }, 1800);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'danas';
    if (diff === 1) return 'jučer';
    return `${diff}d`;
  }
}
