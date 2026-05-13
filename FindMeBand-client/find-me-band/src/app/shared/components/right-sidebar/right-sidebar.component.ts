import { Component, computed, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { OpportunityFilterService } from '../../../core/services/opportunity-filter.service';
import { EventFilterService } from '../../../core/services/event-filter.service';
import { MessagesService, Contact } from '../../../core/services/messages.service';
import { MyBandsService } from '../../../core/services/my-bands.service';
import { MyProfileService } from '../../../core/services/my-profile.service';

interface SearchResult {
  id: number;
  name: string;
  username: string;
  initials: string;
  color: string;
  subtitle: string;
  type: 'musician' | 'band' | 'organizer';
}

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './right-sidebar.component.html',
  styleUrl: './right-sidebar.component.scss'
})
export class RightSidebarComponent {
  private router = inject(Router);
  readonly oppFilter = inject(OpportunityFilterService);
  readonly eventFilter = inject(EventFilterService);

  // ── Route detection ────────────────────────────────
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  currentSection = computed(() => {
    const url = this.currentUrl() ?? '';
    if (url.includes('/opportunities')) return 'opportunities';
    if (url.includes('/events')) return 'events';
    if (url.includes('/messages')) return 'messages';
    if (url.includes('/my-bands')) return 'my-bands';
    if (url.includes('/my-profile')) return 'my-profile';
    return 'home';
  });

  // ── Opportunity filter helpers ─────────────────────
  oppActiveFilterCount = computed(() => {
    let n = 0;
    if (this.oppFilter.type() !== 'all') n++;
    if (this.oppFilter.genre() !== 'all') n++;
    if (this.oppFilter.instrument() !== 'all') n++;
    return n;
  });

  onOppTypeSet(v: string): void { this.oppFilter.type.set(v); }
  onOppGenreChange(e: Event): void { this.oppFilter.genre.set((e.target as HTMLSelectElement).value); }
  onOppInstrumentChange(e: Event): void { this.oppFilter.instrument.set((e.target as HTMLSelectElement).value); }
  onOppSortChange(e: Event): void { this.oppFilter.sortBy.set((e.target as HTMLSelectElement).value); }
  resetOppFilters(): void { this.oppFilter.reset(); }

  // ── Event filter helpers ───────────────────────────
  eventActiveFilterCount = computed(() => {
    let n = 0;
    if (this.eventFilter.status() !== 'all') n++;
    if (this.eventFilter.genre() !== 'all') n++;
    if (this.eventFilter.performerType() !== 'all') n++;
    return n;
  });

  onEventStatusSet(v: string): void { this.eventFilter.status.set(v); }
  onEventGenreChange(e: Event): void { this.eventFilter.genre.set((e.target as HTMLSelectElement).value); }
  onEventTypeSet(v: string): void { this.eventFilter.performerType.set(v); }
  onEventSortChange(e: Event): void { this.eventFilter.sortBy.set((e.target as HTMLSelectElement).value); }
  resetEventFilters(): void { this.eventFilter.reset(); }

  // ── Home search ────────────────────────────────────
  searchTerm = signal('');

  private readonly musicians: SearchResult[] = [
    { id: 1, name: 'Ana Horvat', username: 'ana_violin', initials: 'AH', color: '#059669', subtitle: 'Violina · Zagreb', type: 'musician' },
    { id: 2, name: 'Luka Petrović', username: 'luka_bass', initials: 'LP', color: '#d97706', subtitle: 'Bas gitara · Split', type: 'musician' },
    { id: 3, name: 'Sara Ćosić', username: 'sara_keys', initials: 'SC', color: '#7c3aed', subtitle: 'Klavijature · Rijeka', type: 'musician' },
    { id: 4, name: 'Ivan Blažević', username: 'ivan_drums', initials: 'IB', color: '#dc2626', subtitle: 'Bubnjevi · Zagreb', type: 'musician' }
  ];

  private readonly bands: SearchResult[] = [
    { id: 5, name: 'The Groove Factory', username: 'groove_factory', initials: 'GF', color: '#0891b2', subtitle: 'Funk · Soul · Zagreb', type: 'band' },
    { id: 6, name: 'Split Rhythm Section', username: 'split_rhythm', initials: 'SR', color: '#dc2626', subtitle: 'Rock · Split', type: 'band' },
    { id: 7, name: 'Acoustic Souls', username: 'acoustic_souls', initials: 'AS', color: '#065f46', subtitle: 'Folk · Acoustic · Osijek', type: 'band' }
  ];

  private readonly organizers: SearchResult[] = [
    { id: 8, name: 'Tvornica kulture', username: 'tvornica', initials: 'TK', color: '#1e40af', subtitle: 'Venue · Zagreb', type: 'organizer' },
    { id: 9, name: 'INmusic Festival', username: 'inmusic', initials: 'IN', color: '#065f46', subtitle: 'Festival · Zagreb', type: 'organizer' },
    { id: 10, name: 'Club Boogaloo', username: 'boogaloo', initials: 'CB', color: '#7c3aed', subtitle: 'Klub · Zagreb', type: 'organizer' }
  ];

  filteredMusicians = computed(() => this.filterItems(this.musicians));
  filteredBands = computed(() => this.filterItems(this.bands));
  filteredOrganizers = computed(() => this.filterItems(this.organizers));

  private filterItems(items: SearchResult[]): SearchResult[] {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return items.slice(0, 3);
    return items.filter(
      item =>
        item.name.toLowerCase().includes(term) ||
        item.username.toLowerCase().includes(term) ||
        item.subtitle.toLowerCase().includes(term)
    );
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  // ── My Bands ───────────────────────────────────────
  readonly myBands = inject(MyBandsService);

  // ── My Profile ─────────────────────────────────────
  readonly myProfile = inject(MyProfileService);

  // ── Messages conversations ─────────────────────────
  readonly messages = inject(MessagesService);

  onMsgSearch(event: Event): void {
    this.messages.searchQuery.set((event.target as HTMLInputElement).value);
  }

  clearMsgSearch(): void {
    this.messages.searchQuery.set('');
  }

  selectConversation(id: number): void {
    this.messages.selectConversation(id);
  }

  startConversation(contact: Contact): void {
    this.messages.startConversation(contact);
  }
}
