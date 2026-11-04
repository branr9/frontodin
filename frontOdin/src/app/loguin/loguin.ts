import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../services/authservice';
import { OdinDataService } from '../services/odin-data.service';

@Component({
  selector: 'app-loguin',
  imports: [ReactiveFormsModule],
  templateUrl: './loguin.html',
  styleUrl: './loguin.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Loguin {
  readonly loginForm: FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
  }>;

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly odinData: OdinDataService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      username: ['admin@odin.com', Validators.required],
      password: ['Admin123*', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const { username, password } = this.loginForm.getRawValue();
    const userTrim = username.trim();

    this.authService
      .login(userTrim, password)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.setLoggedUser(userTrim);
          void this.router.navigate(['/menu']);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            this.errorMessage =
              'Credenciales inválidas o usuario inactivo. Verifique correo, identificación o nombre y contraseña.';
            this.cdr.markForCheck();
            return;
          }
          // Modo frontend autónomo cuando el backend Spring Boot está desactivado
          this.setLoggedUser(userTrim);
          void this.router.navigate(['/menu']);
        },
      });
  }

  private setLoggedUser(loginInput: string): void {
    const match = this.odinData
      .usuarios()
      .find(
        (u) =>
          u.correo.toLowerCase() === loginInput.toLowerCase() ||
          u.num_identificacion === loginInput ||
          u.nombre.toLowerCase() === loginInput.toLowerCase(),
      );
    if (match) {
      this.odinData.currentUser.set({
        nombre: match.nombre,
        correo: match.correo,
        inicial: match.nombre.charAt(0).toUpperCase(),
      });
    } else {
      this.odinData.currentUser.set({
        nombre: loginInput || 'Administrador',
        correo: loginInput.includes('@') ? loginInput : 'admin@odin.com',
        inicial: (loginInput.charAt(0) || 'A').toUpperCase(),
      });
    }
  }
}
