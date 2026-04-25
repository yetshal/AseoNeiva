import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from '../../services/auth.service';
import { Achievement, GamificationService, WeeklyStreak } from '../../services/gamification.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header class="ion-no-border edit-modal-header">
      <ion-toolbar>
        <ion-title>Editar perfil</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="edit-modal-content">
      <div class="edit-shell">
        <div class="edit-intro app-panel app-panel-strong">
          <div class="edit-avatar">{{ getInitials() }}</div>
          <div>
            <span class="app-eyebrow">Cuenta ciudadana</span>
            <h2>{{ editData.name || 'Usuario' }}</h2>
          </div>
        </div>

        <div class="edit-form app-panel app-panel-strong">
          <div class="app-field">
            <label class="app-label" for="edit-name">Nombre completo</label>
            <div class="app-input-shell">
              <ion-icon name="person-outline"></ion-icon>
              <input id="edit-name" [(ngModel)]="editData.name" type="text">
            </div>
          </div>

          <div class="app-field">
            <label class="app-label" for="edit-phone">Teléfono</label>
            <div class="app-input-shell">
              <ion-icon name="call-outline"></ion-icon>
              <input id="edit-phone" [(ngModel)]="editData.phone" type="tel">
            </div>
          </div>

          <div class="app-field">
            <label class="app-label" for="edit-address">Dirección</label>
            <div class="app-input-shell">
              <ion-icon name="location-outline"></ion-icon>
              <input id="edit-address" [(ngModel)]="editData.address" type="text">
            </div>
          </div>

          <button class="app-button save-profile-btn" type="button" (click)="save()" [disabled]="loading">
            <ion-spinner name="crescent" *ngIf="loading"></ion-spinner>
            <ion-icon name="save-outline" *ngIf="!loading"></ion-icon>
            <span>{{ loading ? 'Guardando...' : 'Guardar cambios' }}</span>
          </button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .edit-modal-header ion-toolbar {
      --background: transparent;
      --border-width: 0;
    }

    .edit-modal-content {
      --background: linear-gradient(145deg, rgba(238, 246, 244, 1) 0%, rgba(238, 243, 255, 1) 100%);
    }

    .edit-shell {
      padding: 18px;
      display: grid;
      gap: 14px;
    }

    .edit-intro {
      padding: 18px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .edit-avatar {
      width: 58px;
      height: 58px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      background: linear-gradient(135deg, var(--app-green), var(--app-blue));
      font-size: 18px;
      font-weight: 950;
      box-shadow: 0 14px 26px rgba(20, 143, 120, 0.24);
      flex-shrink: 0;
    }

    .edit-intro h2 {
      margin: 4px 0 0;
      color: var(--app-ink);
      font-size: 19px;
      font-weight: 950;
    }

    .edit-form {
      padding: 20px;
    }

    .save-profile-btn {
      width: 100%;
    }
  `]
})
export class EditProfileModal implements OnInit {
  @Input() user!: User;
  editData: any = {};
  loading = false;

  private modalCtrl = inject(ModalController);
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);

  ngOnInit() {
    this.editData = {
      name: this.user?.name || '',
      phone: this.user?.phone || '',
      address: this.user?.address || ''
    };
  }

  getInitials(): string {
    if (!this.editData.name) return 'U';
    return this.editData.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.loading = true;
    this.auth.updateProfile(this.editData).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Perfil actualizado con éxito', 'success');
        this.modalCtrl.dismiss(true);
      },
      error: () => {
        this.loading = false;
        this.showToast('Error al actualizar perfil', 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 2000, position: 'top' });
    t.present();
  }
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header class="ion-no-border app-page-header profile-top-header">
      <ion-toolbar>
        <div class="app-toolbar-shell">
          <div class="app-toolbar-card">
            <div class="app-toolbar-copy">
              <span class="app-toolbar-eyebrow">Cuenta</span>
              <div class="app-toolbar-title-row">
                <h1 class="app-toolbar-title">Mi perfil</h1>
                <span class="app-toolbar-chip">{{ achievementsCount }} logros</span>
              </div>
            </div>

            <div class="app-toolbar-actions">
              <button class="app-toolbar-icon-button emphasis" type="button" (click)="goToSettings()">
                <ion-icon name="settings-outline"></ion-icon>
              </button>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="profile-content">
      <main class="profile-shell">
        <section class="profile-hero">
          <div class="avatar-section">
            <div class="profile-avatar" *ngIf="!user?.avatar_url">{{ getUserInitials() }}</div>
            <img [src]="user?.avatar_url" class="profile-avatar-img" *ngIf="user?.avatar_url" alt="Foto de perfil">
            <button class="edit-avatar" type="button" (click)="editAvatar()">
              <ion-icon name="camera"></ion-icon>
            </button>
          </div>

          <h2>{{ user?.name || 'Usuario' }}</h2>
          <p>{{ user?.email }}</p>

          <div class="level-chip">
            <span>Nivel {{ user?.level || 1 }}</span>
            <strong>{{ getLevelTitle() }}</strong>
          </div>
        </section>

        <section class="profile-body">
          <div class="stats-grid">
            <article class="stat-card app-panel">
              <span class="stat-icon points"><ion-icon name="sparkles-outline"></ion-icon></span>
              <strong>{{ user?.points || 0 }}</strong>
              <span>Puntos</span>
            </article>
            <article class="stat-card app-panel">
              <span class="stat-icon streak"><ion-icon name="flame-outline"></ion-icon></span>
              <strong>{{ user?.streak || 0 }}</strong>
              <span>Racha</span>
            </article>
            <article class="stat-card app-panel">
              <span class="stat-icon badge"><ion-icon name="ribbon-outline"></ion-icon></span>
              <strong>{{ achievementsCount }}</strong>
              <span>Logros</span>
            </article>
          </div>

          <section class="profile-section app-panel app-panel-strong animate-rise">
            <div class="section-title-row">
              <div>
                <span class="app-eyebrow">Progreso</span>
                <h3>Próximo nivel</h3>
              </div>
              <strong>{{ progressToNextLevel }}%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="progressToNextLevel"></div>
            </div>
            <p>Te faltan <b>{{ pointsToNextLevel }} puntos</b> para el siguiente rango.</p>
          </section>

          <section class="profile-section app-panel app-panel-strong animate-rise">
            <div class="section-title-row">
              <div>
                <span class="app-eyebrow">Actividad</span>
                <h3>Semana actual</h3>
              </div>
            </div>
            <div class="streak-grid">
              @for (day of weeklyStreak; track day.day) {
                <div class="day-item" [class.active]="day.completed">
                  <span></span>
                  <strong>{{ day.day.substring(0, 1) }}</strong>
                </div>
              }
            </div>
          </section>

          <section class="profile-section app-panel app-panel-strong animate-rise">
            <div class="section-title-row">
              <div>
                <span class="app-eyebrow">Reconocimientos</span>
                <h3>Logros destacados</h3>
              </div>
              <button type="button" class="app-link-button" (click)="showAllAchievements()">Ver todos</button>
            </div>

            <div class="achievement-list">
              @for (achievement of unlockedAchievements; track achievement.id) {
                <article class="achievement-row">
                  <span class="achievement-icon">{{ achievement.icon }}</span>
                  <div>
                    <strong>{{ achievement.name }}</strong>
                    <p>{{ achievement.description }}</p>
                  </div>
                  <ion-icon name="ribbon" class="achievement-medal"></ion-icon>
                </article>
              } @empty {
                <div class="empty-achievement">
                  <ion-icon name="medal-outline"></ion-icon>
                  <span>Realiza reportes para ganar tu primer logro.</span>
                </div>
              }
            </div>
          </section>

          <section class="action-list">
            <button class="profile-action app-panel" type="button" (click)="goToSettings()">
              <span class="action-icon"><ion-icon name="person-outline"></ion-icon></span>
              <strong>Editar perfil</strong>
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>

            <button class="profile-action app-panel" type="button" (click)="goToHistory()">
              <span class="action-icon blue"><ion-icon name="document-text-outline"></ion-icon></span>
              <strong>Historial de reportes</strong>
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>

            <button class="profile-action logout app-panel" type="button" (click)="logout()">
              <span class="action-icon coral"><ion-icon name="log-out-outline"></ion-icon></span>
              <strong>Cerrar sesión</strong>
            </button>
          </section>
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    .profile-top-header .app-toolbar-shell {
      padding-bottom: 8px;
    }

    .profile-content {
      --background: var(--app-bg);
    }

    .profile-shell {
      padding-bottom: 104px;
    }

    .profile-hero {
      position: relative;
      overflow: hidden;
      margin: 0 16px;
      border-radius: 0 0 34px 34px;
      padding: 34px 20px 48px;
      text-align: center;
      color: #ffffff;
      background: linear-gradient(135deg, rgba(16, 35, 63, 0.98) 0%, rgba(20, 143, 120, 0.94) 52%, rgba(30, 107, 214, 0.9) 100%);
      box-shadow: var(--app-shadow-lg);
    }

    .profile-hero::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 42%;
      background: linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.12));
      pointer-events: none;
    }

    .profile-hero > * {
      position: relative;
      z-index: 1;
    }

    .avatar-section {
      position: relative;
      width: 104px;
      height: 104px;
      margin: 0 auto 16px;
    }

    .profile-avatar,
    .profile-avatar-img {
      width: 104px;
      height: 104px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.95);
      color: var(--app-green-dark);
      font-size: 36px;
      font-weight: 950;
      object-fit: cover;
      box-shadow: 0 18px 34px rgba(16, 35, 63, 0.22);
    }

    .edit-avatar {
      position: absolute;
      right: -2px;
      bottom: -2px;
      width: 38px;
      height: 38px;
      border: 0;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      color: var(--app-green-dark);
      box-shadow: 0 12px 22px rgba(16, 35, 63, 0.24);
    }

    .profile-hero h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 950;
    }

    .profile-hero p {
      margin: 5px 0 18px;
      color: rgba(255, 255, 255, 0.78);
      font-size: 13px;
    }

    .level-chip {
      display: inline-flex;
      flex-direction: column;
      gap: 2px;
      min-width: 150px;
      border-radius: 18px;
      padding: 10px 18px;
      background: rgba(255, 255, 255, 0.14);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .level-chip span {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .level-chip strong {
      font-size: 14px;
      font-weight: 900;
    }

    .profile-body {
      margin-top: -26px;
      padding: 0 16px;
      display: grid;
      gap: 16px;
      position: relative;
      z-index: 2;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .stat-card {
      min-height: 132px;
      padding: 14px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 7px;
      text-align: center;
    }

    .stat-icon {
      width: 42px;
      height: 42px;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #a76513;
      background: rgba(242, 169, 59, 0.16);
    }

    .stat-icon.streak {
      color: var(--app-green-dark);
      background: rgba(20, 143, 120, 0.12);
    }

    .stat-icon.badge {
      color: #1a5eba;
      background: rgba(30, 107, 214, 0.12);
    }

    .stat-icon ion-icon {
      font-size: 21px;
    }

    .stat-card strong {
      color: var(--app-ink);
      font-size: 21px;
      font-weight: 950;
      line-height: 1;
    }

    .stat-card span:not(.stat-icon) {
      color: var(--app-muted);
      font-size: 10px;
      font-weight: 850;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .profile-section {
      padding: 20px;
    }

    .section-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .section-title-row h3 {
      margin: 4px 0 0;
      color: var(--app-ink);
      font-size: 18px;
      font-weight: 950;
    }

    .section-title-row > strong {
      color: var(--app-green-dark);
      font-size: 16px;
      font-weight: 950;
    }

    .progress-track {
      height: 11px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(81, 97, 121, 0.12);
    }

    .progress-fill {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--app-green), var(--app-blue), var(--app-amber));
      transition: width 260ms ease;
    }

    .profile-section p {
      margin: 12px 0 0;
      color: var(--app-muted);
      font-size: 13px;
      line-height: 1.45;
    }

    .streak-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 8px;
    }

    .day-item {
      min-height: 58px;
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: rgba(81, 97, 121, 0.07);
    }

    .day-item span {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: rgba(81, 97, 121, 0.28);
    }

    .day-item strong {
      color: var(--app-muted);
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .day-item.active {
      background: rgba(20, 143, 120, 0.12);
    }

    .day-item.active span {
      background: var(--app-green);
      animation: app-pulse 2s infinite;
    }

    .day-item.active strong {
      color: var(--app-green-dark);
    }

    .achievement-list {
      display: grid;
      gap: 10px;
    }

    .achievement-row {
      min-height: 76px;
      border: 1px solid var(--app-line);
      border-radius: 20px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.66);
    }

    .achievement-icon {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(242, 169, 59, 0.14);
      font-size: 22px;
      flex-shrink: 0;
    }

    .achievement-row div {
      min-width: 0;
      flex: 1;
    }

    .achievement-row strong {
      display: block;
      color: var(--app-ink);
      font-size: 14px;
      font-weight: 900;
    }

    .achievement-row p {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 3px 0 0;
      color: var(--app-muted);
      font-size: 11px;
      line-height: 1.35;
    }

    .achievement-medal {
      color: var(--app-green);
      font-size: 22px;
      flex-shrink: 0;
    }

    .empty-achievement {
      min-height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-align: center;
      color: var(--app-muted);
      font-size: 13px;
      font-weight: 700;
    }

    .empty-achievement ion-icon {
      width: 52px;
      height: 52px;
      border-radius: 18px;
      padding: 13px;
      color: var(--app-blue);
      background: rgba(30, 107, 214, 0.11);
    }

    .action-list {
      display: grid;
      gap: 10px;
      margin-bottom: 8px;
    }

    .profile-action {
      min-height: 64px;
      border: 1px solid var(--app-line);
      padding: 0 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      text-align: left;
    }

    .profile-action > strong {
      flex: 1;
      color: var(--app-ink);
      font-size: 15px;
      font-weight: 900;
    }

    .profile-action > ion-icon {
      color: rgba(81, 97, 121, 0.46);
      font-size: 18px;
    }

    .action-icon {
      width: 42px;
      height: 42px;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--app-green-dark);
      background: rgba(20, 143, 120, 0.12);
      flex-shrink: 0;
    }

    .action-icon.blue {
      color: #1a5eba;
      background: rgba(30, 107, 214, 0.12);
    }

    .action-icon.coral {
      color: var(--app-coral);
      background: rgba(232, 93, 88, 0.1);
    }

    .profile-action.logout strong {
      color: var(--app-coral);
    }
  `]
})
export class ProfilePage implements OnInit {
  private auth = inject(AuthService);
  private gamification = inject(GamificationService);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  user: User | null = null;
  achievementsCount = 0;
  pointsToNextLevel = 0;
  progressToNextLevel = 0;
  weeklyStreak: WeeklyStreak[] = [];
  unlockedAchievements: Achievement[] = [];

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      this.user = u;
      if (u) this.loadGamificationData();
    });
  }

  loadGamificationData() {
    this.gamification.getGamificationProfile().subscribe({
      next: (data) => {
        this.achievementsCount = data.achievements.filter(a => a.unlocked).length;
        this.unlockedAchievements = data.achievements.filter(a => a.unlocked).slice(0, 3);
        this.pointsToNextLevel = data.pointsToNextLevel;
        this.progressToNextLevel = data.progressToNextLevel;
        this.weeklyStreak = data.weeklyStreak;
      },
      error: (err) => {
        console.error('Error loading gamification:', err);
      }
    });
  }

  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }

  getLevelTitle(): string {
    const level = this.user?.level || 1;
    if (level >= 5) return 'Maestro del Aseo';
    if (level >= 4) return 'Experto';
    if (level >= 3) return 'Avanzado';
    if (level >= 2) return 'Intermedio';
    return 'Novato';
  }

  async editAvatar() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        allowEditing: true
      });

      if (image.dataUrl) {
        this.auth.updateProfile({ avatar_url: image.dataUrl }).subscribe({
          next: () => this.showToast('Foto de perfil actualizada', 'success'),
          error: () => this.showToast('Error al subir imagen', 'danger')
        });
      }
    } catch (e) {}
  }

  async goToSettings() {
    const modal = await this.modalCtrl.create({
      component: EditProfileModal,
      componentProps: { user: this.user }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.loadGamificationData();
    }
  }

  goToHistory() {
    this.router.navigate(['/tabs/report']);
  }

  async showAllAchievements() {
    const alert = await this.alertCtrl.create({
      header: 'Tus logros',
      message: 'Próximamente: lista detallada de todos los logros desbloqueables.',
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 2000, position: 'top' });
    t.present();
  }
}
