import { Injectable, computed, signal } from '@angular/core';

export type BandRole = 'Admin' | 'Member';
export type GigStatus = 'Upcoming' | 'Completed' | 'Cancelled';
export type BandTab = 'overview' | 'members' | 'gigs' | 'posts';

export interface BandMemberEntry {
  id: number;
  name: string;
  username: string;
  initials: string;
  color: string;
  instrument: string;
  role: BandRole;
  joinedDate: string;
}

export interface Gig {
  id: number;
  title: string;
  venue: string;
  location: string;
  date: string;
  payment: number | null;
  status: GigStatus;
  notes?: string;
}

export interface BandPost {
  id: number;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface MyBand {
  id: number;
  name: string;
  initials: string;
  color: string;
  description: string;
  genres: string[];
  locations: string[];
  averageRating: number;
  numberOfReviews: number;
  myRole: BandRole;
  myInstrument: string;
  foundedAt: string;
  members: BandMemberEntry[];
  gigs: Gig[];
  posts: BandPost[];
}

@Injectable({ providedIn: 'root' })
export class MyBandsService {
  readonly bands = signal<MyBand[]>([
    {
      id: 1,
      name: 'The Groove Factory',
      initials: 'GF',
      color: '#0891b2',
      description: 'Funk i soul bend iz Zagreba s više od 5 godina iskustva na domaćoj glazbenoj sceni. Nastupamo na festivalima, privatnim proslavama i klubskim večerima. Naš zvuk spaja klasični Motown soul s modernim funk grooveom.',
      genres: ['Funk', 'Soul', 'R&B'],
      locations: ['Zagreb', 'Split'],
      averageRating: 4.7,
      numberOfReviews: 23,
      myRole: 'Admin',
      myInstrument: 'Klavijature',
      foundedAt: '2020-03-15',
      members: [
        { id: 1, name: 'Pero Perić', username: 'pero_peric', initials: 'PP', color: '#7c3aed', instrument: 'Klavijature', role: 'Admin', joinedDate: '2020-03-15' },
        { id: 2, name: 'Marko Novak', username: 'marko_novak', initials: 'MN', color: '#6d28d9', instrument: 'Gitara', role: 'Member', joinedDate: '2020-03-15' },
        { id: 3, name: 'Luka Petrović', username: 'luka_bass', initials: 'LP', color: '#d97706', instrument: 'Bas gitara', role: 'Member', joinedDate: '2020-06-01' },
        { id: 4, name: 'Ivan Blažević', username: 'ivan_drums', initials: 'IB', color: '#dc2626', instrument: 'Bubnjevi', role: 'Member', joinedDate: '2021-01-10' },
        { id: 5, name: 'Ana Horvat', username: 'ana_violin', initials: 'AH', color: '#059669', instrument: 'Vokal', role: 'Member', joinedDate: '2021-08-20' },
      ],
      gigs: [
        { id: 1, title: 'INmusic Festival — Mala pozornica', venue: 'Jarun', location: 'Zagreb', date: '2026-06-22', payment: 2500, status: 'Upcoming', notes: 'Nastup u 21:00, zvučna proba u 18:30. Organizator pokriva putne troškove.' },
        { id: 2, title: 'Art Kafe — Funk & Soul Night', venue: 'Art Kafe', location: 'Zagreb', date: '2026-05-24', payment: 1000, status: 'Upcoming', notes: '3-satni set s pauzama, plešni podij.' },
        { id: 3, title: 'Zagreb Rock Night (Tvornica)', venue: 'Tvornica kulture', location: 'Zagreb', date: '2026-07-10', payment: 1500, status: 'Upcoming' },
        { id: 4, title: 'Privatna proslava — Villa Magdalena', venue: 'Villa Magdalena', location: 'Zagreb', date: '2026-04-12', payment: 1800, status: 'Completed', notes: 'Vjenčanje, 4-satni set.' },
        { id: 5, title: 'Split Summer Festival', venue: 'Obala HNK', location: 'Split', date: '2025-07-15', payment: 3000, status: 'Completed' },
        { id: 6, title: 'Club Boogaloo — Tjedna sesija', venue: 'Club Boogaloo', location: 'Zagreb', date: '2025-11-08', payment: 600, status: 'Completed' },
        { id: 7, title: 'Osijek Jazz Night', venue: 'Gradska kavana', location: 'Osijek', date: '2025-09-20', payment: null, status: 'Cancelled', notes: 'Otkazano zbog nedovoljne prodaje karata.' },
      ],
      posts: [
        { id: 1, content: 'Dragi prijatelji, s ponosom objavljujemo naš novi singl "Noćni Grad"! Dostupan od petka na svim streaming platformama. Hvala svima koji su nam bili podrška na ovom putovanju! 🎶', createdAt: '2026-05-08', likes: 156, comments: 23, isLiked: false },
        { id: 2, content: 'Sjajno večer u Art Kafeu! Publika je bila nevjerojatna — hvala svima koji su došli podržati. Vidimo se idući petak na istom mjestu!', createdAt: '2026-04-14', likes: 89, comments: 12, isLiked: true },
        { id: 3, content: 'Tražimo vokalista/vokalisticu za povremene gostujuće nastupe! Sviramo funk i soul, tražimo iskusnog pjevača/pjevačicu. Javite se u DM za audiciju.', createdAt: '2026-03-22', likes: 44, comments: 31, isLiked: false },
      ],
    },
    {
      id: 2,
      name: 'Acoustic Shadows',
      initials: 'AS',
      color: '#059669',
      description: 'Acoustic indie projekt fokusiran na originalne kompozicije i reinterpretacije folkskih klasika. Nastupamo uglavnom na intimnim venue-ima i open-air festivalima diljem Hrvatske.',
      genres: ['Acoustic', 'Indie', 'Folk'],
      locations: ['Zagreb'],
      averageRating: 4.3,
      numberOfReviews: 11,
      myRole: 'Member',
      myInstrument: 'Klavijature',
      foundedAt: '2023-09-01',
      members: [
        { id: 6, name: 'Sara Ćosić', username: 'sara_keys', initials: 'SC', color: '#7c3aed', instrument: 'Vokal / Gitara', role: 'Admin', joinedDate: '2023-09-01' },
        { id: 7, name: 'Pero Perić', username: 'pero_peric', initials: 'PP', color: '#7c3aed', instrument: 'Klavijature', role: 'Member', joinedDate: '2023-09-01' },
        { id: 8, name: 'Tomislav Kos', username: 'toma_guitar', initials: 'TK', color: '#b45309', instrument: 'Gitara', role: 'Member', joinedDate: '2024-01-15' },
      ],
      gigs: [
        { id: 8, title: 'Boogaloo Acoustic Sessions', venue: 'Club Boogaloo', location: 'Zagreb', date: '2026-05-09', payment: 400, status: 'Upcoming' },
        { id: 9, title: 'Indie Showcase Rijeka', venue: 'Klub Palach', location: 'Rijeka', date: '2026-05-17', payment: 500, status: 'Upcoming', notes: 'Showcase format, 20-minutni set.' },
        { id: 10, title: 'Café Kino debut', venue: 'Café Kino', location: 'Zagreb', date: '2024-03-10', payment: 300, status: 'Completed' },
      ],
      posts: [
        { id: 4, content: 'Uskoro objavljujemo naše prve snimke! Ostanite s nama i pratite naš profil za više informacija.', createdAt: '2026-05-01', likes: 41, comments: 8, isLiked: false },
        { id: 5, content: 'Hvala Club Boogaloou na sjajnoj večeri! Sjajno se sviralo pred tako toplom publikom. Do sljedeći put! 🎸', createdAt: '2024-04-12', likes: 28, comments: 4, isLiked: true },
      ],
    },
  ]);

