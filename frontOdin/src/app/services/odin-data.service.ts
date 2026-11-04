import { Injectable, signal } from '@angular/core';

export interface EstadoCatalogo {
  id_estado: number;
  nombre: string;
}

export interface DependenciaCatalogo {
  id_dependencia: number;
  nombre: string;
  codigo: string;
}

export interface SerieCatalogo {
  codigo_serie: string;
  nombre_serie: string;
}

export interface SubserieCatalogo {
  codigo_subserie: string;
  codigo_serie: string;
  nombre_subserie: string;
}

export interface TipoTramite {
  idTramite: number;
  nombre: string;
  descripcion: string;
  diasRespuesta: number;
  prioridadDefault: string;
  requiereRespuesta: boolean;
  activo: boolean;
  idDependenciaResponsable: number | null;
  idEstadoInicial: number | null;
}

export interface UsuarioOdin {
  id_usuario: number;
  nombre: string;
  id_rol: number;
  rolNombre: string;
  id_dependencia: number;
  dependenciaNombre: string;
  tipo_identificacion: string;
  num_identificacion: string;
  correo: string;
  estado: 'Activo' | 'Inactivo';
  telefono: string;
  direccion: string;
}

export interface TimelineEvent {
  tipo: string;
  icono: string;
  titulo: string;
  fechaTexto: string;
  descripcion: string;
  usuario: string;
  meta: string;
}

export interface FirmaRadicado {
  idFirma: number;
  idRadicado: number;
  idUsuario: number;
  fechaFirma: string;
  estado: string;
  observacion: string;
}

export interface DocumentoAsociado {
  idDocumento: number;
  idRadicado: number;
  nombre: string;
  tipo: string;
  fecha_subida: string;
  tamano: number;
}

export interface RadicadoOdin {
  id_radicado: number;
  numero_radicado: string;
  tipoRadicacion: string;
  canalRecepcion: string;
  tipoDocumento: string;
  id_tramite: number;
  anonimo: boolean;
  remitente: string;
  numeroIdentificacion: string;
  correo: string;
  telefono: string;
  ciudad: string;
  formaRespuesta: string;
  id_dependencia: number;
  id_usuario: number | null;
  codigo_serie: string;
  codigo_subserie: string;
  prioridad: string;
  fecha_radicado: string;
  fecha_vencimiento: string;
  fecha_cierre: string | null;
  id_estado: number;
  asunto: string;
  descripcion: string;
  numeroFolios: number;
  soporte: string;
  confidencialidad: string;
  diasRestantes: number;
  timeline: TimelineEvent[];
}

@Injectable({
  providedIn: 'root',
})
export class OdinDataService {
  readonly currentUser = signal<{ nombre: string; correo: string; inicial: string }>({
    nombre: 'Administrador del Sistema',
    correo: 'admin@odin.com',
    inicial: 'A',
  });

  readonly estados: EstadoCatalogo[] = [
    { id_estado: 1, nombre: 'Pendiente' },
    { id_estado: 2, nombre: 'En trámite' },
    { id_estado: 3, nombre: 'Finalizado' },
    { id_estado: 4, nombre: 'Rechazado' },
  ];

  readonly dependencias: DependenciaCatalogo[] = [
    { id_dependencia: 1, nombre: 'Dirección Regional SENA', codigo: 'DIR-01' },
    { id_dependencia: 2, nombre: 'Subdirección de Centro', codigo: 'SUB-02' },
    { id_dependencia: 3, nombre: 'Coordinación Académica', codigo: 'ACA-03' },
    { id_dependencia: 4, nombre: 'Gestión Documental / Ventanilla Única', codigo: 'GDO-04' },
    { id_dependencia: 5, nombre: 'Bienestar al Aprendiz', codigo: 'BIE-05' },
  ];

  readonly series: SerieCatalogo[] = [
    { codigo_serie: 'PQRS', nombre_serie: 'Peticiones, Quejas, Reclamos y Sugerencias' },
    { codigo_serie: 'ACT', nombre_serie: 'Actas y Comités Institucionales' },
    { codigo_serie: 'CER', nombre_serie: 'Certificaciones y Constancias Académicas' },
    { codigo_serie: 'CON', nombre_serie: 'Contratos y Convenios Formativos' },
  ];

