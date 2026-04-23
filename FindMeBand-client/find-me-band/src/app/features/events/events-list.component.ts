import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/models';
import { EventStatus, PerformerType } from '../../core/models/enums';

@Component({
  selector: 'app-events-list',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss'
})
export class EventsListComponent implements OnInit {
  private eventService = inject(EventService);

  events = signal<Event[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  EventStatus = EventStatus;

  ngOnInit() {
    this.eventService.getAll().subscribe({
      next: (data) => { this.events.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load events. Make sure the API is running.'); this.loading.set(false); }
    });
  }

  statusLabel(status: EventStatus): string {
    return ['Open', 'Closed', 'Canceled'][status] ?? 'Unknown';
  }

  statusClass(status: EventStatus): string {
    return ['status-open', 'status-closed', 'status-canceled'][status] ?? '';
  }

  performerTypeLabel(type?: PerformerType): string {
    if (type === undefined || type === null) return 'Any';
    return type === PerformerType.Musician ? 'Musician' : 'Band';
  }

  budgetLabel(event: Event): string {
    if (!event.budgetMin && !event.budgetMax) return 'Not specified';
    if (event.budgetMin && event.budgetMax) return `€${event.budgetMin} – €${event.budgetMax}`;
    if (event.budgetMin) return `From €${event.budgetMin}`;
    return `Up to €${event.budgetMax}`;
  }
}
