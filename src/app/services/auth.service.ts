import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE } from '../core/api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginResponse extends AuthUser {
  token: string;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'kp_user';

/** Reads the `exp` claim (seconds since epoch) of a JWT, or null if the token is malformed. */
function jwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = JSON.parse(json).exp;
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

/**
 * Single source of truth for "is the admin logged in?".
 *
 * `isLoggedIn()` is a signal, so every component that reads it (news, projects, navbar…)
 * updates instantly on login / logout — no page reload needed.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly loginUrl = `${API_BASE}/auth/login`;
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  readonly token = signal<string | null>(null);
  readonly user = signal<AuthUser | null>(null);
  readonly isLoggedIn = computed(() => !!this.token());

  constructor() {
    this.restoreSession();
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, data).pipe(
      tap(res => {
        const { token, ...user } = res;
        this.setSession(token, user as AuthUser);
      })
    );
  }

  logout(): void {
    clearTimeout(this.expiryTimer);
    this.token.set(null);
    this.user.set(null);
    this.storageRemove(TOKEN_KEY);
    this.storageRemove(USER_KEY);
  }

  /* ───────── internals ───────── */

  private setSession(token: string, user: AuthUser | null): void {
    this.token.set(token);
    this.user.set(user);
    this.storageSet(TOKEN_KEY, token);
    if (user) this.storageSet(USER_KEY, JSON.stringify(user));
    this.scheduleExpiry(token);
  }

  /** A token left over from a previous visit is only trusted while it is still valid. */
  private restoreSession(): void {
    const token = this.storageGet(TOKEN_KEY);
    if (!token) return;

    const exp = jwtExpiry(token);
    if (exp === null || exp * 1000 <= Date.now()) {
      this.storageRemove(TOKEN_KEY);
      this.storageRemove(USER_KEY);
      return;
    }

    let user: AuthUser | null = null;
    try {
      const raw = this.storageGet(USER_KEY);
      user = raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      user = null;
    }

    this.token.set(token);
    this.user.set(user);
    this.scheduleExpiry(token);
  }

  /** Log out automatically the moment the token expires, so the admin UI never lingers on a dead session. */
  private scheduleExpiry(token: string): void {
    clearTimeout(this.expiryTimer);
    const exp = jwtExpiry(token);
    if (exp === null) return;
    const ms = Math.min(exp * 1000 - Date.now(), 2_147_483_647); // setTimeout max ≈ 24.8 days
    if (ms <= 0) { this.logout(); return; }
    this.expiryTimer = setTimeout(() => this.logout(), ms);
  }

  private storageGet(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  private storageSet(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { /* private mode / quota — session just won't persist */ }
  }
  private storageRemove(key: string): void {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}
