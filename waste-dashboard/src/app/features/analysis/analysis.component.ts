import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisService } from '../../core/services/analysis.service';

type Tab = 'reports' | 'fleet' | 'users';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss'
})
export class AnalysisComponent implements OnInit {
  private svc = inject(AnalysisService);

  activeTab: Tab = 'reports';
  period: 'week' | 'month' | 'year' = 'month';

  reportsData: any = null;
  fleetData:   any = null;
  usersData:   any = null;

  loading = true;
  error   = '';

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error   = '';

    const filters = { period: this.period };

    this.svc.getReportsAnalysis(filters).subscribe({
      next:  d => { this.reportsData = d; this.checkDone(); },
      error: () => { this.error = 'Error al cargar análisis de reportes.'; this.loading = false; }
    });

    this.svc.getFleetAnalysis(filters).subscribe({
      next:  d => { this.fleetData = d; this.checkDone(); },
      error: () => { this.error = 'Error al cargar análisis de flota.'; this.loading = false; }
    });

    this.svc.getUsersAnalysis(filters).subscribe({
      next:  d => { this.usersData = d; this.checkDone(); },
      error: () => { this.error = 'Error al cargar análisis de usuarios.'; this.loading = false; }
    });
  }

  private checkDone(): void {
    if (this.reportsData && this.fleetData && this.usersData) {
      this.loading = false;
    }
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  onPeriodChange(): void {
    this.reportsData = null;
    this.fleetData   = null;
    this.usersData   = null;
    this.loadAll();
  }

  periodLabel(): string {
    switch (this.period) {
      case 'week':  return 'últimos 7 días';
      case 'month': return 'último mes';
      case 'year':  return 'último año';
    }
  }

  statusLabel(s: string): string {
    switch (s) {
      case 'pending':    return 'Pendiente';
      case 'reviewing':  return 'En revisión';
      case 'resolved':   return 'Resuelto';
      default: return s;
    }
  }

  /** Calcula el % de la barra más grande = 100% */
  barWidth(value: number, max: number): number {
    if (!max) return 0;
    return Math.round((value / max) * 100);
  }

  get maxReportType(): number {
    if (!this.reportsData?.byType?.length) return 1;
    return Math.max(...this.reportsData.byType.map((t: any) => Number(t.count)));
  }

  get maxRouteCollections(): number {
    if (!this.fleetData?.topRoutes?.length) return 1;
    return Math.max(...this.fleetData.topRoutes.map((r: any) => Number(r.collections)));
  }

  get maxLevel(): number {
    if (!this.usersData?.levelDist?.length) return 1;
    return Math.max(...this.usersData.levelDist.map((l: any) => Number(l.count)));
  }

  countByStatus(arr: any[], status: string): number {
    const found = (arr || []).find((s: any) => s.status === status);
    return found ? Number(found.count) : 0;
  }

  maxDay(arr: any[]): number {
    if (!arr?.length) return 1;
    return Math.max(...arr.map((d: any) => Number(d.count)));
  }
}