  readonly subseries: SubserieCatalogo[] = [
    { codigo_subserie: 'PQRS-01', codigo_serie: 'PQRS', nombre_subserie: 'Derechos de Petición de Interés General' },
    { codigo_subserie: 'PQRS-02', codigo_serie: 'PQRS', nombre_subserie: 'Quejas y Reclamos Académicos' },
    { codigo_subserie: 'ACT-01', codigo_serie: 'ACT', nombre_subserie: 'Actas de Comité de Evaluación y Seguimiento' },
    { codigo_subserie: 'CER-01', codigo_serie: 'CER', nombre_subserie: 'Certificados de Etapa Productiva' },
    { codigo_subserie: 'CON-01', codigo_serie: 'CON', nombre_subserie: 'Contratos de Aprendizaje' },
  ];

  readonly tramites = signal<TipoTramite[]>([
    {
      idTramite: 1,
      nombre: 'Derecho de petición',
      descripcion: 'Solicitud formal de información o actuación administrativa conforme a Ley 1755.',
      diasRespuesta: 15,
      prioridadDefault: 'ALTA',
      requiereRespuesta: true,
      activo: true,
      idDependenciaResponsable: 4,
      idEstadoInicial: 1,
    },
    {
      idTramite: 2,
      nombre: 'Certificación académica / Etapa productiva',
      descripcion: 'Expedición de paz y salvo o constancia de cumplimiento de práctica formativa SENA.',
      diasRespuesta: 10,
      prioridadDefault: 'MEDIA',
      requiereRespuesta: true,
      activo: true,
      idDependenciaResponsable: 3,
      idEstadoInicial: 1,
    },
    {
      idTramite: 3,
      nombre: 'Queja o reclamo institucional',
      descripcion: 'Manifestación de inconformidad sobre procesos formativos o administrativos.',
      diasRespuesta: 15,
      prioridadDefault: 'URGENTE',
      requiereRespuesta: true,
      activo: true,
      idDependenciaResponsable: 1,
      idEstadoInicial: 1,
    },
    {
      idTramite: 4,
      nombre: 'Memorando / Comunicación interna',
      descripcion: 'Trámite documental entre dependencias del centro de formación.',
      diasRespuesta: 5,
      prioridadDefault: 'BAJA',
      requiereRespuesta: false,
      activo: true,
      idDependenciaResponsable: 2,
      idEstadoInicial: 2,
    },
  ]);

  readonly usuarios = signal<UsuarioOdin[]>([
    {
      id_usuario: 1,
      nombre: 'Administrador SENA',
      id_rol: 1,
      rolNombre: 'Administrador',
      id_dependencia: 1,
      dependenciaNombre: 'Dirección Regional SENA',
      tipo_identificacion: 'CC',
      num_identificacion: '1144098123',
      correo: 'admin@senacali.edu.co',
      estado: 'Activo',
      telefono: '3158901122',
      direccion: 'Calle 52 # 2Bis-15 Cali',
    },
    {
      id_usuario: 2,
      nombre: 'Usuario Recepción Ventanilla',
      id_rol: 2,
      rolNombre: 'Radicador',
      id_dependencia: 4,
      dependenciaNombre: 'Gestión Documental / Ventanilla Única',
      tipo_identificacion: 'CC',
      num_identificacion: '1143876543',
      correo: 'recepcion@senacali.edu.co',
      estado: 'Activo',
      telefono: '3167002233',
      direccion: 'Sede Salomia SENA',
    },
    {
      id_usuario: 19,
      nombre: 'Gestor de Trámites',
      id_rol: 3,
      rolNombre: 'Gestor Documental',
      id_dependencia: 3,
      dependenciaNombre: 'Coordinación Académica',
      tipo_identificacion: 'CC',
      num_identificacion: '94512398',
      correo: 'gestor@senacali.edu.co',
      estado: 'Activo',
      telefono: '3184567890',
      direccion: 'Centro de Diseño Tecnológico Industrial',
    },
    {
      id_usuario: 20,
      nombre: 'Usuario Consulta',
      id_rol: 4,
      rolNombre: 'Consulta / Auditoría',
      id_dependencia: 2,
      dependenciaNombre: 'Subdirección de Centro',
      tipo_identificacion: 'CC',
      num_identificacion: '66987321',
      correo: 'consulta@senacali.edu.co',
      estado: 'Activo',
      telefono: '3109988776',
      direccion: 'Sede Principal Cali',
    },
    {
      id_usuario: 24,
      nombre: 'Administrador del Sistema',
      id_rol: 1,
      rolNombre: 'Administrador',
      id_dependencia: 4,
      dependenciaNombre: 'Gestión Documental / Ventanilla Única',
      tipo_identificacion: 'CC',
      num_identificacion: '1005987654',
      correo: 'admin@odin.com',
      estado: 'Activo',
      telefono: '3001234567',
      direccion: 'Complejo Salomia SENA',
    },
  ]);

