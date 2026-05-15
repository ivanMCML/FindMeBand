import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">FindMeBand</div>
        <h1>Prijava</h1>

        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="email" name="email"
                   required placeholder="vas@email.com" />
          </div>
          <div class="form-group">
            <label for="password">Lozinka</label>
            <input id="password" type="password" [(ngModel)]="password" name="password"
                   required placeholder="••••••••" />
          </div>
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Prijavljivanje...' : 'Prijavi se' }}
          </button>
        </form>

        <p class="auth-link">
          Nemaš račun? <a routerLink="/register">Registriraj se</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg);
    }
    .auth-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }
    .auth-logo {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 6px;
    }
    h1 {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 24px;
      color: var(--color-text);
    }
    .auth-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
    .form-group {
      margin-bottom: 14px;
    }
    label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-text);
      margin-bottom: 5px;
    }
    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-bg);
      color: var(--color-text);
      font-size: 0.875rem;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus { border-color: var(--color-primary); }
    button[type="submit"] {
      width: 100%;
      padding: 11px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 6px;
      transition: opacity 0.15s;
    }
    button[type="submit"]:hover:not(:disabled) { opacity: 0.88; }
    button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-link {
      text-align: center;
      margin-top: 20px;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }
    .auth-link a { color: var(--color-primary); text-decoration: none; font-weight: 500; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal('');

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => this.router.navigate([user.role === 'Organizer' ? '/organizer/my-events' : '/musician/home']),
      error: err => {
        this.error.set(this.parseError(err));
        this.loading.set(false);
      }
    });
  }

  private parseError(err: any): string {
    if (typeof err.error === 'string') return err.error;
    if (Array.isArray(err.error)) return err.error.map((e: any) => e.description).join(', ');
    return 'Prijava nije uspjela. Provjeri podatke i pokušaj ponovo.';
  }
}
