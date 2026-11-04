import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DependenciaItem,
  EstadoItem,
  HistorialItem,
  ObservacionItem,
  OdinApiService,
  RadicadoItem,
  ReasignacionItem,
  TramiteItem,
  UsuarioItem,
} from '../services/odin-api.service';

@Component({
  selector: 'app-consulta-seguimiento',
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-seguimiento.html',
  styleUrl: './consulta-seguimiento.css',
})
export class ConsultaSeguimiento implements OnInit {
  radicados: RadicadoItem[] = [];
  estados: EstadoItem[] = [];
  dependencias: DependenciaItem[] = [];
  tramites: TramiteItem[] = [];
  usuarios: UsuarioItem[] = [];

  filtros = {
    texto: '',
    estado: null as number | null,
    dependencia: null as number | null,
    tramite: null as number | null,
  };

  cargando = false;
  radicadoSeleccionado: RadicadoItem | null = null;
  historial: HistorialItem[] = [];
  observaciones: ObservacionItem[] = [];
  reasignaciones: ReasignacionItem[] = [];
  nuevaObservacion = '';
  guardandoObs = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(private readonly api: OdinApiService) {}

  ngOnInit(): void {
    this.api.getEstados().subscribe({ next: (d) => (this.estados = d || []) });
    this.api.getDependencias().subscribe({ next: (d) => (this.dependencias = d || []) });
    this.api.getTramites().subscribe({ next: (d) => (this.tramites = d || []) });
    this.api.getUsuarios().subscribe({ next: (d) => (this.usuarios = d || []) });
    this.buscar();
  }

  buscar(): void {
    this.cargando = true;
    const tieneFiltros =
      this.filtros.texto.trim() !== '' ||
      this.filtros.estado !== null ||
      this.filtros.dependencia !== null ||
      this.filtros.tramite !== null;

    const obs = tieneFiltros
      ? this.api.buscarRadicados(this.filtros)
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

  limpiarFiltros(): void {
    this.filtros = {
      texto: '',
      estado: null,
      dependencia: null,
      tramite: null,
    };
    this.buscar();
  }

  verSeguimiento(r: RadicadoItem): void {
    this.radicadoSeleccionado = r;
    this.historial = [];
    this.observaciones = [];
    this.reasignaciones = [];
    this.nuevaObservacion = '';
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!r.id_radicado) return;
    this.cargarTrazabilidad(r.id_radicado);
  }

  cargarTrazabilidad(id: number): void {
    this.api.getHistorial(id).subscribe({ next: (h) => (this.historial = h || []) });
    this.api.getObservaciones(id).subscribe({ next: (o) => (this.observaciones = o || []) });
    this.api.getReasignaciones(id).subscribe({ next: (re) => (this.reasignaciones = re || []) });
  }

  cerrarDetalle(): void {
    this.radicadoSeleccionado = null;
  }

  registrarObservacion(): void {
    if (!this.radicadoSeleccionado?.id_radicado || !this.nuevaObservacion.trim()) return;
    this.guardandoObs = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const idRad = this.radicadoSeleccionado.id_radicado;
    this.api
      .agregarObservacion(
        idRad,
        this.nuevaObservacion.trim(),
        this.radicadoSeleccionado.id_usuario || 1
      )
      .subscribe({
        next: () => {
          this.guardandoObs = false;
          this.nuevaObservacion = '';
          this.mensajeExito = 'Observación registrada en la bitácora del radicado.';
          this.cargarTrazabilidad(idRad);
        },
        error: (err) => {
          this.guardandoObs = false;
          this.mensajeError = err?.error?.error || 'No fue posible registrar la observación.';
        },
      });
  }

  exportar(formato: 'pdf' | 'xlsx' | 'csv'): void {
    window.open(`/api/reportes/radicados.${formato}`, '_blank');
  }

  abrirComprobante(id?: number): void {
    if (!id) return;
    window.open(`/api/radicados/${id}/comprobante`, '_blank');
  }

  nombreDependencia(id?: number | null): string {
    if (!id) return 'Sin asignar';
    const d = this.dependencias.find((dep) => dep.id_dependencia === id);
    return d ? d.nombre : `Dep. #${id}`;
  }

  nombreUsuario(id?: number | null): string {
    if (!id) return 'Sistema';
    const u = this.usuarios.find((usr) => usr.id_usuario === id);
    return u ? u.nombre : `Usuario #${id}`;
  }
}
