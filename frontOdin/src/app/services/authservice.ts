import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // [AUTH ANGULAR] Esta ruta es API; no usa /login ni vistas Thymeleaf.
  private readonly loginUrl = '/api/auth/login';

  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string): Observable<unknown> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    return this.http.post(this.loginUrl, body.toString(), {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      withCredentials: true,
      observe: 'response',
    });
  }

  // [AUTH ANGULAR] Cierra la sesión HTTP sin usar la vista Thymeleaf /logout.
  logout(): Observable<unknown> {
    return this.http.post('/api/auth/logout', null, {
      withCredentials: true,
      observe: 'response',
    });
  }
}
