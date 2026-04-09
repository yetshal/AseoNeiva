import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SummaryService } from '../../core/services/summary.service';
import { SummaryData } from '../../shared/models/summary.model';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnInit {
  private svc    = inject(SummaryService);
  private router = inject(Router);

  data: SummaryData | null = null;
  loading = true;
  error   = '';

  ngOnInit(): void {
    this.svc.getSummary().subscribe({
      next:  d  => { this.data = d; this.loading = false; },
      error: () => { this.error = 'No se pudo cargar el resumen.'; this.loading = false; }
    });
  }

  get reportResolutionRate(): number {
    if (!this.data || !this.data.reports.total) return 0;
    return Math.round((this.data.reports.resolved / this.data.reports.total) * 100);
  }

  get fleetActiveRate(): number {
    if (!this.data || !this.data.fleet.total) return 0;
    return Math.round((this.data.fleet.active / this.data.fleet.total) * 100);
  }

  goToUsers():  void { this.router.navigate(['/dashboard/usuarios']); }
  goToFleet():  void { this.router.navigate(['/dashboard/mapa']); }
  goToReports():void { this.router.navigate(['/dashboard/analisis']); }
}
