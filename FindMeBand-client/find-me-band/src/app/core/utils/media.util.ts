import { environment } from '../../../environments/environment';

/**
 * Pretvara relativnu putanju s poslužitelja u apsolutni URL.
 *
 * Poslužitelj vraća putanje poput `/uploads/avatars/12.jpg`, a apsolutne
 * URL-ove (vanjske slike) propušta nepromijenjene. Prazna vrijednost vraća
 * `null` da predložak može odlučiti prikazati zamjenu umjesto slomljene slike.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${environment.mediaBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
