import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AnexoItem,
  DashboardResumen,
  DependenciaItem,
  DocumentoItem,
  EstadoItem,
  FirmaItem,
  HistorialItem,
  ObservacionItem,
  OdinApiService,
  RadicadoItem,
  ReasignacionItem,
  SerieItem,
  SubserieItem,
  TramiteItem,
  UsuarioItem,
} from '../services/odin-api.service';

export interface TimelineEventItem {
  timestamp: number;
  fechaTexto: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  usuario?: string;
  meta?: string;
  claseColor: string;
}

@Component({
  selector: 'app-radicaion',
  imports: [CommonModule, FormsModule],
  templateUrl: './radicaion.html',
  styleUrl: './radicaion.css',
})
export class Radicaion implements OnInit {
  resumen: DashboardResumen | null = null;
  radicados: RadicadoItem[] = [];
  tramites: TramiteItem[] = [];
  dependencias: DependenciaItem[] = [];
  usuarios: UsuarioItem[] = [];
  estados: EstadoItem[] = [];
  series: SerieItem[] = [];
  subseries: SubserieItem[] = [];

  cargando = false;
  guardando = false;
  mostrarFormulario = true;
  mensajeExito = '';
  mensajeError = '';
  editandoId: number | null = null;

  // Filtros y paginación en tabla de radicados
  filtroTexto = '';
  filtroTipo = '';
  paginaActual = 1;
  readonly itemsPorPagina = 10;

  // Archivos seleccionados para subir en el formulario de radicación
  archivosSeleccionados: File[] = [];

  // Formulario Completo (RF-04 a RF-23 igual que radicacion_Documental.html)
  form = this.nuevoFormulario();

  // Vista de Detalle y Línea Temporal Unificada (igual que radicado-detalle.html)
  radicadoDetalle: RadicadoItem | null = null;
  documentosDetalle: DocumentoItem[] = [];
  historialDetalle: HistorialItem[] = [];
  observacionesDetalle: ObservacionItem[] = [];
  reasignacionesDetalle: ReasignacionItem[] = [];
  firmasDetalle: FirmaItem[] = [];
  anexosDetalle: AnexoItem[] = [];
  timelineDetalle: TimelineEventItem[] = [];

  nuevaObservacionDetalle = '';
  guardandoObsDetalle = false;
  firmaUsuarioId: number | null = null;
  firmaObservacion = '';
  guardandoFirma = false;
  subiendoArchivoDetalle = false;

  constructor(
    private readonly api: OdinApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarDatos();
  }

  nuevoFormulario() {
    return {
      // 1. Tipo y canal
      tipo_radicado: 'ENTRADA',
      medio_recepcion: 'FISICO',
      tipoDocumento: 'OFICIO',
      id_tramite: null as number | null,
      // 2. Remitente (RF-09 Anónima y RF-14 Forma de respuesta)
      anonimo: false,
      remitente: '',
      numeroIdentificacion: '',
      correo: '',
      telefono: '',
      ciudad: '',
      formaRespuesta: 'ELECTRONICA',
      // 3. Asignación y clasificación (CCD/TRD)
      id_dependencia: null as number | null,
      id_usuario: null as number | null,
      codigo_serie: '',
      codigo_subserie: '',
      prioridad: 'NORMAL',
      fecha_vencimiento: '',
      // 4. Contenido del documento
      asunto: '',
      descripcion: '',
      numeroFolios: 1 as number | null,
      soporte: 'DIGITAL',
      confidencialidad: 'PUBLICA',
    };
  }

  cargarCatalogos(): void {
    this.api.getTramites().subscribe({
      next: (d) => {
        this.tramites = d || [];
        this.cdr.detectChanges();
      },
    });
    this.api.getDependencias().subscribe({
      next: (d) => {
        this.dependencias = d || [];
        this.cdr.detectChanges();
      },
    });
    this.api.getUsuarios().subscribe({
      next: (d) => {
        this.usuarios = d || [];
        this.cdr.detectChanges();
      },
    });
    this.api.getEstados().subscribe({
      next: (d) => {
        this.estados = d || [];
        this.cdr.detectChanges();
      },
    });
    this.api.getSeries().subscribe({
      next: (d) => {
        this.series = d || [];
        this.cdr.detectChanges();
      },
    });
    this.api.getSubseries().subscribe({
      next: (d) => {
        this.subseries = d || [];
        this.cdr.detectChanges();
      },
    });
  }

