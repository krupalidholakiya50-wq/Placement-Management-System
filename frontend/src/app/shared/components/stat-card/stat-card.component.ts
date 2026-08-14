import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="enterprise-card p-4 h-100 d-flex align-items-center">
      <div [class]="'rounded-16 p-3 me-3 text-' + color + ' bg-' + color + ' bg-opacity-10 fs-3 d-flex align-items-center justify-content-center'" style="width: 56px; height: 56px;">
        <i [class]="icon"></i>
      </div>
      <div>
        <div class="text-muted small fw-semibold text-uppercase font-monospace" style="letter-spacing: 0.5px;">{{ label }}</div>
        <h3 class="fw-bold text-slate-900 mb-0 mt-1">{{ value }}</h3>
        <small *ngIf="subtext" [class]="'fw-semibold text-' + (trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'muted')">
          <i *ngIf="trend === 'up'" class="bi bi-arrow-up-right me-1"></i>
          <i *ngIf="trend === 'down'" class="bi bi-arrow-down-right me-1"></i>
          {{ subtext }}
        </small>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = 'bi bi-graph-up';
  @Input() color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() subtext?: string;
  @Input() trend?: 'up' | 'down' | 'neutral';
}
