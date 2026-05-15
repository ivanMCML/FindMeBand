import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrganizerService, OrgEvent } from '../../../core/services/organizer.service';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.scss'
})
export class MyEventsComponent {
  readonly s = inject(OrganizerService);

  confirmDeleteId: number | null = null;

  requestDelete(eventId: number): void {
    this.confirmDeleteId = eventId;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(): void {
    if (this.confirmDeleteId !== null) {
      this.s.deleteEvent(this.confirmDeleteId);
      this.confirmDeleteId = null;
    }
  }

  onGenreChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.s.formGenreId.set(val ? parseInt(val) : null);
  }

  onPreferredTypeChange(e: Event): void {
    this.s.formPreferredType.set((e.target as HTMLSelectElement).value);
  }
}
