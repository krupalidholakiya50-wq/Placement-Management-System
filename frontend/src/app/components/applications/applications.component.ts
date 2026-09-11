import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Application } from '../../core/models/application.model';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid px-4 py-3">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-slate-900 mb-1"><i class="bi bi-diagram-3-fill text-primary me-2"></i>Stage 4: Multi-Round Interview Pipeline Tracker</h3>
          <p class="text-muted mb-0">Advance candidate rounds: Applied ➔ Resume Shortlisted ➔ Aptitude ➔ GD ➔ Tech ➔ HR ➔ Offer</p>
        </div>
        <button
          *ngIf="userRole() !== 'student'"
          class="btn btn-success px-4 py-2 rounded-pill fw-bold shadow-sm"
          (click)="onExportShortlistExcel()"
          [disabled]="isExporting"
        >
          <span *ngIf="isExporting" class="spinner-border spinner-border-sm me-2"></span>
          <i class="bi bi-file-earmark-excel-fill me-2"></i> Export Drive Shortlist (.xlsx)
        </button>
      </div>

      <!-- STUDENT APPLICATIONS 7-ROUND VISUAL TIMELINE VIEW -->
      <ng-container *ngIf="userRole() === 'student'">
        <div class="row g-4 mb-4">
          <div *ngFor="let app of applications" class="col-12">
            <div class="enterprise-card p-4 bg-white">
              <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 flex-wrap gap-2">
                <div>
                  <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 rounded-pill mb-2 px-3 py-1 font-monospace">
                    {{ app.job?.jobType || 'Full Time' }}
                  </span>
                  <h4 class="fw-bold text-slate-900 mb-0">{{ app.job?.title || 'Software Development Engineer' }}</h4>
                  <div class="text-primary fw-semibold"><i class="bi bi-building me-1"></i>{{ app.job?.companyName || 'Partner Corp' }}</div>
                </div>

                <div class="text-md-end">
                  <span [class]="getPipelineStatusBadge(app.status)">
                    <i [class]="getPipelineStatusIcon(app.status) + ' me-1'"></i> {{ app.status }}
                  </span>
                  <div class="small text-muted font-monospace mt-1">Applied on: {{ app.createdAt | date:'mediumDate' }}</div>
                </div>
              </div>

              <!-- EXACT 7-STAGE LIVE APPLICATION TIMELINE STEPPER -->
              <div class="mb-3">
                <div class="text-slate-500 font-monospace small fw-bold mb-2"><i class="bi bi-clock-history me-1 text-primary"></i>STAGE 4: LIVE RECRUITMENT ROUND TRACKER</div>
                
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <div [class]="getStepClass('Applied', app.status)">
                    <i class="bi bi-send-fill me-1"></i> 1. Applied
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('Resume Shortlisted', app.status)">
                    <i class="bi bi-file-earmark-check me-1"></i> 2. Resume Shortlisted
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('Aptitude Test Cleared', app.status)">
                    <i class="bi bi-laptop me-1"></i> 3. Aptitude Test
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('Group Discussion Cleared', app.status)">
                    <i class="bi bi-people me-1"></i> 4. GD Round
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('Technical Interview Cleared', app.status)">
                    <i class="bi bi-code-slash me-1"></i> 5. Tech Interview
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('HR Interview Cleared', app.status)">
                    <i class="bi bi-award-fill me-1"></i> 6. HR Cleared
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('Selected', app.status)">
                    <i class="bi bi-patch-check-fill me-1"></i> 7. Offer Released
                  </div>
                </div>
              </div>

              <!-- Status History Log -->
              <div *ngIf="app.statusTimeline && app.statusTimeline.length > 0" class="bg-slate-50 border rounded-12 p-3 small">
                <div class="text-slate-700 font-monospace fw-bold mb-2"><i class="bi bi-journal-text me-1 text-primary"></i>STAGE ROUND AUDIT LOGS</div>
                <div *ngFor="let log of app.statusTimeline" class="d-flex justify-content-between border-bottom py-1">
                  <div><strong class="text-slate-900">{{ log.status }}</strong> — {{ log.note }}</div>
                  <span class="text-muted font-monospace">{{ log.updatedAt | date:'short' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="applications.length === 0" class="col-12 text-center py-5 enterprise-card">
            <i class="bi bi-diagram-3 fs-1 text-slate-300"></i>
            <h5 class="text-slate-900 mt-3">No Applications Submitted</h5>
            <p class="text-muted mb-0">Explore active campus drives in the Job Portal to submit your application.</p>
          </div>
        </div>
      </ng-container>

      <!-- ADMIN & RECRUITER APPLICANT MANAGEMENT TABLE (STAGE 4 MULTI-ROUND CONTROLS) -->
      <ng-container *ngIf="userRole() !== 'student'">
        <!-- Filter Bar -->
        <div class="enterprise-card p-4 mb-4 bg-white">
          <div class="row g-3">
            <div class="col-md-5">
              <div class="input-group">
                <span class="input-group-text bg-white border-slate-300 text-muted"><i class="bi bi-search"></i></span>
                <input type="text" [(ngModel)]="search" (ngModelChange)="loadApplications()" class="form-control border-slate-300" placeholder="Search candidate name, email, branch..." />
              </div>
            </div>
            <div class="col-md-4">
              <select [(ngModel)]="filterStatus" (change)="loadApplications()" class="form-select border-slate-300">
                <option value="">All Pipeline Stages</option>
                <option value="Applied">1. Applied</option>
                <option value="Resume Shortlisted">2. Resume Shortlisted</option>
                <option value="Aptitude Test Cleared">3. Aptitude Test Cleared</option>
                <option value="Group Discussion Cleared">4. GD Cleared</option>
                <option value="Technical Interview Cleared">5. Tech Interview Cleared</option>
                <option value="HR Interview Cleared">6. HR Interview Cleared</option>
                <option value="Selected">7. Selected / Offer Released</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div class="col-md-3">
              <button class="btn btn-secondary w-100 rounded-pill" (click)="resetFilters()">Reset Candidate Filters</button>
            </div>
          </div>
        </div>

        <!-- Master Applicants Table -->
        <div class="enterprise-card p-4 bg-white">
          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Loading interview pipeline table...</p>
          </div>

          <div *ngIf="!isLoading" class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="bg-light sticky-top">
                <tr class="text-muted border-bottom small text-uppercase font-monospace">
                  <th>Candidate Student</th>
                  <th>Drive Position</th>
                  <th>Branch & CGPA</th>
                  <th>Resume PDF</th>
                  <th>Current Round Status</th>
                  <th class="text-end">Sequential Stage Advance</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let app of applications" class="border-bottom">
                  <td>
                    <div class="fw-bold text-slate-900">{{ app.studentName }}</div>
                    <small class="text-muted">{{ app.studentEmail }}</small>
                  </td>
                  <td>
                    <div class="fw-bold text-slate-900">{{ app.job?.title || 'Drive Position' }}</div>
                    <small class="text-primary fw-semibold">{{ app.job?.companyName || 'Partner Corp' }}</small>
                  </td>
                  <td>
                    <div class="text-slate-800 font-semibold">{{ app.branch || 'B.Tech CSE' }}</div>
                    <small class="text-info fw-bold">CGPA: {{ app.cgpa || 8.5 }}</small>
                  </td>
                  <td>
                    <a [href]="app.resumeUrl" target="_blank" class="btn btn-sm btn-outline-danger rounded-pill">
                      <i class="bi bi-file-earmark-pdf me-1"></i> Preview PDF ↗
                    </a>
                  </td>
                  <td>
                    <span [class]="getPipelineStatusBadge(app.status)">
                      <i [class]="getPipelineStatusIcon(app.status) + ' me-1'"></i> {{ app.status }}
                    </span>
                  </td>
                  <td class="text-end">
                    <!-- EXACT 7-STAGE PIPELINE TRANSITION DROPDOWN -->
                    <div class="dropdown d-inline-block">
                      <button class="btn btn-sm btn-primary rounded-pill px-3 dropdown-toggle font-monospace fw-bold" type="button" data-bs-toggle="dropdown">
                        Advance Round ➔
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                        <li><a class="dropdown-item small" (click)="updateStatus(app._id!, 'Resume Shortlisted')"><i class="bi bi-file-earmark-check text-primary me-2"></i>2. Resume Shortlisted</a></li>
                        <li><a class="dropdown-item small" (click)="updateStatus(app._id!, 'Aptitude Test Cleared')"><i class="bi bi-laptop text-info me-2"></i>3. Aptitude Test Cleared</a></li>
                        <li><a class="dropdown-item small" (click)="updateStatus(app._id!, 'Group Discussion Cleared')"><i class="bi bi-people text-warning me-2"></i>4. GD Cleared</a></li>
                        <li><a class="dropdown-item small" (click)="updateStatus(app._id!, 'Technical Interview Cleared')"><i class="bi bi-code-slash text-indigo me-2"></i>5. Technical Round Cleared</a></li>
                        <li><a class="dropdown-item small text-success fw-bold" (click)="updateStatus(app._id!, 'HR Interview Cleared')"><i class="bi bi-award text-success me-2"></i>6. HR Interview Cleared (Gen Offer)</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item small text-success fw-bold" (click)="updateStatus(app._id!, 'Selected')"><i class="bi bi-patch-check text-success me-2"></i>7. Final Offer / Selected</a></li>
                        <li><a class="dropdown-item small text-danger fw-bold" (click)="updateStatus(app._id!, 'Rejected')"><i class="bi bi-x-circle text-danger me-2"></i>Reject Candidate</a></li>
                      </ul>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="applications.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 text-slate-300"></i>
                    No candidates match the specified pipeline filter.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class ApplicationsComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);

  applications: Application[] = [];
  isLoading = true;
  isExporting = false;
  search = '';
  filterStatus = '';

  userRole = () => this.authService.getUserRole() || 'student';

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    const request$ = this.userRole() === 'student'
      ? this.applicationService.getMyApplications()
      : this.applicationService.getApplications({ search: this.search, status: this.filterStatus });

    request$.subscribe({
      next: (res) => {
        const list = res.data || [];
        this.applications = this.applyClientFilters(list);
        this.isLoading = false;
      },
      error: () => {
        this.applications = [];
        this.isLoading = false;
        this.notify.showError('Failed to load applications');
      }
    });
  }

  private applyClientFilters(list: Application[]): Application[] {
    const q = (this.search || '').toLowerCase().trim();
    return list.filter((app) => {
      const matchesSearch = !q ||
        app.studentName.toLowerCase().includes(q) ||
        app.studentEmail.toLowerCase().includes(q) ||
        (app.branch && app.branch.toLowerCase().includes(q)) ||
        (app.job && app.job.companyName && app.job.companyName.toLowerCase().includes(q)) ||
        (app.job && app.job.title && app.job.title.toLowerCase().includes(q));
      const matchesStatus = !this.filterStatus || app.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  resetFilters(): void {
    this.search = '';
    this.filterStatus = '';
    this.loadApplications();
  }

  updateStatus(id: string, status: string): void {
    this.applicationService.updateStatus(id, status).subscribe({
      next: (res) => {
        this.notify.showSuccess(res.message || `Candidate status updated to ${status}`);
        this.loadApplications();
      },
      error: (err) => this.notify.showError(err.error?.message || 'Status update failed')
    });
  }

  getPipelineStatusBadge(status: string): string {
    switch (status) {
      case 'Selected':
      case 'HR Interview Cleared': return 'badge bg-success text-white rounded-pill px-3 py-1 font-monospace';
      case 'Technical Interview Cleared':
      case 'Group Discussion Cleared': return 'badge bg-warning text-dark rounded-pill px-3 py-1 font-monospace';
      case 'Aptitude Test Cleared':
      case 'Resume Shortlisted': return 'badge bg-info text-white rounded-pill px-3 py-1 font-monospace';
      case 'Rejected': return 'badge bg-danger text-white rounded-pill px-3 py-1 font-monospace';
      default: return 'badge bg-primary text-white rounded-pill px-3 py-1 font-monospace';
    }
  }

  getPipelineStatusIcon(status: string): string {
    switch (status) {
      case 'Selected':
      case 'HR Interview Cleared': return 'bi-award-fill';
      case 'Technical Interview Cleared': return 'bi-code-slash';
      case 'Group Discussion Cleared': return 'bi-people-fill';
      case 'Aptitude Test Cleared': return 'bi-laptop';
      case 'Resume Shortlisted': return 'bi-file-earmark-check';
      case 'Rejected': return 'bi-x-circle-fill';
      default: return 'bi-send-fill';
    }
  }

  getStepClass(stepName: string, currentStatus: string): string {
    const pipelineOrder = [
      'Applied',
      'Resume Shortlisted',
      'Aptitude Test Cleared',
      'Group Discussion Cleared',
      'Technical Interview Cleared',
      'HR Interview Cleared',
      'Selected'
    ];
    const currentIndex = pipelineOrder.indexOf(currentStatus);
    const stepIndex = pipelineOrder.indexOf(stepName);

    if (stepIndex <= currentIndex && currentIndex !== -1) {
      return 'badge bg-primary text-white rounded-pill px-3 py-2 font-monospace';
    } else {
      return 'badge bg-secondary bg-opacity-20 text-slate-600 rounded-pill px-3 py-2 font-monospace';
    }
  }

  onExportShortlistExcel(): void {
    this.isExporting = true;
    this.applicationService.exportApplicantsToExcel(undefined, this.filterStatus).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Candidate_Shortlist_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
        this.notify.showSuccess('Shortlist Excel Spreadsheet downloaded!');
      },
      error: () => {
        this.isExporting = false;
        this.notify.showError('Failed to generate shortlist Excel file');
      }
    });
  }
}