  readonly radicados = signal<RadicadoOdin[]>([
    {
      id_radicado: 101,
      numero_radicado: 'RAD-2026-000101',
      tipoRadicacion: 'ENTRADA',
      canalRecepcion: 'WEB',
      tipoDocumento: 'PETICION',
      id_tramite: 1,
      anonimo: false,
      remitente: 'Carlos Eduardo Barahona',
      numeroIdentificacion: '1144203040',
      correo: 'cbarahona@soy.sena.edu.co',
      telefono: '3154005060',
      ciudad: 'Cali',
      formaRespuesta: 'ELECTRONICA',
      id_dependencia: 4,
      id_usuario: 19,
      codigo_serie: 'PQRS',
      codigo_subserie: 'PQRS-01',
      prioridad: 'ALTA',
      fecha_radicado: '2026-10-28',
      fecha_vencimiento: '2026-11-12',
      fecha_cierre: null,
      id_estado: 1,
      asunto: 'Solicitud de copia controlada de expediente de etapa productiva ADSO',
      descripcion: 'El aprendiz solicita copia autenticada del aval de etapa productiva y bitácoras.',
      numeroFolios: 4,
      soporte: 'DIGITAL',
      confidencialidad: 'PUBLICA',
      diasRestantes: 8,
      timeline: [
        {
          tipo: 'RADICACIÓN',
          icono: 'tl-radicacion',
          titulo: 'Radicado ingresado en Ventanilla Única (RAD-2026-000101)',
          fechaTexto: '28/10/2026 08:15',
          descripcion: 'Recepción por canal Portal Web con 4 folios digitales.',
          usuario: 'Usuario Recepción Ventanilla',
          meta: 'Dependencia: Gestión Documental · Estado: Pendiente',
        },
        {
          tipo: 'HISTORIAL',
          icono: 'tl-historial',
          titulo: 'Asignación automática por TRD',
          fechaTexto: '28/10/2026 08:20',
          descripcion: 'Asignado a Gestor de Trámites según serie documental PQRS-01.',
          usuario: 'Sistema ODIN',
          meta: 'Responsable: Gestor de Trámites',
        },
      ],
    },
    {
      id_radicado: 102,
      numero_radicado: 'RAD-2026-000102',
      tipoRadicacion: 'ENTRADA',
      canalRecepcion: 'FISICO',
      tipoDocumento: 'OFICIO',
      id_tramite: 2,
      anonimo: false,
      remitente: 'Laura Valentina Gómez',
      numeroIdentificacion: '1006112233',
      correo: 'lvgomez@misena.edu.co',
      telefono: '3178889900',
      ciudad: 'Palmira',
      formaRespuesta: 'ELECTRONICA',
      id_dependencia: 3,
      id_usuario: 19,
      codigo_serie: 'CER',
      codigo_subserie: 'CER-01',
      prioridad: 'MEDIA',
      fecha_radicado: '2026-10-24',
      fecha_vencimiento: '2026-11-06',
      fecha_cierre: null,
      id_estado: 2,
      asunto: 'Certificación de finalización de contrato de aprendizaje ficha 2879654',
      descripcion: 'Adjunta carta de la empresa patrocinadora y formato GFPI-F-023.',
      numeroFolios: 7,
      soporte: 'HIBRIDO',
      confidencialidad: 'PUBLICA',
      diasRestantes: 2,
      timeline: [
        {
          tipo: 'RADICACIÓN',
          icono: 'tl-radicacion',
          titulo: 'Radicado ingresado en ventanilla física (RAD-2026-000102)',
          fechaTexto: '24/10/2026 10:05',
          descripcion: 'Documentación de etapa productiva recibida con 7 folios.',
          usuario: 'Usuario Recepción Ventanilla',
          meta: 'Dependencia: Coordinación Académica · Estado: En trámite',
        },
        {
          tipo: 'DOCUMENTO',
          icono: 'tl-documento',
          titulo: 'Anexo cargado: Bitacora_Final_GFPI_F_023.pdf',
          fechaTexto: '25/10/2026 14:30',
          descripcion: 'Verificación de firmas del instructor de seguimiento.',
          usuario: 'Gestor de Trámites',
          meta: 'Archivo PDF · 420 KB',
        },
      ],
    },
    {
      id_radicado: 103,
      numero_radicado: 'RAD-2026-000103',
      tipoRadicacion: 'ENTRADA',
      canalRecepcion: 'CORREO',
      tipoDocumento: 'QUEJA',
      id_tramite: 3,
      anonimo: false,
      remitente: 'Andrés Felipe Morales',
      numeroIdentificacion: '94300111',
      correo: 'afmorales@correo.com',
      telefono: '3123334455',
      ciudad: 'Cali',
      formaRespuesta: 'ELECTRONICA',
      id_dependencia: 1,
      id_usuario: 1,
      codigo_serie: 'PQRS',
      codigo_subserie: 'PQRS-02',
      prioridad: 'URGENTE',
      fecha_radicado: '2026-10-15',
      fecha_vencimiento: '2026-11-01',
      fecha_cierre: null,
      id_estado: 1,
      asunto: 'Revisión urgente de novedad en plataforma de registro académico',
      descripcion: 'Solicita actualización de estado de matrícula y homologación.',
      numeroFolios: 2,
      soporte: 'DIGITAL',
      confidencialidad: 'RESERVADA',
      diasRestantes: -3,
      timeline: [
        {
          tipo: 'RADICACIÓN',
          icono: 'tl-radicacion',
          titulo: 'Radicado recibido por correo institucional (RAD-2026-000103)',
          fechaTexto: '15/10/2026 09:00',
          descripcion: 'Clasificado con prioridad URGENTE.',
          usuario: 'Usuario Recepción Ventanilla',
          meta: 'Dependencia: Dirección Regional SENA',
        },
      ],
    },
    {
      id_radicado: 104,
      numero_radicado: 'RAD-2026-000104',
      tipoRadicacion: 'INTERNO',
      canalRecepcion: 'WEB',
      tipoDocumento: 'MEMORANDO',
      id_tramite: 4,
      anonimo: false,
      remitente: 'Subdirección de Centro',
      numeroIdentificacion: '899999034-1',
      correo: 'subdireccion@senacali.edu.co',
      telefono: '3101112233',
      ciudad: 'Cali',
      formaRespuesta: 'ELECTRONICA',
      id_dependencia: 2,
      id_usuario: 24,
      codigo_serie: 'ACT',
      codigo_subserie: 'ACT-01',
      prioridad: 'NORMAL',
      fecha_radicado: '2026-10-20',
      fecha_vencimiento: '2026-10-27',
      fecha_cierre: '2026-10-26',
      id_estado: 3,
      asunto: 'Remisión de actas de comité de evaluación trimestre III',
      descripcion: 'Entrega oficial de actas firmadas digitalmente para archivo central.',
      numeroFolios: 12,
      soporte: 'DIGITAL',
      confidencialidad: 'PUBLICA',
      diasRestantes: 5,
      timeline: [
        {
          tipo: 'RADICACIÓN',
          icono: 'tl-radicacion',
          titulo: 'Memorando interno radicado (RAD-2026-000104)',
          fechaTexto: '20/10/2026 11:20',
          descripcion: 'Ingreso de actas de comité trimestre III.',
          usuario: 'Administrador del Sistema',
          meta: 'Dependencia: Subdirección de Centro',
        },
        {
          tipo: 'FIRMA',
          icono: 'tl-firma',
          titulo: 'Firma digital verificada y trámite finalizado',
          fechaTexto: '26/10/2026 16:40',
          descripcion: 'Cierre conforme a TRD sin observaciones pendientes.',
          usuario: 'Administrador del Sistema',
          meta: 'Estado: Finalizado',
        },
      ],
    },
  ]);

