import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NewsComponent } from './news.component';
import { authInterceptor } from '../../interceptors/auth.interceptor';
import { AuthService } from '../../services/auth.service';
import { API_BASE } from '../../core/api.config';
import { fakeJwt, mkNews } from '../../testing/fixtures';

const LIST = `${API_BASE}/news`;

async function setup(loggedIn: boolean) {
  localStorage.clear();
  if (loggedIn) localStorage.setItem('token', fakeJwt(3600));
  TestBed.configureTestingModule({
    imports: [NewsComponent],
    providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()]
  });
  await TestBed.compileComponents();
  const fixture: ComponentFixture<NewsComponent> = TestBed.createComponent(NewsComponent);
  const ctrl = TestBed.inject(HttpTestingController);
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, ctrl, el, auth: TestBed.inject(AuthService) };
}

async function settle(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('NewsComponent', () => {
  it('shows published news to visitors — with NO admin controls and no token sent', async () => {
    const { fixture, ctrl, el } = await setup(false);
    fixture.detectChanges();

    const req = ctrl.expectOne(LIST);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ totalCount: 1, items: [mkNews(1, 'Alpha')] });
    await settle(fixture);

    expect(el.querySelectorAll('.news-card').length).toBe(1);
    expect(el.textContent).toContain('Alpha');
    expect(el.querySelector('.admin-actions')).toBeNull();
    expect(el.querySelector('.kp-admin-toolbar')).toBeNull();
    ctrl.verify();
  });

  it('shows Add / Edit / Delete + Draft badge for a logged-in admin, and sends the token', async () => {
    const { fixture, ctrl, el } = await setup(true);
    fixture.detectChanges();

    const req = ctrl.expectOne(LIST);
    expect(req.request.headers.get('Authorization')).toMatch(/^Bearer /);
    req.flush({ totalCount: 2, items: [mkNews(1, 'Alpha'), mkNews(2, 'Beta', 'draft')] });
    await settle(fixture);

    expect(el.querySelector('.kp-admin-toolbar button')).not.toBeNull();
    expect(el.querySelectorAll('.admin-actions').length).toBe(2);
    expect(el.querySelectorAll('.kp-badge.draft').length).toBe(1);
  });

  it('reloads (with the token) as soon as the admin logs in — no page refresh needed', async () => {
    const { fixture, ctrl, el, auth } = await setup(false);
    fixture.detectChanges();
    ctrl.expectOne(LIST).flush({ totalCount: 1, items: [mkNews(1, 'Alpha')] });
    await settle(fixture);
    expect(el.querySelector('.admin-actions')).toBeNull();

    auth.login({ email: 'a@a.com', password: 'secret1' }).subscribe();
    ctrl.expectOne(`${API_BASE}/auth/login`).flush({
      token: fakeJwt(3600), id: 1, fullName: 'Admin', email: 'a@a.com', role: 'admin'
    });
    await settle(fixture);

    const reload = ctrl.expectOne(LIST);
    expect(reload.request.headers.get('Authorization')).toMatch(/^Bearer /);
    reload.flush({ totalCount: 2, items: [mkNews(1, 'Alpha'), mkNews(2, 'Beta', 'draft')] });
    await settle(fixture);

    expect(el.querySelectorAll('.news-card').length).toBe(2);
    expect(el.querySelectorAll('.admin-actions').length).toBe(2);
  });

  it('hides drafts + controls again on logout', async () => {
    const { fixture, ctrl, el, auth } = await setup(true);
    fixture.detectChanges();
    ctrl.expectOne(LIST).flush({ totalCount: 2, items: [mkNews(1, 'Alpha'), mkNews(2, 'Beta', 'draft')] });
    await settle(fixture);
    expect(el.querySelectorAll('.news-card').length).toBe(2);

    auth.logout();
    await settle(fixture);
    const reload = ctrl.expectOne(LIST);
    expect(reload.request.headers.has('Authorization')).toBe(false);
    reload.flush({ totalCount: 1, items: [mkNews(1, 'Alpha')] });
    await settle(fixture);

    expect(el.querySelectorAll('.news-card').length).toBe(1);
    expect(el.querySelector('.admin-actions')).toBeNull();
  });

  it('delete: asks for confirmation, then calls DELETE and removes the card', async () => {
    const { fixture, ctrl, el } = await setup(true);
    fixture.detectChanges();
    ctrl.expectOne(LIST).flush({ totalCount: 2, items: [mkNews(1, 'Alpha'), mkNews(2, 'Beta')] });
    await settle(fixture);

    (el.querySelector('.kp-icon-btn.del') as HTMLButtonElement).click();
    await settle(fixture);
    ctrl.expectNone(`${LIST}/1`); // nothing deleted yet — user must confirm
    expect(el.querySelector('app-confirm-dialog')).not.toBeNull();

    (el.querySelector('app-confirm-dialog .kp-btn-danger') as HTMLButtonElement).click();
    const del = ctrl.expectOne(`${LIST}/1`);
    expect(del.request.method).toBe('DELETE');
    del.flush({ message: 'News article deleted successfully' });
    await settle(fixture);

    expect(el.querySelectorAll('.news-card').length).toBe(1);
    expect(el.textContent).not.toContain('Alpha');
    expect(el.querySelector('app-confirm-dialog')).toBeNull();
  });

  it('delete: cancel does nothing', async () => {
    const { fixture, ctrl, el } = await setup(true);
    fixture.detectChanges();
    ctrl.expectOne(LIST).flush({ totalCount: 1, items: [mkNews(1, 'Alpha')] });
    await settle(fixture);

    (el.querySelector('.kp-icon-btn.del') as HTMLButtonElement).click();
    await settle(fixture);
    (el.querySelector('app-confirm-dialog .kp-btn-ghost') as HTMLButtonElement).click();
    await settle(fixture);

    ctrl.expectNone(`${LIST}/1`);
    expect(el.querySelectorAll('.news-card').length).toBe(1);
  });

  it('shows a friendly empty state and an error state with retry', async () => {
    const { fixture, ctrl, el } = await setup(false);
    fixture.detectChanges();
    ctrl.expectOne(LIST).flush({ totalCount: 0, items: [] });
    await settle(fixture);
    expect(el.querySelector('.kp-state')?.textContent).toContain('No news yet');
  });

  it('shows an error state with a retry button when the API is down', async () => {
    const { fixture, ctrl, el } = await setup(false);
    fixture.detectChanges();
    ctrl.expectOne(LIST).flush('boom', { status: 500, statusText: 'Server Error' });
    await settle(fixture);

    expect(el.querySelector('.kp-state')?.textContent).toContain('could not load');
    (el.querySelector('.kp-state button') as HTMLButtonElement).click();
    ctrl.expectOne(LIST).flush({ totalCount: 1, items: [mkNews(1, 'Alpha')] });
    await settle(fixture);
    expect(el.querySelectorAll('.news-card').length).toBe(1);
  });
});
