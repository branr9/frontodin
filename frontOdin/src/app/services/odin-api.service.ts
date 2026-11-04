import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthUserInfo {
  authenticated: boolean;
  id_usuario?: number;
  idUsuario?: number;
  nombre?: string;
  correo?: string;
  id_rol?: number;
  id_dependencia?: number;
  authorities?: string[];
  permisos?: string[];
}

export interface DashboardResumen {
  totalRadicados: number;
  pendientes: number;
  enTramite: number;
  finalizados: number;
  rechazados: number;
  vencidos: number;
  proximosAVencer: number;
  sinAsignar: number;
  finalizadosHoy: number;
  usuariosActivos: number;
  documentosCargados: number;
  anexosPendientes: number;
}

export interface TramiteItem {
  idTramite?: number;
  nombre: string;
  descripcion: string;
  idDependenciaResponsable?: number | null;
  idEstadoInicial?: number | null;
  diasRespuesta?: number | null;
  prioridadDefault?: string;
  requiereRespuesta?: boolean;
  activo?: boolean;
}

export interface DependenciaItem {
  id_dependencia?: number;
  dependencia: string;
  nombre: string;
  descripcion: string;
  estado: string;
}

export interface EstadoItem {
  id_estado?: number;
  nombre: string;
}

export interface SerieItem {
  id_serie?: number;
  codigo_serie: string;
  nombre_serie: string;
  codigo_unidad?: string;
}

export interface SubserieItem {
  id_subserie?: number;
  id_serie: number;
  codigo_subserie: string;
  nombre_subserie: string;
}

export interface UsuarioItem {
  id_usuario?: number;
  id_rol: number | null;
  id_dependencia: number | null;
  nombre: string;
  tipo_identificacion: string;
  num_identificacion: string;
  correo: string;
  password?: string;
  direccion: string;
  telefono: string;
  estado: string;
  fecha_creacion?: string;
}

export interface RolItem {
  id_rol?: number;
  nombre: string;
  rol: string;
  estado: string;
}

export interface PermisoItem {
  id_permiso: number;
  nombre: string;
  descripcion?: string;
  modulo?: string;
  accion?: string;
}

export interface PermisosRolResponse {
  rol?: number;
  id_rol?: number;
  asignados?: PermisoItem[];
  disponibles?: PermisoItem[];
  permisosIds?: number[];
  permisos?: string[];
  catalogo?: string[];
}

export interface DocumentoItem {
  id_documento?: number;
  id_radicado: number;
  tamano?: number;
  nombre: string;
  nombre_archivo?: string;
  ruta_archivo?: string;
  tipo?: string;
  fecha_subida?: string;
  mime_type?: string;
  version_actual?: number;
}

export interface FirmaItem {
  idFirma?: number;
  idRadicado: number;
  idUsuario?: number;
  fechaFirma?: string;
  estado?: string;
  observacion?: string;
  hashDocumento?: string;
}

export interface AnexoItem {
  idAnexo?: number;
  idRadicado: number;
  descripcion: string;
  archivo: string;
  fechaLimite?: string;
}

export interface RadicadoItem {
  id_radicado?: number;
  numero_radicado?: string;
  id_tramite: number | null;
  id_estado?: number | null;
  id_dependencia?: number | null;
  id_usuario: number | null;
  codigo_serie?: string | null;
  codigo_subserie?: string | null;
  remitente: string;
  asunto: string;
  fecha_radicado?: string;
  tipo_radicado?: string;
  tipoRadicacion?: string;
  medio_recepcion?: string;
  canalRecepcion?: string;
  prioridad?: string;
  confidencialidad?: string;
  fecha_vencimiento?: string;
  fecha_limite?: string;
  fecha_cierre?: string;
  diasRestantes?: number | null;
  observaciones?: string;
  descripcion?: string;
  numeroIdentificacion?: string;
  correo?: string;
  telefono?: string;
  ciudad?: string;
  tipoDocumento?: string;
  numeroFolios?: string;
  soporte?: string;
  tramite?: TramiteItem;
  usuario?: UsuarioItem;
  estado?: EstadoItem;
}

export interface HistorialItem {
  id_historial?: number;
  id_radicado: number;
  id_usuario: number;
  accion: string;
  descripcion: string;
  fecha: string;
}

export interface ObservacionItem {
  id_observacion?: number;
  id_radicado: number;
  id_usuario: number;
  comentario: string;
  fecha: string;
}

