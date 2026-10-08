import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { StudentService } from '../../core/services/student.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="d-flex flex-column gap-4 pb-4">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-main-title mb-1">Student Directory & Verification</h1>
          <p class="body-text mb-0">Manage verified student profiles, check eligibility records, and manage profile freezes</p>
        </div>
        <div class="d-flex gap-2">
          <button
            class="btn btn-secondary"
            (click)="onExportExcel()"
            [disabled]="isExporting"
          >
            <span *ngIf="isExporting" class="spinner-border spinner-border-sm me-1"></span>
            <i class="bi bi-file-earmark-excel text-success me-1"></i> Export Excel (.xlsx)
          </button>
          <button
            *ngIf="isAdmin()"
            class="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#studentModal"
            (click)="openAddModal()"
          >
            <i class="bi bi-person-plus me-1"></i> Add Student
          </button>
        </div>
      </div>

      <!-- Stage 1 Verification Queue KPI Strip -->
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-amber"><i class="bi bi-clock-history"></i></div>
            <div class="stat-content">
              <div class="stat-label">Pending Verification</div>
              <div class="stat-value text-warning">{{ getCountByStatus('Pending Verification') }}</div>
              <div class="stat-meta">Awaiting TPO Review</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-emerald"><i class="bi bi-lock-fill"></i></div>
            <div class="stat-content">
              <div class="stat-label">Verified & Frozen</div>
              <div class="stat-value text-success">{{ getCountByStatus('Verified') }}</div>
              <div class="stat-meta">Credentials Locked</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-danger"><i class="bi bi-x-circle"></i></div>
            <div class="stat-content">
              <div class="stat-label">Rejected Profiles</div>
              <div class="stat-value text-danger">{{ getCountByStatus('Rejected') }}</div>
              <div class="stat-meta">Corrections Required</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-blue"><i class="bi bi-people"></i></div>
            <div class="stat-content">
              <div class="stat-label">Total Candidates</div>
              <div class="stat-value text-primary">{{ students.length }}</div>
              <div class="stat-meta">Active Registered</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Multi-Search Bar -->
      <div class="enterprise-card p-3.5">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Search</label>
            <div class="input-group">
              <span class="input-group-text bg-transparent text-muted"><i class="bi bi-search"></i></span>
              <input type="text" [(ngModel)]="search" (ngModelChange)="loadStudents()" class="form-control" placeholder="Name, ID, email..." />
            </div>
          </div>
          <div class="col-md-3">
            <label class="form-label">Department</label>
            <select [(ngModel)]="filterDept" (change)="loadStudents()" class="form-select">
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Tech</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Verification Status</label>
            <select [(ngModel)]="filterVerif" (change)="loadStudents()" class="form-select">
              <option value="">All Statuses</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Verified">Verified & Frozen</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Min CGPA</label>
            <input type="number" step="0.5" [(ngModel)]="minCgpa" (ngModelChange)="loadStudents()" class="form-control" placeholder="e.g. 7.5" />
          </div>
          <div class="col-md-1 d-flex align-items-end">
            <button class="btn btn-secondary w-100 p-2" (click)="resetFilters()" title="Reset Filters">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Master Students Directory Table -->
      <div class="enterprise-card p-0">
        <div *ngIf="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="body-text mt-2">Loading students directory...</p>
        </div>

        <div *ngIf="!isLoading" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Department & Branch</th>
                <th>CGPA & Backlogs</th>
                <th>Verification Status</th>
                <th>Resume</th>
                <th *ngIf="isAdmin()" class="text-end text-nowrap" style="min-width: 160px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of students">
                <td>
                  <div class="d-flex align-items-center">
                    <img [src]="s.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'" class="rounded-circle me-2.5 border" style="width: 36px; height: 36px; object-fit: cover;" alt="Avatar" />
                    <div>
                      <div class="fw-semibold text-slate-900">{{ s.fullName }}</div>
                      <small class="text-muted">{{ s.email }}</small>
                    </div>
                  </div>
                </td>
                <td class="font-mono fw-bold text-primary">{{ s.studentId }}</td>
                <td>
                  <div class="text-slate-900">{{ s.department }}</div>
                  <small class="text-muted">{{ s.branch }}</small>
                </td>
                <td>
                  <span class="badge badge-subtle-primary font-mono">
                    CGPA: {{ s.cgpa }}
                  </span>
                  <div class="small text-muted mt-0.5">Backlogs: {{ s.backlogs || 0 }}</div>
                </td>
                <td>
                  <span [class]="getVerifClass(s.verificationStatus)">
                    <i [class]="getVerifIcon(s.verificationStatus) + ' me-1'"></i>
                    {{ s.verificationStatus || 'Draft' }}
                  </span>
                  <div *ngIf="s.isFrozen" class="small text-danger fw-semibold mt-0.5">
                    <i class="bi bi-lock-fill me-1"></i> Data Frozen
                  </div>
                </td>
                <td>
                  <a [href]="s.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'" target="_blank" class="btn btn-outline-secondary btn-sm py-0.5 px-2 text-nowrap" style="font-size: 0.72rem;">
                    PDF ↗
                  </a>
                </td>
                <td *ngIf="isAdmin()" class="text-end text-nowrap">
                  <div class="d-flex justify-content-end gap-1 flex-nowrap">
                    <button
                      *ngIf="s.verificationStatus !== 'Verified'"
                      class="btn btn-success btn-sm py-0.5 px-2.5 text-nowrap"
                      style="font-size: 0.75rem;"
                      (click)="verifyStudent(s._id!, 'approve')"
                    >
                      <i class="bi bi-shield-check me-1"></i> Verify & Freeze
                    </button>

                    <button
                      *ngIf="s.verificationStatus === 'Pending Verification'"
                      class="btn btn-outline-secondary text-danger btn-sm py-0.5 px-2 text-nowrap"
                      style="font-size: 0.75rem;"
                      (click)="verifyStudent(s._id!, 'reject')"
                    >
                      Reject
                    </button>

                    <button
                      *ngIf="s.isFrozen"
                      class="btn btn-secondary btn-sm py-0.5 px-2 text-warning text-nowrap"
                      style="font-size: 0.75rem;"
                      (click)="unlockStudent(s._id!)"
                    >
                      <i class="bi bi-unlock me-1"></i> Unlock
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="students.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <div class="saas-empty-state py-2">
                    <i class="bi bi-people empty-icon"></i>
                    <div class="empty-title">No student records found</div>
                    <div class="empty-desc">No candidates match your current search and filter criteria.</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Student Modal -->
      <div class="modal fade" id="studentModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900">
                <i class="bi bi-person-plus text-primary me-2"></i> Add Student Record
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="studentForm" (ngSubmit)="onSaveStudent()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Student ID / Enrollment *</label>
                    <input type="text" formControlName="studentId" class="form-control" placeholder="STU202688" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Full Name *</label>
                    <input type="text" formControlName="fullName" class="form-control" placeholder="John Doe" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Email Address *</label>
                    <input type="email" formControlName="email" class="form-control" placeholder="john@student.edu" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Phone Number *</label>
                    <input type="text" formControlName="phone" class="form-control" placeholder="+91 9876543210" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Department *</label>
                    <select formControlName="department" class="form-select">
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Tech</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Branch *</label>
                    <input type="text" formControlName="branch" class="form-control" placeholder="B.Tech CSE" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">CGPA (0 - 10) *</label>
                    <input type="number" step="0.1" formControlName="cgpa" class="form-control" placeholder="8.5" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Resume PDF Link *</label>
                    <input type="url" formControlName="resumeUrl" class="form-control" placeholder="https://example.com/resume.pdf" />
                  </div>
                </div>

                <div class="mt-4 text-end border-top pt-3">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" [disabled]="studentForm.invalid" class="btn btn-primary px-4" data-bs-dismiss="modal">
                    Save Record
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
export class StudentsComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  students: Student[] = [];
  isLoading = true;

  search = '';
  filterDept = '';
  filterVerif = '';
  minCgpa: number | null = null;
  isExporting = false;

  studentForm: FormGroup = this.fb.group({
    studentId: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['+91 9876543210', Validators.required],
    department: ['Computer Science', Validators.required],
    branch: ['B.Tech CSE', Validators.required],
    cgpa: [8.5, [Validators.required, Validators.min(0), Validators.max(10)]],
    resumeUrl: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', Validators.required]
  });

  ngOnInit(): void {
    this.loadStudents();
  }

  isAdmin(): boolean { return this.authService.getUserRole() === 'admin'; }

  getCountByStatus(status: string): number {
    return this.students.filter((s) => s.verificationStatus === status).length;
  }

  loadStudents(): void {
    this.isLoading = true;
    const filters = {
      search: this.search,
      department: this.filterDept,
      verificationStatus: this.filterVerif,
      minCgpa: this.minCgpa
    };

    this.studentService.getStudents(filters).subscribe({
      next: (res) => {
        const list = res.data || [];
        this.students = this.applyClientFilters(list);
        this.isLoading = false;
      },
      error: () => {
        this.students = [];
        this.isLoading = false;
        this.notify.showError('Failed to load students directory');
      }
    });
  }

  private applyClientFilters(list: Student[]): Student[] {
    const q = (this.search || '').toLowerCase().trim();
    return list.filter((s) => {
      const matchesSearch = !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.branch.toLowerCase().includes(q);
      const matchesDept = !this.filterDept || s.department === this.filterDept;
      const matchesVerif = !this.filterVerif || s.verificationStatus === this.filterVerif;
      const matchesCgpa = !this.minCgpa || s.cgpa >= this.minCgpa;
      return matchesSearch && matchesDept && matchesVerif && matchesCgpa;
    });
  }

  resetFilters(): void {
    this.search = '';
    this.filterDept = '';
    this.filterVerif = '';
    this.minCgpa = null;
    this.loadStudents();
  }

  verifyStudent(id: string, action: 'approve' | 'reject'): void {
    this.studentService.verifyStudentProfile(id, action).subscribe({
      next: (res) => {
        this.notify.showSuccess(res.message || 'Student profile verified and data frozen!');
        this.loadStudents();
      },
      error: (err) => this.notify.showError(err.error?.message || 'Verification failed')
    });
  }

  unlockStudent(id: string): void {
    this.studentService.unlockStudentProfile(id).subscribe({
      next: (res) => {
        this.notify.showSuccess(res.message || 'Student profile unlocked for updates.');
        this.loadStudents();
      },
      error: (err) => this.notify.showError(err.error?.message || 'Unlock failed')
    });
  }

  openAddModal(): void {
    this.studentForm.reset({
      studentId: 'STU2026' + Math.floor(100 + Math.random() * 900),
      department: 'Computer Science',
      branch: 'B.Tech CSE',
      cgpa: 8.5,
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    });
  }

  onSaveStudent(): void {
    if (this.studentForm.invalid) return;

    this.studentService.createStudent(this.studentForm.value).subscribe({
      next: () => {
        this.notify.showSuccess('Student record created successfully!');
        this.loadStudents();
      },
      error: (err) => this.notify.showError(err.error?.message || 'Create failed')
    });
  }

  getVerifClass(status?: string): string {
    switch (status) {
      case 'Verified': return 'badge badge-subtle-success font-mono';
      case 'Pending Verification': return 'badge badge-subtle-warning font-mono';
      case 'Rejected': return 'badge badge-subtle-danger font-mono';
      default: return 'badge badge-subtle-secondary font-mono';
    }
  }

  getVerifIcon(status?: string): string {
    switch (status) {
      case 'Verified': return 'bi-shield-check';
      case 'Pending Verification': return 'bi-clock-history';
      case 'Rejected': return 'bi-x-circle';
      default: return 'bi-pencil';
    }
  }

  onExportExcel(): void {
    this.isExporting = true;
    const filters = {
      department: this.filterDept,
      verificationStatus: this.filterVerif,
      minCgpa: this.minCgpa
    };

    this.studentService.exportStudentsToExcel(filters).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TPO_Master_Students_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
        this.notify.showSuccess('Excel Spreadsheet downloaded successfully!');
      },
      error: () => {
        this.isExporting = false;
        this.notify.showError('Failed to generate Excel file');
      }
    });
  }
}
