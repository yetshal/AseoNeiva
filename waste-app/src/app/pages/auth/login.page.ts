import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule],
  template: `
    <ion-content [fullscreen]="true" class="auth-content">
      <main class="auth-shell">
        <section class="auth-brand-panel">
          <div class="auth-topline">
            <div class="auth-mark">
              <ion-icon name="leaf-outline"></ion-icon>
            </div>
            <span class="auth-badge">Ciudad limpia</span>
          </div>

          <h1 class="auth-title">AseoNeiva</h1>
          <p class="auth-copy">
            Consulta rutas, reporta puntos críticos y gana puntos por ayudar a mantener la ciudad en orden.
          </p>

          <div class="auth-metrics">
            <div class="auth-metric">
              <strong>24/7</strong>
              <span>Seguimiento</span>
            </div>
            <div class="auth-metric">
              <strong>+Eco</strong>
              <span>Reportes</span>
            </div>
            <div class="auth-metric">
              <strong>Neiva</strong>
              <span>Conectada</span>
            </div>
          </div>
        </section>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form-card app-panel app-panel-strong">
          <h2 class="auth-form-title">Iniciar sesión</h2>
          <p class="auth-form-subtitle">Entra para ver tu ruta, horario y estado de recolección.</p>

          <div class="app-field">
            <label class="app-label" for="login-email">Correo electrónico</label>
            <div class="app-input-shell" [class.is-invalid]="isFieldInvalid('email')">
              <ion-icon name="mail-outline"></ion-icon>
              <input
                id="login-email"
                type="email"
                formControlName="email"
                inputmode="email"
                autocomplete="email"
                placeholder="tu.correo@email.com">
            </div>
            <div class="app-error" *ngIf="isFieldInvalid('email')">
              <ion-icon name="alert-circle-outline"></ion-icon>
              Ingresa un correo válido.
            </div>
          </div>

          <div class="app-field">
            <div class="app-field-row">
              <label class="app-label" for="login-password">Contraseña</label>
              <button type="button" class="app-link-button" (click)="togglePasswordVisibility()">
                {{ showPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
            <div class="app-input-shell" [class.is-invalid]="isFieldInvalid('password')">
              <ion-icon name="lock-closed-outline"></ion-icon>
              <input
                id="login-password"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                autocomplete="current-password"
                placeholder="Tu contraseña">
            </div>
            <div class="app-error" *ngIf="isFieldInvalid('password')">
              <ion-icon name="alert-circle-outline"></ion-icon>
              La contraseña es obligatoria.
            </div>
          </div>

          <button type="button" class="app-link-button" (click)="goToRecovery()">
            ¿Olvidaste tu contraseña?
          </button>

          <div class="app-error" *ngIf="error">
            <ion-icon name="warning-outline"></ion-icon>
            {{ error }}
          </div>

          <button type="submit" class="app-button auth-submit" [disabled]="loading || loginForm.invalid">
            <ion-icon name="log-in-outline" *ngIf="!loading"></ion-icon>
            <ion-spinner name="crescent" *ngIf="loading"></ion-spinner>
            <span>{{ loading ? 'Verificando...' : 'Entrar a la app' }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>¿No tienes cuenta?</span>
          <button type="button" class="app-link-button" (click)="goToRegister()">Crear cuenta</button>
        </div>
      </main>
    </ion-content>
  `
})
export class LoginPage {
  loginForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.touched && field.invalid);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/tabs/home']);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al iniciar sesión. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToRecovery(): void {
    this.router.navigate(['/recovery']);
  }
}
