import { Component, computed, signal } from '@angular/core';

interface Post {
  id: number;
  author: {
    name: string;
    username: string;
    initials: string;
    color: string;
    role: string;
    type: 'musician' | 'band';
  };
  content: string;
  genres: string[];
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  activeTab = signal<'following' | 'explore'>('following');

  private readonly followingPosts: Post[] = [
    {
      id: 1,
      author: { name: 'Marko Novak', username: 'marko_novak', initials: 'MN', color: '#7c3aed', role: 'Gitarist', type: 'musician' },
      content: 'Upravo završio sjednicu snimanja s novim materijalom! Tražim bubnjara za projekt rock benda. Ako te zanima, javi se u DM.',
      genres: ['Rock', 'Alternative'],
      timestamp: '2h',
      likes: 24,
      comments: 7,
      isLiked: false
    },
    {
      id: 2,
      author: { name: 'The Groove Factory', username: 'groove_factory', initials: 'GF', color: '#0891b2', role: 'Band', type: 'band' },
      content: 'Dragi prijatelji, s ponosom objavljujemo naš novi singl "Noćni Grad"! Dostupan od petka na svim platformama. Hvala svima na podršci! 🎶',
      genres: ['Funk', 'Soul'],
      timestamp: '5h',
      likes: 156,
      comments: 23,
      isLiked: true
    },
    {
      id: 3,
      author: { name: 'Ana Horvat', username: 'ana_violin', initials: 'AH', color: '#059669', role: 'Violinistica', type: 'musician' },
      content: 'Tko bi bio zainteresiran za acoustic sesiju idući tjedan? Imam slobodan termin u studiju i tražim kolege za kolaboraciju. Žanrovi: classical, folk, ambient.',
      genres: ['Classical', 'Folk'],
      timestamp: '1d',
      likes: 41,
      comments: 12,
      isLiked: false
    },
    {
      id: 4,
      author: { name: 'Luka Petrović', username: 'luka_bass', initials: 'LP', color: '#d97706', role: 'Basist', type: 'musician' },
      content: 'Upravo završio tečaj jazz harmonije! Ako netko traži basistra za jazz projekt ili sesije, slobodan sam od listopada. Kontaktirajte me!',
      genres: ['Jazz'],
      timestamp: '2d',
      likes: 33,
      comments: 8,
      isLiked: false
    }
  ];

  private readonly explorePosts: Post[] = [
    {
      id: 5,
      author: { name: 'Split Rhythm Section', username: 'split_rhythm', initials: 'SR', color: '#dc2626', role: 'Band', type: 'band' },
      content: 'Tražimo vokalista/vokalisticu za naš projekt! Sviramo mix funka i soul glazbe. Proba je u Splitu jednom tjedno. Iskustvo poželjno, ali nije uvjet!',
      genres: ['Funk', 'Soul', 'R&B'],
      timestamp: '3h',
      likes: 89,
      comments: 15,
      isLiked: false
    },
    {
      id: 6,
      author: { name: 'Nina Kolar', username: 'nina_keys', initials: 'NK', color: '#0891b2', role: 'Pijanistica', type: 'musician' },
      content: 'Objavljujem moj prvi EP "Proljeće" — dostupan na Spotifyju i Apple Musicu. Hvala svima koji su mi pomogli u ovom putovanju! 🎹',
      genres: ['Pop', 'Indie'],
      timestamp: '6h',
      likes: 212,
      comments: 45,
      isLiked: false
    },
    {
      id: 7,
      author: { name: 'Acoustic Souls', username: 'acoustic_souls', initials: 'AS', color: '#065f46', role: 'Band', type: 'band' },
      content: 'Ovog ljeta nastupamo na INmusic festivalu! Ako planiraš doći, svakako nas potraži — bit ćemo na maloj pozornici u subotu navečer.',
      genres: ['Folk', 'Acoustic'],
      timestamp: '1d',
      likes: 178,
      comments: 31,
      isLiked: true
    },
    {
      id: 8,
      author: { name: 'Tomislav Kos', username: 'toma_guitar', initials: 'TK', color: '#b45309', role: 'Gitarist', type: 'musician' },
      content: 'Nakon 3 godine rada, konačno sam snimio solo album. Hvala svim producentima, mixerima i prijateljima koji su vjerovali u projekt. 🎸',
      genres: ['Blues', 'Rock'],
      timestamp: '2d',
      likes: 95,
      comments: 19,
      isLiked: false
    }
  ];

  currentPosts = computed(() =>
    this.activeTab() === 'following' ? this.followingPosts : this.explorePosts
  );

  setTab(tab: 'following' | 'explore'): void {
    this.activeTab.set(tab);
  }

  toggleLike(post: Post): void {
    post.likes += post.isLiked ? -1 : 1;
    post.isLiked = !post.isLiked;
  }
}
