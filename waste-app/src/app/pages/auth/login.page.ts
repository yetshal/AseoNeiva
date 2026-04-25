import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule],
  template: `
    <ion-content class="auth-content">
      <div class="auth-container">
        <div class="auth-header">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3L20 8V16L12 21L4 16V8L12 3Z" stroke="currentColor" stroke-width="2" fill="none"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </div>
          <h1 class="app-title">Bienvenido</h1>
          <p class="app-subtitle">AseoNeiva - Gestión inteligente de residuos</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
          <!-- Email Field -->
          <div class="form-field">
            <label>Correo electrónico</label>
            <div class="input-wrapper">
              <input 
                type="email" 
                formControlName="email" 
                placeholder="tu.correo@email.com"
                [class.is-invalid]="isFieldInvalid('email')">
              <span class="input-icon" *ngIf="!isFieldInvalid('email')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.5-18 11.6 2.2.1 4.4-.5 6-1.5-5.5 0-9.5-4-11.5-9 1.7.2 3.4 0 5-.5C5.5 7.5 0 4.5 0 4s2.7 10.5a10 10 0 0 0 9.6 1.5c-1.3.7-2.5 2-2.5 4.2 0 3 2.6 4.6 5 4.6-1.2 1-2.6 1.5-4 1.5 1.5 1 3 2 4.6 1.6 1.5-1 2.8-4 2-6.6-.5-1-1-2-2-3 1.3 1.2 2.4 2.5 2.5 4.5z"/>
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

          <!-- Password Field -->
          <div class="form-field">
            <div class="label-wrapper">
              <label>Contraseña</label>
              <button type="button" class="show-password-btn" (click)="togglePasswordVisibility()">
                <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div class="input-wrapper">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password" 
                placeholder="••••••••"
                [class.is-invalid]="isFieldInvalid('password')">
            </div>
            <span class="error" *ngIf="isFieldInvalid('password')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              La contraseña es obligatoria
            </span>
          </div>

          <!-- Forgot Password Link -->
          <button type="button" class="forgot-link" (click)="goToRecovery()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ¿Olvidaste tu contraseña?
          </button>

          <!-- Error Banner -->
          <div class="error-banner" *ngIf="error" [@slideDown]>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12" stroke="white" stroke-width="2"></line>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" stroke-width="2"></line>
            </svg>
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-primary" [disabled]="loading || loginForm.invalid">
            <span *ngIf="!loading" class="btn-text">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Iniciar sesión
            </span>
            <span *ngIf="loading" class="btn-loading">
              <span class="spinner"></span>
              Verificando...
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <span>¿No tienes cuenta?</span>
          <button type="button" class="link-btn" (click)="goToRegister()">Regístrate aquí</button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    :host { --primary-color: #1D9E75; --danger-color: #D85A30; }

    .auth-content {
      --background: linear-gradient(135deg, #f9f9f7 0%, #f0f7f4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .auth-container {
      width: 100%;
      max-width: 360px;
      padding: 24px;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
      animation: fadeIn 0.6s ease-out 0.1s backwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .logo-icon {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, var(--primary-color) 0%, #16a962 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: white;
      box-shadow: 0 4px 15px rgba(29, 158, 117, 0.2);
      animation: bounce 0.6s ease-out;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .logo-icon svg { width: 40px; height: 40px; }

    .app-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }

    .app-subtitle {
      font-size: 14px;
      color: #999;
      margin: 0;
      font-weight: 500;
    }

    .auth-form {
      background: white;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;
    }

    .form-field { margin-bottom: 20px; }

    .label-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .form-field label {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .show-password-btn {
      background: none;
      border: none;
      width: 20px;
      height: 20px;
      cursor: pointer;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: color 0.2s;
    }

    .show-password-btn:hover { color: var(--primary-color); }
    .show-password-btn svg { width: 18px; height: 18px; stroke-width: 2; }

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
      color: #1D9E75;
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

    .forgot-link {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 13px;
      cursor: pointer;
      padding: 0;
      margin-bottom: 16px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      transition: color 0.2s;
      width: 100%;
      justify-content: flex-end;
    }

    .forgot-link:hover { color: #168b5f; }
    .forgot-link svg { width: 16px; height: 16px; stroke-width: 2; }

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

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

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
      font-size: 14px;
      color: #999;
      animation: fadeIn 0.6s ease-out 0.2s backwards;
    }

    .link-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      margin-left: 4px;
      transition: all 0.2s;
      text-decoration: none;
      border-bottom: 2px solid transparent;
    }

    .link-btn:hover {
      color: #168b5f;
      border-bottom-color: #168b5f;
    }
  `]
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
      next: (res) => {
        console.log('Login success:', res);
        this.router.navigate(['/tabs/home']);
      },
      error: (err: any) => {
        console.error('Login error:', err);
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
