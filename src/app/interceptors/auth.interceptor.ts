import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE } from '../core/api.config';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { TranslationService } from '../services/translation.service';

/**
 * 1) Adds "Authorization: Bearer <token>" to every request that goes to the .NET API.
 *    (Also on GETs — that's what makes the API return Draft items to a logged-in admin.)
 * 2) If the API answers 401 to an authenticated request the token is dead → log out cleanly.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE)) return next(req);

  // inject() must run synchronously here (injection context), not inside the rxjs callback.
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const ts = inject(TranslationService);

  const token = auth.token();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError(err => {
      const isLogin = req.url.endsWith('/auth/login');
      if (err instanceof HttpErrorResponse && err.status === 401 && token && !isLogin) {
        auth.logout();
        toast.error(ts.t('admin.sessionExpired'));
      }
      return throwError(() => err);
    })
  );
};
