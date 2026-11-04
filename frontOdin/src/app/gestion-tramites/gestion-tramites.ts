import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DependenciaItem,
  EstadoItem,
  OdinApiService,
  RadicadoItem,
  TramiteItem,
  UsuarioItem,
} from '../services/odin-api.service';

@Component({
  selector: 'app-gestion-tramites',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-tramites.html',
  styleUrl: './gestion-tramites.css',
})
export class GestionTramites implements OnInit {
  tabActiva: 'operativa' | 'catalogo' = 'operativa';
  filtroBandeja: 'todos' | 'proximos' | 'vencidos' = 'todos';

  radicados: RadicadoItem[] = [];
  tramites: TramiteItem[] = [];
  dependencias: DependenciaItem[] = [];
  estados: EstadoItem[] = [];
  usuarios: UsuarioItem[] = [];

  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  // Modal/Panel de Acción Operativa (Reasignar / Cerrar / Cambiar Estado)
  radicadoAccion: RadicadoItem | null = null;
  tipoAccion: 'estado' | 'reasignar' | 'cerrar' = 'estado';
  nuevoEstadoId: number | null = null;
  nuevoUsuarioId: number | null = null;
  nuevaDependenciaId: number | null = null;
  observacionCierre = '';

  // Formulario de Catálogo de Trámites
  editandoTramiteId: number | null = null;
  formTramite: TramiteItem = this.nuevoTramite();

  constructor(private readonly api: OdinApiService) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarBandeja('todos');
  }

  nuevoTramite(): TramiteItem {
    return {
      nombre: '',
      descripcion: '',
      diasRespuesta: 15,
      prioridadDefault: 'MEDIA',
      idDependenciaResponsable: null,
      idEstadoInicial: 1,
      requiereRespuesta: true,
      activo: true,
    };
  }

  cargarCatalogos(): void {
    this.api.getTramites().subscribe({ next: (d) => (this.tramites = d || []) });
    this.api.getDependencias().subscribe({ next: (d) => (this.dependencias = d || []) });
    this.api.getEstados().subscribe({ next: (d) => (this.estados = d || []) });
    this.api.getUsuarios().subscribe({ next: (d) => (this.usuarios = d || []) });
  }

  cargarBandeja(filtro: 'todos' | 'proximos' | 'vencidos'): void {
    this.filtroBandeja = filtro;
    this.cargando = true;
    const obs =
      filtro === 'vencidos'
        ? this.api.getRadicadosVencidos()
        : filtro === 'proximos'
        ? this.api.getRadicadosProximos(5)
        : this.api.getRadicados();

    obs.subscribe({
      next: (lista) => {
        this.radicados = (lista || []).sort(
          (a, b) => (b.id_radicado || 0) - (a.id_radicado || 0)
        );
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  abrirAccion(r: RadicadoItem, tipo: 'estado' | 'reasignar' | 'cerrar'): void {
    this.radicadoAccion = r;
    this.tipoAccion = tipo;
    this.nuevoEstadoId = r.id_estado || 2;
    this.nuevoUsuarioId = r.id_usuario || null;
    this.nuevaDependenciaId = r.id_dependencia || null;
    this.observacionCierre = '';
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  ejecutarAccionOperativa(): void {
    if (!this.radicadoAccion?.id_radicado) return;
    const id = this.radicadoAccion.id_radicado;
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.tipoAccion === 'estado') {
      if (!this.nuevoEstadoId) return;
      this.api.cambiarEstadoRadicado(id, Number(this.nuevoEstadoId)).subscribe({
        next: () => {
          this.mensajeExito = `Estado del radicado ${this.radicadoAccion?.numero_radicado} actualizado.`;
          this.radicadoAccion = null;
          this.cargarBandeja(this.filtroBandeja);
        },
        error: (err) => {
          this.mensajeError = err?.error?.error || 'No fue posible cambiar el estado.';
        },
      });
    } else if (this.tipoAccion === 'reasignar') {
      if (!this.nuevoUsuarioId || !this.nuevaDependenciaId) {
        this.mensajeError = 'Seleccione dependencia y funcionario destino.';
        return;
      }
      this.api
        .reasignarRadicado(id, Number(this.nuevoUsuarioId), Number(this.nuevaDependenciaId))
        .subscribe({
          next: () => {
            this.mensajeExito = `Radicado ${this.radicadoAccion?.numero_radicado} reasignado exitosamente.`;
            this.radicadoAccion = null;
            this.cargarBandeja(this.filtroBandeja);
          },
          error: (err) => {
            this.mensajeError = err?.error?.error || 'Error al reasignar el radicado.';
          },
        });
    } else if (this.tipoAccion === 'cerrar') {
      this.api.cerrarRadicado(id, 3, this.observacionCierre.trim()).subscribe({
        next: () => {
          this.mensajeExito = `Radicado ${this.radicadoAccion?.numero_radicado} finalizado y cerrado.`;
          this.radicadoAccion = null;
          this.cargarBandeja(this.filtroBandeja);
        },
        error: (err) => {
          this.mensajeError = err?.error?.error || 'No fue posible cerrar el radicado.';
        },
      });
    }
  }

  guardarTramite(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    if (!this.formTramite.nombre.trim() || !this.formTramite.descripcion.trim()) {
      this.mensajeError = 'El nombre y la descripción del trámite son obligatorios.';
      return;
    }

    const payload: TramiteItem = {
      ...this.formTramite,
      nombre: this.formTramite.nombre.trim(),
      descripcion: this.formTramite.descripcion.trim(),
    };

    if (this.editandoTramiteId) {
      this.api.actualizarTramite(this.editandoTramiteId, payload).subscribe({
        next: () => {
          this.mensajeExito = 'Trámite actualizado correctamente.';
          this.cancelarEdicionTramite();
          this.cargarCatalogos();
        },
        error: () => {
          this.mensajeError = 'No fue posible actualizar el trámite.';
        },
      });
    } else {
      this.api.crearTramite(payload).subscribe({
        next: () => {
          this.mensajeExito = 'Nuevo tipo de trámite creado en el catálogo.';
          this.formTramite = this.nuevoTramite();
          this.cargarCatalogos();
        },
        error: () => {
          this.mensajeError = 'No fue posible crear el trámite.';
        },
      });
    }
  }

  editarTramite(t: TramiteItem): void {
    this.editandoTramiteId = t.idTramite || null;
    this.formTramite = { ...t };
  }

  cancelarEdicionTramite(): void {
    this.editandoTramiteId = null;
    this.formTramite = this.nuevoTramite();
  }

  eliminarTramite(t: TramiteItem): void {
    if (!t.idTramite) return;
    if (!confirm(`¿Eliminar el tipo de trámite "${t.nombre}"?`)) return;
    this.api.eliminarTramite(t.idTramite).subscribe({
      next: () => {
        this.mensajeExito = 'Trámite eliminado.';
        this.cargarCatalogos();
      },
      error: () => {
        this.mensajeError = 'No se puede eliminar un trámite con radicados asociados.';
      },
    });
  }

  nombreDependencia(id?: number | null): string {
    if (!id) return 'Sin asignar';
    const d = this.dependencias.find((dep) => dep.id_dependencia === id);
    return d ? d.nombre : `Dep. #${id}`;
  }
}
