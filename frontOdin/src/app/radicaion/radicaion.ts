import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OdinDataService, RadicadoOdin } from '../services/odin-data.service';

@Component({
  selector: 'app-radicaion',
  imports: [FormsModule, RouterLink],
  templateUrl: './radicaion.html',
  styleUrl: './radicaion.css',
})
export class Radicaion {
  tipoRadicacion = 'ENTRADA';
  canalRecepcion = 'FISICO';
  tipoDocumento = '';
  id_tramite = '';

  anonimo = false;
  remitente = '';
  numeroIdentificacion = '';
  correo = '';
  telefono = '';
  ciudad = '';
  formaRespuesta = 'ELECTRONICA';

  id_dependencia = '';
  id_usuario = '';
  codigo_serie = '';
  codigo_subserie = '';
  prioridad = 'NORMAL';
  fecha_vencimiento = '';

  asunto = '';
  descripcion = '';
  numeroFolios = 1;
  soporte = 'DIGITAL';
  confidencialidad = 'PUBLICA';
  archivosSeleccionados: string[] = [];

  radicadoCreado: RadicadoOdin | null = null;
  errorMsg = '';

  constructor(
    public readonly odinData: OdinDataService,
    private readonly router: Router,
  ) {}

  get subseriesFiltradas() {
    if (!this.codigo_serie) {
      return this.odinData.subseries;
    }
    return this.odinData.subseries.filter((s) => s.codigo_serie === this.codigo_serie);
  }

  onToggleAnonimo(): void {
    if (this.anonimo) {
      this.remitente = '';
      this.numeroIdentificacion = '';
      this.correo = '';
      this.telefono = '';
      this.ciudad = '';
      this.formaRespuesta = 'NO_APLICA';
    } else {
      this.formaRespuesta = 'ELECTRONICA';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) {
      this.archivosSeleccionados = [];
      return;
    }
    this.archivosSeleccionados = Array.from(input.files).map((f) => f.name);
  }

  guardarRadicado(): void {
    this.errorMsg = '';
    if (!this.id_tramite || !this.id_dependencia || !this.asunto.trim()) {
      this.errorMsg = 'Complete los campos obligatorios: Trámite, Dependencia destino y Asunto.';
      return;
    }

    this.radicadoCreado = this.odinData.crearRadicado(
      {
        tipoRadicacion: this.tipoRadicacion,
        canalRecepcion: this.canalRecepcion,
        tipoDocumento: this.tipoDocumento,
        id_tramite: Number(this.id_tramite),
        anonimo: this.anonimo,
        remitente: this.remitente,
        numeroIdentificacion: this.numeroIdentificacion,
        correo: this.correo,
        telefono: this.telefono,
        ciudad: this.ciudad,
        formaRespuesta: this.formaRespuesta,
        id_dependencia: Number(this.id_dependencia),
        id_usuario: this.id_usuario ? Number(this.id_usuario) : null,
        codigo_serie: this.codigo_serie,
        codigo_subserie: this.codigo_subserie,
        prioridad: this.prioridad,
        fecha_vencimiento: this.fecha_vencimiento,
        asunto: this.asunto.trim(),
        descripcion: this.descripcion.trim(),
        numeroFolios: this.numeroFolios,
        soporte: this.soporte,
        confidencialidad: this.confidencialidad,
      },
      this.archivosSeleccionados,
    );

    // Limpiar campos del formulario
    this.asunto = '';
    this.descripcion = '';
    this.archivosSeleccionados = [];
  }

  irAGestion(): void {
    void this.router.navigate(['/menu/gestiontramites']);
  }
}
