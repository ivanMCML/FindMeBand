import { Component, inject } from '@angular/core';
import { MyProfileService } from '../../../core/services/my-profile.service';
import { mediaUrl } from '../../../core/utils/media.util';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';
import { IconComponent, EmptyStateComponent } from '../../../shared/ui';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [IconComponent, PostCardComponent, EmptyStateComponent],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfileComponent {
  readonly s = inject(MyProfileService);
  /** Kratica za predložak — lajkovi i komentari objava. */
  readonly i = this.s.interactions;

  protected readonly mediaUrl = mediaUrl;

  onAvatarChange(file: File | undefined): void {
    if (file) this.s.uploadAvatar(file);
  }
}
