import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HomeService } from '../../../core/services/home.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly service = inject(HomeService);

  newPostContent = signal('');

  submitPost(): void {
    this.service.createPost(this.newPostContent(), () => {
      this.newPostContent.set('');
    });
  }
}
