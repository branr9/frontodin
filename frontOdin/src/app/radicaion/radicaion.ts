import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import {
  Dependencia,
  Estado,
  HistorialRadicado,
  ObservacionRadicado,
  Radicado,
  Serie,
  Subserie,
  Tramite,
  Usuario,
} from '../models/radicado.model';
import { RadicacionService } from '../services/radicacion.service';
import { CatalogoService } from '../services/catalogo.service';

@Component({
  selector: 'app-radicaion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './radicaion.html',
  styleUrl: './radicaion.css',
})
export class Radicaion implements OnInit {
  activeTab: 'formulario' | 'bandeja' = 'formulario';

  // Catálogos
  tramites: Tramite[] = [];
  dependencias: Dependencia[] = [];
  usuarios: Usuario[] = [];
  estados: Estado[] = [];
  series: Serie[] = [];
  subseries: Subserie[] = [];
  subseriesFiltradas: Subserie[] = [];

  // Formulario de radicación
  radicadoForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  ultimoRadicadoCreado: Radicado | null = null;
  anexosPendientes: { nombre: string; tamano: string }[] = [];

  // Bandeja de radicados
  radicados: Radicado[] = [];
  cargandoRadicados = false;
  filtroRapido: 'todos' | 'vencidos' | 'proximos' = 'todos';
  filtroTexto = '';
  filtroEstado: number | null = null;
  filtroDependencia: number | null = null;
  filtroTramite: number | null = null;

  // Modales
  radicadoSeleccionado: Radicado | null = null;
  mostrarModalDetalle = false;
  mostrarModalReasignar = false;
  mostrarModalEstado = false;

  // Datos para modal detalle
  historialRadicado: HistorialRadicado[] = [];
  observacionesRadicado: ObservacionRadicado[] = [];
  nuevaObservacionTexto = '';
  guardandoObservacion = false;

  // Datos para modal reasignar
  reasignarUsuarioId: number | null = null;
  reasignarDependenciaId: number | null = null;
  reasignando = false;

