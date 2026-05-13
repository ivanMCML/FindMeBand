import { Injectable, computed, signal } from '@angular/core';

export interface Contact {
  id: number;
  name: string;
  username: string;
  initials: string;
  color: string;
  type: 'musician' | 'band';
  subtitle: string;
}

export interface Conversation {
  id: number;
  contact: Contact;
  lastMessage: string;
  lastMessageAt: Date;
  lastMessageIsOwn: boolean;
  unreadCount: number;
}

export interface Message {
  id: number;
  text: string;
  sentAt: Date;
  isOwn: boolean;
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  readonly followingContacts: Contact[] = [
    { id: 101, name: 'Sara Ćosić', username: 'sara_keys', initials: 'SC', color: '#7c3aed', type: 'musician', subtitle: 'Klavijature · Rijeka' },
    { id: 102, name: 'Acoustic Souls', username: 'acoustic_souls', initials: 'AS', color: '#065f46', type: 'band', subtitle: 'Folk · Acoustic · Osijek' },
    { id: 103, name: 'Ivan Blažević', username: 'ivan_drums', initials: 'IB', color: '#dc2626', type: 'musician', subtitle: 'Bubnjevi · Zagreb' },
    { id: 104, name: 'Nina Kolar', username: 'nina_keys', initials: 'NK', color: '#0891b2', type: 'musician', subtitle: 'Piano · Zagreb' },
    { id: 105, name: 'Tvornica kulture', username: 'tvornica', initials: 'TK', color: '#1e40af', type: 'band', subtitle: 'Organizator · Zagreb' },
  ];

  readonly conversations = signal<Conversation[]>([
    {
      id: 1,
      contact: { id: 1, name: 'Marko Novak', username: 'marko_novak', initials: 'MN', color: '#7c3aed', type: 'musician', subtitle: 'Gitarist · Zagreb' },
      lastMessage: 'Zvuči odlično, javi mi se kad budeš slobodan!',
      lastMessageAt: new Date('2026-05-12T14:32:00'),
      lastMessageIsOwn: false,
      unreadCount: 2,
    },
    {
      id: 2,
      contact: { id: 2, name: 'The Groove Factory', username: 'groove_factory', initials: 'GF', color: '#0891b2', type: 'band', subtitle: 'Funk · Soul · Zagreb' },
      lastMessage: 'Možemo li se naći u studiju idući tjedan?',
      lastMessageAt: new Date('2026-05-12T10:15:00'),
      lastMessageIsOwn: true,
      unreadCount: 0,
    },
    {
      id: 3,
      contact: { id: 3, name: 'Ana Horvat', username: 'ana_violin', initials: 'AH', color: '#059669', type: 'musician', subtitle: 'Violinistica · Zagreb' },
      lastMessage: 'Hvala na pozivu, svakako ću doći na probu!',
      lastMessageAt: new Date('2026-05-11T18:45:00'),
      lastMessageIsOwn: false,
      unreadCount: 0,
    },
    {
      id: 4,
      contact: { id: 4, name: 'Luka Petrović', username: 'luka_bass', initials: 'LP', color: '#d97706', type: 'musician', subtitle: 'Bas gitara · Split' },
      lastMessage: 'Kakav je raspored za ovog vikenda?',
      lastMessageAt: new Date('2026-05-10T09:00:00'),
      lastMessageIsOwn: false,
      unreadCount: 1,
    },
    {
      id: 5,
      contact: { id: 5, name: 'Split Rhythm Section', username: 'split_rhythm', initials: 'SR', color: '#dc2626', type: 'band', subtitle: 'Rock · Split' },
      lastMessage: 'Super, vidimo se na probi.',
      lastMessageAt: new Date('2026-05-08T16:20:00'),
      lastMessageIsOwn: true,
      unreadCount: 0,
    },
  ]);

