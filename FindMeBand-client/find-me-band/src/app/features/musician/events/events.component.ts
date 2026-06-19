import { Component, computed, inject, signal } from '@angular/core';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent {
  readonly service = inject(EventService);
  readonly activePickerId = signal<number | null>(null);

  readonly showPicker = computed(() => this.service.bandOptions().length > 0);

  readonly hasApplyOptions = computed(() =>
    this.service.performerId() !== null || this.service.bandOptions().length > 0
  );

  get filteredEvents() {
    return this.service.filteredEvents;
  }

  togglePicker(eventId: number): void {
    this.activePickerId.set(this.activePickerId() === eventId ? null : eventId);
  }

  pickApply(eventId: number, performerId: number): void {
    this.service.applyToEvent(eventId, performerId);
    this.activePickerId.set(null);
  }
}
