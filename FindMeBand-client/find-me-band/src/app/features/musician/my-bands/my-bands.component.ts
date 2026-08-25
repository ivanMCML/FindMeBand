import { Component, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MyBandsService } from '../../../core/services/my-bands.service';
import { MyProfileService } from '../../../core/services/my-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { PostInteractionService } from '../../../core/services/post-interaction.service';
import { environment } from '../../../../environments/environment';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';
import { IconComponent, EmptyStateComponent } from '../../../shared/ui';

@Component({
  selector: 'app-my-bands',
  standalone: true,
  imports: [IconComponent, SlicePipe, RouterLink, PostCardComponent, EmptyStateComponent],
  templateUrl: './my-bands.component.html',
  styleUrl: './my-bands.component.scss'
})
export class MyBandsComponent {
  readonly s = inject(MyBandsService);
  readonly profile = inject(MyProfileService);
  /** Kratica za predložak — komentari objava benda. */
  readonly i = inject(PostInteractionService);
  private auth = inject(AuthService);

  readonly staticBase = environment.apiBaseUrl.replace('/api', '');

  get currentMusicianId(): number | undefined {
    return this.auth.currentUser()?.profileId;
  }

  onAvatarSelected(bandId: number, file: File | null): void {
    if (file) this.s.uploadBandAvatar(bandId, file);
  }

  submitCreate(): void {
    const musicianId = this.auth.currentUser()?.profileId;
    if (!musicianId) return;
    this.s.submitCreate(musicianId);
  }

  submitEdit(): void {
    const band = this.s.selectedBand();
    if (band) this.s.submitEdit(band.id);
  }

  addGenre(): void {
    const band = this.s.selectedBand();
    const genreId = this.s.addGenreId();
    if (band && genreId) this.s.addGenreImmediate(band.id, band.performerId, genreId);
  }

  removeGenre(playsGenreId: number): void {
    const band = this.s.selectedBand();
    if (band) this.s.removeGenreImmediate(band.id, playsGenreId);
  }

  addLocation(): void {
    const band = this.s.selectedBand();
    const name = this.s.addLocationName().trim();
    if (band && name) this.s.addLocationImmediate(band.id, band.performerId, name);
  }

  removeLocation(locationId: number): void {
    const band = this.s.selectedBand();
    if (band) this.s.removeLocationImmediate(band.id, locationId);
  }

  submitAddMember(): void {
    const band = this.s.selectedBand();
    if (band) this.s.submitAddMember(band.id);
  }

  submitPost(): void {
    const band = this.s.selectedBand();
    if (band) this.s.submitPost(band.id);
  }

  removeMember(memberId: number): void {
    const band = this.s.selectedBand();
    if (band) this.s.removeMember(band.id, memberId);
  }
}
