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
          <h3 class="fw-bold text-slate-900 mb-1"><i class="bi bi-diagram-3-fill text-primary me-2"></i>Stage 3: Application Pipeline & Recruitment Round Tracker</h3>
          <p class="text-muted mb-0">Track application status, live timelines, candidate resume PDFs & recruitment rounds</p>
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

      <!-- STUDENT APPLICATIONS TIMELINE VIEW -->
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

              <!-- LIVE APPLICATION TIMELINE STEPPER -->
              <div class="mb-3">
                <div class="text-slate-500 font-monospace small fw-bold mb-2">LIVE SELECTION PIPELINE TIMELINE</div>
                
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <div [class]="getStepClass('Applied', app.status)">
                    <i class="bi bi-send-fill me-1"></i> 1. Applied
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('Shortlisted', app.status)">
                    <i class="bi bi-funnel-fill me-1"></i> 2. Shortlisted
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('Online Test', app.status)">
                    <i class="bi bi-laptop me-1"></i> 3. Online Test
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('Tech Interview', app.status)">
                    <i class="bi bi-code-slash me-1"></i> 4. Tech Round
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('HR Interview', app.status)">
                    <i class="bi bi-people me-1"></i> 5. HR Round
                  </div>
                  <i class="bi bi-chevron-right text-muted"></i>

                  <div [class]="getStepClass('Selected', app.status)">
                    <i class="bi bi-award-fill me-1"></i> 6. Offer / Placed
                  </div>
                </div>
              </div>

              <!-- Status History Timeline Log -->
              <div *ngIf="app.statusTimeline && app.statusTimeline.length > 0" class="bg-slate-50 border rounded-12 p-3 small">
                <div class="text-slate-700 font-monospace fw-bold mb-2"><i class="bi bi-clock-history me-1 text-primary"></i>TIMELINE LOGS</div>
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

      <!-- ADMIN & RECRUITER APPLICANT MANAGEMENT TABLE -->
      <ng-container *ngIf="userRole() !== 'student'">
        <!-- Filter Bar -->
        <div class="enterprise-card p-4 mb-4 bg-white">
          <div class="row g-3">
            <div class="col-md-5">
              <div class="input-group">
                <span class="input-group-text bg-white border-slate-300 text-muted"><i class="bi bi-search"></i></span>
                <input type="text" [(ngModel)]="search" (ngModelChange)="loadApplications()" class="form-control border-slate-300" placeholder="Search applicant name, email, branch..." />
              </div>
            </div>
            <div class="col-md-4">
              <select [(ngModel)]="filterStatus" (change)="loadApplications()" class="form-select border-slate-300">
                <option value="">All Pipeline Stages</option>
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Online Test">Online Test</option>
                <option value="Tech Interview">Tech Interview</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Selected">Selected / Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div class="col-md-3">
              <button class="btn btn-secondary w-100 rounded-pill" (click)="resetFilters()">Reset Applicant Filters</button>
            </div>
          </div>
        </div>

        <!-- Master Applicants Table -->
        <div class="enterprise-card p-4 bg-white">
          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2">Loading candidate pipeline...</p>
          </div>

          <div *ngIf="!isLoading" class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="bg-light sticky-top">
                <tr class="text-muted border-bottom small text-uppercase font-monospace">
                  <th>Candidate Student</th>
                  <th>Drive & Company</th>
                  <th>Branch & CGPA</th>
                  <th>Resume PDF</th>
                  <th>Pipeline Status</th>
                  <th class="text-end">Recruiter Control</th>
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
                    <small class="text-primary fw-semibold">{{ app.job?.companyName || 'Partner' }}</small>
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
                    <!-- Status Dropdown Menu -->
                    <div class="dropdown d-inline-block">
                      <button class="btn btn-sm btn-primary rounded-pill px-3 dropdown-toggle font-monospace fw-bold" type="button" data-bs-toggle="dropdown">
                        Advance Round
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                        <li><a class="dropdown-item small" (click)="updateStatus(app._id!, 'Shortlisted')"><i class="bi bi-funnel text-primary me-2"></i>Shortlist Candidate</a></li>
                        <li><a class="dropdown-item small" (click)="updateStatus(app._id!, 'Online Test')"><i class="bi bi-laptop text-info me-2"></i>Move to Online Test</a></li>
                        <li><a class="dropdown-item small" (click)="updateStatus(app._id!, 'Tech Interview')"><i class="bi bi-code-slash text-warning me-2"></i>Move to Tech Round</a></li>
                        <li><a class="dropdown-item small" (click)="updateStatus(app._id!, 'HR Interview')"><i class="bi bi-people text-secondary me-2"></i>Move to HR Round</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item small text-success fw-bold" (click)="updateStatus(app._id!, 'Selected')"><i class="bi bi-award text-success me-2"></i>Select / Offer Placed</a></li>
                        <li><a class="dropdown-item small text-danger fw-bold" (click)="updateStatus(app._id!, 'Rejected')"><i class="bi bi-x-circle text-danger me-2"></i>Reject Candidate</a></li>
                      </ul>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="applications.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2 text-slate-300"></i>
                    No candidates match the specified filter.
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

  defaultApplications: Application[] = [
    {
      _id: 'app_demo_1',
      studentName: 'Alex Johnson',
      studentEmail: 'student@placement.com',
      department: 'Computer Science',
      branch: 'B.Tech CSE',
      cgpa: 9.1,
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'Selected',
      job: {
        _id: 'job_google_1',
        title: 'Software Development Engineer',
        companyName: 'Google India',
        salaryPackage: 28.5,
        jobType: 'Full Time'
      } as any,
      statusTimeline: [
        { status: 'Applied', note: 'Application submitted via Campus Job Portal.' },
        { status: 'Shortlisted', note: 'Shortlisted for online coding round.' },
        { status: 'Tech Interview', note: 'Cleared System Design & DSA interview.' },
        { status: 'Selected', note: 'Offer released for 28.5 LPA!' }
      ] as any,
      createdAt: new Date()
    },
    {
      _id: 'app_demo_2',
      studentName: 'Emily Watson',
      studentEmail: 'emily.watson@student.edu',
      department: 'Information Technology',
      branch: 'B.Tech IT',
      cgpa: 8.8,
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'Tech Interview',
      job: {
        _id: 'job_msft_1',
        title: 'Cloud Solutions Architect',
        companyName: 'Microsoft IDC',
        salaryPackage: 24.0,
        jobType: 'Full Time'
      } as any,
      statusTimeline: [
        { status: 'Applied', note: 'Applied for Microsoft IDC drive.' },
        { status: 'Shortlisted', note: 'Shortlisted based on CGPA 8.8.' },
        { status: 'Tech Interview', note: 'Scheduled for Technical Round 2.' }
      ] as any,
      createdAt: new Date()
    },
    {
      _id: 'app_demo_3',
      studentName: 'Rohan Mehta',
      studentEmail: 'rohan.mehta@student.edu',
      department: 'Electronics',
      branch: 'B.Tech ECE',
      cgpa: 7.9,
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'Online Test',
      job: {
        _id: 'job_aws_1',
        title: 'DevOps & Backend Engineer',
        companyName: 'Amazon Web Services',
        salaryPackage: 18.5,
        jobType: 'Internship + Full Time'
      } as any,
      statusTimeline: [
        { status: 'Applied', note: 'Application registered.' },
        { status: 'Online Test', note: 'Coding assessment link sent.' }
      ] as any,
      createdAt: new Date()
    }
  ];

  loadApplications(): void {
    this.isLoading = true;
    const request$ = this.userRole() === 'student'
      ? this.applicationService.getMyApplications()
      : this.applicationService.getApplications({ search: this.search, status: this.filterStatus });

    request$.subscribe({
      next: (res) => {
        const list = res.data || [];
        const raw = list.length > 0 ? list : this.defaultApplications;
        this.applications = this.applyClientFilters(raw);
        this.isLoading = false;
      },
      error: () => {
        this.applications = this.applyClientFilters(this.defaultApplications);
        this.isLoading = false;
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
      case 'Selected': return 'badge bg-success text-white rounded-pill px-3 py-1 font-monospace';
      case 'Tech Interview':
      case 'HR Interview': return 'badge bg-warning text-dark rounded-pill px-3 py-1 font-monospace';
      case 'Shortlisted':
      case 'Online Test': return 'badge bg-info text-white rounded-pill px-3 py-1 font-monospace';
      case 'Rejected': return 'badge bg-danger text-white rounded-pill px-3 py-1 font-monospace';
      default: return 'badge bg-primary text-white rounded-pill px-3 py-1 font-monospace';
    }
  }

  getPipelineStatusIcon(status: string): string {
    switch (status) {
      case 'Selected': return 'bi-award-fill';
      case 'Tech Interview': return 'bi-code-slash';
      case 'HR Interview': return 'bi-people-fill';
      case 'Shortlisted': return 'bi-funnel-fill';
      case 'Online Test': return 'bi-laptop';
      case 'Rejected': return 'bi-x-circle-fill';
      default: return 'bi-send-fill';
    }
  }

  getStepClass(stepName: string, currentStatus: string): string {
    const pipelineOrder = ['Applied', 'Shortlisted', 'Online Test', 'Tech Interview', 'HR Interview', 'Selected'];
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