  cargarDatos(): void {
    this.cargando = true;
    this.api.getDashboardResumen().subscribe({
      next: (r) => {
        this.resumen = r;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
    this.api.getRadicados().subscribe({
      next: (lista) => {
        this.radicados = (lista || []).sort(
          (a, b) => (b.id_radicado || 0) - (a.id_radicado || 0)
        );
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No fue posible cargar el listado de radicados.';
        this.cdr.detectChanges();
      },
    });
  }

  // ==================== Lógica del Formulario RF-04 a RF-23 ====================

  onAnonimoChange(): void {
    if (this.form.anonimo) {
      this.form.remitente = 'Anónimo';
      this.form.numeroIdentificacion = '';
      this.form.correo = '';
      this.form.telefono = '';
      this.form.ciudad = '';
      this.form.formaRespuesta = 'NO_APLICA';
    } else if (this.form.remitente === 'Anónimo') {
      this.form.remitente = '';
      this.form.formaRespuesta = 'ELECTRONICA';
    }
  }

  onTramiteChange(): void {
    if (!this.form.id_tramite) return;
    const tr = this.tramites.find((t) => Number(t.idTramite) === Number(this.form.id_tramite));
    if (tr) {
      if (tr.idDependenciaResponsable) {
        this.form.id_dependencia = tr.idDependenciaResponsable;
      }
      if (tr.prioridadDefault) {
        this.form.prioridad = tr.prioridadDefault.toUpperCase();
      }
      if (tr.diasRespuesta && tr.diasRespuesta > 0 && !this.form.fecha_vencimiento) {
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + tr.diasRespuesta);
        this.form.fecha_vencimiento = hoy.toISOString().split('T')[0];
      }
    }
  }

  onSerieChange(): void {
    this.form.codigo_subserie = '';
  }

  get subseriesFiltradas(): SubserieItem[] {
    if (!this.form.codigo_serie) return this.subseries;
    const serieObj = this.series.find((s) => s.codigo_serie === this.form.codigo_serie);
    if (!serieObj) return this.subseries;
    return this.subseries.filter((sub) => Number(sub.id_serie) === Number(serieObj.id_serie));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivosSeleccionados = Array.from(input.files);
    } else {
      this.archivosSeleccionados = [];
    }
  }

  quitarArchivoSeleccionado(idx: number): void {
    this.archivosSeleccionados.splice(idx, 1);
  }

  guardarRadicado(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    const remitenteFinal = this.form.anonimo
      ? 'Anónimo'
      : this.form.remitente.trim() || 'Anónimo';

    if (!this.form.asunto.trim() || !this.form.id_tramite || !this.form.id_dependencia) {
      this.mensajeError =
        'Por favor complete los campos obligatorios: Trámite / Solicitud, Dependencia Destino y Asunto del documento.';
      return;
    }

    this.guardando = true;
    const payload: Partial<RadicadoItem> = {
      tipo_radicado: this.form.tipo_radicado,
      tipoRadicacion: this.form.tipo_radicado,
      medio_recepcion: this.form.medio_recepcion,
      canalRecepcion: this.form.medio_recepcion,
      tipoDocumento: this.form.tipoDocumento,
      prioridad: this.form.prioridad,
      confidencialidad: this.form.confidencialidad,
      remitente: remitenteFinal,
      numeroIdentificacion: this.form.numeroIdentificacion.trim(),
      correo: this.form.correo.trim(),
      telefono: this.form.telefono.trim(),
      ciudad: this.form.ciudad.trim(),
      asunto: this.form.asunto.trim(),
      id_tramite: Number(this.form.id_tramite),
      id_dependencia: this.form.id_dependencia ? Number(this.form.id_dependencia) : null,
      id_usuario: this.form.id_usuario ? Number(this.form.id_usuario) : null,
      codigo_serie: this.form.codigo_serie || null,
      codigo_subserie: this.form.codigo_subserie || null,
      fecha_vencimiento: this.form.fecha_vencimiento || undefined,
      descripcion: this.form.descripcion.trim(),
      observaciones: this.construirObservacionMetadata(),
      numeroFolios: this.form.numeroFolios ? String(this.form.numeroFolios) : '1',
      soporte: this.form.soporte,
    };

    if (this.editandoId) {
      const idRad = this.editandoId;
      this.api.actualizarRadicado(idRad, payload).subscribe({
        next: () => {
          this.subirAnexosSiExisten(
            idRad,
            `Radicación documental #${idRad} actualizada con éxito.`
          );
        },
        error: (err) => {
          this.guardando = false;
          this.mensajeError = err?.error?.error || 'Error al actualizar el radicado.';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.api.crearRadicado(payload).subscribe({
        next: (creado) => {
          const idRad = creado.id_radicado;
          const numRad = creado.numero_radicado || `#${idRad}`;
          if (idRad) {
            this.subirAnexosSiExisten(
              idRad,
              `Radicación documental guardada con éxito. Consecutivo asignado: ${numRad}.`
            );
          } else {
            this.guardando = false;
            this.mensajeExito = `Radicación documental guardada con éxito (${numRad}).`;
            this.form = this.nuevoFormulario();
            this.archivosSeleccionados = [];
            this.cargarDatos();
          }
        },
        error: (err) => {
          this.guardando = false;
          this.mensajeError = err?.error?.error || 'No fue posible registrar el radicado.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  private construirObservacionMetadata(): string {
    const partes: string[] = [];
    if (this.form.descripcion && this.form.descripcion.trim()) {
      partes.push(this.form.descripcion.trim());
    }
    if (this.form.formaRespuesta) {
      partes.push(`Forma de respuesta: ${this.form.formaRespuesta}`);
    }
    return partes.join(' | ');
  }

  private subirAnexosSiExisten(idRadicado: number, msgBase: string): void {
    if (this.archivosSeleccionados.length > 0) {
      const cant = this.archivosSeleccionados.length;
      this.api.subirArchivosRadicado(idRadicado, this.archivosSeleccionados).subscribe({
        next: () => {
          this.guardando = false;
          this.mensajeExito = `${msgBase} (${cant} archivo(s) adjunto(s) cargado(s)).`;
          this.cancelarEdicion();
          this.cargarDatos();
        },
        error: () => {
          this.guardando = false;
          this.mensajeExito = `${msgBase} (Aviso: no se pudieron adjuntar algunos archivos).`;
          this.cancelarEdicion();
          this.cargarDatos();
        },
      });
    } else {
      this.guardando = false;
      this.mensajeExito = msgBase;
      this.cancelarEdicion();
      this.cargarDatos();
    }
  }

  editar(r: RadicadoItem): void {
    this.editandoId = r.id_radicado || null;
    this.mostrarFormulario = true;
    const esAnonimo = (r.remitente || '').toLowerCase() === 'anónimo';
    this.form = {
      tipo_radicado: r.tipo_radicado || 'ENTRADA',
      medio_recepcion: r.medio_recepcion || 'FISICO',
      tipoDocumento: r.tipoDocumento || 'OFICIO',
      id_tramite: r.id_tramite || null,
      anonimo: esAnonimo,
      remitente: r.remitente || '',
      numeroIdentificacion: r.numeroIdentificacion || '',
      correo: r.correo || '',
      telefono: r.telefono || '',
      ciudad: r.ciudad || '',
      formaRespuesta: esAnonimo ? 'NO_APLICA' : 'ELECTRONICA',
      id_dependencia: r.id_dependencia || null,
      id_usuario: r.id_usuario || null,
      codigo_serie: r.codigo_serie || '',
      codigo_subserie: r.codigo_subserie || '',
      prioridad: r.prioridad || 'NORMAL',
      fecha_vencimiento: r.fecha_vencimiento ? r.fecha_vencimiento.substring(0, 10) : '',
      asunto: r.asunto || '',
      descripcion: r.observaciones || r.descripcion || '',
      numeroFolios: 1,
      soporte: r.soporte || 'DIGITAL',
      confidencialidad: r.confidencialidad || 'PUBLICA',
    };
    this.archivosSeleccionados = [];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.form = this.nuevoFormulario();
    this.archivosSeleccionados = [];
  }

  eliminar(r: RadicadoItem): void {
    if (!r.id_radicado) return;
    if (!confirm(`¿Está seguro de eliminar el radicado ${r.numero_radicado}?`)) return;

    this.api.eliminarRadicado(r.id_radicado).subscribe({
      next: () => {
        this.mensajeExito = `Radicado ${r.numero_radicado} eliminado con éxito.`;
        if (this.radicadoDetalle?.id_radicado === r.id_radicado) {
          this.radicadoDetalle = null;
        }
        this.cargarDatos();
      },
      error: () => {
        this.mensajeError = 'No tienes permisos o no fue posible eliminar el radicado.';
        this.cdr.detectChanges();
      },
    });
  }

  abrirComprobante(id?: number): void {
    if (!id) return;
    window.open(`/api/radicados/${id}/comprobante`, '_blank');
  }

  exportarReporte(formato: 'pdf' | 'xlsx' | 'csv'): void {
    window.open(`/api/reportes/radicados.${formato}`, '_blank');
  }

  // ==================== Filtros y Paginación de Tabla ====================

  get radicadosFiltrados(): RadicadoItem[] {
    const q = this.filtroTexto.trim().toLowerCase();
    return this.radicados.filter((r) => {
      if (q) {
        const match =
          (r.numero_radicado || '').toLowerCase().includes(q) ||
          (r.remitente || '').toLowerCase().includes(q) ||
          (r.asunto || '').toLowerCase().includes(q) ||
          this.nombreDependencia(r.id_dependencia).toLowerCase().includes(q) ||
          this.nombreUsuario(r.id_usuario).toLowerCase().includes(q);
        if (!match) return false;
      }
      if (this.filtroTipo && (r.tipo_radicado || 'ENTRADA').toUpperCase() !== this.filtroTipo) {
        return false;
      }
      return true;
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.radicadosFiltrados.length / this.itemsPorPagina));
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get radicadosPaginados(): RadicadoItem[] {
    const p = Math.min(this.paginaActual, this.totalPaginas);
    const start = (p - 1) * this.itemsPorPagina;
    return this.radicadosFiltrados.slice(start, start + this.itemsPorPagina);
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
    }
  }

  // ==================== Vista de Detalle y Línea Temporal (radicado-detalle.html) ====================

  verDetalle(r: RadicadoItem): void {
    this.radicadoDetalle = r;
    this.documentosDetalle = [];
    this.historialDetalle = [];
    this.observacionesDetalle = [];
    this.reasignacionesDetalle = [];
    this.firmasDetalle = [];
    this.anexosDetalle = [];
    this.timelineDetalle = [];
    this.nuevaObservacionDetalle = '';
    this.firmaObservacion = '';
    this.firmaUsuarioId = r.id_usuario || null;

    if (!r.id_radicado) return;
    this.cargarDetalleCompleto(r.id_radicado);
  }

  cerrarDetalle(): void {
    this.radicadoDetalle = null;
  }

  cargarDetalleCompleto(idRadicado: number): void {
    this.reconstruirTimeline();

    this.api.getHistorial(idRadicado).subscribe({
      next: (h) => {
        this.historialDetalle = h || [];
        this.reconstruirTimeline();
        this.cdr.detectChanges();
      },
    });
    this.api.getObservaciones(idRadicado).subscribe({
      next: (o) => {
        this.observacionesDetalle = o || [];
        this.reconstruirTimeline();
        this.cdr.detectChanges();
      },
    });
    this.api.getReasignaciones(idRadicado).subscribe({
      next: (re) => {
        this.reasignacionesDetalle = re || [];
        this.reconstruirTimeline();
        this.cdr.detectChanges();
      },
    });
    this.api.getDocumentosRadicado(idRadicado).subscribe({
      next: (docs) => {
        this.documentosDetalle = docs || [];
        this.reconstruirTimeline();
        this.cdr.detectChanges();
      },
    });
    this.api.getFirmasRadicado(idRadicado).subscribe({
      next: (f) => {
        this.firmasDetalle = f || [];
        this.reconstruirTimeline();
        this.cdr.detectChanges();
      },
    });
    this.api.getAnexosRadicado(idRadicado).subscribe({
      next: (a) => {
        this.anexosDetalle = a || [];
        this.reconstruirTimeline();
        this.cdr.detectChanges();
      },
    });
  }

  private reconstruirTimeline(): void {
    if (!this.radicadoDetalle) return;
    const r = this.radicadoDetalle;
    const eventos: TimelineEventItem[] = [];

    // 1. Evento raíz: Radicación
    eventos.push({
      timestamp: this.parseTimestamp(r.fecha_radicado),
      fechaTexto: r.fecha_radicado || '—',
      tipo: 'RADICACION',
      titulo: 'Radicación del documento',
      descripcion: r.asunto || 'Documento radicado oficialmente',
      usuario: this.nombreUsuario(r.id_usuario),
      meta: `Estado: ${this.nombreEstado(r.id_estado, r)} · Dependencia: ${this.nombreDependencia(r.id_dependencia)}`,
      claseColor: 'tl-radicacion',
    });

    // 2. Historial
    for (const h of this.historialDetalle) {
      eventos.push({
        timestamp: this.parseTimestamp(h.fecha),
        fechaTexto: this.formatearFecha(h.fecha),
        tipo: 'HISTORIAL',
        titulo: h.accion || 'Movimiento',
        descripcion: h.descripcion || '',
        usuario: this.nombreUsuario(h.id_usuario),
        claseColor: 'tl-historial',
      });
    }

    // 3. Observaciones
    for (const o of this.observacionesDetalle) {
      eventos.push({
        timestamp: this.parseTimestamp(o.fecha),
        fechaTexto: this.formatearFecha(o.fecha),
        tipo: 'OBSERVACION',
        titulo: 'Observación',
        descripcion: o.comentario || '',
        usuario: this.nombreUsuario(o.id_usuario),
        claseColor: 'tl-observacion',
      });
    }

    // 4. Documentos
    for (const d of this.documentosDetalle) {
      eventos.push({
        timestamp: this.parseTimestamp(d.fecha_subida),
        fechaTexto: this.formatearFecha(d.fecha_subida),
        tipo: 'DOCUMENTO',
        titulo: 'Documento adjunto',
        descripcion: d.nombre || d.nombre_archivo || 'Archivo',
        meta: `${d.tipo || ''} ${d.tamano ? '· ' + d.tamano + ' bytes' : ''}`.trim(),
        claseColor: 'tl-documento',
      });
    }

    // 5. Firmas
    for (const f of this.firmasDetalle) {
      eventos.push({
        timestamp: this.parseTimestamp(f.fechaFirma),
        fechaTexto: this.formatearFecha(f.fechaFirma),
        tipo: 'FIRMA',
        titulo: `Firma · ${f.estado || 'PENDIENTE'}`,
        descripcion: f.observacion || f.hashDocumento || 'Solicitud de firma',
        usuario: this.nombreUsuario(f.idUsuario),
        meta: f.estado,
        claseColor: 'tl-firma',
      });
    }

    // 6. Reasignaciones
    for (const re of this.reasignacionesDetalle) {
      const ant = this.nombreUsuario(re.id_usuario_anterior);
      const neu = this.nombreUsuario(re.id_usuario_nuevo);
      eventos.push({
        timestamp: this.parseTimestamp(re.fecha),
        fechaTexto: this.formatearFecha(re.fecha),
        tipo: 'REASIGNACION',
        titulo: 'Reasignación',
        descripcion: `De ${ant} → ${neu}`,
        usuario: neu,
        meta: `Nueva dependencia: ${this.nombreDependencia(re.id_dependencia_nueva)}`,
        claseColor: 'tl-reasignacion',
      });
    }

    eventos.sort((a, b) => a.timestamp - b.timestamp);
    this.timelineDetalle = eventos;
  }

  agregarObservacionEnDetalle(): void {
    if (!this.radicadoDetalle?.id_radicado || !this.nuevaObservacionDetalle.trim()) return;
    const idRad = this.radicadoDetalle.id_radicado;
    this.guardandoObsDetalle = true;
    this.api
      .agregarObservacion(
        idRad,
        this.nuevaObservacionDetalle.trim(),
        this.radicadoDetalle.id_usuario || 1
      )
      .subscribe({
        next: () => {
          this.guardandoObsDetalle = false;
          this.nuevaObservacionDetalle = '';
          this.mensajeExito = 'Observación guardada en la línea temporal del radicado.';
          this.cargarDetalleCompleto(idRad);
        },
        error: () => {
          this.guardandoObsDetalle = false;
          this.mensajeError = 'No fue posible registrar la observación.';
          this.cdr.detectChanges();
        },
      });
  }

  registrarFirmaEnDetalle(): void {
    if (!this.radicadoDetalle?.id_radicado) return;
    const idRad = this.radicadoDetalle.id_radicado;
    this.guardandoFirma = true;
    this.api
      .solicitarFirma(
        idRad,
        this.firmaUsuarioId,
        this.firmaObservacion.trim() || 'Solicitud de firma documental'
      )
      .subscribe({
        next: () => {
          this.guardandoFirma = false;
          this.firmaObservacion = '';
          this.mensajeExito = 'Solicitud de firma registrada en el radicado.';
          this.cargarDetalleCompleto(idRad);
        },
        error: () => {
          this.guardandoFirma = false;
          this.mensajeError = 'No fue posible registrar la firma.';
          this.cdr.detectChanges();
        },
      });
  }

  subirDocumentoEnDetalle(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.radicadoDetalle?.id_radicado) return;
    const idRad = this.radicadoDetalle.id_radicado;
    const files = Array.from(input.files);
    this.subiendoArchivoDetalle = true;
    this.api.subirArchivosRadicado(idRad, files).subscribe({
      next: () => {
        this.subiendoArchivoDetalle = false;
        input.value = '';
        this.mensajeExito = `${files.length} documento(s) adjuntado(s) al radicado.`;
        this.cargarDetalleCompleto(idRad);
      },
      error: () => {
        this.subiendoArchivoDetalle = false;
        this.mensajeError = 'No se pudieron subir los documentos adjuntos.';
        this.cdr.detectChanges();
      },
    });
  }

  descargarDocumento(idDocumento?: number): void {
    if (!idDocumento) return;
    window.open(`/api/documentos/${idDocumento}/descargar`, '_blank');
  }

  // ==================== Helpers ====================

  private parseTimestamp(fecha?: string): number {
    if (!fecha) return 0;
    const parsed = Date.parse(fecha.replace(' ', 'T'));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '—';
    return fecha.replace('T', ' ').substring(0, 16);
  }

  nombreDependencia(id?: number | null): string {
    if (!id) return 'Sin asignar';
    const d = this.dependencias.find((dep) => Number(dep.id_dependencia) === Number(id));
    return d ? d.nombre : `Dep. #${id}`;
  }

  nombreUsuario(id?: number | null): string {
    if (!id) return 'Sin asignar';
    const u = this.usuarios.find((usr) => Number(usr.id_usuario) === Number(id));
    return u ? u.nombre : `Usuario #${id}`;
  }

  nombreTramite(id?: number | null, r?: RadicadoItem): string {
    if (r?.tramite?.nombre) return r.tramite.nombre;
    if (!id) return '—';
    const t = this.tramites.find((tr) => Number(tr.idTramite) === Number(id));
    return t ? t.nombre : `Trámite #${id}`;
  }

  nombreEstado(id?: number | null, r?: RadicadoItem): string {
    if (r?.estado?.nombre) return r.estado.nombre;
    if (!id) return 'Pendiente';
    const e = this.estados.find((est) => Number(est.id_estado) === Number(id));
    return e ? e.nombre : `Estado #${id}`;
  }
}