export interface ReasignacionItem {
  id_reasignacion?: number;
  id_radicado: number;
  id_usuario_anterior: number;
  id_usuario_nuevo: number;
  id_dependencia_nueva: number;
  fecha: string;
}

@Injectable({
  providedIn: 'root',
})
export class OdinApiService {
  private readonly opts = { withCredentials: true };

  constructor(private readonly http: HttpClient) {}

  getMe(): Observable<AuthUserInfo> {
    return this.http.get<AuthUserInfo>('/api/auth/me', this.opts);
  }

  getDashboardResumen(): Observable<DashboardResumen> {
    return this.http.get<DashboardResumen>('/api/radicados/resumen-dashboard', this.opts);
  }

  getNotificaciones(): Observable<{ noLeidas: number; items: any[] }> {
    return this.http.get<{ noLeidas: number; items: any[] }>('/api/notificaciones/resumen', this.opts);
  }

  marcarNotificacionLeida(id: number): Observable<any> {
    return this.http.post(`/api/notificaciones/${id}/leer`, {}, this.opts);
  }

  getRadicados(): Observable<RadicadoItem[]> {
    return this.http.get<RadicadoItem[]>('/api/radicados', this.opts);
  }

  buscarRadicados(filtros: {
    texto?: string;
    estado?: number | null;
    dependencia?: number | null;
    tramite?: number | null;
  }): Observable<RadicadoItem[]> {
    let params = new HttpParams();
    if (filtros.texto && filtros.texto.trim()) {
      params = params.set('texto', filtros.texto.trim());
    }
    if (filtros.estado) {
      params = params.set('estado', String(filtros.estado));
    }
    if (filtros.dependencia) {
      params = params.set('dependencia', String(filtros.dependencia));
    }
    if (filtros.tramite) {
      params = params.set('tramite', String(filtros.tramite));
    }
    return this.http.get<RadicadoItem[]>('/api/radicados/buscar', { ...this.opts, params });
  }

  getRadicadosVencidos(): Observable<RadicadoItem[]> {
    return this.http.get<RadicadoItem[]>('/api/radicados/vencidos', this.opts);
  }

  getRadicadosProximos(dias = 3): Observable<RadicadoItem[]> {
    return this.http.get<RadicadoItem[]>(`/api/radicados/proximos-a-vencer?dias=${dias}`, this.opts);
  }

  crearRadicado(radicado: Partial<RadicadoItem>): Observable<RadicadoItem> {
    return this.http.post<RadicadoItem>('/api/radicados', radicado, this.opts);
  }

  actualizarRadicado(id: number, radicado: Partial<RadicadoItem>): Observable<any> {
    return this.http.put(`/api/radicados/${id}`, radicado, this.opts);
  }

  eliminarRadicado(id: number): Observable<void> {
    return this.http.delete<void>(`/api/radicados/${id}`, this.opts);
  }

  cambiarEstadoRadicado(id: number, estado: number): Observable<any> {
    return this.http.patch(`/api/radicados/${id}/estado`, { estado }, this.opts);
  }

  reasignarRadicado(id: number, usuarioNuevo: number, dependenciaNueva: number): Observable<any> {
    return this.http.post(
      `/api/radicados/${id}/reasignar`,
      { usuarioNuevo, dependenciaNueva },
      this.opts
    );
  }

  cerrarRadicado(id: number, estado = 3, observacion = ''): Observable<any> {
    return this.http.patch(
      `/api/radicados/${id}/cerrar`,
      { estado, observacion },
      this.opts
    );
  }

  getHistorial(id: number): Observable<HistorialItem[]> {
    return this.http.get<HistorialItem[]>(`/api/radicados/${id}/historial`, this.opts);
  }

  getObservaciones(id: number): Observable<ObservacionItem[]> {
    return this.http.get<ObservacionItem[]>(`/api/radicados/${id}/observaciones`, this.opts);
  }

  agregarObservacion(id: number, comentario: string, usuario?: number): Observable<any> {
    return this.http.post(
      `/api/radicados/${id}/observaciones`,
      { comentario, usuario },
      this.opts
    );
  }

  getReasignaciones(id: number): Observable<ReasignacionItem[]> {
    return this.http.get<ReasignacionItem[]>(`/api/radicados/${id}/reasignaciones`, this.opts);
  }

  getDocumentosRadicado(idRadicado: number): Observable<DocumentoItem[]> {
    return this.http.get<DocumentoItem[]>(`/api/documentos/radicado/${idRadicado}`, this.opts);
  }

