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
    <div class="container-fluid px-4 py-3">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-slate-900 mb-1"><i class="bi bi-building-check text-primary me-2"></i>Stage 4: Campus Job Portal & Dream Offer Engine</h3>
          <p class="text-muted mb-0">Explore placement drives, evaluate Auto-Debar rules & apply to Dream Offer upgrades</p>
        </div>
        <button
          *ngIf="canCreateJob()"
          class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm"
          data-bs-toggle="modal"
          data-bs-target="#createJobModal"
          (click)="openCreateModal()"
        >
          <i class="bi bi-plus-lg me-2"></i> Publish Campus Drive
        </button>
      </div>

      <!-- Filters & Search Bar -->
      <div class="enterprise-card p-4 mb-4 bg-white">
        <div class="row g-3">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-white border-slate-300 text-muted"><i class="bi bi-search"></i></span>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (ngModelChange)="filterJobs()"
                class="form-control border-slate-300"
                placeholder="Search drive title, company, role, location..."
              />
            </div>
          </div>
          <div class="col-md-3">
            <select [(ngModel)]="selectedType" (change)="filterJobs()" class="form-select border-slate-300">
              <option value="">All Drive Job Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Internship">Internship</option>
              <option value="Internship + Full Time">Internship + Full Time</option>
            </select>
          </div>
          <div class="col-md-4">
            <button class="btn btn-secondary w-100 rounded-pill" (click)="resetFilters()">Reset Drive Filters</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Evaluating Automatic Batch Eligibility & Dream Offer Rules...</p>
      </div>

      <!-- Job Drive Cards Grid -->
      <div *ngIf="!isLoading" class="row g-4">
        <div *ngFor="let job of filteredJobs" class="col-md-6 col-lg-4">
          <div class="enterprise-card p-4 h-100 d-flex flex-column">
            <!-- Top Approval & Dream Offer Badges -->
            <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
              <span [class]="getApprovalBadgeClass(job.approvalStatus)">
                <i class="bi bi-shield me-1"></i> Drive: {{ job.approvalStatus || 'Approved' }}
              </span>

              <!-- GOLDEN DREAM OFFER UPGRADE BADGE -->
              <span *ngIf="job._id && eligibilityMap[job._id]?.isDreamOffer" class="badge bg-warning text-dark border border-warning rounded-pill px-3 py-1 font-monospace fw-bold shadow-sm">
                ✨ Eligible for Dream Offer (>= 2x CTC)
              </span>
            </div>

            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 rounded-pill mb-2 px-3 py-1 fw-bold">
                  {{ job.jobType }}
                </span>
                <h4 class="fw-bold text-slate-900 mb-1">{{ job.title }}</h4>
                <div class="text-primary fw-semibold"><i class="bi bi-building me-1"></i>{{ job.companyName }}</div>
              </div>
              <span class="badge bg-success text-white rounded-pill px-3 py-2 fs-6 shadow-sm">
                {{ job.salaryPackage || 12.0 }} LPA
              </span>
            </div>

            <p class="text-slate-600 small mb-3 flex-grow-1">
              {{ job.description }}
            </p>

            <!-- AUTOMATIC BATCH ELIGIBILITY CALCULATOR WIDGET FOR DRIVE -->
            <div class="bg-primary bg-opacity-10 border border-primary border-opacity-20 rounded-12 p-3 mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-primary font-monospace fw-bold small text-uppercase"><i class="bi bi-cpu me-1"></i>AUTOMATIC BATCH ELIGIBILITY</span>
                <span class="badge bg-primary text-white font-monospace fs-6">{{ job.eligibilityPercentage || 78 }}%</span>
              </div>
              <div class="progress mb-2" style="height: 8px;">
                <div class="progress-bar bg-primary" [style.width.%]="job.eligibilityPercentage || 78"></div>
              </div>
              <div class="d-flex justify-content-between text-slate-700 small font-monospace">
                <span>Eligible: <strong>{{ job.eligibleStudentCount || 78 }}</strong></span>
                <span>Ineligible: <strong>{{ job.ineligibleStudentCount || 22 }}</strong></span>
              </div>
            </div>

            <!-- Eligibility Rules Criteria Breakdown -->
            <div class="bg-slate-50 border border-slate-200 rounded-12 p-3 mb-3 small">
              <div class="text-slate-500 font-monospace fw-bold mb-1">ELIGIBILITY CRITERIA</div>
              <div class="text-slate-800"><i class="bi bi-award me-1 text-primary"></i>Min CGPA: <strong>{{ job.minCgpa }}</strong></div>
              <div class="text-slate-800"><i class="bi bi-x-circle me-1 text-warning"></i>Max Backlogs: <strong>{{ job.maxBacklogs || 0 }}</strong></div>
              <div class="text-slate-800"><i class="bi bi-diagram-3 me-1 text-info"></i>Branches: <strong>{{ (job.eligibleBranches || ['CSE','IT']).join(', ') }}</strong></div>
              <div class="text-slate-800"><i class="bi bi-file-text me-1 text-secondary"></i>Bond: <strong>{{ job.bond || 'No Service Bond' }}</strong></div>
            </div>

            <!-- Individual Student Eligibility Breakdown -->
            <div *ngIf="userRole() === 'student' && job._id && eligibilityMap[job._id]" class="mb-3">
              <div *ngIf="isJobEligible(job._id)" class="alert alert-success bg-success bg-opacity-10 text-success border border-success border-opacity-30 p-2 mb-0 small rounded-12">
                <i class="bi bi-check-circle-fill me-1"></i> Verified profile meets all eligibility rules!
                <span *ngIf="eligibilityMap[job._id].isDreamOffer" class="badge bg-warning text-dark ms-1">Dream Offer Unlocked</span>
              </div>

              <div *ngIf="!isJobEligible(job._id)" class="alert alert-danger bg-danger bg-opacity-10 text-danger border border-danger border-opacity-30 p-2 mb-0 small rounded-12">
                <div class="fw-bold mb-1"><i class="bi bi-exclamation-triangle-fill me-1"></i>Ineligible for this drive:</div>
                <ul class="mb-0 ps-3">
                  <li *ngFor="let reason of eligibilityMap[job._id].reasons">{{ reason }}</li>
                </ul>
              </div>
            </div>

            <div class="border-top border-slate-200 pt-3 mt-auto">
              <div class="d-flex justify-content-between text-muted small mb-3">
                <span><i class="bi bi-geo-alt me-1"></i>{{ job.location }}</span>
                <span><i class="bi bi-calendar-event me-1"></i>Deadline: {{ job.deadline | date:'shortDate' }}</span>
              </div>

              <div class="d-grid gap-2">
                <button
                  *ngIf="userRole() === 'student'"
                  class="btn rounded-pill fw-bold py-2"
                  [class]="(job._id && isJobEligible(job._id)) ? 'btn-primary shadow-sm' : 'btn-secondary'"
                  [disabled]="!job._id || !isJobEligible(job._id) || applyingId === job._id"
                  (click)="applyJob(job)"
                >
                  <span *ngIf="applyingId === job._id" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="bi bi-send-fill me-1"></i>
                  {{ (job._id && isJobEligible(job._id)) ? 'Apply for Drive' : 'Ineligible to Apply' }}
                </button>

                <div *ngIf="userRole() !== 'student'" class="text-center text-muted small py-1 font-monospace">
                  Workspace: <span class="text-primary text-uppercase fw-semibold">{{ userRole() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredJobs.length === 0" class="col-12 text-center py-5 enterprise-card">
          <i class="bi bi-briefcase fs-1 text-slate-300"></i>
          <h5 class="text-slate-900 mt-3">No Placement Drives Found</h5>
          <p class="text-muted mb-0">Check back later or adjust search filter.</p>
        </div>
      </div>

      <!-- Stage 2 Create Job Drive Modal -->
      <div class="modal fade" id="createJobModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content enterprise-card border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900"><i class="bi bi-plus-circle text-primary me-2"></i>Publish Placement Drive</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="jobForm" (ngSubmit)="onCreateJob()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Drive Title</label>
                    <input type="text" formControlName="title" class="form-control" placeholder="Software Development Engineer" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Company Name</label>
                    <input type="text" formControlName="companyName" class="form-control" placeholder="Google India" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Salary CTC Package (LPA)</label>
                    <input type="number" step="0.5" formControlName="salaryPackage" class="form-control" placeholder="15.0" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Location</label>
                    <input type="text" formControlName="location" class="form-control" placeholder="Bangalore / Hybrid" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-slate-700">Minimum CGPA</label>
                    <input type="number" step="0.1" formControlName="minCgpa" class="form-control" placeholder="7.5" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-slate-700">Min 10th Marks (%)</label>
                    <input type="number" formControlName="min10thPercent" class="form-control" placeholder="60.0" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-slate-700">Min 12th Marks (%)</label>
                    <input type="number" formControlName="min12thPercent" class="form-control" placeholder="60.0" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-slate-700">Max Backlogs</label>
                    <input type="number" formControlName="maxBacklogs" class="form-control" placeholder="0" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Eligible Branches (comma separated)</label>
                    <input type="text" formControlName="eligibleBranches" class="form-control" placeholder="B.Tech CSE, B.Tech IT, B.Tech ECE" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Service Bond / Agreement</label>
                    <input type="text" formControlName="bond" class="form-control" placeholder="No Service Bond / 1 Year Bond" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Open Positions</label>
                    <input type="number" formControlName="openPositions" class="form-control" placeholder="15" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Selection Process</label>
                    <input type="text" formControlName="selectionProcess" class="form-control" placeholder="Online Test -> Technical -> HR" />
                  </div>
                  <div class="col-12">
                    <label class="form-label text-slate-700">Drive Description</label>
                    <textarea formControlName="description" class="form-control" rows="3" placeholder="Describe placement drive requirements and roles..."></textarea>
                  </div>
                </div>

                <div class="mt-4 text-end border-top pt-3">
                  <button type="button" class="btn btn-secondary me-2 rounded-pill" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" [disabled]="jobForm.invalid" class="btn btn-primary rounded-pill px-4 shadow-sm" data-bs-dismiss="modal">
                    Publish & Calculate Eligibility
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
        return 'badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 rounded-pill px-3 py-1 font-monospace';
      case 'Pending Admin Approval':
        return 'badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20 rounded-pill px-3 py-1 font-monospace';
      default:
        return 'badge bg-secondary bg-opacity-10 text-slate-700 rounded-pill px-3 py-1 font-monospace';
    }
  }
}
