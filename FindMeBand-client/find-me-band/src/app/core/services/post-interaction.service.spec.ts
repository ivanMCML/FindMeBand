import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FeedPost } from '../models/feed.model';
import { AuthService } from './auth.service';
import { PostInteractionService } from './post-interaction.service';
import { ToastService } from './toast.service';

const API = environment.apiBaseUrl;

function post(over: Partial<FeedPost> = {}): FeedPost {
  return {
    id: 1,
    profileId: 7,
    authorName: 'Marko Horvat',
    authorUserName: 'markoh',
    authorInitials: 'MH',
    authorColor: '#7c3aed',
    authorAvatarUrl: null,
    authorType: 'musician',
    bandId: null,
    content: 'Proba',
    createdAt: new Date().toISOString(),
    timestamp: 'upravo sad',
    likes: 3,
    isLiked: false,
    media: [],
    commentsCount: 0,
    ...over,
  };
}

describe('PostInteractionService', () => {
  let service: PostInteractionService;
  let http: HttpTestingController;
  let toast: ToastService;
  let feed: ReturnType<typeof signal<FeedPost[]>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { currentUser: signal({ profileId: 99, userName: 'tester' }) },
        },
      ],
    });

    service = TestBed.inject(PostInteractionService);
    http = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);

    feed = signal<FeedPost[]>([post()]);
    service.registerFeed(feed);
  });

  afterEach(() => http.verify());

  describe('toggleLike', () => {
    it('mijenja stanje odmah, prije odgovora poslužitelja', () => {
      service.toggleLike(1);

      expect(feed()[0].isLiked).toBe(true);
      expect(feed()[0].likes).toBe(4);

      http.expectOne(`${API}/postlike`).flush({ liked: true });
    });

    it('vraća promjenu unatrag kad zahtjev padne', () => {
      service.toggleLike(1);
      http.expectOne(`${API}/postlike`).error(new ProgressEvent('network'));

      expect(feed()[0].isLiked).toBe(false);
      expect(feed()[0].likes).toBe(3);
    });

    it('javlja korisniku da oznaka nije spremljena', () => {
      service.toggleLike(1);
      http.expectOne(`${API}/postlike`).error(new ProgressEvent('network'));

      expect(toast.toasts().at(-1)?.tone).toBe('error');
    });

    it('usklađuje se s poslužiteljem kad se ishod razlikuje od pretpostavke', () => {
      service.toggleLike(1);
      // Poslužitelj javlja da objava ipak nije lajkana
      http.expectOne(`${API}/postlike`).flush({ liked: false });

      expect(feed()[0].isLiked).toBe(false);
      expect(feed()[0].likes).toBe(3);
    });

    it('ne šalje zahtjev za nepoznatu objavu', () => {
      service.toggleLike(999);
      http.expectOne(`${API}/postlike`).flush({ liked: true });

      expect(feed()[0].likes).toBe(3);
    });
  });

  describe('registerFeed', () => {
    it('osvježava svaki prijavljeni popis', () => {
      const second = signal<FeedPost[]>([post()]);
      service.registerFeed(second);

      service.toggleLike(1);
      http.expectOne(`${API}/postlike`).flush({ liked: true });

      expect(second()[0].isLiked).toBe(true);
    });
  });

  describe('deletePost', () => {
    it('miče objavu iz popisa', () => {
      service.deletePost(1);
      http.expectOne(`${API}/post/1`).flush({});

      expect(feed()).toEqual([]);
    });

    it('zadržava objavu kad brisanje padne', () => {
      service.deletePost(1);
      http.expectOne(`${API}/post/1`).error(new ProgressEvent('network'));

      expect(feed()).toHaveLength(1);
      expect(toast.toasts().at(-1)?.tone).toBe('error');
    });
  });

  describe('komentari', () => {
    it('dohvaća komentare pri prvom otvaranju', () => {
      service.toggleComments(1);
      http.expectOne(`${API}/postcomment/post/1`).flush([]);

      expect(service.expandedPostIds().has(1)).toBe(true);
    });

    it('ne dohvaća ih ponovno pri sljedećem otvaranju', () => {
      service.toggleComments(1);
      http.expectOne(`${API}/postcomment/post/1`).flush([]);

      service.toggleComments(1);
      service.toggleComments(1);

      http.expectNone(`${API}/postcomment/post/1`);
    });

    it('povećava brojač nakon poslanog komentara', () => {
      service.setDraft(1, 'Bravo!');
      service.submitComment(1);

      http.expectOne(`${API}/postcomment`).flush({
        id: 5,
        postId: 1,
        profileId: 99,
        authorFirstName: 'Test',
        authorLastName: 'Korisnik',
        authorUserName: 'tester',
        content: 'Bravo!',
        createdAt: new Date().toISOString(),
      });

      expect(feed()[0].commentsCount).toBe(1);
      expect(service.draft(1)).toBe('');
    });

    it('ne šalje prazan komentar', () => {
      service.setDraft(1, '   ');
      service.submitComment(1);

      http.expectNone(`${API}/postcomment`);
    });

    it('zadržava skicu kad slanje padne', () => {
      service.setDraft(1, 'Bravo!');
      service.submitComment(1);
      http.expectOne(`${API}/postcomment`).error(new ProgressEvent('network'));

      expect(service.draft(1)).toBe('Bravo!');
      expect(toast.toasts().at(-1)?.tone).toBe('error');
    });
  });
});
