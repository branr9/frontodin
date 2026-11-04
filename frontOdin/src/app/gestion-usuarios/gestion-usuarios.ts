import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OdinDataService, UsuarioOdin } from '../services/odin-data.service';

@Component({
  selector: 'app-gestion-usuarios',
  imports: [FormsModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css',
})
export class GestionUsuarios {
  modoFormulario = false;
  successMessage = '';

  // Filtros tabla
  busqueda = '';
  filtroTipoId = '';
  filtroEstado = '';
  filtroDependencia = '';

  // Campos de usuariosForm.html
  id_usuario: number | null = null;
  nombre = '';
  id_rol = 1;
  id_dependencia = 1;
  tipo_identificacion = 'CC';
  num_identificacion = '';
  correo = '';
  password = '';
  estado: 'Activo' | 'Inactivo' = 'Activo';
  telefono = '';
  direccion = '';

  readonly rolesCatalogo = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Radicador' },
    { id: 3, nombre: 'Gestor Documental' },
    { id: 4, nombre: 'Consulta / Auditoría' },
  ];

  constructor(public readonly odinData: OdinDataService) {}

  get usuariosFiltrados(): UsuarioOdin[] {
    return this.odinData.usuarios().filter((u) => {
      if (this.busqueda.trim()) {
        const q = this.busqueda.trim().toLowerCase();
        if (
          !u.nombre.toLowerCase().includes(q) &&
          !u.correo.toLowerCase().includes(q) &&
          !u.num_identificacion.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (this.filtroTipoId && u.tipo_identificacion !== this.filtroTipoId) {
        return false;
      }
      if (this.filtroEstado && u.estado !== this.filtroEstado) {
        return false;
      }
      if (this.filtroDependencia && u.id_dependencia !== Number(this.filtroDependencia)) {
        return false;
      }
      return true;
    });
  }

  abrirNuevoUsuario(): void {
    this.id_usuario = null;
    this.nombre = '';
    this.id_rol = 1;
    this.id_dependencia = 1;
    this.tipo_identificacion = 'CC';
    this.num_identificacion = '';
    this.correo = '';
    this.password = '';
    this.estado = 'Activo';
    this.telefono = '';
    this.direccion = '';
    this.modoFormulario = true;
  }

  editarUsuario(u: UsuarioOdin): void {
    this.id_usuario = u.id_usuario;
    this.nombre = u.nombre;
    this.id_rol = u.id_rol;
    this.id_dependencia = u.id_dependencia;
    this.tipo_identificacion = u.tipo_identificacion;
    this.num_identificacion = u.num_identificacion;
    this.correo = u.correo;
    this.password = '********';
    this.estado = u.estado;
    this.telefono = u.telefono;
    this.direccion = u.direccion;
    this.modoFormulario = true;
  }

  guardarUsuario(): void {
    if (!this.nombre.trim() || !this.correo.trim() || !this.num_identificacion.trim()) {
      return;
    }

    const rolNombre =
      this.rolesCatalogo.find((r) => r.id === Number(this.id_rol))?.nombre ?? `Rol #${this.id_rol}`;
    const depNombre = this.odinData.getNombreDependencia(Number(this.id_dependencia));

    const lista = this.odinData.usuarios();
    if (this.id_usuario) {
      this.odinData.usuarios.set(
        lista.map((item) =>
          item.id_usuario === this.id_usuario
            ? {
                ...item,
                nombre: this.nombre.trim(),
                id_rol: Number(this.id_rol),
                rolNombre,
                id_dependencia: Number(this.id_dependencia),
                dependenciaNombre: depNombre,
                tipo_identificacion: this.tipo_identificacion,
                num_identificacion: this.num_identificacion.trim(),
                correo: this.correo.trim(),
                estado: this.estado,
                telefono: this.telefono.trim(),
                direccion: this.direccion.trim(),
              }
            : item,
        ),
      );
      this.successMessage = `Usuario "${this.nombre.trim()}" actualizado correctamente.`;
    } else {
      const nextId = lista.length > 0 ? Math.max(...lista.map((u) => u.id_usuario)) + 1 : 1;
      this.odinData.usuarios.set([
        ...lista,
        {
          id_usuario: nextId,
          nombre: this.nombre.trim(),
          id_rol: Number(this.id_rol),
          rolNombre,
          id_dependencia: Number(this.id_dependencia),
          dependenciaNombre: depNombre,
          tipo_identificacion: this.tipo_identificacion,
          num_identificacion: this.num_identificacion.trim(),
          correo: this.correo.trim(),
          estado: this.estado,
          telefono: this.telefono.trim(),
          direccion: this.direccion.trim(),
        },
      ]);
      this.successMessage = `Usuario "${this.nombre.trim()}" registrado correctamente.`;
    }

    this.modoFormulario = false;
  }

  eliminarUsuario(u: UsuarioOdin): void {
    this.odinData.usuarios.update((lista) =>
      lista.filter((item) => item.id_usuario !== u.id_usuario),
    );
    this.successMessage = `Usuario "${u.nombre}" eliminado del sistema.`;
  }
}
