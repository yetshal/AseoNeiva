import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-schedule-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header class="ion-no-border schedule-header">
      <ion-toolbar>
        <ion-title>Horario</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="schedule-content">
      <main class="schedule-shell">
        <section class="schedule-intro app-panel app-panel-strong">
          <span class="intro-icon">
            <ion-icon name="calendar-outline"></ion-icon>
          </span>
          <div>
            <span class="app-eyebrow">Recolección</span>
            <h2>Configura tus días</h2>
            <p>Selecciona cuándo sacas tus residuos para mejorar las alertas del servicio.</p>
          </div>
        </section>

        <section class="days-grid">
          <button
            type="button"
            class="day-toggle app-panel"
            *ngFor="let day of days"
            [class.selected]="day.selected"
            (click)="day.selected = !day.selected">
            <strong>{{ day.short }}</strong>
            <span>{{ day.name }}</span>
            <ion-icon [name]="day.selected ? 'checkmark-circle' : 'ellipse-outline'"></ion-icon>
          </button>
        </section>

        <section class="time-card app-panel app-panel-strong">
          <div>
            <span class="app-eyebrow">Hora aproximada</span>
            <h3>{{ selectedTime }}</h3>
          </div>
          <ion-datetime-button datetime="collection-time"></ion-datetime-button>
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime id="collection-time" presentation="time" [(ngModel)]="selectedTime"></ion-datetime>
            </ng-template>
          </ion-modal>
        </section>

        <button class="app-button save-schedule" type="button" (click)="save()">
          <ion-icon name="save-outline"></ion-icon>
          Guardar configuración
        </button>
      </main>
    </ion-content>
  `,
  styles: [`
    .schedule-header ion-toolbar {
      --background: transparent;
      --border-width: 0;
    }

    .schedule-content {
      --background: linear-gradient(145deg, rgba(238, 246, 244, 1) 0%, rgba(238, 243, 255, 1) 100%);
    }

    .schedule-shell {
      padding: 18px;
      display: grid;
      gap: 14px;
    }

    .schedule-intro {
      padding: 18px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .intro-icon {
      width: 58px;
      height: 58px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      background: linear-gradient(135deg, var(--app-green), var(--app-blue));
      box-shadow: 0 14px 26px rgba(20, 143, 120, 0.22);
      flex-shrink: 0;
    }

    .intro-icon ion-icon {
      font-size: 28px;
    }

    .schedule-intro h2 {
      margin: 4px 0 5px;
      color: var(--app-ink);
      font-size: 20px;
      font-weight: 950;
    }

    .schedule-intro p {
      margin: 0;
      color: var(--app-muted);
      font-size: 13px;
      line-height: 1.45;
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .day-toggle {
      min-height: 86px;
      border: 1px solid var(--app-line);
      border-radius: 22px;
      padding: 14px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 4px 10px;
      text-align: left;
      transition: transform 180ms ease, border-color 180ms ease, background-color 180ms ease;
    }

    .day-toggle:active {
      transform: scale(0.98);
    }

    .day-toggle strong {
      color: var(--app-ink);
      font-size: 18px;
      font-weight: 950;
      text-transform: uppercase;
    }

    .day-toggle span {
      color: var(--app-muted);
      font-size: 12px;
      font-weight: 750;
      grid-column: 1 / 2;
    }

    .day-toggle ion-icon {
      grid-column: 2;
      grid-row: 1 / span 2;
      align-self: center;
      color: rgba(81, 97, 121, 0.42);
      font-size: 23px;
    }

    .day-toggle.selected {
      border-color: rgba(20, 143, 120, 0.28);
      background: linear-gradient(135deg, rgba(20, 143, 120, 0.12), rgba(30, 107, 214, 0.1));
    }

    .day-toggle.selected ion-icon {
      color: var(--app-green);
    }

    .time-card {
      min-height: 88px;
      padding: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }

    .time-card h3 {
      margin: 4px 0 0;
      color: var(--app-ink);
      font-size: 24px;
      font-weight: 950;
    }

    .save-schedule {
      width: 100%;
    }
  `]
})
export class ScheduleModalComponent {
  private modalCtrl = inject(ModalController);
  @Input() currentSchedule: any[] = [];

  selectedTime: string = '06:00';
  days = [
    { name: 'Lunes', short: 'Lun', selected: false },
    { name: 'Martes', short: 'Mar', selected: false },
    { name: 'Miércoles', short: 'Mié', selected: false },
    { name: 'Jueves', short: 'Jue', selected: false },
    { name: 'Viernes', short: 'Vie', selected: false },
    { name: 'Sábado', short: 'Sáb', selected: false },
    { name: 'Domingo', short: 'Dom', selected: false }
  ];

  ngOnInit() {
    if (this.currentSchedule && this.currentSchedule.length > 0) {
      this.selectedTime = this.currentSchedule[0].time;
      this.days.forEach(d => {
        d.selected = this.currentSchedule.some(s => s.day === d.name);
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    const newSchedule = this.days
      .filter(d => d.selected)
      .map(d => ({ day: d.name, time: this.selectedTime }));
    this.modalCtrl.dismiss(newSchedule);
  }
}
