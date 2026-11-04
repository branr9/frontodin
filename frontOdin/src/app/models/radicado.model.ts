export interface Dependencia {
  id_dependencia: number;
  nombre: string;
  dependencia?: string;
  estado?: string;
  descripcion?: string;
}

export interface Tramite {
  idTramite: number;
  nombre: string;
  descripcion: string;
  idDependenciaResponsable?: number;
  idEstadoInicial?: number;
  diasRespuesta?: number;
  prioridadDefault?: string;
  activo?: boolean;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  id_rol?: number;
  id_dependencia?: number;
  num_identificacion?: string;
  tipo_identificacion?: string;
}

export interface Estado {
  id_estado: number;
  nombre: string;
}

export interface Serie {
  id_serie: number;
  codigo_serie: string;
  nombre_serie: string;
  codigo_unidad?: string;
}

export interface Subserie {
  id_subserie: number;
  id_serie: number;
  codigo_subserie: string;
  nombre_subserie: string;
  tipo_pqrsf?: string;
  retencion_anios?: number;
  disposicion_final?: string;
  nivel_acceso?: string;
}

export interface HistorialRadicado {
  id_historial?: number;
  id_radicado: number;
  id_usuario?: number;
  accion: string;
  descripcion?: string;
  fecha: string;
}

export interface ObservacionRadicado {
  id_observacion?: number;
  id_radicado: number;
  id_usuario?: number;
  comentario: string;
  fecha: string;
}

export interface Anexo {
  idAnexo?: number;
  idRadicado: number;
  descripcion: string;
  archivo: string;
}

export interface Radicado {
  id_radicado?: number;
  numero_radicado: string;
  id_tramite: number;
  id_estado: number;
  id_dependencia?: number;
  dependencias?: Dependencia;
  id_usuario: number;
  codigo_serie?: string | null;
  codigo_subserie?: string | null;
  serie?: Serie;
  subserie?: Subserie;
  remitente: string;
  asunto: string;
  fecha_radicado: string;
  tipo_radicado?: string;
  medio_recepcion?: string;
  prioridad?: string;
  confidencialidad?: string;
  id_expediente?: number;
  fecha_vencimiento?: string;
  fecha_limite?: string;
  fecha_cierre?: string;
  id_usuario_cierre?: number;
  tramite?: Tramite;
  usuario?: Usuario;
  estado?: Estado;

  // Campos complementarios del formulario (RF-09, soporte, folios, forma respuesta)
  numeroIdentificacion?: string;
  contacto?: string;
  direccion?: string;
  tipoDocumento?: string;
  fechaDocumento?: string;
  canalRecepcion?: string;
  observaciones?: string;
  correo?: string;
  telefono?: string;
  ciudad?: string;
  numeroFolios?: string | number;
  soporte?: string;
  descripcion?: string;
  formaRespuesta?: string;
  anonimo?: boolean;
}
