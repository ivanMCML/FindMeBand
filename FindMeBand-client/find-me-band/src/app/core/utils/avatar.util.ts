/**
 * Paleta boja za avatare bez učitane slike.
 *
 * Boja se bira determinističkim ostatkom po identifikatoru, pa isti profil
 * uvijek dobije istu boju — i između sesija i između uređaja.
 */
export const AVATAR_PALETTE = [
  '#7c3aed',
  '#0891b2',
  '#059669',
  '#dc2626',
  '#d97706',
  '#1e40af',
  '#b45309',
] as const;

/** Vraća stabilnu boju avatara za zadani identifikator. */
export function avatarColor(id: number): string {
  return AVATAR_PALETTE[Math.abs(id) % AVATAR_PALETTE.length];
}

/**
 * Izvlači najviše dva inicijala iz punog imena.
 *
 * `"Ivan Horvat"` → `"IH"`, `"Bijelo Dugme"` → `"BD"`, `"Prljavci"` → `"P"`.
 */
export function toInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Inicijali iz odvojenog imena i prezimena.
 *
 * Poslužitelj ta dva polja vraća zasebno, pa ovo štedi spajanje u niz
 * samo da bi ga se opet rastavilo.
 */
export function initialsFrom(first: string, last: string): string {
  return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase();
}

/**
 * Boja avatara za bend.
 *
 * Pomak osigurava da bend i glazbenik s istim identifikatorom ne dobiju
 * istu boju, jer se često pojavljuju jedan uz drugoga.
 */
export function bandColor(id: number): string {
  return avatarColor(id + 1000);
}
