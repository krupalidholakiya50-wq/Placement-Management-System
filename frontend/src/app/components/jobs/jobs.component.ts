import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Job, EligibilityResult } from '../../core/models/job.model';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="d-flex flex-column gap-4 pb-4">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-main-title mb-1">Campus Placement Drives</h1>
          <p class="body-text mb-0">Browse published JNFs, evaluate automated eligibility criteria, and submit applications</p>
        </div>
        <button
          *ngIf="canCreateJob()"
          class="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#createJobModal"
          (click)="openCreateModal()"
        >
          <i class="bi bi-plus-circle me-1"></i> Publish Placement Drive
        </button>
      </div>

      <!-- Live Job Drive Metrics Row -->
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-blue"><i class="bi bi-briefcase"></i></div>
            <div class="stat-content">
              <div class="stat-label">Total Drives</div>
              <div class="stat-value text-primary">{{ jobs.length }}</div>
              <div class="stat-meta">Active Placement JNFs</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-emerald"><i class="bi bi-trophy"></i></div>
            <div class="stat-content">
              <div class="stat-label">Highest CTC</div>
              <div class="stat-value text-success">{{ getHighestPackage() }} <small style="font-size: 14px;">LPA</small></div>
              <div class="stat-meta">Top Compensation</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-cyan"><i class="bi bi-graph-up"></i></div>
            <div class="stat-content">
              <div class="stat-label">Average CTC</div>
              <div class="stat-value text-info">{{ getAvgPackage() }} <small style="font-size: 14px;">LPA</small></div>
              <div class="stat-meta">Median Benchmark</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-navy"><i class="bi bi-person-workspace"></i></div>
            <div class="stat-content">
              <div class="stat-label">Full Time Roles</div>
              <div class="stat-value">{{ getFullTimeCount() }}</div>
              <div class="stat-meta">FTE Opportunities</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="enterprise-card p-3.5">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Search</label>
            <div class="input-group">
              <span class="input-group-text bg-transparent text-muted"><i class="bi bi-search"></i></span>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (ngModelChange)="filterJobs()"
                class="form-control"
                placeholder="Search drive title, company, role, location..."
              />
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label">Drive Type</label>
            <select [(ngModel)]="selectedType" (change)="filterJobs()" class="form-select">
              <option value="">All Drive Job Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Internship">Internship</option>
              <option value="Internship + Full Time">Internship + Full Time</option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-secondary w-100 p-2" (click)="resetFilters()" title="Reset Filters">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="body-text mt-2">Loading placement drives...</p>
      </div>

      <!-- Job Drive Cards Grid (Section 14 Spec) -->
      <div *ngIf="!isLoading" class="row g-3">
        <div *ngFor="let job of filteredJobs" class="col-12 col-md-6 col-lg-6 col-xl-4">
          <div class="enterprise-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <!-- Top Approval & Dream Offer Badges -->
              <div class="d-flex justify-content-between align-items-center mb-2.5 flex-wrap gap-1">
                <span [class]="getApprovalBadgeClass(job.approvalStatus)">
                  <i class="bi bi-shield-check me-1"></i> {{ job.approvalStatus || 'Approved' }}
                </span>

                <span *ngIf="job._id && eligibilityMap[job._id]?.isDreamOffer" class="badge badge-subtle-warning font-mono">
                  ✨ Dream Offer Unlocked (&gt; 2x CTC)
                </span>
              </div>

              <div class="d-flex justify-content-between align-items-start mb-2.5 gap-2">
                <div class="min-w-0 flex-grow-1">
                  <h4 class="fw-bold text-slate-900 mb-0.5 text-break">{{ job.title }}</h4>
                  <div class="text-primary fw-semibold small text-break"><i class="bi bi-building me-1"></i>{{ job.companyName }}</div>
                </div>
                <span class="badge badge-subtle-success font-mono fs-6 text-nowrap flex-shrink-0">
                  {{ job.salaryPackage || 12.0 }} LPA
                </span>
              </div>

              <p class="body-text small mb-3 text-clamp-2 text-break">
                {{ job.description }}
              </p>

              <!-- Eligibility Criteria Breakdown -->
              <div class="bg-slate-50 border rounded-8 p-2.5 mb-3 meta-text">
                <div class="mb-1"><i class="bi bi-award me-1 text-primary"></i> Min CGPA: <strong>{{ job.minCgpa }}</strong> • Backlogs: <strong>{{ job.maxBacklogs || 0 }}</strong></div>
                <div class="mb-1 text-break"><i class="bi bi-diagram-3 me-1 text-info"></i> Branches: <strong>{{ (job.eligibleBranches || ['CSE','IT']).join(', ') }}</strong></div>
                <div class="text-break"><i class="bi bi-file-text me-1 text-secondary"></i> Bond: <strong>{{ job.bond || 'No Service Bond' }}</strong></div>
              </div>

              <!-- Student Eligibility Status Pill -->
              <div *ngIf="userRole() === 'student' && job._id && eligibilityMap[job._id]" class="mb-3">
                <div *ngIf="isJobEligible(job._id)" class="badge badge-subtle-success p-2 rounded-8 w-100 text-start font-mono text-break">
                  <i class="bi bi-check-circle-fill me-1"></i> Eligible to apply for this drive
                </div>

                <div *ngIf="!isJobEligible(job._id)" class="badge badge-subtle-danger p-2 rounded-8 w-100 text-start font-mono text-break">
                  <i class="bi bi-lock-fill me-1"></i> Ineligible: {{ eligibilityMap[job._id].reasons[0] || 'Criteria not met' }}
                </div>
              </div>
            </div>

            <div class="border-top pt-3 mt-auto">
              <div class="d-flex justify-content-between meta-text mb-2.5 flex-wrap gap-1">
                <span class="text-break"><i class="bi bi-geo-alt me-1 text-danger"></i> {{ job.location }}</span>
                <span class="text-nowrap"><i class="bi bi-calendar-event me-1 text-warning"></i> {{ job.deadline | date:'mediumDate' }}</span>
              </div>


              <div class="d-grid gap-2">
                <button
                  *ngIf="userRole() === 'student'"
                  class="btn rounded-pill"
                  [class]="(job._id && isJobEligible(job._id)) ? 'btn-primary' : 'btn-secondary text-muted'"
                  [disabled]="!job._id || !isJobEligible(job._id) || applyingId === job._id"
                  (click)="applyJob(job)"
                >
                  <span *ngIf="applyingId === job._id" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="bi bi-send me-1"></i>
                  {{ (job._id && isJobEligible(job._id)) ? 'Apply Now' : 'Not Eligible' }}
                </button>

                <div *ngIf="userRole() !== 'student'" class="text-center meta-text py-1">
                  Drive Type: <span class="fw-semibold text-primary">{{ job.jobType }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredJobs.length === 0" class="col-12 text-center py-5 enterprise-card">
          <div class="saas-empty-state py-3">
            <i class="bi bi-briefcase empty-icon"></i>
            <div class="empty-title">No Placement Drives Found</div>
            <div class="empty-desc">Check back later or adjust your search filter criteria.</div>
          </div>
        </div>
      </div>

      <!-- Create Job Drive Modal -->
      <div class="modal fade" id="createJobModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900"><i class="bi bi-briefcase text-primary me-2"></i>Publish Placement Drive</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="jobForm" (ngSubmit)="onCreateJob()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Drive Title *</label>
                    <input type="text" formControlName="title" class="form-control" placeholder="Software Development Engineer" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Company Name *</label>
                    <input type="text" formControlName="companyName" class="form-control" placeholder="Google India" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Salary CTC Package (LPA) *</label>
                    <input type="number" step="0.5" formControlName="salaryPackage" class="form-control" placeholder="15.0" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Location *</label>
                    <input type="text" formControlName="location" class="form-control" placeholder="Bangalore / Hybrid" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Minimum CGPA *</label>
                    <input type="number" step="0.1" formControlName="minCgpa" class="form-control" placeholder="7.5" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Min 10th Marks (%) *</label>
                    <input type="number" formControlName="min10thPercent" class="form-control" placeholder="60.0" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Min 12th Marks (%) *</label>
                    <input type="number" formControlName="min12thPercent" class="form-control" placeholder="60.0" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Max Backlogs *</label>
                    <input type="number" formControlName="maxBacklogs" class="form-control" placeholder="0" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Eligible Branches *</label>
                    <input type="text" formControlName="eligibleBranches" class="form-control" placeholder="B.Tech CSE, B.Tech IT" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Service Bond</label>
                    <input type="text" formControlName="bond" class="form-control" placeholder="No Service Bond" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Open Positions *</label>
                    <input type="number" formControlName="openPositions" class="form-control" placeholder="15" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Selection Process</label>
                    <input type="text" formControlName="selectionProcess" class="form-control" placeholder="Online Test -> Technical -> HR" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Drive Description *</label>
                    <textarea formControlName="description" class="form-control" rows="3" placeholder="Describe placement drive requirements and roles..."></textarea>
                  </div>
                </div>

                <div class="mt-4 text-end border-top pt-3">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" [disabled]="jobForm.invalid" class="btn btn-primary px-4" data-bs-dismiss="modal">
                    Publish Drive
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JobsComponent implements OnInit {
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  isLoading = true;
  applyingId: string | null = null;
  searchTerm = '';
  selectedType = '';

  eligibilityMap: { [jobId: string]: EligibilityResult } = {};

  userRole = () => this.authService.getUserRole() || 'student';

  jobForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    companyName: ['', Validators.required],
    salaryPackage: [14.0, [Validators.required, Validators.min(0)]],
    location: ['Bangalore', Validators.required],
    minCgpa: [7.5, [Validators.required, Validators.min(0), Validators.max(10)]],
    min10thPercent: [60.0, [Validators.required, Validators.min(0), Validators.max(100)]],
    min12thPercent: [60.0, [Validators.required, Validators.min(0), Validators.max(100)]],
    maxBacklogs: [0, [Validators.required, Validators.min(0)]],
    jobType: ['Full Time', Validators.required],
    eligibleBranches: ['B.Tech CSE, B.Tech IT', Validators.required],
    bond: ['No Service Bond', Validators.required],
    openPositions: [15, Validators.required],
    selectionProcess: ['Online Test -> Tech Round -> HR', Validators.required],
    description: ['', Validators.required],
    deadline: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()]
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      this.loadJobs();
    });
  }

  isAdmin(): boolean { return this.userRole() === 'admin'; }
  isRecruiter(): boolean { return this.userRole() === 'company'; }

  canCreateJob(): boolean {
    return this.isAdmin() || this.isRecruiter();
  }

  isJobEligible(jobId: string): boolean {
    return !!(this.eligibilityMap[jobId] && this.eligibilityMap[jobId].isEligible);
  }

  loadJobs(): void {
    this.isLoading = true;
    this.jobService.getJobs().subscribe({
      next: (res) => {
        this.jobs = res.data || [];
        this.filterJobs();
        this.isLoading = false;
        
        if (this.userRole() === 'student') {
          this.runEligibilityEngine();
        }
      },
      error: () => {
        this.jobs = [];
        this.filterJobs();
        this.isLoading = false;
        this.notify.showError('Failed to load placement drives');
      }
    });
  }

  private runEligibilityEngine(): void {
    this.jobs.forEach((j) => {
      if (j._id) {
        this.jobService.checkEligibility(j._id).subscribe({
          next: (result) => {
            this.eligibilityMap[j._id!] = result;
          },
          error: (err) => {
            this.eligibilityMap[j._id!] = {
              success: false,
              isEligible: false,
              reasons: [err.error?.message || 'Failed to verify eligibility. Check profile status.']
            };
          }
        });
      }
    });
  }

  filterJobs(): void {
    const q = (this.searchTerm || '').toLowerCase().trim();
    this.filteredJobs = this.jobs.filter((j) => {
      const matchesSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        (j.description && j.description.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q)) ||
        (j.eligibleBranches && j.eligibleBranches.some((b) => b.toLowerCase().includes(q)));
      const matchesType = !this.selectedType || j.jobType === this.selectedType;
      return matchesSearch && matchesType;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.filterJobs();
  }

  applyJob(job: Job): void {
    if (!job._id) return;
    this.applyingId = job._id;

    this.applicationService.applyForJob({ jobId: job._id }).subscribe({
      next: () => {
        this.notify.showSuccess(`Application submitted successfully for ${job.title} at ${job.companyName}!`);
        this.applyingId = null;
        this.loadJobs();
      },
      error: (err) => {
        this.notify.showError(err.error?.message || 'Application failed.');
        this.applyingId = null;
      }
    });
  }

  approveDrive(jobId: string, approvalStatus: 'Approved' | 'Rejected'): void {
    this.jobService.approveJobDrive(jobId, approvalStatus).subscribe({
      next: () => {
        this.notify.showSuccess(`Job Drive status updated to ${approvalStatus}`);
        this.loadJobs();
      },
      error: (err) => this.notify.showError(err.error?.message || 'Approval update failed')
    });
  }

  openCreateModal(): void {
    this.jobForm.reset({
      salaryPackage: 14.0,
      location: 'Bangalore',
      minCgpa: 7.5,
      maxBacklogs: 0,
      jobType: 'Full Time',
      eligibleBranches: 'B.Tech CSE, B.Tech IT',
      bond: 'No Service Bond',
      openPositions: 15,
      selectionProcess: 'Online Test -> Tech Round -> HR',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  onCreateJob(): void {
    if (this.jobForm.invalid) return;

    const rawBranches = this.jobForm.value.eligibleBranches;
    const branchesArray = typeof rawBranches === 'string'
      ? rawBranches.split(',').map((b: string) => b.trim())
      : rawBranches;

    const payload = {
      ...this.jobForm.value,
      eligibleBranches: branchesArray
    };

    this.jobService.createJob(payload).subscribe({
      next: (res) => {
        this.notify.showSuccess(res.message || 'Placement job drive published successfully!');
        this.loadJobs();
      },
      error: (err) => this.notify.showError(err.error?.message || 'Posting failed')
    });
  }

  getApprovalBadgeClass(status?: string): string {
    switch (status) {
      case 'Approved':
        return 'badge badge-subtle-success font-mono';
      case 'Pending Admin Approval':
        return 'badge badge-subtle-warning font-mono';
      default:
        return 'badge badge-subtle-secondary font-mono';
    }
  }

  getHighestPackage(): number {
    if (!this.jobs.length) return 32.0;
    return Math.max(...this.jobs.map(j => j.salaryPackage || 0));
  }

  getAvgPackage(): number {
    if (!this.jobs.length) return 14.5;
    const sum = this.jobs.reduce((acc, j) => acc + (j.salaryPackage || 0), 0);
    return Math.round((sum / this.jobs.length) * 10) / 10;
  }

  getFullTimeCount(): number {
    return this.jobs.filter(j => j.jobType === 'Full Time' || !j.jobType).length;
  }
}
