/**
 * Modeli prikaza za objave u feedu.
 *
 * Za razliku od modela u `models.ts`, koji zrcale entitete s poslužitelja,
 * ovo su oblici prilagođeni predlošku: ime autora je već složeno, vrijeme
 * već formatirano, a boja avatara izvedena. Servisi ih grade iz odgovora
 * poslužitelja, a `<app-post-card>` ih samo iscrtava.
 */

export interface FeedPostMedia {
  id: number;
  url: string;
  type: string;
}

export interface PostComment {
  id: number;
  postId: number;
  profileId: number;
  authorName: string;
  authorUserName: string;
  authorInitials: string;
  authorColor: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
  timestamp: string;
}

export interface FeedPost {
  id: number;
  profileId: number;
  authorName: string;
  authorUserName: string;
  authorInitials: string;
  authorColor: string;
  authorAvatarUrl: string | null;
  authorType: 'musician' | 'band';
  bandId: number | null;
  content: string;
  createdAt: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  media: FeedPostMedia[];
  commentsCount: number;
}

export interface BandOption {
  bandId: number;
  bandName: string;
}
