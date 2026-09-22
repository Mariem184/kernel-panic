import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { API_BASE } from '../core/api.config';
import { fakeJwt } from '../testing/fixtures';

function setup(): { auth: AuthService; http: HttpTestingController } {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  return { auth: TestBed.inject(AuthService), http: TestBed.inject(HttpTestingController) };
}

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());

  it('login() stores the token + user and flips isLoggedIn', () => {
    const { auth, http } = setup();
    expect(auth.isLoggedIn()).toBe(false);

    const token = fakeJwt(3600);
    auth.login({ email: 'admin@kernelpanic.com', password: 'x' }).subscribe();
    const req = http.expectOne(`${API_BASE}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token, id: 1, fullName: 'KernelPanic Admin', email: 'admin@kernelpanic.com', role: 'admin' });

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.token()).toBe(token);
    expect(auth.user()?.fullName).toBe('KernelPanic Admin');
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('logout() clears state and storage', () => {
    localStorage.setItem('token', fakeJwt(3600));
    const { auth } = setup();
    expect(auth.isLoggedIn()).toBe(true);

    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('restores a still-valid token from a previous visit', () => {
    localStorage.setItem('token', fakeJwt(3600));
    localStorage.setItem('kp_user', JSON.stringify({ id: 1, fullName: 'A', email: 'a@a.com', role: 'admin' }));
    const { auth } = setup();
    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.user()?.email).toBe('a@a.com');
  });

  it('ignores and removes an expired token', () => {
    localStorage.setItem('token', fakeJwt(-60));
    const { auth } = setup();
    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('treats a malformed token as logged out', () => {
    localStorage.setItem('token', 'not-a-jwt');
    const { auth } = setup();
    expect(auth.isLoggedIn()).toBe(false);
  });
});
