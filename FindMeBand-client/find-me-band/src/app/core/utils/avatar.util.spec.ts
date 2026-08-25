import { AVATAR_PALETTE, avatarColor, bandColor, initialsFrom, toInitials } from './avatar.util';

describe('avatarColor', () => {
  it('daje istu boju za isti identifikator', () => {
    expect(avatarColor(42)).toBe(avatarColor(42));
  });

  it('ostaje unutar palete', () => {
    for (let id = 0; id < 50; id++) {
      expect(AVATAR_PALETTE).toContain(avatarColor(id));
    }
  });

  it('podnosi negativne identifikatore', () => {
    expect(AVATAR_PALETTE).toContain(avatarColor(-7));
  });
});

describe('bandColor', () => {
  it('razlikuje bend od glazbenika s istim identifikatorom', () => {
    // Pomak postoji upravo zato što se to dvoje često prikazuje jedno uz drugo
    const collisions = [1, 2, 3, 4, 5, 6, 7].filter(id => bandColor(id) === avatarColor(id));
    expect(collisions).toEqual([]);
  });
});

describe('toInitials', () => {
  it('uzima prvo slovo prve dvije riječi', () => {
    expect(toInitials('Marko Horvat')).toBe('MH');
  });

  it('ne prelazi dva znaka', () => {
    expect(toInitials('Kvintet Bez Imena')).toBe('KB');
  });

  it('radi s jednom riječi', () => {
    expect(toInitials('Prljavci')).toBe('P');
  });

  it('preskače višestruke razmake', () => {
    expect(toInitials('  Modri   Val ')).toBe('MV');
  });

  it('vraća prazan niz za prazno ime', () => {
    expect(toInitials('')).toBe('');
  });
});

describe('initialsFrom', () => {
  it('spaja inicijale imena i prezimena', () => {
    expect(initialsFrom('Ivan', 'Bebić')).toBe('IB');
  });

  it('podnosi prazna polja', () => {
    expect(initialsFrom('', '')).toBe('');
    expect(initialsFrom('Ana', '')).toBe('A');
  });
});
