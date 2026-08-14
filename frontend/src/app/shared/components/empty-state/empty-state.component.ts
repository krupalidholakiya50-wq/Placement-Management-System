import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="enterprise-card p-5 text-center my-3">
      <div class="rounded-circle bg-slate-100 p-4 d-inline-flex align-items-center justify-content-center mb-3 text-slate-400">
        <i [class]="icon + ' fs-1'"></i>
      </div>
      <h5 class="fw-bold text-slate-900 mb-1">{{ title }}</h5>
      <p class="text-muted small mb-3 max-w-md mx-auto" style="max-width: 420px;">{{ description }}</p>
      <button *ngIf="actionLabel" class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="onAction.emit()">
        <i *ngIf="actionIcon" [class]="actionIcon + ' me-1'"></i> {{ actionLabel }}
      </button>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon: string = 'bi bi-inbox';
  @Input() title: string = 'No Data Found';
  @Input() description: string = 'There are no records to display at this time.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;

  @Output() onAction = new EventEmitter<void>();
}