  readonly firmas = signal<FirmaRadicado[]>([
    {
      idFirma: 1,
      idRadicado: 104,
      idUsuario: 24,
      fechaFirma: '26/10/2026 16:40',
      estado: 'FIRMADO',
      observacion: 'Aprobado y firmado electrónicamente con sello institucional SENA',
    },
    {
      idFirma: 2,
      idRadicado: 101,
      idUsuario: 19,
      fechaFirma: '28/10/2026 09:10',
      estado: 'PENDIENTE',
      observacion: 'Pendiente visto bueno de coordinación académica',
    },
  ]);

  readonly documentos = signal<DocumentoAsociado[]>([
    {
      idDocumento: 1,
      idRadicado: 101,
      nombre: 'Solicitud_Etapa_Productiva_101.pdf',
      tipo: 'application/pdf',
      fecha_subida: '28/10/2026 08:15',
      tamano: 248920,
    },
    {
      idDocumento: 2,
      idRadicado: 102,
      nombre: 'Bitacora_Final_GFPI_F_023.pdf',
      tipo: 'application/pdf',
      fecha_subida: '25/10/2026 14:30',
      tamano: 430120,
    },
  ]);

  getNombreEstado(idEstado: number | null): string {
    return this.estados.find((e) => e.id_estado === Number(idEstado))?.nombre ?? '-';
  }

