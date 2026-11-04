import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DependenciaItem,
  OdinApiService,
  PermisoItem,
  RolItem,
  UsuarioItem,
} from '../services/odin-api.service';

@Component({
  selector: 'app-gestion-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css',
})
export class GestionUsuarios implements OnInit {
  tabActiva: 'usuarios' | 'roles' = 'usuarios';

  usuarios: UsuarioItem[] = [];
  roles: RolItem[] = [];
  dependencias: DependenciaItem[] = [];
  permisosDisponibles: PermisoItem[] = [];

  // Filtros de Usuarios (igual que usuarios.html del gestor documental)
  filtroUsuario = '';
  filtroTipoId = '';
  filtroEstadoUsuario = '';
  filtroDependencia: number | null = null;
  filtroRol: number | null = null;

  // Paginación de Usuarios
  paginaActualUsuarios = 1;
  readonly itemsPorPaginaUsuarios = 8;

  // Filtros de Roles (igual que roles.html del gestor documental)
  filtroTextoRol = '';
  filtroEstadoRol = '';

  cargando = false;
  guardandoUsuario = false;
  guardandoRol = false;
  guardandoPermisos = false;
  mensajeExito = '';
  mensajeError = '';

  // Formulario Usuario
  mostrarFormularioUsuario = true;
  editandoUsuarioId: number | null = null;
  formUsuario: UsuarioItem = this.nuevoUsuario();

  // Formulario Rol y Matriz de Permisos (RF-N16 · RF-43 · RF-44)
  editandoRolId: number | null = null;
  formRol: RolItem = { nombre: '', rol: '', estado: 'Activo' };
  permisosFormRolIds: Set<number> = new Set<number>();

  // Panel dedicado de matriz de permisos para un rol seleccionado
  rolPermisosSeleccionado: RolItem | null = null;
  permisosActivosIds: Set<number> = new Set<number>();

