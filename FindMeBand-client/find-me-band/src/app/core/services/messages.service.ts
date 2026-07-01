import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

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

interface ConversationResponse {
  id: number;
  otherProfileId: number;
  otherFirstName: string;
  otherLastName: string;
  otherUserName: string;
  otherDescription: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageIsOwn: boolean;
  unreadCount: number;
}

interface MessageResponse {
  id: number;
  senderId: number;
  content: string;
  sentAt: string;
  isOwn: boolean;
}

interface FollowResponse {
  followeeProfileId: number | null;
  followeeProfileFirstName: string | null;
  followeeProfileLastName: string | null;
  followeeProfileUserName: string | null;
  followeeProfileDescription: string | null;
}

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#1e40af', '#b45309'];

function contactColor(id: number): string {
  return PALETTE[Math.abs(id) % PALETTE.length];
}

function toInitials(first: string, last: string): string {
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
}

function toSubtitle(description: string): string {
  if (!description?.trim()) return 'Muzičar';
  return description.length > 40 ? description.slice(0, 40) + '…' : description;
}

const API = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly conversations = signal<Conversation[]>([]);
  readonly searchQuery = signal('');
  readonly selectedConversationId = signal<number | null>(null);

  private readonly loadedMessages = signal<Record<number, Message[]>>({});
  private followingContacts = signal<Contact[]>([]);

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
    return this.followingContacts().filter(
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
    return id !== null ? (this.loadedMessages()[id] ?? []) : [];
  });

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.loadConversations(user.profileId);
        this.loadFollowingContacts(user.profileId);
      } else {
        this.conversations.set([]);
        this.followingContacts.set([]);
        this.selectedConversationId.set(null);
        this.loadedMessages.set({});
      }
    });
  }

  selectConversation(convId: number): void {
    this.selectedConversationId.set(convId);
    this.conversations.update(convs =>
      convs.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c)
    );

    if (!this.loadedMessages()[convId]) {
      this.loadMessages(convId);
    }
  }

  startConversation(contact: Contact): void {
    const user = this.auth.currentUser();
    if (!user) return;

    // Check if conversation already exists locally
    const existing = this.conversations().find(c => c.contact.id === contact.id);
    if (existing) {
      this.selectConversation(existing.id);
      this.searchQuery.set('');
      return;
    }

    this.http.post<ConversationResponse>(`${API}/conversation`, {
      senderId: user.profileId,
      recipientId: contact.id,
    }).subscribe({
      next: (res) => {
        const conv = this.toConversation(res);
        this.conversations.update(convs => [conv, ...convs]);
        this.searchQuery.set('');
        this.selectConversation(res.id);
      }
    });
  }

  sendMessage(text: string): void {
    const convId = this.selectedConversationId();
    const user = this.auth.currentUser();
    if (!text.trim() || convId === null || !user) return;

    this.http.post<MessageResponse>(`${API}/conversation/${convId}/message`, {
      senderId: user.profileId,
      content: text.trim(),
    }).subscribe({
      next: (res) => {
        const msg: Message = {
          id: res.id,
          text: res.content,
          sentAt: new Date(res.sentAt),
          isOwn: true,
        };
        const now = new Date(res.sentAt);
        this.loadedMessages.update(msgs => ({
          ...msgs,
          [convId]: [...(msgs[convId] ?? []), msg],
        }));
        this.conversations.update(convs =>
          convs.map(c =>
            c.id === convId
              ? { ...c, lastMessage: text.trim(), lastMessageAt: now, lastMessageIsOwn: true }
              : c
          )
        );
      }
    });
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

  private loadConversations(profileId: number): void {
    this.http.get<ConversationResponse[]>(`${API}/conversation/profile/${profileId}`)
      .pipe(catchError(() => of([])))
      .subscribe(convs => {
        this.conversations.set(convs.map(c => this.toConversation(c)));
      });
  }

  private loadMessages(convId: number): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.http.get<MessageResponse[]>(`${API}/conversation/${convId}/messages/${user.profileId}`)
      .pipe(catchError(() => of([])))
      .subscribe(msgs => {
        this.loadedMessages.update(all => ({
          ...all,
          [convId]: msgs.map(m => ({
            id: m.id,
            text: m.content,
            sentAt: new Date(m.sentAt),
            isOwn: m.isOwn,
          })),
        }));
      });
  }

  private loadFollowingContacts(profileId: number): void {
    this.http.get<FollowResponse[]>(`${API}/follow/following/${profileId}`)
      .pipe(catchError(() => of([])))
      .subscribe(follows => {
        const contacts = follows
          .filter(f => f.followeeProfileId !== null)
          .map(f => ({
            id: f.followeeProfileId!,
            name: `${f.followeeProfileFirstName} ${f.followeeProfileLastName}`,
            username: f.followeeProfileUserName ?? '',
            initials: toInitials(f.followeeProfileFirstName ?? '', f.followeeProfileLastName ?? ''),
            color: contactColor(f.followeeProfileId!),
            type: 'musician' as const,
            subtitle: toSubtitle(f.followeeProfileDescription ?? ''),
          }));
        this.followingContacts.set(contacts);
      });
  }

  private toConversation(r: ConversationResponse): Conversation {
    const name = `${r.otherFirstName} ${r.otherLastName}`;
    return {
      id: r.id,
      contact: {
        id: r.otherProfileId,
        name,
        username: r.otherUserName,
        initials: toInitials(r.otherFirstName, r.otherLastName),
        color: contactColor(r.otherProfileId),
        type: 'musician',
        subtitle: toSubtitle(r.otherDescription),
      },
      lastMessage: r.lastMessage ?? '',
      lastMessageAt: r.lastMessageAt ? new Date(r.lastMessageAt) : new Date(0),
      lastMessageIsOwn: r.lastMessageIsOwn,
      unreadCount: r.unreadCount,
    };
  }
}
