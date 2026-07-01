import { Component, computed, inject, signal, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PublicProfileService } from '../../../core/services/public-profile.service';
import { FollowService } from '../../../core/services/follow.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessagesService } from '../../../core/services/messages.service';

@Component({
  selector: 'app-public-musician',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './public-musician.component.html',
  styleUrl: './public-musician.component.scss',
})
export class PublicMusicianComponent implements OnInit {
  readonly s = inject(PublicProfileService);
  readonly followSvc = inject(FollowService);
  private auth = inject(AuthService);
  private msg = inject(MessagesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly hoverRating = signal(0);

  readonly followId = computed(() => {
    const m = this.s.musician();
    return m ? this.followSvc.followIdFor('musician', m.id) : null;
  });

  readonly hasReviewed = computed(() => {
    const myId = this.auth.currentUser()?.profileId;
    if (!myId) return false;
    return this.s.reviews().some(r => r.reviewerId === myId);
  });

  get isMe(): boolean {
    return this.auth.currentUser()?.profileId === this.s.musician()?.id;
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.s.loadMusician(id);
    });
  }

  toggleFollow(): void {
    const musician = this.s.musician();
    if (!musician) return;
    const fid = this.followId();
    if (fid !== null) {
      this.followSvc.unfollowById(fid, 'musician', musician.id);
      this.s.musician.update(m => m ? { ...m, followersCount: Math.max(0, m.followersCount - 1) } : m);
    } else {
      this.followSvc.followById('musician', musician.id);
      this.s.musician.update(m => m ? { ...m, followersCount: m.followersCount + 1 } : m);
    }
  }

  startChat(): void {
    const m = this.s.musician();
    if (!m) return;
    this.msg.startConversation({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      username: m.userName,
      initials: m.initials,
      color: m.color,
      type: 'musician',
      subtitle: m.description ?? '',
    });
    this.router.navigate(['/musician/messages']);
  }

  submitReview(): void {
    const performerId = this.s.musician()?.performerId;
    if (performerId) this.s.submitReview(performerId);
  }
}
