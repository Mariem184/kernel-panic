import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { API_BASE } from '../core/api.config';
import { fakeJwt } from '../testing/fixtures';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()]
  });
  return {
    http: TestBed.inject(HttpClient),
    ctrl: TestBed.inject(HttpTestingController),
    auth: TestBed.inject(AuthService),
    toast: TestBed.inject(ToastService)
  };
}

describe('authInterceptor', () => {
  beforeEach(() => localStorage.clear());

  it('adds the Bearer token to API requests (including GETs)', () => {
    const token = fakeJwt(3600);
    localStorage.setItem('token', token);
    const { http, ctrl } = setup();

    http.get(`${API_BASE}/news`).subscribe();
    expect(ctrl.expectOne(`${API_BASE}/news`).request.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('sends no Authorization header when logged out', () => {
    const { http, ctrl } = setup();
    http.get(`${API_BASE}/news`).subscribe();
    expect(ctrl.expectOne(`${API_BASE}/news`).request.headers.has('Authorization')).toBe(false);
  });

  it('never leaks the token to other hosts', () => {
    localStorage.setItem('token', fakeJwt(3600));
    const { http, ctrl } = setup();
    http.get('https://example.com/data').subscribe();
    expect(ctrl.expectOne('https://example.com/data').request.headers.has('Authorization')).toBe(false);
  });

  it('logs out and shows a toast when the API answers 401 to an authenticated call', () => {
    localStorage.setItem('token', fakeJwt(3600));
    const { http, ctrl, auth, toast } = setup();
    expect(auth.isLoggedIn()).toBe(true);

    http.delete(`${API_BASE}/news/1`).subscribe({ error: () => {} });
    ctrl.expectOne(`${API_BASE}/news/1`).flush({ message: 'nope' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.isLoggedIn()).toBe(false);
    expect(toast.toasts().length).toBe(1);
  });

  it('does NOT log out on a 401 from the login endpoint itself (wrong password)', () => {
    const { http, ctrl, toast } = setup();
    http.post(`${API_BASE}/auth/login`, {}).subscribe({ error: () => {} });
    ctrl.expectOne(`${API_BASE}/auth/login`).flush({ message: 'Invalid' }, { status: 401, statusText: 'Unauthorized' });
    expect(toast.toasts().length).toBe(0);
  });
});
