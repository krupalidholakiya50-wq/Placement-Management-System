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
    <div class="d-flex flex-column gap-4 pb-4">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-main-title mb-1">Applications & ATS Pipeline</h1>
          <p class="body-text mb-0">Multi-round candidate evaluation tracker: Applied ➔ Shortlisted ➔ Assessment ➔ Interview ➔ Offer</p>
        </div>
        <button
          *ngIf="userRole() !== 'student'"
          class="btn btn-secondary"
          (click)="onExportShortlistExcel()"
          [disabled]="isExporting"
        >
          <span *ngIf="isExporting" class="spinner-border spinner-border-sm me-1"></span>
          <i class="bi bi-file-earmark-excel text-success me-1"></i> Export Shortlist (.xlsx)
        </button>
      </div>

      <!-- Live Application Pipeline Metrics Row -->
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-blue"><i class="bi bi-send"></i></div>
            <div class="stat-content">
              <div class="stat-label">Total Applications</div>
              <div class="stat-value text-primary">{{ applications.length }}</div>
              <div class="stat-meta">Candidate Submissions</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-cyan"><i class="bi bi-file-earmark-check"></i></div>
            <div class="stat-content">
              <div class="stat-label">Shortlisted</div>
              <div class="stat-value text-info">{{ getShortlistedCount() }}</div>
              <div class="stat-meta">Profile / Test Cleared</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-amber"><i class="bi bi-calendar-event"></i></div>
            <div class="stat-content">
              <div class="stat-label">In Interview</div>
              <div class="stat-value text-warning">{{ getInterviewCount() }}</div>
              <div class="stat-meta">Tech / HR Rounds</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-emerald"><i class="bi bi-patch-check"></i></div>
            <div class="stat-content">
              <div class="stat-label">Offers Released</div>
              <div class="stat-value text-success">{{ getSelectedCount() }}</div>
              <div class="stat-meta">Selected Candidates</div>
            </div>
          </div>
        </div>
      </div>

      <!-- STUDENT APPLICATIONS 7-ROUND VISUAL TIMELINE VIEW -->
      <ng-container *ngIf="userRole() === 'student'">
        <div class="row g-3">
          <div *ngFor="let app of applications" class="col-12">
            <div class="enterprise-card p-4">
              <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 flex-wrap gap-2">
                <div>
                  <span class="badge badge-subtle-primary font-mono mb-1.5">
                    {{ app.job?.jobType || 'Full Time' }}
                  </span>
                  <h4 class="fw-bold text-slate-900 mb-0.5">{{ app.job?.title || 'Software Engineer' }}</h4>
                  <div class="text-primary fw-semibold small"><i class="bi bi-building me-1"></i>{{ app.job?.companyName || 'Corporate Partner' }}</div>
                </div>

                <div class="text-md-end">
                  <span [class]="getPipelineStatusBadge(app.status)">
                    <i [class]="getPipelineStatusIcon(app.status) + ' me-1'"></i> {{ app.status }}
                  </span>
                  <div class="meta-text mt-1">Applied: {{ app.createdAt | date:'mediumDate' }}</div>
                </div>
              </div>

              <!-- 7-STAGE LIVE APPLICATION TIMELINE STEPPER -->
              <div class="mb-3">
                <div class="meta-text text-uppercase fw-bold text-muted mb-2">RECRUITMENT ROUND PROGRESSION</div>
                
                <div class="d-flex flex-wrap align-items-center gap-1.5">
                  <div [class]="getStepClass('Applied', app.status)">
                    <i class="bi bi-send me-1"></i> 1. Applied
                  </div>
                  <i class="bi bi-chevron-right text-muted small"></i>

                  <div [class]="getStepClass('Resume Shortlisted', app.status)">
                    <i class="bi bi-file-earmark-check me-1"></i> 2. Shortlist
                  </div>
                  <i class="bi bi-chevron-right text-muted small"></i>

                  <div [class]="getStepClass('Aptitude Test Cleared', app.status)">
                    <i class="bi bi-laptop me-1"></i> 3. Assessment
                  </div>
                  <i class="bi bi-chevron-right text-muted small"></i>

                  <div [class]="getStepClass('Group Discussion Cleared', app.status)">
                    <i class="bi bi-people me-1"></i> 4. GD Round
                  </div>
                  <i class="bi bi-chevron-right text-muted small"></i>

                  <div [class]="getStepClass('Technical Interview Cleared', app.status)">
                    <i class="bi bi-code me-1"></i> 5. Tech Round
                  </div>
                  <i class="bi bi-chevron-right text-muted small"></i>

                  <div [class]="getStepClass('HR Interview Cleared', app.status)">
                    <i class="bi bi-award me-1"></i> 6. HR Cleared
                  </div>
                  <i class="bi bi-chevron-right text-muted small"></i>

                  <div [class]="getStepClass('Selected', app.status)">
                    <i class="bi bi-patch-check me-1"></i> 7. Offer Released
                  </div>
                </div>
              </div>

              <!-- Status History Log -->
              <div *ngIf="app.statusTimeline && app.statusTimeline.length > 0" class="bg-slate-50 border rounded-8 p-2.5 small meta-text">
                <div class="fw-bold text-slate-700 mb-1.5 font-mono">AUDIT TRAIL LOGS</div>
                <div *ngFor="let log of app.statusTimeline" class="d-flex justify-content-between border-bottom py-1">
                  <div><strong class="text-slate-900">{{ log.status }}</strong> — {{ log.note }}</div>
                  <span class="text-muted font-mono">{{ log.updatedAt | date:'short' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="applications.length === 0" class="col-12 text-center py-5 enterprise-card">
            <div class="saas-empty-state py-3">
              <i class="bi bi-inbox empty-icon"></i>
              <div class="empty-title">No Applications Submitted</div>
              <div class="empty-desc">Explore active campus drives in the Job Portal to submit your application.</div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ADMIN & RECRUITER APPLICANT MANAGEMENT TABLE -->
      <ng-container *ngIf="userRole() !== 'student'">
        <!-- Filter Bar -->
        <div class="enterprise-card p-3.5">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Search</label>
              <div class="input-group">
                <span class="input-group-text bg-transparent text-muted"><i class="bi bi-search"></i></span>
                <input type="text" [(ngModel)]="search" (ngModelChange)="loadApplications()" class="form-control" placeholder="Search candidate name, email, branch..." />
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Pipeline Stage</label>
              <select [(ngModel)]="filterStatus" (change)="loadApplications()" class="form-select">
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
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-secondary w-100 p-2" (click)="resetFilters()" title="Reset Filters">
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Master Applicants Table -->
        <div class="enterprise-card p-0">
          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="body-text mt-2">Loading interview pipeline table...</p>
          </div>

          <div *ngIf="!isLoading" class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Candidate Student</th>
                  <th>Drive Position</th>
                  <th>Branch & CGPA</th>
                  <th>Resume</th>
                  <th>Current ATS Stage</th>
                  <th class="text-end">Sequential Stage Advance</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let app of applications">
                  <td>
                    <div class="fw-semibold text-slate-900">{{ app.studentName }}</div>
                    <small class="text-muted">{{ app.studentEmail }}</small>
                  </td>
                  <td>
                    <div class="fw-semibold text-slate-900">{{ app.job?.title || 'Engineering Role' }}</div>
                    <small class="text-primary">{{ app.job?.companyName || 'Partner Corp' }}</small>
                  </td>
                  <td>
                    <div>{{ app.branch || 'B.Tech CSE' }}</div>
                    <small class="text-info fw-bold font-mono">CGPA: {{ app.cgpa || 8.5 }}</small>
                  </td>
                  <td>
                    <a [href]="app.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'" target="_blank" class="btn btn-outline-secondary btn-sm py-0.5 px-2" style="font-size: 0.72rem;">
                      PDF ↗
                    </a>
                  </td>
                  <td>
                    <span [class]="getPipelineStatusBadge(app.status)">
                      <i [class]="getPipelineStatusIcon(app.status) + ' me-1'"></i> {{ app.status }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="dropdown d-inline-block">
                      <button class="btn btn-primary btn-sm py-1 px-2.5 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Advance Stage ➔
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end shadow-sm border p-1" style="font-size: 0.8rem;">
                        <li><a class="dropdown-item py-1.5 rounded-8" (click)="updateStatus(app._id!, 'Resume Shortlisted')"><i class="bi bi-file-earmark-check text-primary me-2"></i>2. Resume Shortlisted</a></li>
                        <li><a class="dropdown-item py-1.5 rounded-8" (click)="updateStatus(app._id!, 'Aptitude Test Cleared')"><i class="bi bi-laptop text-info me-2"></i>3. Aptitude Test Cleared</a></li>
                        <li><a class="dropdown-item py-1.5 rounded-8" (click)="updateStatus(app._id!, 'Group Discussion Cleared')"><i class="bi bi-people text-warning me-2"></i>4. GD Cleared</a></li>
                        <li><a class="dropdown-item py-1.5 rounded-8" (click)="updateStatus(app._id!, 'Technical Interview Cleared')"><i class="bi bi-code text-primary me-2"></i>5. Tech Round Cleared</a></li>
                        <li><a class="dropdown-item py-1.5 rounded-8 text-success fw-bold" (click)="updateStatus(app._id!, 'HR Interview Cleared')"><i class="bi bi-award text-success me-2"></i>6. HR Interview Cleared</a></li>
                        <li><hr class="dropdown-divider my-1"></li>
                        <li><a class="dropdown-item py-1.5 rounded-8 text-success fw-bold" (click)="updateStatus(app._id!, 'Selected')"><i class="bi bi-patch-check text-success me-2"></i>7. Final Offer / Selected</a></li>
                        <li><a class="dropdown-item py-1.5 rounded-8 text-danger fw-bold" (click)="updateStatus(app._id!, 'Rejected')"><i class="bi bi-x-circle text-danger me-2"></i>Reject Candidate</a></li>
                      </ul>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="applications.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <div class="saas-empty-state py-3">
                      <i class="bi bi-inbox empty-icon"></i>
                      <div class="empty-title">No Candidate Applications Found</div>
                      <div class="empty-desc">No candidates match your current pipeline filter criteria.</div>
                    </div>
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
      case 'HR Interview Cleared': return 'badge badge-subtle-success font-mono';
      case 'Technical Interview Cleared':
      case 'Group Discussion Cleared': return 'badge badge-subtle-warning font-mono';
      case 'Aptitude Test Cleared':
      case 'Resume Shortlisted': return 'badge badge-subtle-primary font-mono';
      case 'Rejected': return 'badge badge-subtle-danger font-mono';
      default: return 'badge badge-subtle-primary font-mono';
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
      return 'badge badge-subtle-primary font-mono px-3 py-1.5';
    } else {
      return 'badge badge-subtle-secondary font-mono px-3 py-1.5';
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

  getShortlistedCount(): number {
    return this.applications.filter(a => a.status === 'Resume Shortlisted' || a.status === 'Aptitude Test Cleared').length;
  }

  getInterviewCount(): number {
    return this.applications.filter(a => a.status.includes('Interview') || a.status.includes('Discussion')).length;
  }

  getSelectedCount(): number {
    return this.applications.filter(a => a.status === 'Selected' || a.status === 'HR Interview Cleared').length;
  }
}
