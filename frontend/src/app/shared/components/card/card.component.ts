import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'enterprise-card p-4 ' + customClass">
      <div *ngIf="title || subtitle" class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-slate-100">
        <div>
          <h5 *ngIf="title" class="fw-bold text-slate-900 mb-0 d-flex align-items-center">
            <i *ngIf="icon" [class]="icon + ' text-primary me-2'"></i> {{ title }}
          </h5>
          <small *ngIf="subtitle" class="text-muted">{{ subtitle }}</small>
        </div>
        <ng-content select="[card-action]"></ng-content>
      </div>
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() customClass: string = '';
}
