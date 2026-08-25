import { FeedPost } from '../models/feed.model';
import { avatarColor, toInitials } from './avatar.util';
import { relativeTime } from './date.util';

/** Oblik objave koji vraća `PostController` na poslužitelju. */
export interface PostResponse {
  id: number;
  profileId: number;
  authorFirstName: string;
  authorLastName: string;
  authorUserName: string;
  authorAvatarUrl?: string;
  bandId: number | null;
  bandName: string | null;
  bandAvatarUrl?: string;
  content: string;
  createdAt: string;
  media: { id: number; url: string; type: string }[];
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
}

/**
 * Pretvara odgovor poslužitelja u model prikaza.
 *
 * Objava koju je napisao bend prikazuje bend kao autora — njegovo ime,
 * avatar i boju — iako je zapis vezan i uz profil člana koji ju je objavio.
 */
export function toFeedPost(p: PostResponse): FeedPost {
  const isBandPost = p.bandId !== null;
  const displayName = isBandPost ? p.bandName ?? 'Bend' : `${p.authorFirstName} ${p.authorLastName}`;
  const colorId = isBandPost ? p.bandId ?? p.profileId : p.profileId;

  return {
    id: p.id,
    profileId: p.profileId,
    authorName: displayName,
    authorUserName: isBandPost ? p.bandName ?? '' : p.authorUserName,
    authorInitials: toInitials(displayName),
    authorColor: avatarColor(colorId),
    authorAvatarUrl: (isBandPost ? p.bandAvatarUrl : p.authorAvatarUrl) ?? null,
    authorType: isBandPost ? 'band' : 'musician',
    bandId: p.bandId,
    content: p.content,
    createdAt: p.createdAt,
    timestamp: relativeTime(p.createdAt),
    likes: p.likesCount,
    isLiked: p.isLiked,
    media: (p.media ?? []).map(m => ({ id: m.id, url: m.url, type: m.type })),
    commentsCount: p.commentsCount ?? 0,
  };
}
