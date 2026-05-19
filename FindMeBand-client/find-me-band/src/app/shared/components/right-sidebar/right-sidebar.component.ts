import { Component, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { OpportunityFilterService } from '../../../core/services/opportunity-filter.service';
import { EventFilterService } from '../../../core/services/event-filter.service';
import { MessagesService, Contact } from '../../../core/services/messages.service';
import { MyBandsService } from '../../../core/services/my-bands.service';
import { MyProfileService } from '../../../core/services/my-profile.service';
import { OrganizerService } from '../../../core/services/organizer.service';
import { FollowService, SearchResult } from '../../../core/services/follow.service';

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
    if (url.includes('/organizer/my-events')) return 'organizer-events';
    if (url.includes('/organizer/my-profile')) return 'organizer-profile';
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
  readonly follow = inject(FollowService);

  get searchTerm() { return this.follow.searchTerm; }
  get filteredMusicians() { return this.follow.filteredMusicians; }
  get filteredBands() { return this.follow.filteredBands; }
  get filteredOrganizers() { return this.follow.filteredOrganizers; }

  onSearch(event: Event): void {
    this.follow.searchTerm.set((event.target as HTMLInputElement).value);
  }

  toggleFollow(item: SearchResult): void {
    this.follow.toggleFollow(item);
  }

  // ── My Bands ───────────────────────────────────────
  readonly myBands = inject(MyBandsService);

  // ── My Profile ─────────────────────────────────────
  readonly myProfile = inject(MyProfileService);

  // ── Organizer ──────────────────────────────────────
  readonly organizer = inject(OrganizerService);

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
