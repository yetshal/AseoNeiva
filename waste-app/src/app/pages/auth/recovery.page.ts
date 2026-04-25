import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule],
  template: `
    <ion-content [fullscreen]="true" class="auth-content">
      <main class="auth-shell">
        <section class="auth-brand-panel compact">
          <div class="auth-topline">
            <button type="button" class="icon-button" (click)="goBack()">
              <ion-icon name="arrow-back-outline"></ion-icon>
            </button>
            <span class="auth-badge">Acceso seguro</span>
          </div>

          <div class="auth-mark">
            <ion-icon name="key-outline"></ion-icon>
          </div>
          <h1 class="auth-title">Recuperar acceso</h1>
          <p class="auth-copy">
            Te enviaremos las instrucciones para restablecer tu contraseña y volver a tu cuenta.
          </p>
        </section>

        <form [formGroup]="recoveryForm" (ngSubmit)="onRecovery()" class="auth-form-card app-panel app-panel-strong">
          <h2 class="auth-form-title">Correo de recuperación</h2>
          <p class="auth-form-subtitle">Escribe el correo registrado en AseoNeiva.</p>

          <div class="app-field">
            <label class="app-label" for="recovery-email">Correo electrónico</label>
            <div class="app-input-shell" [class.is-invalid]="isFieldInvalid('email')">
              <ion-icon name="mail-outline"></ion-icon>
              <input
                id="recovery-email"
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

          <div class="app-success" *ngIf="success">
            <ion-icon name="checkmark-circle-outline"></ion-icon>
            <span>{{ success }}</span>
          </div>

          <div class="app-error" *ngIf="error">
            <ion-icon name="warning-outline"></ion-icon>
            {{ error }}
          </div>

          <button type="submit" class="app-button auth-submit" [disabled]="loading || recoveryForm.invalid">
            <ion-icon name="send-outline" *ngIf="!loading"></ion-icon>
            <ion-spinner name="crescent" *ngIf="loading"></ion-spinner>
            <span>{{ loading ? 'Enviando...' : 'Enviar enlace' }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <button type="button" class="app-link-button" (click)="goToLogin()">Volver a iniciar sesión</button>
        </div>
      </main>
    </ion-content>
  `
})
export class RecoveryPage {
  recoveryForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.recoveryForm.get(fieldName);
    return !!(field && field.touched && field.invalid);
  }

  onRecovery(): void {
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.auth.recovery(this.recoveryForm.value.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.success = res.message || 'Revisa tu correo para recuperar tu acceso.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'No pudimos encontrar tu cuenta. Intenta de nuevo.';
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
