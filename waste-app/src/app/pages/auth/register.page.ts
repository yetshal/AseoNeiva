import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule],
  template: `
    <ion-content [fullscreen]="true" class="auth-content">
      <main class="auth-shell auth-shell-scroll">
        <section class="auth-brand-panel compact">
          <div class="auth-topline">
            <button type="button" class="icon-button" (click)="goBack()">
              <ion-icon name="arrow-back-outline"></ion-icon>
            </button>
            <span class="auth-badge">Registro ciudadano</span>
          </div>

          <h1 class="auth-title">Crea tu cuenta</h1>
          <p class="auth-copy">
            Guarda tu dirección, configura horarios y participa con reportes verificados.
          </p>
        </section>

        <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form-card app-panel app-panel-strong">
          <h2 class="auth-form-title">Datos principales</h2>
          <p class="auth-form-subtitle">Usaremos esta información para personalizar el servicio.</p>

          <div class="app-field">
            <label class="app-label" for="register-name">Nombre completo</label>
            <div class="app-input-shell" [class.is-invalid]="isFieldInvalid('name')">
              <ion-icon name="person-outline"></ion-icon>
              <input
                id="register-name"
                type="text"
                formControlName="name"
                autocomplete="name"
                placeholder="Tu nombre completo">
            </div>
            <div class="app-error" *ngIf="isFieldInvalid('name')">
              <ion-icon name="alert-circle-outline"></ion-icon>
              El nombre debe tener mínimo 2 caracteres.
            </div>
          </div>

          <div class="app-field">
            <label class="app-label" for="register-email">Correo electrónico</label>
            <div class="app-input-shell" [class.is-invalid]="isFieldInvalid('email')">
              <ion-icon name="mail-outline"></ion-icon>
              <input
                id="register-email"
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
            <label class="app-label" for="register-phone">Teléfono opcional</label>
            <div class="app-input-shell">
              <ion-icon name="call-outline"></ion-icon>
              <input
                id="register-phone"
                type="tel"
                formControlName="phone"
                inputmode="tel"
                autocomplete="tel"
                placeholder="3001234567">
            </div>
          </div>

          <div class="app-field">
            <label class="app-label" for="register-address">Dirección opcional</label>
            <div class="app-input-shell">
              <ion-icon name="location-outline"></ion-icon>
              <input
                id="register-address"
                type="text"
                formControlName="address"
                autocomplete="street-address"
                placeholder="Barrio, calle o referencia">
            </div>
          </div>

          <div class="app-field">
            <div class="app-field-row">
              <label class="app-label" for="register-password">Contraseña</label>
              <button type="button" class="app-link-button" (click)="togglePasswordVisibility('password')">
                {{ showPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
            <div class="app-input-shell" [class.is-invalid]="isFieldInvalid('password')">
              <ion-icon name="lock-closed-outline"></ion-icon>
              <input
                id="register-password"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                autocomplete="new-password"
                placeholder="Mínimo 6 caracteres"
                (input)="updatePasswordStrength()">
            </div>

            <div class="auth-password-strength" *ngIf="registerForm.get('password')?.value">
              <div class="auth-strength-track">
                <div
                  class="auth-strength-fill"
                  [ngClass]="'strength-' + passwordStrength"
                  [style.width]="strengthPercentage + '%'">
                </div>
              </div>
              <span class="auth-strength-text" [ngClass]="'strength-' + passwordStrength">
                {{ getPasswordStrengthText() }}
              </span>
            </div>

            <div class="app-error" *ngIf="isFieldInvalid('password')">
              <ion-icon name="alert-circle-outline"></ion-icon>
              La contraseña debe tener mínimo 6 caracteres.
            </div>
          </div>

          <div class="app-field">
            <div class="app-field-row">
              <label class="app-label" for="register-confirm">Confirmar contraseña</label>
              <button type="button" class="app-link-button" (click)="togglePasswordVisibility('confirm')">
                {{ showConfirmPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
            <div class="app-input-shell" [class.is-invalid]="isFieldInvalid('confirmPassword')">
              <ion-icon name="shield-checkmark-outline"></ion-icon>
              <input
                id="register-confirm"
                [type]="showConfirmPassword ? 'text' : 'password'"
                formControlName="confirmPassword"
                autocomplete="new-password"
                placeholder="Repite tu contraseña">
            </div>
            <div class="app-error" *ngIf="isFieldInvalid('confirmPassword')">
              <ion-icon name="alert-circle-outline"></ion-icon>
              Las contraseñas no coinciden.
            </div>
          </div>

          <div class="app-error" *ngIf="error">
            <ion-icon name="warning-outline"></ion-icon>
            {{ error }}
          </div>

          <button type="submit" class="app-button auth-submit" [disabled]="loading || registerForm.invalid">
            <ion-icon name="person-add-outline" *ngIf="!loading"></ion-icon>
            <ion-spinner name="crescent" *ngIf="loading"></ion-spinner>
            <span>{{ loading ? 'Creando...' : 'Crear cuenta' }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>¿Ya tienes cuenta?</span>
          <button type="button" class="app-link-button" (click)="goToLogin()">Iniciar sesión</button>
        </div>
      </main>
    </ion-content>
  `
})
export class RegisterPage {
  registerForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  strengthPercentage = 0;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    if (!field) return false;

    const passwordMismatch = fieldName === 'confirmPassword'
      && !!this.registerForm.errors?.['passwordMismatch']
      && field.touched;

    return !!((field.touched && field.invalid) || passwordMismatch);
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      return;
    }

    this.showConfirmPassword = !this.showConfirmPassword;
  }

  updatePasswordStrength(): void {
    const password = this.registerForm.get('password')?.value || '';
    const strength = this.calculatePasswordStrength(password);
    this.passwordStrength = strength.level;
    this.strengthPercentage = strength.percentage;
  }

  calculatePasswordStrength(password: string): { level: 'weak' | 'fair' | 'good' | 'strong'; percentage: number } {
    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', percentage: 25 };
    if (score <= 4) return { level: 'fair', percentage: 50 };
    if (score <= 6) return { level: 'good', percentage: 75 };
    return { level: 'strong', percentage: 100 };
  }

  getPasswordStrengthText(): string {
    const texts = {
      weak: 'Contraseña débil',
      fair: 'Contraseña aceptable',
      good: 'Contraseña buena',
      strong: 'Contraseña fuerte'
    };
    return texts[this.passwordStrength];
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const data = { ...this.registerForm.value };
    delete data.confirmPassword;

    this.auth.register(data).subscribe({
      next: () => {
        this.router.navigate(['/tabs/home']);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al crear cuenta. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
