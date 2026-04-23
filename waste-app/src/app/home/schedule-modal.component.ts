import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Configurar Horario</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>Selecciona los días y la hora aproximada en que sacas tus residuos.</p>
      
      <ion-list>
        <ion-item *ngFor="let day of days">
          <ion-label>{{ day.name }}</ion-label>
          <ion-checkbox slot="end" [(ngModel)]="day.selected"></ion-checkbox>
        </ion-item>
        
        <ion-item>
          <ion-label>Hora de recolección</ion-label>
          <ion-datetime-button datetime="datetime"></ion-datetime-button>
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime id="datetime" presentation="time" [(ngModel)]="selectedTime"></ion-datetime>
            </ng-template>
          </ion-modal>
        </ion-item>
      </ion-list>

      <ion-button expand="block" (click)="save()" class="ion-margin-top" color="success">
        Guardar Configuración
      </ion-button>
    </ion-content>
  `
})
export class ScheduleModalComponent {
  private modalCtrl = inject(ModalController);
  @Input() currentSchedule: any[] = [];

  selectedTime: string = '06:00';
  days = [
    { name: 'Lunes', selected: false },
    { name: 'Martes', selected: false },
    { name: 'Miércoles', selected: false },
    { name: 'Jueves', selected: false },
    { name: 'Viernes', selected: false },
    { name: 'Sábado', selected: false },
    { name: 'Domingo', selected: false }
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