  readonly allMessages = signal<Record<number, Message[]>>({
    1: [
      { id: 1, text: 'Ej, vidio sam tvoj post o traženju gitariste za projekt. Zanima me više detalja!', sentAt: new Date('2026-05-12T13:45:00'), isOwn: true },
      { id: 2, text: 'Super da se čuješ! Radi se o rock projektu, trebamo iskusnog gitarista za studijsko snimanje i par nastupa.', sentAt: new Date('2026-05-12T13:52:00'), isOwn: false },
      { id: 3, text: 'Zvuči zanimljivo. Koliko dugo planirate snimati i kada bi bili nastupi?', sentAt: new Date('2026-05-12T14:01:00'), isOwn: true },
      { id: 4, text: 'Snimanje je planirano za lipanj, 3-4 dana u studiju. Nastupi su u srpnju i kolovozu, uglavnom po Zagrebu.', sentAt: new Date('2026-05-12T14:15:00'), isOwn: false },
      { id: 5, text: 'To mi odgovara! Mogu ti poslati primjere svog rada ako te zanima?', sentAt: new Date('2026-05-12T14:28:00'), isOwn: true },
      { id: 6, text: 'Zvuči odlično, javi mi se kad budeš slobodan!', sentAt: new Date('2026-05-12T14:32:00'), isOwn: false },
    ],
    2: [
      { id: 1, text: 'Pozdrav! Čuo sam da tražite keyboardistu za sljedeći projekt?', sentAt: new Date('2026-05-11T16:00:00'), isOwn: true },
      { id: 2, text: 'Da, točno! Imaš li iskustva s funkom i soulom?', sentAt: new Date('2026-05-11T16:10:00'), isOwn: false },
      { id: 3, text: 'Svakako, sviram već 8 godina i specijalizirao sam se upravo za funk i soul.', sentAt: new Date('2026-05-11T16:18:00'), isOwn: true },
      { id: 4, text: 'Odlično! Možemo li se čuti uživo da vidimo kako zvučimo zajedno?', sentAt: new Date('2026-05-12T09:30:00'), isOwn: false },
      { id: 5, text: 'Možemo li se naći u studiju idući tjedan?', sentAt: new Date('2026-05-12T10:15:00'), isOwn: true },
    ],
    3: [
      { id: 1, text: 'Ana, zanima me tvoj prijedlog za acoustic sesiju. Koji bi datum odgovarao?', sentAt: new Date('2026-05-11T17:30:00'), isOwn: true },
      { id: 2, text: 'Imam slobodan studio u srijedu i petkom prijepodne. Što ti bolje odgovara?', sentAt: new Date('2026-05-11T17:45:00'), isOwn: false },
      { id: 3, text: 'Srijeda mi je bolja. Trebamo li donijeti vlastitu opremu?', sentAt: new Date('2026-05-11T18:10:00'), isOwn: true },
      { id: 4, text: 'Hvala na pozivu, svakako ću doći na probu!', sentAt: new Date('2026-05-11T18:45:00'), isOwn: false },
    ],
    4: [
      { id: 1, text: 'Luka, vidio sam da si završio jazz tečaj. Imaš li interes za jam session?', sentAt: new Date('2026-05-09T20:00:00'), isOwn: true },
      { id: 2, text: 'Svakako! Gdje i kada planiraš?', sentAt: new Date('2026-05-09T20:15:00'), isOwn: false },
      { id: 3, text: 'Razmišljam o Boogaloo baru, imaju live music večer svaki četvrtak.', sentAt: new Date('2026-05-10T08:30:00'), isOwn: true },
      { id: 4, text: 'Kakav je raspored za ovog vikenda?', sentAt: new Date('2026-05-10T09:00:00'), isOwn: false },
    ],
    5: [
      { id: 1, text: 'Čuo sam da tražite keyboardistu za vikend nastupe.', sentAt: new Date('2026-05-08T14:00:00'), isOwn: true },
      { id: 2, text: 'Da, točno! Imaš li iskustva s rock glazbom?', sentAt: new Date('2026-05-08T14:30:00'), isOwn: false },
      { id: 3, text: 'Apsolutno, sviram rock već 6 godina.', sentAt: new Date('2026-05-08T15:00:00'), isOwn: true },
      { id: 4, text: 'Super, dođi na probu u subotu u 14h na adresu Ilica 45.', sentAt: new Date('2026-05-08T15:45:00'), isOwn: false },
      { id: 5, text: 'Super, vidimo se na probi.', sentAt: new Date('2026-05-08T16:20:00'), isOwn: true },
    ],
  });

  readonly searchQuery = signal('');
  readonly selectedConversationId = signal<number | null>(null);

  readonly sortedConversations = computed(() =>
    [...this.conversations()].sort((a, b) =>
      b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
    )
  );

  readonly filteredConversations = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.sortedConversations();
    return this.sortedConversations().filter(
      c =>
        c.contact.name.toLowerCase().includes(q) ||
        c.contact.username.toLowerCase().includes(q)
    );
  });

  private readonly existingContactIds = computed(() =>
    new Set(this.conversations().map(c => c.contact.id))
  );

  readonly suggestedContacts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    const existing = this.existingContactIds();
    return this.followingContacts.filter(
      f =>
        !existing.has(f.id) &&
        (f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q))
    );
  });

  readonly selectedConversation = computed(() => {
    const id = this.selectedConversationId();
    return id !== null ? (this.conversations().find(c => c.id === id) ?? null) : null;
  });

  readonly currentMessages = computed(() => {
    const id = this.selectedConversationId();
    return id !== null ? (this.allMessages()[id] ?? []) : [];
  });

  selectConversation(convId: number): void {
    this.conversations.update(convs =>
      convs.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
    this.selectedConversationId.set(convId);
  }

  startConversation(contact: Contact): void {
    const ids = this.conversations().map(c => c.id);
    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    this.conversations.update(convs => [
      ...convs,
      {
        id: newId,
        contact: { ...contact },
        lastMessage: '',
        lastMessageAt: new Date(),
        lastMessageIsOwn: true,
        unreadCount: 0,
      },
    ]);
    this.allMessages.update(msgs => ({ ...msgs, [newId]: [] }));
    this.searchQuery.set('');
    this.selectedConversationId.set(newId);
  }

  sendMessage(text: string): void {
    const convId = this.selectedConversationId();
    if (!text.trim() || convId === null) return;

    const now = new Date();
    this.allMessages.update(msgs => {
      const existing = msgs[convId] ?? [];
      return {
        ...msgs,
        [convId]: [...existing, { id: existing.length + 1, text: text.trim(), sentAt: now, isOwn: true }],
      };
    });
    this.conversations.update(convs =>
      convs.map(c =>
        c.id === convId
          ? { ...c, lastMessage: text.trim(), lastMessageAt: now, lastMessageIsOwn: true }
          : c
      )
    );
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'upravo sad';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'jučer';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
  }
}