  constructor(
    private readonly api: OdinApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  nuevoUsuario(): UsuarioItem {
    return {
      nombre: '',
      tipo_identificacion: 'CC',
      num_identificacion: '',
      correo: '',
      password: '',
      telefono: '',
      direccion: '',
      id_rol: null,
      id_dependencia: null,
      estado: 'Activo',
    };
  }

  cargarTodo(): void {
    this.cargando = true;
    this.api.getRoles().subscribe({
      next: (r) => {
        this.roles = (r || []).sort((a, b) => (a.id_rol || 0) - (b.id_rol || 0));
        this.cdr.detectChanges();
      },
    });
    this.api.getDependencias().subscribe({
      next: (d) => {
        this.dependencias = d || [];
        this.cdr.detectChanges();
      },
    });
    this.api.getPermisosDisponibles().subscribe({
      next: (p) => {
        this.permisosDisponibles = p || [];
        this.cdr.detectChanges();
      },
    });
    this.api.getUsuarios().subscribe({
      next: (u) => {
        this.usuarios = (u || []).sort((a, b) => (a.id_usuario || 0) - (b.id_usuario || 0));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.mensajeError =
          'No se pudieron cargar los funcionarios. Verifique que haya iniciado sesión con permisos de administración.';
        this.cdr.detectChanges();
      },
    });
  }

  // ==================== KPIs y Filtros de Usuarios ====================

  get totalUsuariosActivos(): number {
    return this.usuarios.filter((u) => (u.estado || 'Activo').toLowerCase() === 'activo').length;
  }

  get totalUsuariosInactivos(): number {
    return this.usuarios.length - this.totalUsuariosActivos;
  }

  get usuariosFiltrados(): UsuarioItem[] {
    const q = this.filtroUsuario.trim().toLowerCase();
    return this.usuarios.filter((u) => {
      if (q) {
        const matchTexto =
          (u.nombre || '').toLowerCase().includes(q) ||
          (u.correo || '').toLowerCase().includes(q) ||
          (u.num_identificacion || '').toLowerCase().includes(q) ||
          (u.telefono || '').toLowerCase().includes(q) ||
          this.nombreRol(u.id_rol).toLowerCase().includes(q) ||
          this.nombreDependencia(u.id_dependencia).toLowerCase().includes(q);
        if (!matchTexto) return false;
      }
      if (this.filtroTipoId && (u.tipo_identificacion || '') !== this.filtroTipoId) {
        return false;
      }
      if (
        this.filtroEstadoUsuario &&
        (u.estado || 'Activo').toLowerCase() !== this.filtroEstadoUsuario.toLowerCase()
      ) {
        return false;
      }
      if (this.filtroDependencia && Number(u.id_dependencia) !== Number(this.filtroDependencia)) {
        return false;
      }
      if (this.filtroRol && Number(u.id_rol) !== Number(this.filtroRol)) {
        return false;
      }
      return true;
    });
  }

  get totalPaginasUsuarios(): number {
    return Math.max(1, Math.ceil(this.usuariosFiltrados.length / this.itemsPorPaginaUsuarios));
  }

  get paginasUsuariosArray(): number[] {
    return Array.from({ length: this.totalPaginasUsuarios }, (_, i) => i + 1);
  }

  get usuariosPaginados(): UsuarioItem[] {
    const pagina = Math.min(this.paginaActualUsuarios, this.totalPaginasUsuarios);
    const inicio = (pagina - 1) * this.itemsPorPaginaUsuarios;
    return this.usuariosFiltrados.slice(inicio, inicio + this.itemsPorPaginaUsuarios);
  }

  cambiarPaginaUsuarios(p: number): void {
    if (p >= 1 && p <= this.totalPaginasUsuarios) {
      this.paginaActualUsuarios = p;
    }
  }

  limpiarFiltrosUsuarios(): void {
    this.filtroUsuario = '';
    this.filtroTipoId = '';
    this.filtroEstadoUsuario = '';
    this.filtroDependencia = null;
    this.filtroRol = null;
    this.paginaActualUsuarios = 1;
  }

  // ==================== CRUD Usuarios ====================

  iniciarNuevoUsuario(): void {
    this.editandoUsuarioId = null;
    this.formUsuario = this.nuevoUsuario();
    this.mostrarFormularioUsuario = true;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  guardarUsuario(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (
      !this.formUsuario.nombre.trim() ||
      !this.formUsuario.correo.trim() ||
      !this.formUsuario.num_identificacion.trim() ||
      !this.formUsuario.id_rol ||
      !this.formUsuario.id_dependencia
    ) {
      this.mensajeError =
        'Por favor complete los campos obligatorios: Nombre completo, Rol, Dependencia, Identificación y Correo electrónico.';
      return;
    }

    if (!this.editandoUsuarioId && (!this.formUsuario.password || !this.formUsuario.password.trim())) {
      this.mensajeError = 'Debe asignar una contraseña inicial para el nuevo usuario.';
      return;
    }

    this.guardandoUsuario = true;
    const payload: UsuarioItem = {
      ...this.formUsuario,
      nombre: this.formUsuario.nombre.trim(),
      correo: this.formUsuario.correo.trim(),
      num_identificacion: this.formUsuario.num_identificacion.trim(),
      tipo_identificacion: this.formUsuario.tipo_identificacion || 'CC',
      id_rol: Number(this.formUsuario.id_rol),
      id_dependencia: Number(this.formUsuario.id_dependencia),
      telefono: this.formUsuario.telefono.trim() || '3000000000',
      direccion: this.formUsuario.direccion.trim() || 'Sede Institucional SENA',
      estado: this.formUsuario.estado || 'Activo',
    };

    if (this.editandoUsuarioId) {
      this.api.actualizarUsuario(this.editandoUsuarioId, payload).subscribe({
        next: () => {
          this.guardandoUsuario = false;
          this.mensajeExito = 'Usuario actualizado con éxito.';
          this.cancelarEdicionUsuario();
          this.cargarTodo();
        },
        error: (err) => {
          this.guardandoUsuario = false;
          this.mensajeError = err?.error?.error || 'No fue posible actualizar el usuario.';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.api.crearUsuario(payload).subscribe({
        next: () => {
          this.guardandoUsuario = false;
          this.mensajeExito = 'Usuario registrado con éxito (contraseña encriptada con BCrypt).';
          this.formUsuario = this.nuevoUsuario();
          this.cargarTodo();
        },
        error: (err) => {
          this.guardandoUsuario = false;
          this.mensajeError =
            err?.error?.error || 'Error al registrar el usuario (verifique que el correo no esté duplicado).';
          this.cdr.detectChanges();
        },
      });
    }
  }

  editarUsuario(u: UsuarioItem): void {
    this.editandoUsuarioId = u.id_usuario || null;
    this.mostrarFormularioUsuario = true;
    this.formUsuario = {
      ...u,
      password: '', // dejar en blanco para mantener la clave actual
    };
    this.mensajeError = '';
    this.mensajeExito = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicionUsuario(): void {
    this.editandoUsuarioId = null;
    this.formUsuario = this.nuevoUsuario();
  }

  alternarEstadoUsuario(u: UsuarioItem): void {
    if (!u.id_usuario) return;
    const actual = (u.estado || 'Activo').trim();
    const nuevo = actual.toLowerCase() === 'activo' ? 'Inactivo' : 'Activo';
    this.api.cambiarEstadoUsuario(u.id_usuario, nuevo).subscribe({
      next: () => {
        this.mensajeExito = `Estado de "${u.nombre}" cambiado a ${nuevo}.`;
        this.cargarTodo();
      },
      error: () => {
        this.mensajeError = 'No fue posible cambiar el estado del usuario.';
        this.cdr.detectChanges();
      },
    });
  }

  eliminarUsuario(u: UsuarioItem): void {
    if (!u.id_usuario) return;
    if (!confirm(`¿Está seguro que desea eliminar al usuario "${u.nombre}"?`)) return;
    this.api.eliminarUsuario(u.id_usuario).subscribe({
      next: () => {
        this.mensajeExito = 'Usuario eliminado con éxito.';
        this.cargarTodo();
      },
      error: (err) => {
        this.mensajeError =
          err?.error?.error ||
          'No se puede eliminar un usuario con historial de radicados asociado. Puede cambiar su estado a Inactivo.';
        this.cdr.detectChanges();
      },
    });
  }

  exportarUsuarios(formato: 'pdf' | 'excel'): void {
    window.open(`/view/usuarios/${formato}`, '_blank');
  }

  // ==================== Roles y Matriz de Permisos ====================

  get rolesFiltrados(): RolItem[] {
    const q = this.filtroTextoRol.trim().toLowerCase();
    return this.roles.filter((r) => {
      if (q) {
        const match =
          (r.nombre || '').toLowerCase().includes(q) || (r.rol || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (this.filtroEstadoRol && (r.estado || 'Activo').toLowerCase() !== this.filtroEstadoRol.toLowerCase()) {
        return false;
      }
      return true;
    });
  }

  contarUsuariosPorRol(idRol?: number): number {
    if (!idRol) return 0;
    return this.usuarios.filter((u) => Number(u.id_rol) === Number(idRol)).length;
  }

  togglePermisoFormRol(idPermiso: number): void {
    if (this.permisosFormRolIds.has(idPermiso)) {
      this.permisosFormRolIds.delete(idPermiso);
    } else {
      this.permisosFormRolIds.add(idPermiso);
    }
  }

  seleccionarTodosPermisosForm(): void {
    this.permisosDisponibles.forEach((p) => this.permisosFormRolIds.add(p.id_permiso));
  }

  limpiarPermisosForm(): void {
    this.permisosFormRolIds.clear();
  }

  guardarRol(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    if (!this.formRol.nombre.trim() || !this.formRol.rol.trim()) {
      this.mensajeError = 'Ingrese el nombre del rol y el código/clave del rol.';
      return;
    }

    this.guardandoRol = true;
    const payload: RolItem = {
      nombre: this.formRol.nombre.trim(),
      rol: this.formRol.rol.trim().toUpperCase().replace(/\s+/g, '_'),
      estado: this.formRol.estado || 'Activo',
    };

    const idsPermisos = Array.from(this.permisosFormRolIds);

    if (this.editandoRolId) {
      const idRol = this.editandoRolId;
      this.api.actualizarRol(idRol, payload).subscribe({
        next: () => {
          this.api.guardarPermisosRol(idRol, idsPermisos).subscribe({
            next: () => {
              this.guardandoRol = false;
              this.mensajeExito = 'Rol y permisos guardados correctamente.';
              this.cancelarEdicionRol();
              this.cargarTodo();
            },
            error: () => {
              this.guardandoRol = false;
              this.mensajeExito = 'Rol actualizado correctamente.';
              this.cancelarEdicionRol();
              this.cargarTodo();
            },
          });
        },
        error: () => {
          this.guardandoRol = false;
          this.mensajeError = 'No fue posible actualizar el rol.';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.api.crearRol(payload).subscribe({
        next: (creado) => {
          if (creado?.id_rol && idsPermisos.length > 0) {
            this.api.guardarPermisosRol(creado.id_rol, idsPermisos).subscribe({
              next: () => {
                this.guardandoRol = false;
                this.mensajeExito = 'Nuevo rol y permisos registrados correctamente.';
                this.cancelarEdicionRol();
                this.cargarTodo();
              },
              error: () => {
                this.guardandoRol = false;
                this.mensajeExito = 'Rol creado correctamente.';
                this.cancelarEdicionRol();
                this.cargarTodo();
              },
            });
          } else {
            this.guardandoRol = false;
            this.mensajeExito = 'Rol creado correctamente.';
            this.cancelarEdicionRol();
            this.cargarTodo();
          }
        },
        error: () => {
          this.guardandoRol = false;
          this.mensajeError = 'No fue posible registrar el rol.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  editarRol(r: RolItem): void {
    this.editandoRolId = r.id_rol || null;
    this.formRol = {
      id_rol: r.id_rol,
      nombre: r.nombre || '',
      rol: r.rol || '',
      estado: r.estado || 'Activo',
    };
    this.permisosFormRolIds.clear();
    if (r.id_rol) {
      this.api.getPermisosRol(r.id_rol).subscribe({
        next: (res) => {
          if (res.disponibles && res.disponibles.length > 0) {
            this.permisosDisponibles = res.disponibles;
          }
          const asignados = res.asignados || [];
          this.permisosFormRolIds = new Set(asignados.map((p) => p.id_permiso));
          this.cdr.detectChanges();
        },
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicionRol(): void {
    this.editandoRolId = null;
    this.formRol = { nombre: '', rol: '', estado: 'Activo' };
    this.permisosFormRolIds.clear();
  }

  eliminarRol(r: RolItem): void {
    if (!r.id_rol) return;
    if (!confirm(`¿Está seguro que desea eliminar el rol "${r.nombre}"?`)) return;
    this.api.eliminarRol(r.id_rol).subscribe({
      next: () => {
        this.mensajeExito = `Rol "${r.nombre}" eliminado correctamente.`;
        if (this.rolPermisosSeleccionado?.id_rol === r.id_rol) {
          this.rolPermisosSeleccionado = null;
        }
        if (this.editandoRolId === r.id_rol) {
          this.cancelarEdicionRol();
        }
        this.cargarTodo();
      },
      error: (err) => {
        this.mensajeError =
          err?.error?.error || 'No se puede eliminar el rol porque tiene usuarios asignados.';
        this.cdr.detectChanges();
      },
    });
  }

  abrirPermisos(r: RolItem): void {
    if (!r.id_rol) return;
    this.rolPermisosSeleccionado = r;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.api.getPermisosRol(r.id_rol).subscribe({
      next: (res) => {
        if (res.disponibles && res.disponibles.length > 0) {
          this.permisosDisponibles = res.disponibles;
        }
        const asignados = res.asignados || [];
        this.permisosActivosIds = new Set(asignados.map((p) => p.id_permiso));
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar la matriz de permisos del rol.';
        this.cdr.detectChanges();
      },
    });
  }

  togglePermisoActivo(idPermiso: number): void {
    if (this.permisosActivosIds.has(idPermiso)) {
      this.permisosActivosIds.delete(idPermiso);
    } else {
      this.permisosActivosIds.add(idPermiso);
    }
  }

  seleccionarTodosPermisosModal(): void {
    this.permisosDisponibles.forEach((p) => this.permisosActivosIds.add(p.id_permiso));
  }

  limpiarPermisosModal(): void {
    this.permisosActivosIds.clear();
  }

  guardarMatrizPermisos(): void {
    if (!this.rolPermisosSeleccionado?.id_rol) return;
    this.guardandoPermisos = true;
    const listaIds = Array.from(this.permisosActivosIds);
    this.api.guardarPermisosRol(this.rolPermisosSeleccionado.id_rol, listaIds).subscribe({
      next: () => {
        this.guardandoPermisos = false;
        this.mensajeExito = `Permisos del rol "${this.rolPermisosSeleccionado?.nombre}" actualizados correctamente (${listaIds.length} permisos asignados).`;
        if (this.editandoRolId === this.rolPermisosSeleccionado?.id_rol) {
          this.permisosFormRolIds = new Set(listaIds);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardandoPermisos = false;
        this.mensajeError = 'No fue posible guardar la matriz de permisos.';
        this.cdr.detectChanges();
      },
    });
  }

  exportarRoles(formato: 'pdf' | 'excel'): void {
    window.open(`/view/roles/${formato}`, '_blank');
  }

  nombreRol(id?: number | null): string {
    if (!id) return 'Sin rol';
    const r = this.roles.find((rol) => Number(rol.id_rol) === Number(id));
    return r ? r.nombre : `Rol #${id}`;
  }

  nombreDependencia(id?: number | null): string {
    if (!id) return 'Sin dependencia';
    const d = this.dependencias.find((dep) => Number(dep.id_dependencia) === Number(id));
    return d ? d.nombre : `Dep. #${id}`;
  }
}
