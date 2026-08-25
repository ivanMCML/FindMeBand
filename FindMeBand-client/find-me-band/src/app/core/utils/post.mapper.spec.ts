import { avatarColor } from './avatar.util';
import { PostResponse, toFeedPost } from './post.mapper';

function response(over: Partial<PostResponse> = {}): PostResponse {
  return {
    id: 1,
    profileId: 7,
    authorFirstName: 'Marko',
    authorLastName: 'Horvat',
    authorUserName: 'markoh',
    bandId: null,
    bandName: null,
    content: 'Proba',
    createdAt: new Date().toISOString(),
    media: [],
    likesCount: 3,
    isLiked: false,
    commentsCount: 2,
    ...over,
  };
}

describe('toFeedPost — objava glazbenika', () => {
  it('spaja ime i prezime u ime autora', () => {
    expect(toFeedPost(response()).authorName).toBe('Marko Horvat');
  });

  it('označava vrstu autora', () => {
    expect(toFeedPost(response()).authorType).toBe('musician');
  });

  it('boju izvodi iz profila', () => {
    expect(toFeedPost(response()).authorColor).toBe(avatarColor(7));
  });

  it('preuzima avatar profila', () => {
    const post = toFeedPost(response({ authorAvatarUrl: '/uploads/m.jpg' }));
    expect(post.authorAvatarUrl).toBe('/uploads/m.jpg');
  });
});

describe('toFeedPost — objava benda', () => {
  const bandPost = () =>
    toFeedPost(
      response({
        bandId: 4,
        bandName: 'Modri Val',
        bandAvatarUrl: '/uploads/b.jpg',
        authorAvatarUrl: '/uploads/m.jpg',
      })
    );

  it('prikazuje bend kao autora, a ne člana koji je objavio', () => {
    expect(bandPost().authorName).toBe('Modri Val');
    expect(bandPost().authorType).toBe('band');
  });

  it('bira avatar benda ispred avatara člana', () => {
    expect(bandPost().authorAvatarUrl).toBe('/uploads/b.jpg');
  });

  it('boju izvodi iz benda', () => {
    expect(bandPost().authorColor).toBe(avatarColor(4));
  });

  it('zadržava profil člana radi provjere vlasništva', () => {
    // Brisanje se i dalje veže uz osobu koja je objavila
    expect(bandPost().profileId).toBe(7);
  });

  it('podnosi bend bez imena', () => {
    const post = toFeedPost(response({ bandId: 9, bandName: null }));
    expect(post.authorName).toBe('Bend');
  });
});

describe('toFeedPost — rubni slučajevi', () => {
  it('nedostajuće medije pretvara u prazan popis', () => {
    const post = toFeedPost(response({ media: undefined as never }));
    expect(post.media).toEqual([]);
  });

  it('nedostajući broj komentara čita kao nulu', () => {
    const post = toFeedPost(response({ commentsCount: undefined as never }));
    expect(post.commentsCount).toBe(0);
  });

  it('prenosi brojače lajkova i stanje oznake', () => {
    const post = toFeedPost(response({ likesCount: 11, isLiked: true }));
    expect(post.likes).toBe(11);
    expect(post.isLiked).toBe(true);
  });
});
