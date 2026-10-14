
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      username: ['vigilante', Validators.required],
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

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username, password).subscribe({
      next: () => {
        this.isSubmitting = false;
        void this.router.navigate(['/menu']);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;

        this.errorMessage =
          error.status === 401 || error.status === 403
            ? 'Credenciales inválidas o usuario inactivo. Verifique correo, identificación o nombre y contraseña.'
            : 'No fue posible iniciar sesión. Intente nuevamente.';
      },
    });
  }
}
