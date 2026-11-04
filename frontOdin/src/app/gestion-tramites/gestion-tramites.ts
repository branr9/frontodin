import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OdinDataService, RadicadoOdin, TipoTramite } from '../services/odin-data.service';

@Component({
  selector: 'app-gestion-tramites',
  imports: [FormsModule],
  templateUrl: './gestion-tramites.html',
  styleUrl: './gestion-tramites.css',
})
export class GestionTramites {
  activeTab: 'bandeja' | 'catalogo' | 'form-tipo' = 'bandeja';

  // Filtros RF-35
  textoFiltro = '';
  estadoFiltro = '';
  dependenciaFiltro = '';
  tramiteFiltro = '';
  fechaDesdeFiltro = '';
  fechaHastaFiltro = '';
  vencimientoFiltro = '';

  // Selección masiva
  seleccionados = new Set<number>();
  modalAction: 'asignar' | 'estado' | 'reasignar' | 'cerrar' | null = null;
  modalValor = '';
  modalObservacion = '';
  feedbackMsg = '';

  // Formulario Tipo de Trámite
  f_idTramite: number | null = null;
  f_nombre = '';
  f_descripcion = '';
  f_diasRespuesta = 15;
  f_prioridadDefault = 'MEDIA';
  f_idDependencia = '';
  f_idEstadoInicial = '';
  f_requiereRespuesta = true;
  f_activo = true;

  readonly pendientesCount = computed(
    () => this.odinData.radicados().filter((r) => r.id_estado === 1).length,
  );
  readonly enProcesoCount = computed(
    () => this.odinData.radicados().filter((r) => r.id_estado === 2).length,
  );
  readonly finalizadosCount = computed(
    () => this.odinData.radicados().filter((r) => r.id_estado === 3).length,
  );
  readonly vencidosCount = computed(
    () => this.odinData.radicados().filter((r) => r.diasRestantes < 0 && r.id_estado !== 3).length,
  );
  readonly totalRadicadosCount = computed(() => this.odinData.radicados().length);

  constructor(
    public readonly odinData: OdinDataService,
    private readonly router: Router,
  ) {}

