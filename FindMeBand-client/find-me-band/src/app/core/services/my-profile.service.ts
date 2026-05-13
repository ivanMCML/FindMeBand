import { Injectable, signal } from '@angular/core';

export type ProfileTab = 'overview' | 'posts' | 'reviews';

export interface ProfileInstrument {
  id: number;
  name: string;
  type: string;
}

export interface ProfileGenre {
  id: number;
  name: string;
}

export interface ProfileReview {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewerName: string;
  reviewerInitials: string;
  reviewerColor: string;
  eventName?: string;
}

export interface ProfileBandEntry {
  id: number;
  name: string;
  initials: string;
  color: string;
  instrument: string;
  role: 'Admin' | 'Member';
  genres: string[];
}

export interface MyProfileData {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  description: string;
  initials: string;
  color: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  averageRating: number;
  numberOfReviews: number;
  instruments: ProfileInstrument[];
  genres: ProfileGenre[];
  bands: ProfileBandEntry[];
}

export interface ProfilePost {
  id: number;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

@Injectable({ providedIn: 'root' })
export class MyProfileService {
  readonly profile = signal<MyProfileData>({
    id: 1,
    firstName: 'Pero',
    lastName: 'Perić',
    userName: 'pero_peric',
    description: 'Profesionalni klavijaturist s više od 10 godina iskustva u funk, soul i jazz glazbi. Nastupam s više bendova diljem Hrvatske i uvijek sam otvoren za nove kolaboracije i projekte. Sviram u The Groove Factory i Acoustic Shadows.',
    initials: 'PP',
    color: '#7c3aed',
    createdAt: '2020-03-15',
    followersCount: 142,
    followingCount: 38,
    averageRating: 4.8,
    numberOfReviews: 17,
    instruments: [
      { id: 1, name: 'Klavijature', type: 'Keyboard' },
      { id: 2, name: 'Klavir', type: 'Keyboard' },
      { id: 3, name: 'Sintesajzer', type: 'Electronic' },
    ],
    genres: [
      { id: 1, name: 'Funk' },
      { id: 2, name: 'Soul' },
      { id: 3, name: 'Jazz' },
      { id: 4, name: 'R&B' },
    ],
    bands: [
      { id: 1, name: 'The Groove Factory', initials: 'GF', color: '#0891b2', instrument: 'Klavijature', role: 'Admin', genres: ['Funk', 'Soul', 'R&B'] },
      { id: 2, name: 'Acoustic Shadows', initials: 'AS', color: '#059669', instrument: 'Klavijature', role: 'Member', genres: ['Acoustic', 'Indie', 'Folk'] },
    ],
  });

  readonly activeTab = signal<ProfileTab>('overview');
  readonly isEditing = signal(false);

  readonly editFirstName = signal('');
  readonly editLastName = signal('');
  readonly editDescription = signal('');

  readonly reviews = signal<ProfileReview[]>([
    {
      id: 1,
      rating: 5,
      comment: 'Nevjerojatan muzičar! Pero je bio profesionalan, punktualan i iznimno talentiran. Naš nastup je bio savršen zahvaljujući njemu.',
      createdAt: '2026-04-12',
      reviewerName: 'Tvornica kulture',
      reviewerInitials: 'TK',
      reviewerColor: '#1e40af',
      eventName: 'Art Kafe — Funk & Soul Night',
    },
    {
      id: 2,
      rating: 5,
      comment: 'Odlična suradnja, profesionalan i pouzdan. Svakako preporučam!',
      createdAt: '2026-02-08',
      reviewerName: 'Club Boogaloo',
      reviewerInitials: 'CB',
      reviewerColor: '#7c3aed',
    },
    {
      id: 3,
      rating: 4,
      comment: 'Pero je sjajan muzičar koji odlično radi u timu. Jedina zamjerka je kašnjenje na probu, ali nastup je bio odličan.',
      createdAt: '2025-11-20',
      reviewerName: 'INmusic Festival',
      reviewerInitials: 'IN',
      reviewerColor: '#065f46',
      eventName: 'INmusic Festival — Mala pozornica',
    },
    {
      id: 4,
      rating: 5,
      comment: 'Pravi profesionalac. Sve pohvale!',
      createdAt: '2025-09-05',
      reviewerName: 'Sara Ćosić',
      reviewerInitials: 'SC',
      reviewerColor: '#dc2626',
    },
    {
      id: 5,
      rating: 5,
      comment: 'Fantastičan muzičar, zadovoljstvo raditi s njim. Preporučujem svim organizatorima!',
      createdAt: '2025-07-20',
      reviewerName: 'Split Summer Festival',
      reviewerInitials: 'SF',
      reviewerColor: '#059669',
      eventName: 'Split Summer Festival',
    },
  ]);

  readonly posts = signal<ProfilePost[]>([
    {
      id: 1,
      content: 'Upravo završio snimanje za novi album benda The Groove Factory! Jedva čekam da čujete materijal koji smo pripremili. Bit će odlično! 🎹',
      createdAt: '2026-05-03',
      likes: 67,
      comments: 9,
      isLiked: false,
    },
    {
      id: 2,
      content: 'Tražim bas gitarista za kratki side-projekt koji radim u slobodno vrijeme. Žanr: jazz-funk, probe jednom tjedno u Zagrebu. Ako te zanima, javi se!',
      createdAt: '2026-04-18',
      likes: 23,
      comments: 14,
      isLiked: false,
    },
    {
      id: 3,
      content: 'Sjajno veče u Art Kafeu večeras! Hvala svima koji su podržali The Groove Factory — energija publike bila je nevjerojatna. Do sljedeći put! 🎶',
      createdAt: '2026-04-14',
      likes: 89,
      comments: 12,
      isLiked: true,
    },
    {
      id: 4,
      content: 'Upravo sam završio online tečaj jazz harmonije. Preporučam svim klavijaturistima koji žele proširiti vokabular.',
      createdAt: '2026-03-29',
      likes: 41,
      comments: 6,
      isLiked: false,
    },
  ]);

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  startEditing(): void {
    const p = this.profile();
    this.editFirstName.set(p.firstName);
    this.editLastName.set(p.lastName);
    this.editDescription.set(p.description);
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  saveEditing(): void {
    const firstName = this.editFirstName().trim();
    const lastName = this.editLastName().trim();
    const description = this.editDescription().trim();
    if (!firstName || !lastName) return;
    this.profile.update(p => ({ ...p, firstName, lastName, description }));
    this.isEditing.set(false);
  }

  togglePostLike(postId: number): void {
    this.posts.update(posts =>
      posts.map(p =>
        p.id !== postId ? p : {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
        }
      )
    );
  }

  starsArray(rating: number): { full: boolean; half: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({
      full: i < Math.floor(rating),
      half: i === Math.floor(rating) && rating % 1 >= 0.5,
    }));
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const months = ['sij.', 'velj.', 'ožu.', 'tra.', 'svi.', 'lip.', 'srp.', 'kol.', 'ruj.', 'lis.', 'stu.', 'pro.'];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}.`;
  }
}
