import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/authservice';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  isLoggingOut = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  // [AUTH ANGULAR] Invalida JSESSIONID y vuelve al login de Angular.
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
