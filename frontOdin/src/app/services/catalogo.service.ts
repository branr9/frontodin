import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { Dependencia, Estado, Serie, Subserie, Tramite, Usuario } from '../models/radicado.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogoService {
  private readonly defaultOptions = { withCredentials: true };

  private tramites$?: Observable<Tramite[]>;
  private dependencias$?: Observable<Dependencia[]>;
  private usuarios$?: Observable<Usuario[]>;
  private estados$?: Observable<Estado[]>;
  private series$?: Observable<Serie[]>;
  private subseries$?: Observable<Subserie[]>;

  constructor(private readonly http: HttpClient) {}

  getTramites(forceReload = false): Observable<Tramite[]> {
    if (!this.tramites$ || forceReload) {
      this.tramites$ = this.http.get<Tramite[]>('/api/tramites', this.defaultOptions).pipe(
        catchError((err) => {
          console.error('[CatalogoService] Error al cargar trámites:', err);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.tramites$;
  }

  getDependencias(forceReload = false): Observable<Dependencia[]> {
    if (!this.dependencias$ || forceReload) {
      this.dependencias$ = this.http.get<Dependencia[]>('/api/dependencias', this.defaultOptions).pipe(
        catchError((err) => {
          console.error('[CatalogoService] Error al cargar dependencias:', err);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.dependencias$;
  }

  getUsuarios(forceReload = false): Observable<Usuario[]> {
    if (!this.usuarios$ || forceReload) {
      this.usuarios$ = this.http.get<Usuario[]>('/api/usuarios', this.defaultOptions).pipe(
        catchError((err) => {
          console.error('[CatalogoService] Error al cargar usuarios:', err);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.usuarios$;
  }

  getEstados(forceReload = false): Observable<Estado[]> {
    if (!this.estados$ || forceReload) {
      this.estados$ = this.http.get<Estado[]>('/api/estados', this.defaultOptions).pipe(
        catchError((err) => {
          console.error('[CatalogoService] Error al cargar estados:', err);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.estados$;
  }

  getSeries(forceReload = false): Observable<Serie[]> {
    if (!this.series$ || forceReload) {
      this.series$ = this.http.get<Serie[]>('/api/series', this.defaultOptions).pipe(
        catchError((err) => {
          console.error('[CatalogoService] Error al cargar series:', err);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.series$;
  }

  getSubseries(forceReload = false): Observable<Subserie[]> {
    if (!this.subseries$ || forceReload) {
      this.subseries$ = this.http.get<Subserie[]>('/api/subseries', this.defaultOptions).pipe(
        catchError((err) => {
          console.error('[CatalogoService] Error al cargar subseries:', err);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.subseries$;
  }
}
