import { Component, computed, signal, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { MessagesService, Message } from '../../../core/services/messages.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements AfterViewChecked {
  @ViewChild('messagesList') messagesList?: ElementRef<HTMLElement>;

  readonly msg = inject(MessagesService);

  newMessageText = signal('');
  private shouldScrollToBottom = false;

  selectedConversation = this.msg.selectedConversation;
  currentMessages = this.msg.currentMessages;

  sendMessage(): void {
    const text = this.newMessageText().trim();
    if (!text) return;
    this.msg.sendMessage(text);
    this.newMessageText.set('');
    this.shouldScrollToBottom = true;
  }

  onNewMessageInput(event: Event): void {
    this.newMessageText.set((event.target as HTMLInputElement).value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messagesList) {
      const el = this.messagesList.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollToBottom = false;
    }
  }

  needsDateSeparator(messages: Message[], index: number): boolean {
    if (index === 0) return true;
    return messages[index].sentAt.toDateString() !== messages[index - 1].sentAt.toDateString();
  }

  formatDateSeparator(date: Date): string {
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Danas';
    const yesterday = new Date(now.getTime() - 86400000);
    if (date.toDateString() === yesterday.toDateString()) return 'Jučer';
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
  }
}
