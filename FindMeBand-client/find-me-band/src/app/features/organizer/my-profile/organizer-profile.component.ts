import { Component, inject } from '@angular/core';
import { OrganizerService } from '../../../core/services/organizer.service';

@Component({
  selector: 'app-organizer-profile',
  standalone: true,
  imports: [],
  templateUrl: './organizer-profile.component.html',
  styleUrl: './organizer-profile.component.scss'
})
export class OrganizerProfileComponent {
  readonly s = inject(OrganizerService);
}
