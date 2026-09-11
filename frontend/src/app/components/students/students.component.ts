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
    <div class="container-fluid px-4 py-3">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-slate-900 mb-1"><i class="bi bi-shield-check text-primary me-2"></i>Stage 1: Admin TPO Verification Queue</h3>
          <p class="text-muted mb-0">Review student academic records, preview resume PDFs & freeze verified profiles</p>
        </div>
        <div class="d-flex gap-2">
          <button
            class="btn btn-success px-3 py-2 rounded-pill fw-bold shadow-sm"
            (click)="onExportExcel()"
            [disabled]="isExporting"
          >
            <span *ngIf="isExporting" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-file-earmark-excel-fill me-1"></i> Export Master List (.xlsx)
          </button>
          <button
            *ngIf="isAdmin()"
            class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm"
            data-bs-toggle="modal"
            data-bs-target="#studentModal"
            (click)="openAddModal()"
          >
            <i class="bi bi-person-plus-fill me-2"></i> Add Student Record
          </button>
        </div>
      </div>

      <!-- Stage 1 Verification Queue Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="enterprise-card p-3 d-flex align-items-center bg-warning bg-opacity-10 border-warning border-opacity-20">
            <div class="rounded-circle p-3 me-3 text-warning bg-white shadow-sm fs-4"><i class="bi bi-clock-history"></i></div>
            <div>
              <div class="text-warning font-monospace small fw-bold text-uppercase">WAITING VERIFICATION</div>
              <h3 class="fw-bold text-slate-900 mb-0">{{ getCountByStatus('Pending Verification') }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="enterprise-card p-3 d-flex align-items-center bg-success bg-opacity-10 border-success border-opacity-20">
            <div class="rounded-circle p-3 me-3 text-success bg-white shadow-sm fs-4"><i class="bi bi-lock-fill"></i></div>
            <div>
              <div class="text-success font-monospace small fw-bold text-uppercase">VERIFIED & FROZEN</div>
              <h3 class="fw-bold text-slate-900 mb-0">{{ getCountByStatus('Verified') }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="enterprise-card p-3 d-flex align-items-center bg-danger bg-opacity-10 border-danger border-opacity-20">
            <div class="rounded-circle p-3 me-3 text-danger bg-white shadow-sm fs-4"><i class="bi bi-x-circle"></i></div>
            <div>
              <div class="text-danger font-monospace small fw-bold text-uppercase">REJECTED PROFILES</div>
              <h3 class="fw-bold text-slate-900 mb-0">{{ getCountByStatus('Rejected') }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="enterprise-card p-3 d-flex align-items-center bg-info bg-opacity-10 border-info border-opacity-20">
            <div class="rounded-circle p-3 me-3 text-info bg-white shadow-sm fs-4"><i class="bi bi-file-earmark-pdf"></i></div>
            <div>
              <div class="text-info font-monospace small fw-bold text-uppercase">RESUMES ATTACHED</div>
              <h3 class="fw-bold text-slate-900 mb-0">{{ students.length }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Multi-Search Bar -->
      <div class="enterprise-card p-4 mb-4 bg-white">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label text-slate-700 small fw-semibold">Global Search</label>
            <div class="input-group">
              <span class="input-group-text bg-white border-slate-300 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" [(ngModel)]="search" (ngModelChange)="loadStudents()" class="form-control border-slate-300" placeholder="Name, Enrollment No, Email..." />
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label text-slate-700 small fw-semibold">Department</label>
            <select [(ngModel)]="filterDept" (change)="loadStudents()" class="form-select border-slate-300">
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Tech</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label text-slate-700 small fw-semibold">Verification Stage</label>
            <select [(ngModel)]="filterVerif" (change)="loadStudents()" class="form-select border-slate-300">
              <option value="">All Stages</option>
              <option value="Pending Verification">Pending Verification Queue</option>
              <option value="Verified">Verified & Frozen</option>
              <option value="Draft">Draft Mode</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label text-slate-700 small fw-semibold">Min CGPA Filter</label>
            <input type="number" step="0.5" [(ngModel)]="minCgpa" (ngModelChange)="loadStudents()" class="form-control border-slate-300" placeholder="Min CGPA (e.g. 7.5)" />
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100 rounded-pill" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- TPO Master Students Directory Table -->
      <div class="enterprise-card p-4 bg-white">
        <div *ngIf="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-2">Loading verification queue...</p>
        </div>

        <div *ngIf="!isLoading" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light sticky-top">
              <tr class="text-muted border-bottom small text-uppercase font-monospace">
                <th>Student</th>
                <th>Enrollment No</th>
                <th>Dept & Branch</th>
                <th>CGPA & Backlogs</th>
                <th>Stage 1 Verification</th>
                <th>Resume PDF</th>
                <th *ngIf="isAdmin()" class="text-end">TPO Verification Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of students" class="border-bottom">
                <td>
                  <div class="d-flex align-items-center">
                    <img [src]="s.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'" class="rounded-circle me-3 border p-1" style="width: 44px; height: 44px; object-fit: cover;" />
                    <div>
                      <div class="fw-bold text-slate-900">{{ s.fullName }}</div>
                      <small class="text-muted">{{ s.email }}</small>
                    </div>
                  </div>
                </td>
                <td class="fw-mono text-primary font-monospace fw-bold">{{ s.studentId }}</td>
                <td>
                  <div class="text-slate-900 font-semibold">{{ s.department }}</div>
                  <small class="text-muted">{{ s.branch }} • {{ s.semester || '7th Sem' }}</small>
                </td>
                <td>
                  <span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-20 rounded-pill px-3 py-1 fw-bold fs-6">
                    {{ s.cgpa }}
                  </span>
                  <div class="small text-muted mt-1">Backlogs: {{ s.backlogs || 0 }}</div>
                </td>
                <td>
                  <span [class]="getVerifClass(s.verificationStatus)">
                    <i [class]="getVerifIcon(s.verificationStatus) + ' me-1'"></i>
                    {{ s.verificationStatus || 'Draft' }}
                  </span>
                  <div *ngIf="s.isFrozen" class="small text-danger fw-bold mt-1">
                    <i class="bi bi-lock-fill me-1"></i> Data Frozen
                  </div>
                </td>
                <td>
                  <a [href]="s.resumeUrl" target="_blank" class="btn btn-sm btn-outline-danger rounded-pill">
                    <i class="bi bi-file-earmark-pdf me-1"></i> Preview PDF ↗
                  </a>
                </td>
                <td *ngIf="isAdmin()" class="text-end">
                  <div class="d-flex justify-content-end gap-1">
                    <button
                      *ngIf="s.verificationStatus !== 'Verified'"
                      class="btn btn-sm btn-success rounded-pill px-3 py-1 fw-bold shadow-sm"
                      style="font-size: 0.75rem;"
                      (click)="verifyStudent(s._id!, 'approve')"
                    >
                      <i class="bi bi-shield-check me-1"></i> Verify & Freeze
                    </button>

                    <button
                      *ngIf="s.verificationStatus === 'Pending Verification'"
                      class="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"
                      style="font-size: 0.75rem;"
                      (click)="verifyStudent(s._id!, 'reject')"
                    >
                      Reject
                    </button>

                    <button
                      *ngIf="s.isFrozen"
                      class="btn btn-sm btn-outline-warning rounded-pill px-2 py-1"
                      style="font-size: 0.75rem;"
                      (click)="unlockStudent(s._id!)"
                    >
                      <i class="bi bi-unlock-fill me-1"></i> Unlock Data
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="students.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="bi bi-people fs-1 d-block mb-2 text-slate-300"></i>
                  No student records match search or queue criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Student Modal -->
      <div class="modal fade" id="studentModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content enterprise-card border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900">
                <i class="bi bi-person-badge text-primary me-2"></i> Add New Student Record
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="studentForm" (ngSubmit)="onSaveStudent()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Enrollment Number / Student ID</label>
                    <input type="text" formControlName="studentId" class="form-control" placeholder="STU202688" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Full Name</label>
                    <input type="text" formControlName="fullName" class="form-control" placeholder="John Doe" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Email Address</label>
                    <input type="email" formControlName="email" class="form-control" placeholder="john@student.edu" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700">Phone Number</label>
                    <input type="text" formControlName="phone" class="form-control" placeholder="+91 9876543210" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700">Department</label>
                    <select formControlName="department" class="form-select">
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Tech</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700">Branch</label>
                    <input type="text" formControlName="branch" class="form-control" placeholder="B.Tech CSE" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700">CGPA (0 - 10)</label>
                    <input type="number" step="0.1" formControlName="cgpa" class="form-control" placeholder="8.5" />
                  </div>
                  <div class="col-12">
                    <label class="form-label text-slate-700">Resume PDF URL</label>
                    <input type="url" formControlName="resumeUrl" class="form-control" placeholder="https://example.com/resume.pdf" />
                  </div>
                </div>

                <div class="mt-4 text-end border-top pt-3">
                  <button type="button" class="btn btn-outline-secondary me-2 rounded-pill" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" [disabled]="studentForm.invalid" class="btn btn-primary rounded-pill px-4 shadow-sm" data-bs-dismiss="modal">
                    Save Student Record
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
      case 'Verified': return 'badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 rounded-pill px-3 py-1';
      case 'Pending Verification': return 'badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-20 rounded-pill px-3 py-1';
      case 'Rejected': return 'badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20 rounded-pill px-3 py-1';
      default: return 'badge bg-secondary bg-opacity-10 text-slate-700 rounded-pill px-3 py-1';
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
