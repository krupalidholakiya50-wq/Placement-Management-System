import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container-fluid px-4 py-3">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold text-slate-900 mb-1"><i class="bi bi-gear-fill text-primary me-2"></i>University TPO Portal Settings</h3>
          <p class="text-muted mb-0">Configure academic sessions, department branches, placement policies & role permissions</p>
        </div>
      </div>

      <!-- Settings Cards -->
      <div class="row g-4">
        <!-- Placement Policy Configuration -->
        <div class="col-lg-6">
          <div class="enterprise-card p-4 bg-white h-100">
            <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
              <i class="bi bi-shield-lock text-primary me-2"></i>Campus Placement Policy Rules
            </h5>

            <form [formGroup]="policyForm" (ngSubmit)="savePolicy()">
              <div class="mb-3">
                <label class="form-label text-slate-700 fw-semibold">Academic Placement Session</label>
                <input type="text" formControlName="session" class="form-control" placeholder="2025 - 2026" />
              </div>

              <div class="mb-3">
                <label class="form-label text-slate-700 fw-semibold">Dream Offer CTC Multiplier Rule</label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-muted fw-bold">>=</span>
                  <input type="number" step="0.5" formControlName="dreamMultiplier" class="form-control" />
                  <span class="input-group-text bg-light text-muted font-monospace">x Current CTC</span>
                </div>
                <small class="text-muted">Students placed at 10 LPA can only apply to drives offering >= 20 LPA.</small>
              </div>

              <div class="mb-3">
                <label class="form-label text-slate-700 fw-semibold">Blacklist No-Show Penalty (Drives Debarred)</label>
                <input type="number" formControlName="blacklistDebar" class="form-control" placeholder="3" />
                <small class="text-muted">Number of consecutive drives a student is blocked for unexcused interview absence.</small>
              </div>

              <div class="text-end pt-2 border-top">
                <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                  Save Policy Configuration
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Academic Departments & Branches -->
        <div class="col-lg-6">
          <div class="enterprise-card p-4 bg-white h-100">
            <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
              <i class="bi bi-diagram-3 text-warning me-2"></i>Active Academic Departments & Branches
            </h5>

            <div class="table-responsive mb-3">
              <table class="table align-middle mb-0">
                <thead class="bg-light">
                  <tr class="text-muted small text-uppercase font-monospace">
                    <th>Department</th>
                    <th>Branch Code</th>
                    <th>Students Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="fw-bold text-slate-900">Computer Science & Engg</td>
                    <td><span class="badge bg-primary rounded-pill px-3">B.Tech CSE</span></td>
                    <td class="font-monospace">120 Students</td>
                  </tr>
                  <tr>
                    <td class="fw-bold text-slate-900">Information Technology</td>
                    <td><span class="badge bg-info rounded-pill px-3">B.Tech IT</span></td>
                    <td class="font-monospace">90 Students</td>
                  </tr>
                  <tr>
                    <td class="fw-bold text-slate-900">Electronics & Comm</td>
                    <td><span class="badge bg-secondary rounded-pill px-3">B.Tech ECE</span></td>
                    <td class="font-monospace">75 Students</td>
                  </tr>
                  <tr>
                    <td class="fw-bold text-slate-900">Mechanical Engineering</td>
                    <td><span class="badge bg-warning text-dark rounded-pill px-3">B.Tech ME</span></td>
                    <td class="font-monospace">60 Students</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="text-end pt-2 border-top">
              <button class="btn btn-secondary rounded-pill px-4" (click)="addBranch()">
                <i class="bi bi-plus-lg me-1"></i> Add Academic Branch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  policyForm: FormGroup = this.fb.group({
    session: ['2025 - 2026', Validators.required],
    dreamMultiplier: [2.0, [Validators.required, Validators.min(1.5)]],
    blacklistDebar: [3, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {}

  savePolicy(): void {
    if (this.policyForm.invalid) return;
    this.notify.showSuccess('University TPO Placement Policy saved successfully!');
  }

  addBranch(): void {
    this.notify.showSuccess('Branch creation modal triggered.');
  }
}