  get radicadosFiltrados(): RadicadoOdin[] {
    return this.odinData.radicados().filter((r) => {
      if (this.textoFiltro.trim()) {
        const q = this.textoFiltro.trim().toLowerCase();
        if (
          !r.numero_radicado.toLowerCase().includes(q) &&
          !r.asunto.toLowerCase().includes(q) &&
          !r.remitente.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (this.estadoFiltro && r.id_estado !== Number(this.estadoFiltro)) {
        return false;
      }
      if (this.dependenciaFiltro && r.id_dependencia !== Number(this.dependenciaFiltro)) {
        return false;
      }
      if (this.tramiteFiltro && r.id_tramite !== Number(this.tramiteFiltro)) {
        return false;
      }
      if (this.fechaDesdeFiltro && r.fecha_radicado < this.fechaDesdeFiltro) {
        return false;
      }
      if (this.fechaHastaFiltro && r.fecha_radicado > this.fechaHastaFiltro) {
        return false;
      }
      if (this.vencimientoFiltro === 'vencidos' && !(r.diasRestantes < 0 && r.id_estado !== 3)) {
        return false;
      }
      if (
        this.vencimientoFiltro === 'proximos' &&
        !(r.diasRestantes >= 0 && r.diasRestantes <= 3 && r.id_estado !== 3)
      ) {
        return false;
      }
      return true;
    });
  }

  filtrarPorKpi(estado: string, vencimiento = ''): void {
    this.estadoFiltro = estado;
    this.vencimientoFiltro = vencimiento;
  }

  limpiarFiltros(): void {
    this.textoFiltro = '';
    this.estadoFiltro = '';
    this.dependenciaFiltro = '';
    this.tramiteFiltro = '';
    this.fechaDesdeFiltro = '';
    this.fechaHastaFiltro = '';
    this.vencimientoFiltro = '';
  }

  toggleSeleccion(idRadicado: number, checked: boolean): void {
    if (checked) {
      this.seleccionados.add(idRadicado);
    } else {
      this.seleccionados.delete(idRadicado);
    }
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.radicadosFiltrados.forEach((r) => this.seleccionados.add(r.id_radicado));
    } else {
      this.seleccionados.clear();
    }
  }

  abrirModalMasivo(accion: 'asignar' | 'estado' | 'reasignar' | 'cerrar'): void {
    if (this.seleccionados.size === 0) {
      this.feedbackMsg = 'Seleccione al menos un radicado en la tabla para ejecutar esta acción.';
      return;
    }
    this.feedbackMsg = '';
    this.modalAction = accion;
    this.modalValor = '';
    this.modalObservacion = '';
  }

  confirmarAccionMasiva(): void {
    if (!this.modalAction) return;
    const ids = new Set(this.seleccionados);
    const ahoraTexto = new Date().toLocaleDateString('es-CO') + ' ' + new Date().toTimeString().slice(0, 5);

    this.odinData.radicados.update((lista) =>
      lista.map((r) => {
        if (!ids.has(r.id_radicado)) return r;

        if (this.modalAction === 'asignar' && this.modalValor) {
          const uid = Number(this.modalValor);
          return {
            ...r,
            id_usuario: uid,
            timeline: [
              ...r.timeline,
              {
                tipo: 'HISTORIAL',
                icono: 'tl-historial',
                titulo: `Asignado a ${this.odinData.getNombreUsuario(uid)}`,
                fechaTexto: ahoraTexto,
                descripcion: this.modalObservacion || 'Asignación desde bandeja operativa.',
                usuario: this.odinData.currentUser().nombre,
                meta: `Responsable: ${this.odinData.getNombreUsuario(uid)}`,
              },
            ],
          };
        }

        if (this.modalAction === 'estado' && this.modalValor) {
          const eid = Number(this.modalValor);
          return {
            ...r,
            id_estado: eid,
            timeline: [
              ...r.timeline,
              {
                tipo: 'HISTORIAL',
                icono: 'tl-historial',
                titulo: `Cambio de estado a ${this.odinData.getNombreEstado(eid)}`,
                fechaTexto: ahoraTexto,
                descripcion: this.modalObservacion || 'Actualización de estado en bandeja.',
                usuario: this.odinData.currentUser().nombre,
                meta: `Nuevo estado: ${this.odinData.getNombreEstado(eid)}`,
              },
            ],
          };
        }

        if (this.modalAction === 'reasignar' && this.modalValor) {
          const did = Number(this.modalValor);
          return {
            ...r,
            id_dependencia: did,
            timeline: [
              ...r.timeline,
              {
                tipo: 'REASIGNACIÓN',
                icono: 'tl-reasignacion',
                titulo: `Trasladado a ${this.odinData.getNombreDependencia(did)}`,
                fechaTexto: ahoraTexto,
                descripcion: this.modalObservacion || 'Reasignación de dependencia.',
                usuario: this.odinData.currentUser().nombre,
                meta: `Dependencia destino: ${this.odinData.getNombreDependencia(did)}`,
              },
            ],
          };
        }

        if (this.modalAction === 'cerrar') {
          return {
            ...r,
            id_estado: 3,
            fecha_cierre: new Date().toISOString().slice(0, 10),
            timeline: [
              ...r.timeline,
              {
                tipo: 'HISTORIAL',
                icono: 'tl-historial',
                titulo: 'Trámite cerrado y finalizado',
                fechaTexto: ahoraTexto,
                descripcion: this.modalObservacion || 'Cierre formal de trámite desde bandeja.',
                usuario: this.odinData.currentUser().nombre,
                meta: 'Estado: Finalizado',
              },
            ],
          };
        }

        return r;
      }),
    );

    this.feedbackMsg = `Acción aplicada correctamente sobre ${ids.size} radicado(s).`;
    this.seleccionados.clear();
    this.modalAction = null;
  }

  verDetalle(r: RadicadoOdin): void {
    void this.router.navigate(['/menu/consultaseguimiento'], {
      queryParams: { id: r.id_radicado },
    });
  }

  abrirFormTipo(): void {
    this.f_idTramite = null;
    this.f_nombre = '';
    this.f_descripcion = '';
    this.f_diasRespuesta = 15;
    this.f_prioridadDefault = 'MEDIA';
    this.f_idDependencia = '';
    this.f_idEstadoInicial = '';
    this.f_requiereRespuesta = true;
    this.f_activo = true;
    this.activeTab = 'form-tipo';
  }

  editarTipo(t: TipoTramite): void {
    this.f_idTramite = t.idTramite;
    this.f_nombre = t.nombre;
    this.f_descripcion = t.descripcion;
    this.f_diasRespuesta = t.diasRespuesta;
    this.f_prioridadDefault = t.prioridadDefault;
    this.f_idDependencia = t.idDependenciaResponsable ? String(t.idDependenciaResponsable) : '';
    this.f_idEstadoInicial = t.idEstadoInicial ? String(t.idEstadoInicial) : '';
    this.f_requiereRespuesta = t.requiereRespuesta;
    this.f_activo = t.activo;
    this.activeTab = 'form-tipo';
  }

  guardarTipoTramite(): void {
    if (!this.f_nombre.trim()) return;

    const lista = this.odinData.tramites();
    if (this.f_idTramite) {
      this.odinData.tramites.set(
        lista.map((item) =>
          item.idTramite === this.f_idTramite
            ? {
                ...item,
                nombre: this.f_nombre.trim(),
                descripcion: this.f_descripcion.trim(),
                diasRespuesta: Number(this.f_diasRespuesta) || 15,
                prioridadDefault: this.f_prioridadDefault || 'MEDIA',
                idDependenciaResponsable: this.f_idDependencia ? Number(this.f_idDependencia) : null,
                idEstadoInicial: this.f_idEstadoInicial ? Number(this.f_idEstadoInicial) : null,
                requiereRespuesta: this.f_requiereRespuesta,
                activo: this.f_activo,
              }
            : item,
        ),
      );
    } else {
      const nextId = lista.length > 0 ? Math.max(...lista.map((i) => i.idTramite)) + 1 : 1;
      this.odinData.tramites.set([
        ...lista,
        {
          idTramite: nextId,
          nombre: this.f_nombre.trim(),
          descripcion: this.f_descripcion.trim(),
          diasRespuesta: Number(this.f_diasRespuesta) || 15,
          prioridadDefault: this.f_prioridadDefault || 'MEDIA',
          idDependenciaResponsable: this.f_idDependencia ? Number(this.f_idDependencia) : null,
          idEstadoInicial: this.f_idEstadoInicial ? Number(this.f_idEstadoInicial) : null,
          requiereRespuesta: this.f_requiereRespuesta,
          activo: this.f_activo,
        },
      ]);
    }

    this.activeTab = 'catalogo';
  }
}
