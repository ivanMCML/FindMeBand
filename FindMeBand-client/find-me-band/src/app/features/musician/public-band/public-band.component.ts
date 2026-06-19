import { Component, computed, inject, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PublicProfileService } from '../../../core/services/public-profile.service';
import { FollowService } from '../../../core/services/follow.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-public-band',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './public-band.component.html',
  styleUrl: './public-band.component.scss',
})
export class PublicBandComponent implements OnInit {
  readonly s = inject(PublicProfileService);
  readonly followSvc = inject(FollowService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly followId = computed(() => {
    const b = this.s.band();
    return b ? this.followSvc.followIdFor('band', b.id) : null;
  });

  get myMusicianId(): number | undefined {
    return this.auth.currentUser()?.profileId;
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.s.loadBand(id);
    });
  }

  toggleFollow(): void {
    const band = this.s.band();
    if (!band) return;
    const fid = this.followId();
    if (fid !== null) {
      this.followSvc.unfollowById(fid, 'band', band.id);
      this.s.band.update(b => b ? { ...b, followersCount: Math.max(0, b.followersCount - 1) } : b);
    } else {
      this.followSvc.followById('band', band.id);
      this.s.band.update(b => b ? { ...b, followersCount: b.followersCount + 1 } : b);
    }
  }
}
