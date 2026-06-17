import { Component, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { MyBandsService } from '../../../core/services/my-bands.service';
import { MyProfileService } from '../../../core/services/my-profile.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-bands',
  standalone: true,
  imports: [SlicePipe],
  templateUrl: './my-bands.component.html',
  styleUrl: './my-bands.component.scss'
})
export class MyBandsComponent {
  readonly s = inject(MyBandsService);
  readonly profile = inject(MyProfileService);
  private auth = inject(AuthService);

  submitCreate(): void {
    const musicianId = this.auth.currentUser()?.profileId;
    if (!musicianId) return;
    this.s.submitCreate(musicianId);
  }
}
