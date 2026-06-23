import { Component, inject, signal } from '@angular/core';
import { HomeService } from '../../../core/services/home.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly service = inject(HomeService);

  newPostContent = signal('');
  selectedBandId = signal<number | null>(null);
  pendingImageUrls = signal<string[]>([]);
  uploadingImage = signal(false);

  readonly staticBase = 'http://localhost:5251';

  onImageSelected(file: File | undefined): void {
    if (!file) return;
    this.uploadingImage.set(true);
    this.service.uploadPostImage(file, (url) => {
      this.pendingImageUrls.update(urls => [...urls, url]);
      this.uploadingImage.set(false);
    });
  }

  removeImage(url: string): void {
    this.pendingImageUrls.update(urls => urls.filter(u => u !== url));
  }

  submitPost(): void {
    this.service.createPost(this.newPostContent(), this.selectedBandId(), this.pendingImageUrls(), () => {
      this.newPostContent.set('');
      this.pendingImageUrls.set([]);
    });
  }
}
