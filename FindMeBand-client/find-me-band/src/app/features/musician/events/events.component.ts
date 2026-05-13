import { Component, computed, inject } from '@angular/core';
import { EventFilterService } from '../../../core/services/event-filter.service';

interface MockEvent {
  id: number;
  title: string;
  description: string;
  organizer: { name: string; username: string; initials: string; color: string };
  location: string;
  scheduledAt: string;
  budgetMin: number | null;
  budgetMax: number | null;
  requiredPerformers: number;
  preferredPerformerType: 'Musician' | 'Band' | 'Any';
  minReviewRequired: number | null;
  status: 'Open' | 'Closed' | 'Canceled';
  genre: string;
  applicationCount: number;
  isApplied: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent {
  private filterService = inject(EventFilterService);

  private readonly allEvents: MockEvent[] = [
    {
      id: 1,
      title: 'Zagreb Rock Night',
      description: 'Večernji rock koncert u Tvornici kulture. Tražimo 2 izvođača za nastup od 21:00 do 01:00. Zvučna proba u 18:00. Plaćanje gotovinom na dan nastupa.',
      organizer: { name: 'Tvornica kulture', username: 'tvornica', initials: 'TK', color: '#1e40af' },
      location: 'Zagreb',
      scheduledAt: '2026-06-15',
      budgetMin: 500,
      budgetMax: 1500,
      requiredPerformers: 2,
      preferredPerformerType: 'Band',
      minReviewRequired: 3.5,
      status: 'Open',
      genre: 'Rock',
      applicationCount: 8,
      isApplied: false,
      createdAt: '2026-04-20'
    },
    {
      id: 2,
      title: 'INmusic Festival — Mala pozornica',
      description: 'Tražimo folk i acoustic izvođače za malu pozornicu INmusic festivala. Nastup traje 45 minuta, sve troškove snosi organizator.',
      organizer: { name: 'INmusic Festival', username: 'inmusic', initials: 'IN', color: '#065f46' },
      location: 'Zagreb',
      scheduledAt: '2026-06-22',
      budgetMin: 800,
      budgetMax: 2000,
      requiredPerformers: 3,
      preferredPerformerType: 'Any',
      minReviewRequired: 4.0,
      status: 'Open',
      genre: 'Folk',
      applicationCount: 14,
      isApplied: true,
      createdAt: '2026-04-18'
    },
    {
      id: 3,
      title: 'Jazz Under the Stars',
      description: 'Ljetni jazz festival na otvorenom u Splitu. Tražimo jazz kvartet ili kvintet za večernji nastup. Smještaj i putni troškovi pokriveni.',
      organizer: { name: 'Split Summer Events', username: 'split_summer', initials: 'SS', color: '#0891b2' },
      location: 'Split',
      scheduledAt: '2026-07-10',
      budgetMin: 1200,
      budgetMax: 3000,
      requiredPerformers: 1,
      preferredPerformerType: 'Band',
      minReviewRequired: 4.2,
      status: 'Open',
      genre: 'Jazz',
      applicationCount: 5,
      isApplied: false,
      createdAt: '2026-04-17'
    },
    {
      id: 4,
      title: 'Boogaloo Acoustic Sessions',
      description: 'Tjedne acoustic sesije u Club Boogaloou. Tražimo solo izvođače ili duete za intimni nastup. Sve žanrove dobro došle!',
      organizer: { name: 'Club Boogaloo', username: 'boogaloo', initials: 'CB', color: '#7c3aed' },
      location: 'Zagreb',
      scheduledAt: '2026-05-09',
      budgetMin: 150,
      budgetMax: 400,
      requiredPerformers: 1,
      preferredPerformerType: 'Musician',
      minReviewRequired: null,
      status: 'Open',
      genre: 'Acoustic',
      applicationCount: 11,
      isApplied: false,
      createdAt: '2026-04-22'
    },
    {
      id: 5,
      title: 'Osijek Blues Weekend',
      description: 'Dvodnevni blues festival u Osijeku. Nastup subotom navečer, 60-minutni set. Tražimo blues bendove s repertoarom od minimalno 45 minuta.',
      organizer: { name: 'Osijek Music Club', username: 'omc_osijek', initials: 'OM', color: '#b45309' },
      location: 'Osijek',
      scheduledAt: '2026-05-30',
      budgetMin: 600,
      budgetMax: 1000,
      requiredPerformers: 2,
      preferredPerformerType: 'Band',
      minReviewRequired: 3.0,
      status: 'Open',
      genre: 'Blues',
      applicationCount: 6,
      isApplied: false,
      createdAt: '2026-04-15'
    },
    {
      id: 6,
      title: 'Indie Showcase Rijeka',
      description: 'Večer indie i alternative glazbe u Rijeci. Tražimo 4 indie benda ili solo izvođača za showcase format. Svaki nastup traje 20 minuta.',
      organizer: { name: 'Rijeka Music Scene', username: 'rijeka_music', initials: 'RM', color: '#dc2626' },
      location: 'Rijeka',
      scheduledAt: '2026-05-17',
      budgetMin: 300,
      budgetMax: 700,
      requiredPerformers: 4,
      preferredPerformerType: 'Any',
      minReviewRequired: null,
      status: 'Open',
      genre: 'Indie',
      applicationCount: 19,
      isApplied: false,
      createdAt: '2026-04-14'
    },
    {
      id: 7,
      title: 'Klasična večer u HNK',
      description: 'Gala večer klasične glazbe u Hrvatskom narodnom kazalištu. Tražimo solistu violinista/violinisticu za suradnju s komornim orkestrom.',
      organizer: { name: 'HNK Zagreb', username: 'hnk_zagreb', initials: 'HN', color: '#374151' },
      location: 'Zagreb',
      scheduledAt: '2026-06-05',
      budgetMin: 2000,
      budgetMax: null,
      requiredPerformers: 1,
      preferredPerformerType: 'Musician',
      minReviewRequired: 4.5,
      status: 'Open',
      genre: 'Classical',
      applicationCount: 3,
      isApplied: false,
      createdAt: '2026-04-12'
    },
    {
      id: 8,
      title: 'Funk & Soul Night',
      description: 'Noć funka i soula u Art kafeu. Tražimo bend koji može svirati kontinuirani set od 3 sata uz pauze. Plešni podij obavezan!',
      organizer: { name: 'Art Kafe', username: 'art_kafe', initials: 'AK', color: '#059669' },
      location: 'Zagreb',
      scheduledAt: '2026-05-24',
      budgetMin: 800,
      budgetMax: 1200,
      requiredPerformers: 1,
      preferredPerformerType: 'Band',
      minReviewRequired: 3.8,
      status: 'Closed',
      genre: 'Funk',
      applicationCount: 22,
      isApplied: false,
      createdAt: '2026-04-10'
    }
  ];

  filteredEvents = computed(() => {
    const status = this.filterService.status();
    const genre = this.filterService.genre();
    const type = this.filterService.performerType();
    const sortBy = this.filterService.sortBy();

    let result = [...this.allEvents];

    if (status !== 'all') result = result.filter(e => e.status === status);
    if (genre !== 'all') result = result.filter(e => e.genre === genre);
    if (type !== 'all') result = result.filter(e => e.preferredPerformerType === type || e.preferredPerformerType === 'Any');

    result.sort((a, b) => {
      if (sortBy === 'soonest') return a.scheduledAt.localeCompare(b.scheduledAt);
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'budget-high') return (b.budgetMax ?? b.budgetMin ?? 0) - (a.budgetMax ?? a.budgetMin ?? 0);
      if (sortBy === 'budget-low') return (a.budgetMin ?? 0) - (b.budgetMin ?? 0);
      return 0;
    });

    return result;
  });

  applyToEvent(event: MockEvent): void {
    if (event.isApplied) return;
    event.isApplied = true;
    event.applicationCount++;
  }

  formatEventDate(dateStr: string): string {
    const date = new Date(dateStr);
    const months = ['sij.', 'velj.', 'ožu.', 'tra.', 'svi.', 'lip.', 'srp.', 'kol.', 'ruj.', 'lis.', 'stu.', 'pro.'];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}.`;
  }

  formatBudget(min: number | null, max: number | null): string {
    if (!min && !max) return 'Dogovor';
    if (min && max) return `${min.toLocaleString()} – ${max.toLocaleString()} €`;
    if (min) return `od ${min.toLocaleString()} €`;
    if (max) return `do ${max.toLocaleString()} €`;
    return 'Dogovor';
  }

  formatPerformerType(type: string): string {
    if (type === 'Musician') return 'Muzičar';
    if (type === 'Band') return 'Bend';
    return 'Svi';
  }

  statusLabel(status: string): string {
    if (status === 'Open') return 'Otvoreno';
    if (status === 'Closed') return 'Zatvoreno';
    return 'Otkazano';
  }
}
