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

  submitPost(): void {
    this.service.createPost(this.newPostContent(), this.selectedBandId(), () => {
      this.newPostContent.set('');
    });
  }
}
