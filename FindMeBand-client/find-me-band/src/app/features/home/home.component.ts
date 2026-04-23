import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  cards = [
    {
      icon: '🎸',
      title: 'Musicians',
      description: 'Browse talented musicians looking to join bands or collaborate.',
      link: '/musicians',
      color: '#e94560'
    },
    {
      icon: '🎵',
      title: 'Bands',
      description: 'Discover bands and check out their members, genres and posts.',
      link: '/bands',
      color: '#f7971e'
    },
    {
      icon: '⭐',
      title: 'Performers',
      description: 'Find top-rated performers — musicians and bands with reviews.',
      link: '/performers',
      color: '#9b59b6'
    },
    {
      icon: '🎤',
      title: 'Events',
      description: 'Explore upcoming events and apply as a performer.',
      link: '/events',
      color: '#2ecc71'
    },
    {
      icon: '🔍',
      title: 'Opportunities',
      description: 'Post or find collaboration opportunities in the music scene.',
      link: '/opportunities',
      color: '#3498db'
    },
  ];
}
