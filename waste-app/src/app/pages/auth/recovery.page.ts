import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule],
  template: `
    <ion-content class="auth-content">
      <div class="auth-container">
        <div class="auth-header">
          <button class="back-btn" (click)="goBack()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="recovery-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h1 class="page-title">Recuperar acceso</h1>
          <p class="page-sub">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        <form [formGroup]="recoveryForm" (ngSubmit)="onRecovery()" class="auth-form">
          <div class="form-field">
            <label>Correo electrónico</label>
            <div class="input-wrapper">
              <input 
                type="email" 
                formControlName="email" 
                placeholder="tu.correo@email.com"
                [class.is-invalid]="isFieldInvalid('email')">
              <span class="input-icon" *ngIf="!isFieldInvalid('email') && recoveryForm.get('email')?.value">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.5-18 11.6 2.2.1 4.4-.5 6-1.5-5.5 0-9.5-4-11.5-9 1.7.2 3.4 0 5-.5C5.5 7.5 0 4.5 0 4s2.7 10.5 9.6 1.5c-1.3.7-2.5 2-2.5 4.2 0 3 2.6 4.6 5 4.6-1.2 1-2.6 1.5-4 1.5 1.5 1 3 2 4.6 1.6 1.5-1 2.8-4 2-6.6-.5-1-1-2-2-3 1.3 1.2 2.4 2.5 2.5 4.5z"/>
                </svg>
              </span>
            </div>
            <span class="error" *ngIf="isFieldInvalid('email')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Ingresa un correo válido
            </span>
          </div>

          <!-- Success Message -->
          <div class="success-banner" *ngIf="success">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <div>
              <p class="success-title">Enlace enviado</p>
              <p class="success-text">{{ success }}</p>
            </div>
          </div>

          <!-- Error Banner -->
          <div class="error-banner" *ngIf="error">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12" stroke="white" stroke-width="2"></line>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" stroke-width="2"></line>
            </svg>
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-primary" [disabled]="loading || recoveryForm.invalid">
            <span *ngIf="!loading" class="btn-text">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Enviar enlace
            </span>
            <span *ngIf="loading" class="btn-loading">
              <span class="spinner"></span>
              Enviando...
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <button type="button" class="link-btn" (click)="goToLogin()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver a iniciar sesión
          </button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    :host { --primary-color: #1D9E75; --danger-color: #D85A30; --success-color: #10B981; }

    .auth-content {
      --background: linear-gradient(135deg, #f9f9f7 0%, #f0f7f4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .auth-container {
      width: 100%;
      max-width: 380px;
      padding: 24px;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .auth-header {
      text-align: center;
      margin-bottom: 28px;
      animation: fadeIn 0.6s ease-out 0.1s backwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .back-btn {
      width: 36px;
      height: 36px;
      background: white;
      border: 2px solid #e8e8e8;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-bottom: 16px;
      transition: all 0.2s;
      margin-left: auto;
      margin-right: auto;
      display: flex;
    }

    .back-btn:hover {
      border-color: var(--primary-color);
      background: #f0fdf9;
    }

    .back-btn svg { width: 18px; height: 18px; color: #666; }

    .recovery-icon {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: white;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
      animation: bounce 0.6s ease-out;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .recovery-icon svg { width: 40px; height: 40px; stroke-width: 1.5; }

    .page-title {
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }

    .page-sub {
      font-size: 14px;
      color: #999;
      margin: 0;
      line-height: 1.5;
    }

    .auth-form {
      background: white;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;
    }

    .form-field { margin-bottom: 18px; }

    .form-field label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrapper input {
      width: 100%;
      height: 44px;
      padding: 0 14px;
      border: 2px solid #e8e8e8;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .input-wrapper input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(29, 158, 117, 0.08);
      background: #fafbfa;
    }

    .input-wrapper input.is-invalid {
      border-color: var(--danger-color);
    }

    .input-wrapper input.is-invalid:focus {
      box-shadow: 0 0 0 3px rgba(216, 90, 48, 0.08);
    }

    .input-icon {
      position: absolute;
      right: 12px;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    .input-icon svg { width: 18px; height: 18px; stroke-width: 2; }

    .error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--danger-color);
      margin-top: 6px;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .error-icon { width: 14px; height: 14px; min-width: 14px; }

    .success-banner {
      background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
      border-left: 4px solid var(--success-color);
      color: #065F46;
      border-radius: 8px;
      padding: 14px;
      font-size: 13px;
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      animation: slideDown 0.3s ease-out;
    }

    .success-banner svg { width: 20px; height: 20px; min-width: 20px; margin-top: 2px; }

    .success-title {
      font-weight: 600;
      margin: 0 0 4px;
      font-size: 13px;
    }

    .success-text {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
    }

    .error-banner {
      background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
      border-left: 4px solid var(--danger-color);
      color: #991B1B;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 13px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideDown 0.3s ease-out;
    }

    .error-banner svg { width: 18px; height: 18px; min-width: 18px; }

    .btn-primary {
      width: 100%;
      height: 48px;
      background: linear-gradient(135deg, var(--primary-color) 0%, #168b5f 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(29, 158, 117, 0.2);
      overflow: hidden;
      position: relative;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(29, 158, 117, 0.3);
    }

    .btn-primary:active:not(:disabled) { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-text, .btn-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-primary svg { width: 18px; height: 18px; stroke-width: 2; }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      animation: fadeIn 0.6s ease-out 0.2s backwards;
    }

    .link-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      transition: all 0.2s;
      text-decoration: none;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-bottom: 2px solid transparent;
    }

    .link-btn:hover {
      color: #168b5f;
      border-bottom-color: #168b5f;
    }

    .link-btn svg { width: 16px; height: 16px; }
  `]
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
        this.success = res.message || 'Revisa tu correo para recuperar tu acceso';
        // Redirigir a login después de 2 segundos
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
