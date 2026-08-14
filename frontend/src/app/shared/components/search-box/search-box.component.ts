import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="input-group">
      <span class="input-group-text bg-white border-slate-300 text-muted"><i class="bi bi-search"></i></span>
      <input
        type="text"
        [(ngModel)]="value"
        (ngModelChange)="onSearchChange($event)"
        class="form-control border-slate-300"
        [placeholder]="placeholder"
      />
    </div>
  `
})
export class SearchBoxComponent {
  @Input() placeholder: string = 'Search...';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  onSearchChange(newValue: string): void {
    this.valueChange.emit(newValue);
  }
}
