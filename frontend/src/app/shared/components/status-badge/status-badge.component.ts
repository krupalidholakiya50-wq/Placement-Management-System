import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="getBadgeClass()">
      <i *ngIf="icon" [class]="icon + ' me-1'"></i>
      {{ label || status }}
    </span>
  `,
  styles: [`
    span {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() label?: string;
  @Input() icon?: string;

  getBadgeClass(): string {
    const s = (this.status || '').toLowerCase();
    if (s.includes('verified') || s.includes('placed') || s.includes('approved') || s.includes('selected')) {
      return 'bg-success bg-opacity-10 text-success border border-success border-opacity-20';
    }
    if (s.includes('pending') || s.includes('shortlisted') || s.includes('interview')) {
      return 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20';
    }
    if (s.includes('blacklisted') || s.includes('rejected') || s.includes('no show')) {
      return 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20';
    }
    return 'bg-secondary bg-opacity-10 text-slate-700 border border-slate-200';
  }
}