  // Datos para modal cambiar estado
  nuevoEstadoId: number | null = null;
  cambiandoEstado = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly radicacionService: RadicacionService,
    private readonly catalogoService: CatalogoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCatalogos();
  }

  initForm(): void {
    const hoy = new Date().toISOString().substring(0, 10);
    const numeroInicial = this.radicacionService.generarConsecutivoSugerido('ENTRADA');

    this.radicadoForm = this.fb.group({
      tipo_radicado: ['ENTRADA', Validators.required],
      numero_radicado: [numeroInicial, Validators.required],
      canal_recepcion: ['FISICO', Validators.required],
      tipoDocumento: ['OFICIO'],
      id_tramite: ['', Validators.required],

      // Remitente (RF-09 anónimo)
      anonimo: [false],
      remitente: ['', Validators.required],
      numeroIdentificacion: [''],
      correo: ['', [Validators.email]],
      telefono: [''],
      ciudad: [''],
      formaRespuesta: ['ELECTRONICA', Validators.required],

      // Asignación y CCD/TRD
      id_dependencia: ['', Validators.required],
      id_usuario: ['', Validators.required],
      codigo_serie: [''],
      codigo_subserie: [''],
      prioridad: ['NORMAL', Validators.required],
      fecha_radicado: [hoy, Validators.required],
      fecha_vencimiento: [''],

      // Contenido
      asunto: ['', [Validators.required, Validators.maxLength(500)]],
      descripcion: [''],
      numeroFolios: [1],
      soporte: ['DIGITAL', Validators.required],
      confidencialidad: ['PUBLICA', Validators.required],
    });

    // Escuchar cambios de serie para filtrar subseries
    this.radicadoForm.get('codigo_serie')?.valueChanges.subscribe((codSerie) => {
      this.filtrarSubseriesPorSerie(codSerie);
    });

    // Escuchar cambios de trámite para sugerir prioridad y calcular vencimiento
    this.radicadoForm.get('id_tramite')?.valueChanges.subscribe((idTramite) => {
      this.onTramiteSeleccionado(idTramite);
    });

    // Escuchar cambios de tipo_radicado para actualizar prefijo del consecutivo
    this.radicadoForm.get('tipo_radicado')?.valueChanges.subscribe((tipo) => {
      const actual = this.radicadoForm.get('numero_radicado')?.value;
      if (!actual || actual.startsWith('E-') || actual.startsWith('S-') || actual.startsWith('I-')) {
        this.radicadoForm.get('numero_radicado')?.setValue(
          this.radicacionService.generarConsecutivoSugerido(tipo)
        );
      }
    });
  }

  cargarCatalogos(): void {
    this.catalogoService.getTramites().subscribe((res) => {
      this.tramites = res || [];
      this.cdr.markForCheck();
    });

    this.catalogoService.getDependencias().subscribe((res) => {
      this.dependencias = res || [];
      this.cdr.markForCheck();
    });

    this.catalogoService.getUsuarios().subscribe((res) => {
      this.usuarios = res || [];
      this.cdr.markForCheck();
    });

    this.catalogoService.getEstados().subscribe((res) => {
      this.estados = res || [];
      this.cdr.markForCheck();
    });

    this.catalogoService.getSeries().subscribe((res) => {
      this.series = res || [];
      this.cdr.markForCheck();
    });

    this.catalogoService.getSubseries().subscribe((res) => {
      this.subseries = res || [];
      this.subseriesFiltradas = [...this.subseries];
      this.cdr.markForCheck();
    });
  }

  setTab(tab: 'formulario' | 'bandeja'): void {
    this.activeTab = tab;
    if (tab === 'bandeja') {
      this.cargarRadicados();
    }
  }

  toggleAnonimo(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const remitenteCtrl = this.radicadoForm.get('remitente');
    const docCtrl = this.radicadoForm.get('numeroIdentificacion');
    const correoCtrl = this.radicadoForm.get('correo');
    const telCtrl = this.radicadoForm.get('telefono');
    const ciudadCtrl = this.radicadoForm.get('ciudad');
    const formaCtrl = this.radicadoForm.get('formaRespuesta');

    if (isChecked) {
      remitenteCtrl?.setValue('Anónimo');
      remitenteCtrl?.disable();
      docCtrl?.setValue('');
      docCtrl?.disable();
      correoCtrl?.setValue('');
      correoCtrl?.disable();
      telCtrl?.setValue('');
      telCtrl?.disable();
      ciudadCtrl?.setValue('');
      ciudadCtrl?.disable();
      formaCtrl?.setValue('NO_APLICA');
    } else {
      remitenteCtrl?.enable();
      remitenteCtrl?.setValue('');
      docCtrl?.enable();
      correoCtrl?.enable();
      telCtrl?.enable();
      ciudadCtrl?.enable();
      formaCtrl?.setValue('ELECTRONICA');
    }
  }

  onTramiteSeleccionado(idTramite: string | number): void {
    if (!idTramite) return;
    const id = Number(idTramite);
    const tramite = this.tramites.find((t) => t.idTramite === id);
    if (!tramite) return;

    if (tramite.prioridadDefault) {
      this.radicadoForm.get('prioridad')?.setValue(tramite.prioridadDefault);
    }
    if (tramite.idDependenciaResponsable) {
      this.radicadoForm.get('id_dependencia')?.setValue(tramite.idDependenciaResponsable);
    }

    if (tramite.diasRespuesta != null && tramite.diasRespuesta > 0) {
      const fechaBaseStr = this.radicadoForm.get('fecha_radicado')?.value || new Date().toISOString();
      const fechaBase = new Date(fechaBaseStr);
      fechaBase.setDate(fechaBase.getDate() + tramite.diasRespuesta);
      this.radicadoForm.get('fecha_vencimiento')?.setValue(fechaBase.toISOString().substring(0, 10));
    }
  }

  filtrarSubseriesPorSerie(codigoSerie: string): void {
    if (!codigoSerie) {
      this.subseriesFiltradas = [...this.subseries];
      return;
    }
    const serieSel = this.series.find((s) => s.codigo_serie === codigoSerie);
    if (serieSel) {
      this.subseriesFiltradas = this.subseries.filter(
        (ss) => ss.id_serie === serieSel.id_serie || ss.codigo_subserie.startsWith(codigoSerie)
      );
    } else {
      this.subseriesFiltradas = [...this.subseries];
    }
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const tam = (file.size / 1024).toFixed(1) + ' KB';
        this.anexosPendientes.push({ nombre: file.name, tamano: tam });
      }
    }
  }

  eliminarAnexo(index: number): void {
    this.anexosPendientes.splice(index, 1);
  }

  regenerarConsecutivo(): void {
    const tipo = this.radicadoForm.get('tipo_radicado')?.value || 'ENTRADA';
    const nuevo = this.radicacionService.generarConsecutivoSugerido(tipo);
    this.radicadoForm.get('numero_radicado')?.setValue(nuevo);
  }

  guardarRadicado(): void {
    if (this.radicadoForm.invalid) {
      this.radicadoForm.markAllAsTouched();
      this.errorMessage = 'Por favor complete todos los campos obligatorios (*).';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValues = this.radicadoForm.getRawValue();

    // Determinar estado inicial (ID 1 = Pendiente o idEstadoInicial del trámite)
    const tramiteSel = this.tramites.find((t) => t.idTramite === Number(formValues.id_tramite));
    const estadoInicial = tramiteSel?.idEstadoInicial || (this.estados.length > 0 ? this.estados[0].id_estado : 1);

    const radicadoPayload: Partial<Radicado> = {
      numero_radicado: formValues.numero_radicado,
      id_tramite: Number(formValues.id_tramite),
      id_estado: estadoInicial,
      id_dependencia: Number(formValues.id_dependencia),
      id_usuario: Number(formValues.id_usuario),
      codigo_serie: formValues.codigo_serie || null,
      codigo_subserie: formValues.codigo_subserie || null,
      remitente: formValues.anonimo ? 'Anónimo' : formValues.remitente,
      asunto: formValues.asunto,
      fecha_radicado: formValues.fecha_radicado,
      tipo_radicado: formValues.tipo_radicado,
      medio_recepcion: formValues.canal_recepcion,
      prioridad: formValues.prioridad,
      confidencialidad: formValues.confidencialidad,
      fecha_vencimiento: formValues.fecha_vencimiento || null,
      descripcion: formValues.descripcion || null,
      numeroIdentificacion: formValues.numeroIdentificacion || null,
      contacto: formValues.correo || null,
      canalRecepcion: formValues.canal_recepcion,
      tipoDocumento: formValues.tipoDocumento,
      formaRespuesta: formValues.formaRespuesta,
      soporte: formValues.soporte,
      numeroFolios: formValues.numeroFolios,
    };

    this.radicacionService.createRadicado(radicadoPayload).subscribe({
      next: (radicadoCreado) => {
        this.isSubmitting = false;
        this.ultimoRadicadoCreado = radicadoCreado;
        this.successMessage = `¡Radicado ${radicadoCreado.numero_radicado} registrado con éxito!`;

        // Si hay anexos, guardarlos para este radicado
        if (radicadoCreado.id_radicado && this.anexosPendientes.length > 0) {
          for (const anexo of this.anexosPendientes) {
            this.radicacionService
              .guardarAnexo({
                idRadicado: radicadoCreado.id_radicado,
                descripcion: anexo.nombre,
                archivo: anexo.nombre,
              })
              .subscribe({
                error: (err) => console.warn('[Anexo] Error al asociar anexo:', err),
              });
          }
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('[Radicacion] Error al guardar radicado:', err);
        this.errorMessage =
          err?.error?.error ||
          err?.error?.message ||
          'Error al guardar el radicado. Verifique la conexión con el servidor.';
        this.cdr.markForCheck();
      },
    });
  }

  nuevoRegistro(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.ultimoRadicadoCreado = null;
    this.anexosPendientes = [];
    this.initForm();
  }

  // BANDEJA DE RADICADOS
  cargarRadicados(): void {
    this.cargandoRadicados = true;
    this.radicados = [];

    if (this.filtroRapido === 'vencidos') {
      this.radicacionService.getVencidos().subscribe({
        next: (res) => {
          this.radicados = res || [];
          this.cargandoRadicados = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.cargandoRadicados = false;
          this.cdr.markForCheck();
        },
      });
      return;
    }

    if (this.filtroRapido === 'proximos') {
      this.radicacionService.getProximosAVencer(3).subscribe({
        next: (res) => {
          this.radicados = res || [];
          this.cargandoRadicados = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.cargandoRadicados = false;
          this.cdr.markForCheck();
        },
      });
      return;
    }

    this.radicacionService
      .buscarRadicados({
        texto: this.filtroTexto,
        estado: this.filtroEstado,
        dependencia: this.filtroDependencia,
        tramite: this.filtroTramite,
      })
      .subscribe({
        next: (res) => {
          this.radicados = res || [];
          this.cargandoRadicados = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.cargandoRadicados = false;
          this.cdr.markForCheck();
        },
      });
  }

  cambiarFiltroRapido(tipo: 'todos' | 'vencidos' | 'proximos'): void {
    this.filtroRapido = tipo;
    this.cargarRadicados();
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = null;
    this.filtroDependencia = null;
    this.filtroTramite = null;
    this.filtroRapido = 'todos';
    this.cargarRadicados();
  }

  descargarComprobante(radicado: Radicado): void {
    if (!radicado.id_radicado) return;
    this.radicacionService.descargarComprobante(radicado.id_radicado).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Comprobante-${radicado.numero_radicado}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar comprobante:', err);
        alert('No se pudo generar el comprobante PDF para este radicado.');
      },
    });
  }

  // MODAL DETALLE
  abrirModalDetalle(radicado: Radicado): void {
    this.radicadoSeleccionado = radicado;
    this.mostrarModalDetalle = true;
    this.historialRadicado = [];
    this.observacionesRadicado = [];
    this.nuevaObservacionTexto = '';

    if (radicado.id_radicado) {
      this.radicacionService.getHistorial(radicado.id_radicado).subscribe({
        next: (h) => {
          this.historialRadicado = h || [];
          this.cdr.markForCheck();
        },
      });

      this.radicacionService.getObservaciones(radicado.id_radicado).subscribe({
        next: (obs) => {
          this.observacionesRadicado = obs || [];
          this.cdr.markForCheck();
        },
      });
    }
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.radicadoSeleccionado = null;
  }

  agregarObservacion(): void {
    if (!this.radicadoSeleccionado?.id_radicado || !this.nuevaObservacionTexto.trim()) return;

    this.guardandoObservacion = true;
    this.radicacionService
      .addObservacion(this.radicadoSeleccionado.id_radicado, this.nuevaObservacionTexto.trim())
      .subscribe({
        next: () => {
          this.guardandoObservacion = false;
          this.nuevaObservacionTexto = '';
          if (this.radicadoSeleccionado?.id_radicado) {
            this.radicacionService
              .getObservaciones(this.radicadoSeleccionado.id_radicado)
              .subscribe((obs) => {
                this.observacionesRadicado = obs || [];
                this.cdr.markForCheck();
              });
          }
        },
        error: (err) => {
          this.guardandoObservacion = false;
          alert('Error al agregar observación: ' + (err?.error?.error || 'Verifique permisos.'));
          this.cdr.markForCheck();
        },
      });
  }

  // MODAL REASIGNAR
  abrirModalReasignar(radicado: Radicado): void {
    this.radicadoSeleccionado = radicado;
    this.reasignarUsuarioId = radicado.id_usuario || null;
    this.reasignarDependenciaId = radicado.id_dependencia || null;
    this.mostrarModalReasignar = true;
  }

  cerrarModalReasignar(): void {
    this.mostrarModalReasignar = false;
    this.radicadoSeleccionado = null;
  }

  confirmarReasignacion(): void {
    if (
      !this.radicadoSeleccionado?.id_radicado ||
      !this.reasignarUsuarioId ||
      !this.reasignarDependenciaId
    ) {
      alert('Por favor seleccione un usuario y una dependencia de destino.');
      return;
    }

    this.reasignando = true;
    this.radicacionService
      .reasignar(
        this.radicadoSeleccionado.id_radicado,
        Number(this.reasignarUsuarioId),
        Number(this.reasignarDependenciaId)
      )
      .subscribe({
        next: () => {
          this.reasignando = false;
          this.cerrarModalReasignar();
          this.cargarRadicados();
          alert('¡Radicado reasignado con éxito!');
        },
        error: (err) => {
          this.reasignando = false;
          alert('Error al reasignar: ' + (err?.error?.error || err.message));
          this.cdr.markForCheck();
        },
      });
  }

  // MODAL CAMBIAR ESTADO
  abrirModalEstado(radicado: Radicado): void {
    this.radicadoSeleccionado = radicado;
    this.nuevoEstadoId = radicado.id_estado;
    this.mostrarModalEstado = true;
  }

  cerrarModalEstado(): void {
    this.mostrarModalEstado = false;
    this.radicadoSeleccionado = null;
  }

  confirmarCambioEstado(): void {
    if (!this.radicadoSeleccionado?.id_radicado || !this.nuevoEstadoId) return;

    this.cambiandoEstado = true;
    this.radicacionService
      .cambiarEstado(this.radicadoSeleccionado.id_radicado, Number(this.nuevoEstadoId))
      .subscribe({
        next: () => {
          this.cambiandoEstado = false;
          this.cerrarModalEstado();
          this.cargarRadicados();
          alert('¡Estado actualizado correctamente!');
        },
        error: (err) => {
          this.cambiandoEstado = false;
          alert('Error al cambiar de estado: ' + (err?.error?.error || err.message));
          this.cdr.markForCheck();
        },
      });
  }

  // Helpers de visualización
  obtenerNombreEstado(idEstado?: number): string {
    if (!idEstado) return 'Sin estado';
    const est = this.estados.find((e) => e.id_estado === idEstado);
    return est ? est.nombre : `Estado ${idEstado}`;
  }

  obtenerNombreDependencia(idDep?: number): string {
    if (!idDep) return 'No asignada';
    const dep = this.dependencias.find((d) => d.id_dependencia === idDep);
    return dep ? dep.nombre : `Dep #${idDep}`;
  }

  obtenerNombreTramite(idTramite?: number): string {
    if (!idTramite) return 'No definido';
    const tra = this.tramites.find((t) => t.idTramite === idTramite);
    return tra ? tra.nombre : `Trámite #${idTramite}`;
  }

  obtenerNombreUsuario(idUsuario?: number): string {
    if (!idUsuario) return 'Sin asignar';
    const usu = this.usuarios.find((u) => u.id_usuario === idUsuario);
    return usu ? usu.nombre : `Usuario #${idUsuario}`;
  }
}
