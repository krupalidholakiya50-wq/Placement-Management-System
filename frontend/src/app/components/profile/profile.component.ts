import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { StudentService } from '../../core/services/student.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="d-flex flex-column gap-4 pb-4">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-main-title mb-1">Academic Profile & Credentials</h1>
          <p class="body-text mb-0">Maintain your academic records, verified resume PDF, and skills for placement drives</p>
        </div>

        <div>
          <button
            type="button"
            *ngIf="student?.verificationStatus !== 'Verified' && student?.verificationStatus !== 'Pending Verification'"
            class="btn btn-primary"
            (click)="submitVerification()"
          >
            <i class="bi bi-send me-1"></i> Submit for TPO Review
          </button>

          <span *ngIf="student?.verificationStatus === 'Pending Verification'" class="badge badge-subtle-warning font-mono p-2">
            <i class="bi bi-clock-history me-1"></i> Under TPO Review
          </span>

          <span *ngIf="student?.verificationStatus === 'Verified'" class="badge badge-subtle-success font-mono p-2">
            <i class="bi bi-shield-check me-1"></i> Verified & Frozen
          </span>
        </div>
      </div>

      <!-- Completion Ribbon -->
      <div class="enterprise-card p-4">
        <div class="row align-items-center g-3">
          <div class="col-md-3 text-center border-end">
            <div class="display-6 fw-bold text-primary">{{ completionPercentage }}%</div>
            <div class="stat-label mt-1">Profile Completion</div>
          </div>

          <div class="col-md-9">
            <h4 class="card-title-heading mb-1">Candidate Profile Status</h4>
            <p class="body-text small mb-2">Ensure your CGPA, 10th%, 12th%, backlogs and resume link are accurately filled.</p>

            <div *ngIf="missingFields.length > 0" class="d-flex flex-wrap gap-1.5 align-items-center">
              <small class="text-warning fw-semibold me-1"><i class="bi bi-exclamation-triangle me-1"></i>Missing Fields:</small>
              <span *ngFor="let field of missingFields" class="badge badge-subtle-warning font-mono" style="font-size: 0.7rem;">
                {{ field }}
              </span>
            </div>

            <div *ngIf="missingFields.length === 0" class="text-success small fw-semibold">
              <i class="bi bi-check-circle-fill me-1"></i> All academic credentials and documentation complete!
            </div>
          </div>
        </div>
      </div>

      <!-- Verified Freeze Alert -->
      <div *ngIf="student?.verificationStatus === 'Verified'" class="badge badge-subtle-success p-3 rounded-8 w-100 text-start d-flex align-items-center gap-3">
        <i class="bi bi-lock-fill fs-3 text-success"></i>
        <div>
          <strong class="d-block text-slate-900 fs-6">Stage 1 Verified & Profile Frozen by TPO Cell</strong>
          <span class="body-text small">Your academic records (CGPA, Branch, Backlogs & Resume) are locked in the university vault. Contact TPO Admin for any modifications.</span>
        </div>
      </div>

      <!-- Profile Form Card -->
      <div class="enterprise-card p-4">
        <!-- Navigation Tabs -->
        <div class="btn-group mb-4" role="group">
          <button 
            type="button"
            [class.btn-primary]="activeTab === 'personal'" 
            [class.btn-secondary]="activeTab !== 'personal'" 
            class="btn btn-sm" 
            (click)="activeTab = 'personal'"
          >
            <i class="bi bi-person me-1"></i> Personal
          </button>
          <button 
            type="button"
            [class.btn-primary]="activeTab === 'academic'" 
            [class.btn-secondary]="activeTab !== 'academic'" 
            class="btn btn-sm" 
            (click)="activeTab = 'academic'"
          >
            <i class="bi bi-mortarboard me-1"></i> Academic Records
          </button>
          <button 
            type="button"
            [class.btn-primary]="activeTab === 'skills'" 
            [class.btn-secondary]="activeTab !== 'skills'" 
            class="btn btn-sm" 
            (click)="activeTab = 'skills'"
          >
            <i class="bi bi-code me-1"></i> Skills & Links
          </button>
          <button 
            type="button"
            [class.btn-primary]="activeTab === 'documents'" 
            [class.btn-secondary]="activeTab !== 'documents'" 
            class="btn btn-sm" 
            (click)="activeTab = 'documents'"
          >
            <i class="bi bi-file-earmark-pdf me-1"></i> Resume PDF
          </button>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <fieldset [disabled]="student?.isFrozen">
            <!-- TAB 1: PERSONAL DETAILS -->
            <div *ngIf="activeTab === 'personal'" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Student ID / Enrollment No *</label>
                <input type="text" formControlName="studentId" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Full Name *</label>
                <input type="text" formControlName="fullName" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Email Address *</label>
                <input type="email" formControlName="email" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Contact Phone</label>
                <input type="text" formControlName="phone" class="form-control" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Gender</label>
                <select formControlName="gender" class="form-select">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="col-md-8">
                <label class="form-label">Permanent Address</label>
                <input type="text" formControlName="address" class="form-control" placeholder="123 University Campus, Block B" />
              </div>
            </div>

            <!-- TAB 2: ACADEMIC CREDENTIALS -->
            <div *ngIf="activeTab === 'academic'" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Department *</label>
                <select formControlName="department" class="form-select">
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Tech</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Branch *</label>
                <input type="text" formControlName="branch" class="form-control" placeholder="B.Tech CSE" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Current CGPA (0 - 10) *</label>
                <input type="number" step="0.1" formControlName="cgpa" class="form-control" placeholder="8.5" />
              </div>
              <div class="col-md-4">
                <label class="form-label">10th Grade Marks (%)</label>
                <input type="number" step="0.1" formControlName="tenthPercentage" class="form-control" placeholder="85.0" />
              </div>
              <div class="col-md-4">
                <label class="form-label">12th Grade Marks (%)</label>
                <input type="number" step="0.1" formControlName="twelfthPercentage" class="form-control" placeholder="85.0" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Active Backlogs Count *</label>
                <input type="number" formControlName="backlogs" class="form-control" placeholder="0" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Passing Year</label>
                <input type="number" formControlName="passingYear" class="form-control" placeholder="2026" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Current Semester</label>
                <input type="text" formControlName="semester" class="form-control" placeholder="7th Semester" />
              </div>
            </div>

            <!-- TAB 3: SKILLS & PORTFOLIO -->
            <div *ngIf="activeTab === 'skills'" class="row g-3">
              <div class="col-12">
                <label class="form-label">Technical Skills (comma separated)</label>
                <input type="text" formControlName="skills" class="form-control" placeholder="Angular, Node.js, Python, MongoDB, Docker" />
              </div>
              <div class="col-md-6">
                <label class="form-label">LinkedIn Profile URL</label>
                <input type="url" formControlName="linkedIn" class="form-control" placeholder="https://linkedin.com/in/username" />
              </div>
              <div class="col-md-6">
                <label class="form-label">GitHub Portfolio URL</label>
                <input type="url" formControlName="github" class="form-control" placeholder="https://github.com/username" />
              </div>
            </div>

            <!-- TAB 4: RESUME PDF LINK -->
            <div *ngIf="activeTab === 'documents'" class="row g-3">
              <div class="col-12">
                <label class="form-label">Resume PDF Link *</label>
                <input type="url" formControlName="resumeUrl" class="form-control" placeholder="https://example.com/resume.pdf" />
              </div>

              <div class="col-12" *ngIf="profileForm.value.resumeUrl">
                <div class="p-3 bg-slate-50 border rounded-8 d-flex justify-content-between align-items-center">
                  <div>
                    <span class="fw-semibold text-slate-900"><i class="bi bi-file-earmark-pdf text-danger me-2"></i>Attached Resume PDF</span>
                    <small class="text-muted d-block font-mono">{{ profileForm.value.resumeUrl }}</small>
                  </div>
                  <a [href]="profileForm.value.resumeUrl" target="_blank" class="btn btn-secondary btn-sm">
                    Preview PDF ↗
                  </a>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-2" *ngIf="!student?.isFrozen">
              <button type="submit" [disabled]="profileForm.invalid || isSaving" class="btn btn-primary px-4">
                <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                Save Profile Changes
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  student: Student | null = null;
  activeTab: 'personal' | 'academic' | 'skills' | 'documents' = 'personal';
  isSaving = false;
  completionPercentage = 0;
  missingFields: string[] = [];

  profileForm: FormGroup = this.fb.group({
    studentId: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    gender: ['Male'],
    address: [''],
    department: ['Computer Science', Validators.required],
    branch: ['B.Tech CSE', Validators.required],
    cgpa: [8.5, [Validators.required, Validators.min(0), Validators.max(10)]],
    tenthPercentage: [85],
    twelfthPercentage: [85],
    backlogs: [0, [Validators.required, Validators.min(0)]],
    passingYear: [2026],
    semester: ['7th Semester'],
    skills: ['Angular, Node.js, TypeScript, SQL'],
    linkedIn: [''],
    github: [''],
    resumeUrl: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', Validators.required]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.studentService.getProfile().subscribe({
      next: (res) => {
        this.student = res.data;
        if (this.student) {
          this.profileForm.patchValue({
            studentId: this.student.studentId,
            fullName: this.student.fullName,
            email: this.student.email,
            phone: this.student.phone,
            gender: this.student.gender || 'Male',
            address: this.student.address,
            department: this.student.department,
            branch: this.student.branch,
            cgpa: this.student.cgpa,
            tenthPercentage: this.student.tenthPercentage || 85,
            backlogs: this.student.backlogs || 0,
            passingYear: 2026,
            semester: this.student.semester || '7th Semester',
            skills: Array.isArray(this.student.technicalSkills) ? this.student.technicalSkills.join(', ') : (Array.isArray(this.student.skills) ? this.student.skills.join(', ') : (this.student.technicalSkills || this.student.skills || '')),
            linkedIn: this.student.linkedinUrl || '',
            github: this.student.githubUrl || '',
            resumeUrl: this.student.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          });
        }
        this.loadCompletionStatus();
      },
      error: () => {}
    });
  }

  loadCompletionStatus(): void {
    this.studentService.getProfileCompletion().subscribe({
      next: (res) => {
        this.completionPercentage = res.completionPercentage || 0;
        this.missingFields = res.missingFields || [];
      },
      error: () => {}
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.isSaving = true;

    const val = this.profileForm.value;
    const skillsArray = typeof val.skills === 'string'
      ? val.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : val.skills;

    const payload = {
      ...val,
      skills: skillsArray
    };

    this.studentService.updateProfile(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.notify.showSuccess('Academic profile updated successfully!');
        this.loadProfile();
      },
      error: (err) => {
        this.isSaving = false;
        this.notify.showError(err.error?.message || 'Failed to update profile');
      }
    });
  }

  submitVerification(): void {
    this.studentService.submitForVerification().subscribe({
      next: () => {
        this.notify.showSuccess('Profile submitted to TPO Admin for verification!');
        this.loadProfile();
      },
      error: (err) => {
        this.notify.showError(err.error?.message || 'Submission failed');
      }
    });
  }
}
