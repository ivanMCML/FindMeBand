import { Component, inject, signal } from '@angular/core';
import { HomeService } from '../../../core/services/home.service';
import { mediaUrl } from '../../../core/utils/media.util';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';
import {
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  IconComponent,
  SpinnerComponent,
} from '../../../shared/ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    PostCardComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    IconComponent,
    SpinnerComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly service = inject(HomeService);
  readonly interactions = this.service.interactions;

  readonly newPostContent = signal('');
  readonly selectedBandId = signal<number | null>(null);
  readonly pendingImageUrls = signal<string[]>([]);
  readonly uploadingImage = signal(false);

  protected readonly mediaUrl = mediaUrl;

  onImageSelected(file: File | undefined): void {
    if (!file) return;
    this.uploadingImage.set(true);
    this.service.uploadPostImage(file, url => {
      this.pendingImageUrls.update(urls => [...urls, url]);
      this.uploadingImage.set(false);
    });
  }

  removeImage(url: string): void {
    this.pendingImageUrls.update(urls => urls.filter(u => u !== url));
  }

  submitPost(): void {
    this.service.createPost(
      this.newPostContent(),
      this.selectedBandId(),
      this.pendingImageUrls(),
      () => {
        this.newPostContent.set('');
        this.pendingImageUrls.set([]);
      }
    );
  }
}
