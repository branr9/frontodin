import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/authservice';

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
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
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
    console.log('[AUTH] Enviando solicitud de inicio de sesión para:', username);

    this.authService.login(username, password).subscribe({
      next: (response) => {
        console.log('[AUTH] Inicio de sesión exitoso. Redirigiendo a /menu...', response);
        this.isSubmitting = false;
        this.cdr.markForCheck();
        this.router.navigate(['/menu']).then((navigated) => {
          console.log('[AUTH] Navegación a /menu completada:', navigated);
        }).catch((navErr) => {
          console.error('[AUTH] Error al navegar a /menu:', navErr);
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('[AUTH] Error al iniciar sesión:', error);
        this.isSubmitting = false;

        this.errorMessage =
          error.status === 401 || error.status === 403
            ? 'Credenciales inválidas o usuario inactivo. Verifique correo, identificación o nombre y contraseña.'
            : 'No fue posible iniciar sesión. Verifique la conexión con el servidor.';
        this.cdr.markForCheck();
      },
    });
  }
}
