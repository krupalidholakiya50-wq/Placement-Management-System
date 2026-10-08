import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="d-flex flex-column gap-4 pb-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-main-title mb-1">System & Placement Settings</h1>
          <p class="body-text mb-0">Configure academic sessions, dream offer rules, interview policies and departmental codes</p>
        </div>
      </div>

      <!-- Settings Cards -->
      <div class="row g-4">
        <!-- Placement Policy Configuration -->
        <div class="col-lg-6">
          <div class="enterprise-card p-4 h-100">
            <h4 class="card-title-heading mb-3 pb-2 border-bottom">
              <i class="bi bi-shield-lock text-primary me-2"></i>Campus Placement Policy Rules
            </h4>

            <form [formGroup]="policyForm" (ngSubmit)="savePolicy()">
              <div class="mb-3">
                <label class="form-label">Academic Placement Session</label>
                <input type="text" formControlName="session" class="form-control" placeholder="2025 - 2026" />
              </div>

              <div class="mb-3">
                <label class="form-label">Dream Offer CTC Multiplier Rule</label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-muted fw-bold">>=</span>
                  <input type="number" step="0.5" formControlName="dreamMultiplier" class="form-control" />
                  <span class="input-group-text bg-light text-muted font-mono">x Base CTC</span>
                </div>
                <small class="meta-text text-muted mt-1 d-block">Placed students can only apply to drives with package &gt;= 2x of current accepted offer.</small>
              </div>

              <div class="mb-3">
                <label class="form-label">Interview No-Show Debar Penalty (Drives)</label>
                <input type="number" formControlName="blacklistDebar" class="form-control" placeholder="3" />
                <small class="meta-text text-muted mt-1 d-block">Number of placement drives a candidate is locked out of for unexcused interview absence.</small>
              </div>

              <div class="text-end pt-3 border-top">
                <button type="submit" class="btn btn-primary px-4">
                  Save Policy Configuration
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Academic Departments & Branches -->
        <div class="col-lg-6">
          <div class="enterprise-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h4 class="card-title-heading">
                <i class="bi bi-diagram-3 text-info me-2"></i>Active Academic Branches
              </h4>
            </div>

            <div class="table-responsive mb-3">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Branch Code</th>
                    <th class="text-end">Batch Strength</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="fw-semibold text-slate-900">Computer Science & Engineering</td>
                    <td><span class="badge badge-subtle-primary font-mono">B.Tech CSE</span></td>
                    <td class="text-end font-mono">120 Students</td>
                  </tr>
                  <tr>
                    <td class="fw-semibold text-slate-900">Information Technology</td>
                    <td><span class="badge badge-subtle-primary font-mono">B.Tech IT</span></td>
                    <td class="text-end font-mono">90 Students</td>
                  </tr>
                  <tr>
                    <td class="fw-semibold text-slate-900">Electronics & Communication</td>
                    <td><span class="badge badge-subtle-secondary font-mono">B.Tech ECE</span></td>
                    <td class="text-end font-mono">75 Students</td>
                  </tr>
                  <tr>
                    <td class="fw-semibold text-slate-900">Mechanical Engineering</td>
                    <td><span class="badge badge-subtle-secondary font-mono">B.Tech ME</span></td>
                    <td class="text-end font-mono">60 Students</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="text-end pt-3 border-top">
              <button class="btn btn-secondary" (click)="addBranch()">
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
    this.notify.showSuccess('Branch registration modal triggered.');
  }
}