  getNombreDependencia(idDep: number | null): string {
    return this.dependencias.find((d) => d.id_dependencia === Number(idDep))?.nombre ?? '-';
  }

  getNombreTramite(idTramite: number | null): string {
    return this.tramites().find((t) => t.idTramite === Number(idTramite))?.nombre ?? '-';
  }

  getNombreUsuario(idUsuario: number | null): string {
    if (!idUsuario) return 'Sin asignar';
    return this.usuarios().find((u) => u.id_usuario === Number(idUsuario))?.nombre ?? `#${idUsuario}`;
  }

  crearRadicado(nuevo: Partial<RadicadoOdin>, nombresArchivos: string[] = []): RadicadoOdin {
    const lista = this.radicados();
    const nextId = lista.length > 0 ? Math.max(...lista.map((r) => r.id_radicado)) + 1 : 101;
    const consecutivo = `RAD-2026-${String(nextId).padStart(6, '0')}`;
    const tramite = this.tramites().find((t) => t.idTramite === Number(nuevo.id_tramite));
    const dias = tramite?.diasRespuesta ?? 15;

    const hoy = new Date();
    const fechaRad = hoy.toISOString().slice(0, 10);
    let fechaVenc = nuevo.fecha_vencimiento || '';
    if (!fechaVenc) {
      const v = new Date(hoy);
      v.setDate(v.getDate() + dias);
      fechaVenc = v.toISOString().slice(0, 10);
    }

    const ahoraTexto = hoy.toLocaleDateString('es-CO') + ' ' + hoy.toTimeString().slice(0, 5);
    const creado: RadicadoOdin = {
      id_radicado: nextId,
      numero_radicado: consecutivo,
      tipoRadicacion: nuevo.tipoRadicacion || 'ENTRADA',
      canalRecepcion: nuevo.canalRecepcion || 'FISICO',
      tipoDocumento: nuevo.tipoDocumento || 'OFICIO',
      id_tramite: Number(nuevo.id_tramite) || 1,
      anonimo: !!nuevo.anonimo,
      remitente: nuevo.anonimo ? 'ANÓNIMO (RF-09)' : nuevo.remitente || 'Ciudadano / Remitente',
      numeroIdentificacion: nuevo.anonimo ? '—' : nuevo.numeroIdentificacion || '—',
      correo: nuevo.anonimo ? '—' : nuevo.correo || '—',
      telefono: nuevo.anonimo ? '—' : nuevo.telefono || '—',
      ciudad: nuevo.anonimo ? '—' : nuevo.ciudad || 'Cali',
      formaRespuesta: nuevo.anonimo ? 'NO_APLICA' : nuevo.formaRespuesta || 'ELECTRONICA',
      id_dependencia: Number(nuevo.id_dependencia) || 4,
      id_usuario: nuevo.id_usuario ? Number(nuevo.id_usuario) : null,
      codigo_serie: nuevo.codigo_serie || 'PQRS',
      codigo_subserie: nuevo.codigo_subserie || 'PQRS-01',
      prioridad: nuevo.prioridad || 'NORMAL',
      fecha_radicado: fechaRad,
      fecha_vencimiento: fechaVenc,
      fecha_cierre: null,
      id_estado: 1,
      asunto: nuevo.asunto || 'Sin asunto',
      descripcion: nuevo.descripcion || '',
      numeroFolios: Number(nuevo.numeroFolios) || 1,
      soporte: nuevo.soporte || 'DIGITAL',
      confidencialidad: nuevo.confidencialidad || 'PUBLICA',
      diasRestantes: dias,
      timeline: [
        {
          tipo: 'RADICACIÓN',
          icono: 'tl-radicacion',
          titulo: `Radicado registrado (${consecutivo})`,
          fechaTexto: ahoraTexto,
          descripcion: nuevo.descripcion || `Ingreso de documento por canal ${nuevo.canalRecepcion || 'FISICO'}.`,
          usuario: this.currentUser().nombre,
          meta: `Dependencia: ${this.getNombreDependencia(Number(nuevo.id_dependencia) || 4)} · Estado: Pendiente`,
        },
      ],
    };

    this.radicados.set([creado, ...lista]);

    if (nombresArchivos.length > 0) {
      const docsActuales = this.documentos();
      const nuevosDocs = nombresArchivos.map((nombre, idx) => ({
        idDocumento: docsActuales.length + idx + 1,
        idRadicado: nextId,
        nombre,
        tipo: 'application/pdf',
        fecha_subida: ahoraTexto,
        tamano: 154200,
      }));
      this.documentos.set([...nuevosDocs, ...docsActuales]);
    }

    return creado;
  }

