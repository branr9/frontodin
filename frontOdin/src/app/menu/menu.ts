import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/authservice';
import { AuthUserInfo, OdinApiService } from '../services/odin-api.service';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  isLoggingOut = false;
  currentUser: AuthUserInfo | null = null;
  pageTitle = 'Radicación Documental';
  notificacionesNoLeidas = 0;
  notificaciones: any[] = [];
  mostrarNotificaciones = false;

  constructor(
    private readonly authService: AuthService,
    private readonly api: OdinApiService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.actualizarTitulo(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.actualizarTitulo(e.urlAfterRedirects));

    this.api.getMe().subscribe({
      next: (user) => {
        if (user && user.authenticated) {
          this.currentUser = user;
        } else {
          void this.router.navigate(['/login']);
        }
      },
      error: () => {
        void this.router.navigate(['/login']);
      },
    });

    this.cargarNotificaciones();
  }

  private actualizarTitulo(url: string): void {
    if (url.includes('consultaseguimiento')) {
      this.pageTitle = 'Consulta y Seguimiento de Radicados';
    } else if (url.includes('gestiontramites')) {
      this.pageTitle = 'Gestión Operativa y Catálogo de Trámites';
    } else if (url.includes('gestionusuarios')) {
      this.pageTitle = 'Gestión de Usuarios, Roles y Permisos';
    } else {
      this.pageTitle = 'Radicación Documental y Panel Operativo';
    }
  }

  cargarNotificaciones(): void {
    this.api.getNotificaciones().subscribe({
      next: (res) => {
        this.notificacionesNoLeidas = res?.noLeidas ?? 0;
        this.notificaciones = res?.items ?? [];
      },
      error: () => {},
    });
  }

  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.cargarNotificaciones();
    }
  }

  marcarLeida(id: number): void {
    this.api.marcarNotificacionLeida(id).subscribe({
      next: () => this.cargarNotificaciones(),
    });
  }

  get userInitial(): string {
    const name = this.currentUser?.nombre || 'Usuario';
    return name.trim().charAt(0).toUpperCase();
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigate(['/login']);
      },
      error: (error: unknown) => {
        console.error('[AUTH ANGULAR] No se pudo confirmar el cierre de sesión.', error);
        void this.router.navigate(['/login']);
      },
    });
  }
}