  subirArchivosRadicado(idRadicado: number, archivos: File[]): Observable<DocumentoItem[]> {
    const formData = new FormData();
    archivos.forEach((f) => formData.append('archivos', f, f.name));
    return this.http.post<DocumentoItem[]>(
      `/api/documentos/upload/${idRadicado}`,
      formData,
      this.opts
    );
  }

  eliminarDocumento(idDocumento: number): Observable<void> {
    return this.http.delete<void>(`/api/documentos/${idDocumento}`, this.opts);
  }

  getFirmasRadicado(idRadicado: number): Observable<FirmaItem[]> {
    return this.http.get<FirmaItem[]>(`/api/firmas/radicado/${idRadicado}`, this.opts);
  }

  solicitarFirma(idRadicado: number, idUsuario?: number | null, observacion?: string): Observable<any> {
    return this.http.post(
      '/api/firmas',
      {
        idRadicado,
        id_radicado: idRadicado,
        idUsuario: idUsuario || null,
        id_usuario: idUsuario || null,
        estado: 'PENDIENTE',
        observacion: observacion || 'Solicitud de firma registrada',
      },
      this.opts
    );
  }

  getAnexosRadicado(idRadicado: number): Observable<AnexoItem[]> {
    return this.http.get<AnexoItem[]>(`/api/anexos/radicado/${idRadicado}`, this.opts);
  }

  getTramites(): Observable<TramiteItem[]> {
    return this.http.get<TramiteItem[]>('/api/tramites', this.opts);
  }

  crearTramite(tramite: TramiteItem): Observable<TramiteItem> {
    return this.http.post<TramiteItem>('/api/tramites', tramite, this.opts);
  }

  actualizarTramite(id: number, tramite: TramiteItem): Observable<TramiteItem> {
    return this.http.put<TramiteItem>(`/api/tramites/${id}`, tramite, this.opts);
  }

  eliminarTramite(id: number): Observable<void> {
    return this.http.delete<void>(`/api/tramites/${id}`, this.opts);
  }

  getDependencias(): Observable<DependenciaItem[]> {
    return this.http.get<DependenciaItem[]>('/api/dependencias', this.opts);
  }

  getEstados(): Observable<EstadoItem[]> {
    return this.http.get<EstadoItem[]>('/api/estados', this.opts);
  }

  getSeries(): Observable<SerieItem[]> {
    return this.http.get<SerieItem[]>('/api/series', this.opts);
  }

  getSubseries(): Observable<SubserieItem[]> {
    return this.http.get<SubserieItem[]>('/api/subseries', this.opts);
  }

  getUsuarios(): Observable<UsuarioItem[]> {
    return this.http.get<UsuarioItem[]>('/api/usuarios', this.opts);
  }

  crearUsuario(usuario: UsuarioItem): Observable<UsuarioItem> {
    return this.http.post<UsuarioItem>('/api/usuarios', usuario, this.opts);
  }

  actualizarUsuario(id: number, usuario: UsuarioItem): Observable<UsuarioItem> {
    return this.http.put<UsuarioItem>(`/api/usuarios/${id}`, usuario, this.opts);
  }

  cambiarEstadoUsuario(id: number, estado: string): Observable<UsuarioItem> {
    return this.http.patch<UsuarioItem>(`/api/usuarios/${id}/estado`, { estado }, this.opts);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`/api/usuarios/${id}`, this.opts);
  }

  getRoles(): Observable<RolItem[]> {
    return this.http.get<RolItem[]>('/api/roles', this.opts);
  }

  crearRol(rol: RolItem): Observable<RolItem> {
    return this.http.post<RolItem>('/api/roles', rol, this.opts);
  }

  actualizarRol(id: number, rol: RolItem): Observable<RolItem> {
    return this.http.put<RolItem>(`/api/roles/${id}`, rol, this.opts);
  }

  eliminarRol(id: number): Observable<void> {
    return this.http.delete<void>(`/api/roles/${id}`, this.opts);
  }

  getPermisosDisponibles(): Observable<PermisoItem[]> {
    return this.http.get<PermisoItem[]>('/api/roles/permisos-disponibles', this.opts);
  }

  getPermisosRol(id: number): Observable<PermisosRolResponse> {
    return this.http.get<PermisosRolResponse>(`/api/roles/${id}/permisos`, this.opts);
  }

  guardarPermisosRol(id: number, permisos: (number | string)[]): Observable<PermisosRolResponse> {
    return this.http.put<PermisosRolResponse>(
      `/api/roles/${id}/permisos`,
      { permisos },
      this.opts
    );
  }
}
