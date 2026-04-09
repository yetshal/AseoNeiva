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
          <h1 class="app-title">AseoNeiva</h1>
          <p class="app-subtitle">Gestión inteligente de residuos</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-field">
            <label>Correo electrónico</label>
            <input type="email" formControlName="email" placeholder="tucorreo@email.com">
            <span class="error" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
              Ingresa un correo válido
            </span>
          </div>

          <div class="form-field">
            <label>Contraseña</label>
            <input type="password" formControlName="password" placeholder="••••••••">
            <span class="error" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
              La contraseña es obligatoria
            </span>
          </div>

          <button type="button" class="forgot-link" (click)="goToRecovery()">¿Olvidaste tu contraseña?</button>

          <div class="error-banner" *ngIf="error">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading || loginForm.invalid">
            <span *ngIf="!loading">Iniciar sesión</span>
            <span *ngIf="loading">Cargando...</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>¿No tienes cuenta?</span>
          <button type="button" (click)="goToRegister()">Regístrate</button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-content {
      --background: #f9f9f7;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-container {
      width: 100%;
      max-width: 360px;
      padding: 24px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-icon {
      width: 64px;
      height: 64px;
      background: #1D9E75;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: white;
      svg { width: 36px; height: 36px; }
    }

    .app-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 4px;
      color: #1D9E75;
    }

    .app-subtitle {
      font-size: 14px;
      color: #888;
      margin: 0;
    }

    .auth-form {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }

    .form-field {
      margin-bottom: 16px;
    }

    .form-field label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #555;
      margin-bottom: 6px;
    }

    .form-field input {
      width: 100%;
      height: 44px;
      padding: 0 14px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
    }

    .form-field input:focus {
      border-color: #1D9E75;
    }

    .form-field .error {
      display: block;
      font-size: 12px;
      color: #D85A30;
      margin-top: 4px;
    }

    .forgot-link {
      background: none;
      border: none;
      color: #1D9E75;
      font-size: 13px;
      cursor: pointer;
      padding: 0;
      margin-bottom: 16px;
      display: block;
      text-align: right;
      width: 100%;
    }

    .error-banner {
      background: #FEE2E2;
      color: #991B1B;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .btn-primary {
      width: 100%;
      height: 48px;
      background: #1D9E75;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-primary:disabled {
      opacity: 0.6;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #888;
    }

    .auth-footer button {
      background: none;
      border: none;
      color: #1D9E75;
      font-weight: 500;
      cursor: pointer;
      margin-left: 4px;
    }
  `]
})
export class LoginPage {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    console.log('Login attempt with:', this.loginForm.value);

    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
        console.log('Login success:', res);
        this.router.navigate(['/tabs/home']);
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.error = err.message || err.error?.message || 'Error al iniciar sesión';
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
