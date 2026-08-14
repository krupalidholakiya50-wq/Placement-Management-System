import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItem {
  label: string;
  sublabel?: string;
  icon?: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center position-relative my-3">
      <div *ngFor="let step of steps; let i = index" class="d-flex flex-column align-items-center position-relative z-1" style="flex: 1;">
        <div [class]="getStepCircleClass(i)">
          <i [class]="step.icon || (i < currentStepIndex ? 'bi bi-check-lg' : 'bi bi-circle-fill')" style="font-size: 0.85rem;"></i>
        </div>
        <small class="fw-bold text-slate-900 mt-2 text-center" style="font-size: 0.75rem;">{{ step.label }}</small>
        <small *ngIf="step.sublabel" class="text-muted text-center" style="font-size: 0.65rem;">{{ step.sublabel }}</small>
      </div>
    </div>
  `,
  styles: [`
    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
  `]
})
export class StepperComponent {
  @Input() steps: StepItem[] = [];
  @Input() currentStepIndex: number = 0;

  getStepCircleClass(index: number): string {
    if (index < this.currentStepIndex) {
      return 'step-circle bg-success text-white shadow-sm';
    }
    if (index === this.currentStepIndex) {
      return 'step-circle bg-primary text-white shadow-sm ring-4 ring-primary-100';
    }
    return 'step-circle bg-slate-200 text-slate-500';
  }
}