  agregarObservacion(idRadicado: number, comentario: string): void {
    const ahoraTexto = new Date().toLocaleDateString('es-CO') + ' ' + new Date().toTimeString().slice(0, 5);
    this.radicados.update((lista) =>
      lista.map((r) =>
        r.id_radicado === idRadicado
          ? {
              ...r,
              timeline: [
                ...r.timeline,
                {
                  tipo: 'OBSERVACIÓN',
                  icono: 'tl-observacion',
                  titulo: 'Nueva observación registrada',
                  fechaTexto: ahoraTexto,
                  descripcion: comentario,
                  usuario: this.currentUser().nombre,
                  meta: `Estado actual: ${this.getNombreEstado(r.id_estado)}`,
                },
              ],
            }
          : r,
      ),
    );
  }

  solicitarFirma(idRadicado: number, idUsuario: number | null, observacion: string): void {
    const ahoraTexto = new Date().toLocaleDateString('es-CO') + ' ' + new Date().toTimeString().slice(0, 5);
    const uid = idUsuario || 24;
    this.firmas.update((f) => [
      {
        idFirma: f.length + 1,
        idRadicado,
        idUsuario: uid,
        fechaFirma: ahoraTexto,
        estado: 'PENDIENTE',
        observacion: observacion || 'Solicitud de firma electrónica',
      },
      ...f,
    ]);
    this.radicados.update((lista) =>
      lista.map((r) =>
        r.id_radicado === idRadicado
          ? {
              ...r,
              timeline: [
                ...r.timeline,
                {
                  tipo: 'FIRMA',
                  icono: 'tl-firma',
                  titulo: 'Solicitud de firma registrada',
                  fechaTexto: ahoraTexto,
                  descripcion: observacion || 'Solicitud de firma electrónica',
                  usuario: this.getNombreUsuario(uid),
                  meta: 'Estado firma: PENDIENTE',
                },
              ],
            }
          : r,
      ),
    );
  }
}
