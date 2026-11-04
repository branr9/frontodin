import { ApplicationConfig, ApplicationRef, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';

import { routes } from './app.routes';

const zonelessHttpSyncInterceptor: HttpInterceptorFn = (req, next) => {
  const appRef = inject(ApplicationRef);
  return next(req).pipe(
    tap({
      next: () => setTimeout(() => appRef.tick(), 0),
      error: () => setTimeout(() => appRef.tick(), 0),
    }),
    finalize(() => setTimeout(() => appRef.tick(), 0))
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([zonelessHttpSyncInterceptor])),
  ],
};
