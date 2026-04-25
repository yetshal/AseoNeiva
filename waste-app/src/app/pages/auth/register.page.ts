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
          <!-- Name Field -->
          <div class="form-field">
            <label>Nombre completo</label>
            <div class="input-wrapper">
              <input 
                type="text" 
                formControlName="name" 
                placeholder="Tu nombre completo"
                [class.is-invalid]="isFieldInvalid('name')">
            </div>
            <span class="error" *ngIf="isFieldInvalid('name')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              El nombre es obligatorio (mínimo 2 caracteres)
            </span>
          </div>

          <!-- Email Field -->
          <div class="form-field">
            <label>Correo electrónico</label>
            <div class="input-wrapper">
              <input 
                type="email" 
                formControlName="email" 
                placeholder="tu.correo@email.com"
                [class.is-invalid]="isFieldInvalid('email')">
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

          <!-- Phone Field (Optional) -->
          <div class="form-field">
            <label>Teléfono <span class="optional">(opcional)</span></label>
            <div class="input-wrapper">
              <input type="tel" formControlName="phone" placeholder="3001234567">
            </div>
          </div>

          <!-- Address Field (Optional) -->
          <div class="form-field">
            <label>Dirección <span class="optional">(opcional)</span></label>
            <div class="input-wrapper">
              <input type="text" formControlName="address" placeholder="Tu dirección">
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-field">
            <div class="label-wrapper">
              <label>Contraseña</label>
              <button type="button" class="show-password-btn" (click)="togglePasswordVisibility('password')">
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
                placeholder="Mínimo 6 caracteres"
                (input)="updatePasswordStrength()"
                [class.is-invalid]="isFieldInvalid('password')">
            </div>
            
            <!-- Password Strength Indicator -->
            <div class="password-strength" *ngIf="registerForm.get('password')?.value">
              <div class="strength-bar">
                <div class="strength-fill" [ngClass]="'strength-' + passwordStrength" [style.width]="strengthPercentage + '%'"></div>
              </div>
              <span class="strength-text" [ngClass]="'strength-' + passwordStrength">
                {{ getPasswordStrengthText() }}
              </span>
            </div>

            <span class="error" *ngIf="isFieldInvalid('password')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Mínimo 6 caracteres
            </span>
          </div>

          <!-- Confirm Password Field -->
          <div class="form-field">
            <div class="label-wrapper">
              <label>Confirmar contraseña</label>
              <button type="button" class="show-password-btn" (click)="togglePasswordVisibility('confirm')">
                <svg *ngIf="!showConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="showConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div class="input-wrapper">
              <input 
                [type]="showConfirmPassword ? 'text' : 'password'" 
                formControlName="confirmPassword" 
                placeholder="••••••••"
                [class.is-invalid]="isFieldInvalid('confirmPassword')">
              <span class="input-icon" *ngIf="passwordsMatch() && registerForm.get('confirmPassword')?.value">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </span>
            </div>
            <span class="error" *ngIf="isFieldInvalid('confirmPassword')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Las contraseñas no coinciden
            </span>
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
          <button type="submit" class="btn-primary" [disabled]="loading || registerForm.invalid">
            <span *ngIf="!loading" class="btn-text">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Crear cuenta
            </span>
            <span *ngIf="loading" class="btn-loading">
              <span class="spinner"></span>
              Creando...
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <span>¿Ya tienes cuenta?</span>
          <button type="button" class="link-btn" (click)="goToLogin()">Inicia sesión aquí</button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    :host { --primary-color: #1D9E75; --danger-color: #D85A30; --warning-color: #F59E0B; --success-color: #10B981; }

    .auth-content {
      --background: linear-gradient(135deg, #f9f9f7 0%, #f0f7f4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .auth-container {
      width: 100%;
      max-width: 400px;
      padding: 24px;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .auth-header {
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
    }

    .back-btn:hover {
      border-color: var(--primary-color);
      background: #f0fdf9;
    }

    .back-btn svg { width: 18px; height: 18px; color: #666; }

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
      line-height: 1.4;
    }

    .auth-form {
      background: white;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;
    }

    .form-field { margin-bottom: 18px; }

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

    .optional {
      font-size: 11px;
      font-weight: 400;
      color: #999;
      text-transform: lowercase;
      letter-spacing: 0;
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
      color: var(--success-color);
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    .input-icon svg { width: 18px; height: 18px; }

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

    .password-strength {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .strength-bar {
      height: 4px;
      background: #e8e8e8;
      border-radius: 2px;
      overflow: hidden;
    }

    .strength-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .strength-fill.strength-weak { background: #D85A30; }
    .strength-fill.strength-fair { background: #F59E0B; }
    .strength-fill.strength-good { background: #3B82F6; }
    .strength-fill.strength-strong { background: #10B981; }

    .strength-text {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: color 0.3s ease;
    }

    .strength-text.strength-weak { color: #D85A30; }
    .strength-text.strength-fair { color: #F59E0B; }
    .strength-text.strength-good { color: #3B82F6; }
    .strength-text.strength-strong { color: #10B981; }

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
      margin-top: 8px;
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
    return !!(field && field.touched && field.invalid);
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
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

  passwordsMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    return password && confirm && password === confirm;
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

    const { confirmPassword, ...data } = this.registerForm.value;

    this.auth.register(data).subscribe({
      next: (res) => {
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
