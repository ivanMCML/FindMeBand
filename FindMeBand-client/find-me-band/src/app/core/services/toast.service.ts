import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

/** Koliko poruka ostaje na zaslonu prije nego se sama povuče. */
const DISMISS_AFTER_MS = 5000;

/** Više od ovoga zatrpava zaslon; najstarija ispada. */
const MAX_VISIBLE = 3;

/**
 * Kratke povratne poruke o ishodu radnje.
 *
 * Postoji jer se većina neuspjelih zahtjeva prije tiho gutala u
 * `catchError` — korisnik bi kliknuo, ništa se ne bi dogodilo i ne bi
 * imao naznaku zašto.
 *
 * ```ts
 * this.toast.error('Objava nije spremljena.');
 * this.toast.success('Profil je ažuriran.');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;

  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private push(tone: ToastTone, message: string): void {
    const id = this.nextId++;

    this.toasts.update(list => [...list, { id, tone, message }].slice(-MAX_VISIBLE));

    setTimeout(() => this.dismiss(id), DISMISS_AFTER_MS);
  }
}
