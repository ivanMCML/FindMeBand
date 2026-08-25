import { environment } from '../../../environments/environment';
import { mediaUrl } from './media.util';

describe('mediaUrl', () => {
  it('vraća null za nedostajuću putanju', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
    expect(mediaUrl('')).toBeNull();
  });

  it('propušta apsolutne URL-ove nepromijenjene', () => {
    expect(mediaUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(mediaUrl('http://example.com/a.jpg')).toBe('http://example.com/a.jpg');
    expect(mediaUrl('//cdn.example.com/a.jpg')).toBe('//cdn.example.com/a.jpg');
  });

  it('propušta ugrađene podatkovne URL-ove', () => {
    const inline = 'data:image/png;base64,iVBORw0KGgo=';
    expect(mediaUrl(inline)).toBe(inline);
  });

  it('nadopunjuje relativnu putanju korijenom poslužitelja', () => {
    expect(mediaUrl('/uploads/a.jpg')).toBe(`${environment.mediaBaseUrl}/uploads/a.jpg`);
  });

  it('umeće kosu crtu kad je putanja ne počinje njome', () => {
    expect(mediaUrl('uploads/a.jpg')).toBe(`${environment.mediaBaseUrl}/uploads/a.jpg`);
  });
});
