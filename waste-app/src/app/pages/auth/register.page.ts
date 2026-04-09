import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
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
          <h1 class="page-title">Crear cuenta</h1>
          <p class="page-sub">Regístrate para participar en el cuidado de tu ciudad</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
          <div class="form-field">
            <label>Nombre completo</label>
            <input type="text" formControlName="name" placeholder="Tu nombre completo">
            <span class="error" *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.invalid">
              El nombre es obligatorio
            </span>
          </div>

          <div class="form-field">
            <label>Correo electrónico</label>
            <input type="email" formControlName="email" placeholder="tucorreo@email.com">
            <span class="error" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
              Ingresa un correo válido
            </span>
          </div>

          <div class="form-field">
            <label>Teléfono (opcional)</label>
            <input type="tel" formControlName="phone" placeholder="3001234567">
          </div>

          <div class="form-field">
            <label>Dirección (opcional)</label>
            <input type="text" formControlName="address" placeholder="Tu dirección">
          </div>

          <div class="form-field">
            <label>Contraseña</label>
            <input type="password" formControlName="password" placeholder="Mínimo 6 caracteres">
            <span class="error" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
              Mínimo 6 caracteres
            </span>
          </div>

          <div class="form-field">
            <label>Confirmar contraseña</label>
            <input type="password" formControlName="confirmPassword" placeholder="••••••••">
            <span class="error" *ngIf="registerForm.get('confirmPassword')?.touched && registerForm.hasError('passwordMismatch')">
              Las contraseñas no coinciden
            </span>
          </div>

          <div class="error-banner" *ngIf="error">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading || registerForm.invalid">
            <span *ngIf="!loading">Crear cuenta</span>
            <span *ngIf="loading">Creando cuenta...</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>¿Ya tienes cuenta?</span>
          <button type="button" (click)="goToLogin()">Inicia sesión</button>
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
      margin-bottom: 14px;
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
      margin-top: 8px;
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
export class RegisterPage {
  registerForm: FormGroup;
  loading = false;
  error = '';

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

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';

    const { confirmPassword, ...data } = this.registerForm.value;
    console.log('Register data:', data);

    this.auth.register(data).subscribe({
      next: (res) => {
        console.log('Register success:', res);
        this.router.navigate(['/tabs/home']);
      },
      error: (err: any) => {
        console.error('Register error:', err);
        this.error = err.message || err.error?.message || 'Error al crear cuenta';
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
