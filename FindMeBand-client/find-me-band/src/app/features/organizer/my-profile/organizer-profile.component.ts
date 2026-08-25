import { Component, inject } from '@angular/core';
import { OrganizerService } from '../../../core/services/organizer.service';
import { mediaUrl } from '../../../core/utils/media.util';
import { IconComponent } from '../../../shared/ui';

@Component({
  selector: 'app-organizer-profile',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './organizer-profile.component.html',
  styleUrl: './organizer-profile.component.scss'
})
export class OrganizerProfileComponent {
  readonly s = inject(OrganizerService);

  protected readonly mediaUrl = mediaUrl;

  onAvatarChange(file: File | undefined): void {
    if (file) this.s.uploadAvatar(file);
  }
}
