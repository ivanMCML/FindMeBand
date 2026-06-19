import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExploreService } from '../../../core/services/explore.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss',
})
export class ExploreComponent implements OnInit {
  readonly s = inject(ExploreService);

  ngOnInit(): void {
    this.s.load();
  }

  onGenreChange(event: Event): void {
    this.s.selectedGenre.set((event.target as HTMLSelectElement).value);
  }

  onInstrumentChange(event: Event): void {
    this.s.selectedInstrument.set((event.target as HTMLSelectElement).value);
  }

  stars(rating: number): { full: boolean; half: boolean }[] {
    return [1, 2, 3, 4, 5].map(i => ({
      full: rating >= i,
      half: rating >= i - 0.5 && rating < i,
    }));
  }
}
