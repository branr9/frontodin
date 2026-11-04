import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OdinDataService, RadicadoOdin } from '../services/odin-data.service';

@Component({
  selector: 'app-consulta-seguimiento',
  imports: [FormsModule],
  templateUrl: './consulta-seguimiento.html',
  styleUrl: './consulta-seguimiento.css',
})
export class ConsultaSeguimiento {
  textoFiltro = '';
  estadoFiltro = '';
  dependenciaFiltro = '';
  tramiteFiltro = '';
  fechaDesdeFiltro = '';
  fechaHastaFiltro = '';

  radicadoSeleccionadoId: number | null = null;
  nuevoComentario = '';
  firmaUsuario = '';
  firmaObs = '';

  constructor(
    public readonly odinData: OdinDataService,
    private readonly route: ActivatedRoute,
  ) {
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id');
      this.radicadoSeleccionadoId = id ? Number(id) : null;
    });
  }

  get radicadoDetalle(): RadicadoOdin | null {
    if (!this.radicadoSeleccionadoId) return null;
    return (
      this.odinData.radicados().find((r) => r.id_radicado === this.radicadoSeleccionadoId) ?? null
    );
  }

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
      return true;
    });
  }

  get totalResultados(): number {
    return this.radicadosFiltrados.length;
  }

  get pendientesCount(): number {
    return this.radicadosFiltrados.filter((r) => r.id_estado === 1).length;
  }

  get vencidosCount(): number {
    return this.radicadosFiltrados.filter((r) => r.diasRestantes < 0 && r.id_estado !== 3).length;
  }

  get proximosCount(): number {
    return this.radicadosFiltrados.filter(
      (r) => r.diasRestantes >= 0 && r.diasRestantes <= 3 && r.id_estado !== 3,
    ).length;
  }

  get firmasDelRadicado() {
    if (!this.radicadoSeleccionadoId) return [];
    return this.odinData.firmas().filter((f) => f.idRadicado === this.radicadoSeleccionadoId);
  }

  get documentosDelRadicado() {
    if (!this.radicadoSeleccionadoId) return [];
    return this.odinData.documentos().filter((d) => d.idRadicado === this.radicadoSeleccionadoId);
  }

  verDetalle(r: RadicadoOdin): void {
    this.radicadoSeleccionadoId = r.id_radicado;
    this.nuevoComentario = '';
    this.firmaObs = '';
  }

  volverAConsulta(): void {
    this.radicadoSeleccionadoId = null;
  }

  guardarObservacion(): void {
    if (!this.radicadoSeleccionadoId || !this.nuevoComentario.trim()) return;
    this.odinData.agregarObservacion(this.radicadoSeleccionadoId, this.nuevoComentario.trim());
    this.nuevoComentario = '';
  }

  registrarFirma(): void {
    if (!this.radicadoSeleccionadoId) return;
    const uid = this.firmaUsuario ? Number(this.firmaUsuario) : null;
    this.odinData.solicitarFirma(this.radicadoSeleccionadoId, uid, this.firmaObs.trim());
    this.firmaObs = '';
  }

  imprimirComprobante(): void {
    window.print();
  }
}
