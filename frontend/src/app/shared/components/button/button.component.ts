import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getButtonClass()"
      (click)="onClick.emit($event)"
    >
      <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
      <i *ngIf="icon && !loading" [class]="icon + ' me-2'"></i>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      border-radius: 12px;
      font-weight: 600;
      padding: 10px 20px;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() icon?: string;
  @Input() customClass: string = '';

  @Output() onClick = new EventEmitter<Event>();

  getButtonClass(): string {
    let base = 'btn ';
    switch (this.variant) {
      case 'primary': base += 'btn-primary shadow-sm '; break;
      case 'secondary': base += 'btn-secondary '; break;
      case 'outline': base += 'btn-outline-primary '; break;
      case 'danger': base += 'btn-danger shadow-sm '; break;
      case 'success': base += 'btn-success shadow-sm '; break;
      case 'warning': base += 'btn-warning text-dark shadow-sm '; break;
    }
    if (this.size === 'sm') base += 'btn-sm ';
    if (this.size === 'lg') base += 'btn-lg ';
    return base + this.customClass;
  }
}
