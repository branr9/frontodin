import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Anexo,
  HistorialRadicado,
  ObservacionRadicado,
  Radicado,
} from '../models/radicado.model';

@Injectable({
  providedIn: 'root',
})
export class RadicacionService {
  private readonly baseUrl = '/api/radicados';
  private readonly anexosUrl = '/api/anexos';
  private readonly defaultOptions = { withCredentials: true };

  constructor(private readonly http: HttpClient) {}

  getRadicados(): Observable<Radicado[]> {
    return this.http.get<Radicado[]>(this.baseUrl, this.defaultOptions);
  }

  buscarRadicados(filtros: {
    texto?: string;
    estado?: number | null;
    dependencia?: number | null;
    tramite?: number | null;
  }): Observable<Radicado[]> {
    let params = new HttpParams();
    if (filtros.texto && filtros.texto.trim()) {
      params = params.set('texto', filtros.texto.trim());
    }
    if (filtros.estado != null) {
      params = params.set('estado', filtros.estado.toString());
    }
    if (filtros.dependencia != null) {
      params = params.set('dependencia', filtros.dependencia.toString());
    }
    if (filtros.tramite != null) {
      params = params.set('tramite', filtros.tramite.toString());
    }

    return this.http.get<Radicado[]>(`${this.baseUrl}/buscar`, {
      ...this.defaultOptions,
      params,
    });
  }

  getVencidos(): Observable<Radicado[]> {
    return this.http.get<Radicado[]>(`${this.baseUrl}/vencidos`, this.defaultOptions);
  }

  getProximosAVencer(dias = 3): Observable<Radicado[]> {
    const params = new HttpParams().set('dias', dias.toString());
    return this.http.get<Radicado[]>(`${this.baseUrl}/proximos-a-vencer`, {
      ...this.defaultOptions,
      params,
    });
  }

  getRadicadoById(id: number): Observable<Radicado> {
    return this.http.get<Radicado>(`${this.baseUrl}/${id}`, this.defaultOptions);
  }

  createRadicado(radicado: Partial<Radicado>): Observable<Radicado> {
    return this.http.post<Radicado>(this.baseUrl, radicado, this.defaultOptions);
  }

  updateRadicado(id: number, radicado: Partial<Radicado>): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${id}`, radicado, this.defaultOptions);
  }

  deleteRadicado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.defaultOptions);
  }

  cambiarEstado(id: number, estado: number): Observable<unknown> {
    return this.http.patch(
      `${this.baseUrl}/${id}/estado`,
      { estado },
      this.defaultOptions
    );
  }

  reasignar(
    id: number,
    usuarioNuevo: number,
    dependenciaNueva: number
  ): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}/${id}/reasignar`,
      { usuario: usuarioNuevo, dependencia: dependenciaNueva },
      this.defaultOptions
    );
  }

  cerrar(
    id: number,
    payload?: { estado?: number; observacion?: string }
  ): Observable<unknown> {
    return this.http.patch(
      `${this.baseUrl}/${id}/cerrar`,
      payload || { estado: 3, observacion: 'Cierre del trámite' },
      this.defaultOptions
    );
  }

  descargarComprobante(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/comprobante`, {
      ...this.defaultOptions,
      responseType: 'blob',
    });
  }

  getHistorial(id: number): Observable<HistorialRadicado[]> {
    return this.http.get<HistorialRadicado[]>(
      `${this.baseUrl}/${id}/historial`,
      this.defaultOptions
    );
  }

  getObservaciones(id: number): Observable<ObservacionRadicado[]> {
    return this.http.get<ObservacionRadicado[]>(
      `${this.baseUrl}/${id}/observaciones`,
      this.defaultOptions
    );
  }

  addObservacion(
    id: number,
    comentario: string,
    usuarioId?: number
  ): Observable<unknown> {
    const body: { comentario: string; usuario?: number } = { comentario };
    if (usuarioId) {
      body.usuario = usuarioId;
    }
    return this.http.post(
      `${this.baseUrl}/${id}/observaciones`,
      body,
      this.defaultOptions
    );
  }

  // Anexos
  getAnexos(idRadicado: number): Observable<Anexo[]> {
    return this.http.get<Anexo[]>(
      `${this.anexosUrl}/radicado/${idRadicado}`,
      this.defaultOptions
    );
  }

  guardarAnexo(anexo: Anexo): Observable<Anexo> {
    return this.http.post<Anexo>(this.anexosUrl, anexo, this.defaultOptions);
  }

  /**
   * Genera un número de radicado sugerido según tipo institucional (E-AAAA-XXXXXX, S-AAAA-XXXXXX o I-AAAA-XXXXXX)
   */
  generarConsecutivoSugerido(tipo: string): string {
    const anio = new Date().getFullYear();
    const prefijo = tipo === 'SALIDA' ? 'S' : tipo === 'INTERNO' ? 'I' : 'E';
    const aleatorio = Math.floor(100000 + Math.random() * 900000);
    return `${prefijo}-${anio}-${aleatorio}`;
  }
}
