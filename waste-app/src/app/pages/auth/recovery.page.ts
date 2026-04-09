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
          <h1 class="page-title">Recuperar contraseña</h1>
          <p class="page-sub">Ingresa tu correo y te enviaremos un enlace para recuperar tu acceso</p>
        </div>

        <form [formGroup]="recoveryForm" (ngSubmit)="onRecovery()" class="auth-form">
          <div class="form-field">
            <label>Correo electrónico</label>
            <input type="email" formControlName="email" placeholder="tucorreo@email.com">
            <span class="error" *ngIf="recoveryForm.get('email')?.touched && recoveryForm.get('email')?.invalid">
              Ingresa un correo válido
            </span>
          </div>

          <div class="success-banner" *ngIf="success">
            {{ success }}
          </div>

          <div class="error-banner" *ngIf="error">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading || recoveryForm.invalid">
            <span *ngIf="!loading">Enviar enlace</span>
            <span *ngIf="loading">Enviando...</span>
          </button>
        </form>

        <div class="auth-footer">
          <button type="button" (click)="goToLogin()">Volver a iniciar sesión</button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-content {
      --background: #f9f9f7;
      --padding-top: 16px;
    }

    .auth-container {
      width: 100%;
      max-width: 360px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .auth-header {
      margin-bottom: 24px;
    }

    .back-btn {
      width: 36px;
      height: 36px;
      background: white;
      border: 1px solid #ebebeb;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-bottom: 16px;
      svg { width: 18px; height: 18px; color: #666; }
    }

    .page-title {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 4px;
    }

    .page-sub {
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

    .success-banner {
      background: #E1F5EE;
      color: #0F6E56;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 16px;
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
    }

    .auth-footer button {
      background: none;
      border: none;
      color: #1D9E75;
      font-weight: 500;
      cursor: pointer;
    }
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

  onRecovery(): void {
    if (this.recoveryForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.auth.recovery(this.recoveryForm.value.email).subscribe({
      next: (res: any) => {
        this.success = res.message;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al procesar solicitud';
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
