import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { finalize } from 'rxjs';
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
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // [AUTH ANGULAR] Invalida JSESSIONID y vuelve al login de Angular.
  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.cdr.markForCheck();
    this.authService
      .logout()
      .pipe(
        finalize(() => {
          this.isLoggingOut = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/login']);
        },
        error: () => {
          void this.router.navigate(['/login']);
        },
      });
  }
}
