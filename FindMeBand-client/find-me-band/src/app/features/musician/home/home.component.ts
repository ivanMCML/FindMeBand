import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeService } from '../../../core/services/home.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly service = inject(HomeService);

  newPostContent = signal('');
  selectedBandId = signal<number | null>(null);
  pendingImageUrls = signal<string[]>([]);
  uploadingImage = signal(false);
  commentInputs = signal<Record<number, string>>({});

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

  commentInput(postId: number): string {
    return this.commentInputs()[postId] ?? '';
  }

  setCommentInput(postId: number, value: string): void {
    this.commentInputs.update(m => ({ ...m, [postId]: value }));
  }

  submitComment(postId: number): void {
    const content = this.commentInput(postId);
    if (!content.trim()) return;
    this.service.addComment(postId, content, () => {
      this.setCommentInput(postId, '');
    });
  }
}
