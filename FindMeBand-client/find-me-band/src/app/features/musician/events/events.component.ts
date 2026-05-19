import { Component, inject } from '@angular/core';
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

  get filteredEvents() {
    return this.service.filteredEvents;
  }
}
