import { fullDateTime, relativeTime } from './date.util';

/** Trenutak od kojeg se računa; testovi ga fiksiraju da ne ovise o satu. */
const NOW = new Date('2026-06-15T12:00:00Z').getTime();

function agoBy(ms: number): string {
  return new Date(NOW - ms).toISOString();
}

describe('relativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prikazuje minute do jednog sata', () => {
    expect(relativeTime(agoBy(5 * 60_000))).toBe('5min');
    expect(relativeTime(agoBy(59 * 60_000))).toBe('59min');
  });

  it('prikazuje sate do jednog dana', () => {
    expect(relativeTime(agoBy(3 * 3_600_000))).toBe('3h');
  });

  it('imenuje jučerašnji dan', () => {
    expect(relativeTime(agoBy(26 * 3_600_000))).toBe('jučer');
  });

  it('prikazuje dane do godine dana', () => {
    expect(relativeTime(agoBy(12 * 86_400_000))).toBe('12d');
  });

  it('prelazi na datum nakon godine dana', () => {
    // Brojanje dana iznad 365 prestaje biti čitljivo
    const out = relativeTime(agoBy(400 * 86_400_000));
    expect(out).not.toMatch(/d$/);
    expect(out).toContain('2025');
  });

  it('sažima svježe zapise', () => {
    expect(relativeTime(agoBy(20_000))).toBe('upravo sad');
  });

  it('vraća prazan niz za nedostajuću ili neispravnu vrijednost', () => {
    expect(relativeTime(null)).toBe('');
    expect(relativeTime(undefined)).toBe('');
    expect(relativeTime('')).toBe('');
    expect(relativeTime('ovo nije datum')).toBe('');
  });
});

describe('fullDateTime', () => {
  it('vraća prazan niz za neispravnu vrijednost', () => {
    expect(fullDateTime('bez smisla')).toBe('');
    expect(fullDateTime(null)).toBe('');
  });

  it('ispisuje godinu za ispravan datum', () => {
    expect(fullDateTime('2026-03-08T19:30:00Z')).toContain('2026');
  });
});