  readonly selectedBandId = signal<number | null>(null);
  readonly activeTab = signal<BandTab>('overview');

  readonly selectedBand = computed(() => {
    const id = this.selectedBandId();
    return id !== null ? (this.bands().find(b => b.id === id) ?? null) : null;
  });

  readonly upcomingGigs = computed(() => {
    const band = this.selectedBand();
    if (!band) return [];
    const today = new Date().toISOString().split('T')[0];
    return band.gigs
      .filter(g => g.date >= today && g.status !== 'Cancelled')
      .sort((a, b) => a.date.localeCompare(b.date));
  });

  readonly pastGigs = computed(() => {
    const band = this.selectedBand();
    if (!band) return [];
    const today = new Date().toISOString().split('T')[0];
    return band.gigs
      .filter(g => g.date < today || g.status === 'Cancelled')
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  selectBand(id: number): void {
    this.selectedBandId.set(id);
    this.activeTab.set('overview');
  }

  setTab(tab: BandTab): void {
    this.activeTab.set(tab);
  }

  togglePostLike(bandId: number, postId: number): void {
    this.bands.update(bands =>
      bands.map(b =>
        b.id !== bandId ? b : {
          ...b,
          posts: b.posts.map(p =>
            p.id !== postId ? p : {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          ),
        }
      )
    );
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const months = ['sij.', 'velj.', 'ožu.', 'tra.', 'svi.', 'lip.', 'srp.', 'kol.', 'ruj.', 'lis.', 'stu.', 'pro.'];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}.`;
  }

  formatPayment(payment: number | null): string {
    if (payment === null) return 'Dogovor';
    return `${payment.toLocaleString('hr-HR')} €`;
  }

  toUsername(name: string): string {
    return name.toLowerCase().split(' ').join('_');
  }

  starsArray(rating: number): { full: boolean; half: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({
      full: i < Math.floor(rating),
      half: i === Math.floor(rating) && rating % 1 >= 0.5,
    }));
  }
}
