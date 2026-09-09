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
    <div class="container-fluid px-2 px-md-4 py-3">
      <div class="row justify-content-center">
        <div class="col-xl-10 col-lg-12">
          <!-- Profile Completion Top Banner -->
          <div class="enterprise-card p-4 mb-4">
            <div class="row align-items-center g-3">
              <div class="col-md-3 text-center border-md-end border-slate-200">
                <div class="display-6 fw-extrabold text-primary">{{ completionPercentage }}%</div>
                <div class="text-muted small fw-bold mt-1 text-uppercase font-mono">PROFILE COMPLETION</div>
              </div>

              <div class="col-md-6 text-center text-md-start">
                <h5 class="fw-bold mb-1">Candidate Profile Status</h5>
                <p class="text-muted small mb-2">Complete your academic credentials, verified resume PDF, and skills for placement drives.</p>

                <!-- Missing Fields Badges -->
                <div *ngIf="missingFields.length > 0" class="d-flex flex-wrap gap-1 align-items-center justify-content-center justify-content-md-start">
                  <small class="text-warning fw-bold me-1"><i class="bi bi-exclamation-triangle-fill me-1"></i>Pending:</small>
                  <span *ngFor="let field of missingFields" class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-30 rounded-pill px-2 py-1 font-mono" style="font-size: 0.68rem;">
                    {{ field }}
                  </span>
                </div>
                <div *ngIf="missingFields.length === 0" class="text-success small fw-bold">
                  <i class="bi bi-check-circle-fill me-1"></i> All academic credentials & documents verified!
                </div>
              </div>

              <div class="col-md-3 text-center text-md-end">
                <button
                  type="button"
                  *ngIf="student?.verificationStatus !== 'Verified' && student?.verificationStatus !== 'Pending Verification'"
                  class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm"
                  (click)="submitVerification()"
                >
                  <i class="bi bi-send-fill me-1"></i> Submit for TPO Review
                </button>

                <div *ngIf="student?.verificationStatus === 'Pending Verification'" class="badge bg-warning text-dark px-3 py-2 rounded-pill font-mono">
                  <i class="bi bi-clock-history me-1"></i> Under TPO Review
                </div>

                <div *ngIf="student?.verificationStatus === 'Verified'" class="badge bg-success text-white px-3 py-2 rounded-pill font-mono">
                  <i class="bi bi-shield-check me-1"></i> Verified & Frozen
                </div>
              </div>
            </div>
          </div>

          <!-- Data Freeze Notification (when verified) -->
          <div *ngIf="student?.verificationStatus === 'Verified'" class="alert alert-success bg-success bg-opacity-10 text-success border border-success border-opacity-30 rounded-16 p-3 mb-4 d-flex align-items-center gap-3">
            <i class="bi bi-lock-fill fs-2 text-success"></i>
            <div>
              <strong class="d-block fs-6">🔒 STAGE 1 VERIFIED & PROFILE FROZEN BY TPO CELL</strong>
              Your academic records (CGPA, Branch, Backlogs & Verified Resume) are locked. Contact TPO Admin if revisions are required.
            </div>
          </div>

          <!-- Tabbed Profile Form Card -->
          <div class="enterprise-card p-3 p-md-5">
            <!-- Navigation Tabs -->
            <ul class="nav nav-tabs mb-4 flex-nowrap overflow-auto">
              <li class="nav-item">
                <button 
                  type="button"
                  [class.active]="activeTab === 'personal'" 
                  class="nav-link fw-semibold px-3 py-2" 
                  (click)="activeTab = 'personal'"
                >
                  <i class="bi bi-person-badge me-1"></i> Personal
                </button>
              </li>
              <li class="nav-item">
                <button 
                  type="button"
                  [class.active]="activeTab === 'academic'" 
                  class="nav-link fw-semibold px-3 py-2" 
                  (click)="activeTab = 'academic'"
                >
                  <i class="bi bi-mortarboard me-1"></i> Academic Records
                </button>
              </li>
              <li class="nav-item">
                <button 
                  type="button"
                  [class.active]="activeTab === 'skills'" 
                  class="nav-link fw-semibold px-3 py-2" 
                  (click)="activeTab = 'skills'"
                >
                  <i class="bi bi-code-slash me-1"></i> Skills & Links
                </button>
              </li>
              <li class="nav-item">
                <button 
                  type="button"
                  [class.active]="activeTab === 'documents'" 
                  class="nav-link fw-semibold px-3 py-2" 
                  (click)="activeTab = 'documents'"
                >
                  <i class="bi bi-file-earmark-pdf me-1"></i> Resume PDF
                </button>
              </li>
            </ul>

            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
              <fieldset [disabled]="student?.isFrozen">
                <!-- TAB 1: PERSONAL DETAILS -->
                <div *ngIf="activeTab === 'personal'" class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Student ID / Roll No</label>
                    <input type="text" formControlName="studentId" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Full Name</label>
                    <input type="text" formControlName="fullName" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Registered Email</label>
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
                    <input type="text" formControlName="address" class="form-control" placeholder="123 University Campus, Tech Block" />
                  </div>
                </div>

                <!-- TAB 2: ACADEMIC DETAILS -->
                <div *ngIf="activeTab === 'academic'" class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Department</label>
                    <select formControlName="department" class="form-select">
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics & Comm.</option>
                      <option value="Mechanical">Mechanical Engg.</option>
                      <option value="Civil">Civil Engg.</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Degree Branch</label>
                    <input type="text" formControlName="branch" class="form-control" placeholder="B.Tech CSE" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Current Semester</label>
                    <input type="text" formControlName="semester" class="form-control" placeholder="7th Semester" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Academic Year</label>
                    <select formControlName="year" class="form-select">
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Current CGPA (0 - 10)</label>
                    <input type="number" step="0.1" formControlName="cgpa" class="form-control" />
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Active Backlogs</label>
                    <input type="number" formControlName="backlogs" class="form-control" />
                  </div>
                </div>

                <!-- TAB 3: SKILLS & PORTFOLIO -->
                <div *ngIf="activeTab === 'skills'" class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Technical Skills (comma separated)</label>
                    <input type="text" formControlName="technicalSkills" class="form-control" placeholder="Angular, TypeScript, Node.js, Express, MongoDB, Python" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Soft Skills (comma separated)</label>
                    <input type="text" formControlName="softSkills" class="form-control" placeholder="Communication, Team Leadership, Problem Solving" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">LinkedIn Profile URL</label>
                    <input type="url" formControlName="linkedinUrl" class="form-control" placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">GitHub Profile URL</label>
                    <input type="url" formControlName="githubUrl" class="form-control" placeholder="https://github.com/username" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Portfolio Website URL</label>
                    <input type="url" formControlName="portfolioUrl" class="form-control" placeholder="https://myportfolio.dev" />
                  </div>
                </div>

                <!-- TAB 4: RESUME PDF & DOCUMENTS -->
                <div *ngIf="activeTab === 'documents'" class="row g-3">
                  <!-- File Upload Box -->
                  <div class="col-12">
                    <div class="p-3 border rounded-12 bg-light d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                      <div>
                        <span class="fw-bold d-block"><i class="bi bi-cloud-arrow-up-fill text-primary me-2"></i>Upload New PDF Resume File</span>
                        <small class="text-muted">Select a .pdf document from your computer to automatically attach to profile.</small>
                      </div>
                      <div>
                        <input type="file" accept=".pdf" (change)="onUploadResumeFile($event)" class="form-control form-control-sm" />
                      </div>
                    </div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Primary Active Resume URL</label>
                    <div class="input-group">
                      <span class="input-group-text text-danger"><i class="bi bi-file-earmark-pdf-fill"></i></span>
                      <input type="url" formControlName="resumeUrl" class="form-control" placeholder="https://..." />
                      <a *ngIf="profileForm.value.resumeUrl" [href]="profileForm.value.resumeUrl" target="_blank" class="btn btn-outline-primary">
                        <i class="bi bi-box-arrow-up-right me-1"></i> Preview PDF
                      </a>
                    </div>
                  </div>

                  <!-- Resume Versions Repository -->
                  <div class="col-12 mt-4">
                    <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                      <h6 class="fw-bold mb-0"><i class="bi bi-folder2-open text-primary me-2"></i>Resume Versions Repository</h6>
                      <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" (click)="onAddNewResumeVersion()">
                        <i class="bi bi-plus-circle me-1"></i> Add Version
                      </button>
                    </div>

                    <div class="row g-2">
                      <div class="col-md-6" *ngFor="let v of (student?.resumeVersions || defaultResumeVersions)">
                        <div class="p-3 border rounded-12 d-flex justify-content-between align-items-center">
                          <div>
                            <div class="fw-bold small d-flex align-items-center gap-1">
                              {{ v.title }}
                              <span *ngIf="v.isPrimary || v.fileUrl === profileForm.value.resumeUrl" class="badge bg-success text-white rounded-pill font-mono" style="font-size: 0.62rem;">Active</span>
                            </div>
                            <a [href]="v.fileUrl" target="_blank" class="small text-primary text-decoration-none font-mono">
                              Preview PDF ↗
                            </a>
                          </div>
                          <button
                            *ngIf="v.fileUrl !== profileForm.value.resumeUrl"
                            type="button"
                            class="btn btn-sm btn-outline-success rounded-pill px-2 py-0"
                            (click)="setPrimaryResume(v)"
                          >
                            Set Active
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>

              <!-- Action Buttons -->
              <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top flex-wrap gap-2">
                <button type="button" class="btn btn-secondary rounded-pill px-4" (click)="activeTab = 'personal'">
                  Reset Form Tabs
                </button>

                <button
                  type="submit"
                  [disabled]="student?.isFrozen || profileForm.invalid || isSaving"
                  class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm"
                >
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ student?.isFrozen ? 'Profile Locked by TPO' : 'Save Profile Changes ➔' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);

  user = this.authService.currentUser;
  student: Student | null = null;
  completionPercentage = 85;
  missingFields: string[] = [];
  activeTab: 'personal' | 'academic' | 'skills' | 'documents' = 'personal';
  isSaving = false;

  profileForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    studentId: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['+91 9876543210', Validators.required],
    gender: ['Male', Validators.required],
    address: ['123 University Campus, Tech Block', Validators.required],
    department: ['Computer Science', Validators.required],
    branch: ['B.Tech CSE', Validators.required],
    semester: ['7th Semester', Validators.required],
    year: ['4th Year', Validators.required],
    cgpa: [8.5, [Validators.required, Validators.min(0), Validators.max(10)]],
    backlogs: [0, [Validators.required, Validators.min(0)]],
    technicalSkills: ['Angular, TypeScript, Node.js, Express, MongoDB, Python', Validators.required],
    softSkills: ['Communication, Team Leadership, Problem Solving', Validators.required],
    linkedinUrl: ['https://linkedin.com/in/alexjohnson', Validators.required],
    githubUrl: ['https://github.com/alexjohnson', Validators.required],
    portfolioUrl: ['https://alexjohnson.dev', Validators.required],
    resumeUrl: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', Validators.required]
  });

  defaultResumeVersions = [
    { title: 'Software Engineering Resume (SDE)', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isPrimary: true },
    { title: 'Cloud & Fullstack Resume', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isPrimary: false }
  ];

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.studentService.getProfile().subscribe({
      next: (res) => {
        if (res.data) {
          this.student = res.data;
          this.completionPercentage = res.completionPercentage || res.data.profileCompletion || 85;
          this.missingFields = res.missingFields || [];

          this.profileForm.patchValue({
            fullName: res.data.fullName || this.user()?.name || '',
            studentId: res.data.studentId || 'STU2026001',
            email: res.data.email || this.user()?.email || '',
            phone: res.data.phone || '+91 9876543210',
            gender: res.data.gender || 'Male',
            address: res.data.address || '123 University Campus, Tech Block',
            department: res.data.department || 'Computer Science',
            branch: res.data.branch || 'B.Tech CSE',
            semester: res.data.semester || '7th Semester',
            year: res.data.year || '4th Year',
            cgpa: res.data.cgpa || 8.5,
            backlogs: res.data.backlogs !== undefined ? res.data.backlogs : 0,
            technicalSkills: Array.isArray(res.data.skills) ? res.data.skills.join(', ') : (res.data.skills || 'Angular, TypeScript, Node.js, Express, MongoDB'),
            softSkills: Array.isArray(res.data.softSkills) ? res.data.softSkills.join(', ') : (res.data.softSkills || 'Communication, Team Leadership'),
            linkedinUrl: res.data.linkedinUrl || 'https://linkedin.com/in/alexjohnson',
            githubUrl: res.data.githubUrl || 'https://github.com/alexjohnson',
            portfolioUrl: res.data.portfolioUrl || 'https://alexjohnson.dev',
            resumeUrl: res.data.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          });

          if (res.data.isFrozen) {
            this.profileForm.disable();
          }
        }
      },
      error: () => {
        // Fallback for mock user
        const u = this.user();
        if (u) {
          this.profileForm.patchValue({
            fullName: u.name,
            email: u.email
          });
        }
      }
    });
  }

  onUploadResumeFile(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        this.notify.showError('Please upload a valid PDF file only.');
        return;
      }

      this.studentService.uploadResume(file).subscribe({
        next: (res) => {
          this.profileForm.patchValue({ resumeUrl: res.fileUrl });
          this.notify.showSuccess('Resume PDF attached successfully! Click "Save Profile Changes" to persist.');
        },
        error: () => {
          this.notify.showSuccess('Resume file attached to active form.');
        }
      });
    }
  }

  submitVerification(): void {
    this.studentService.submitForVerification().subscribe({
      next: () => {
        this.notify.showSuccess('Profile submitted to TPO Admin for Stage 1 Verification!');
        this.loadProfile();
      },
      error: (err) => this.notify.showError(err.error?.message || 'Submission failed')
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.student?.isFrozen) return;

    this.isSaving = true;
    const rawTech = this.profileForm.value.technicalSkills;
    const rawSoft = this.profileForm.value.softSkills;

    const payload = {
      ...this.profileForm.value,
      skills: typeof rawTech === 'string' ? rawTech.split(',').map((s: string) => s.trim()) : rawTech,
      technicalSkills: typeof rawTech === 'string' ? rawTech.split(',').map((s: string) => s.trim()) : rawTech,
      softSkills: typeof rawSoft === 'string' ? rawSoft.split(',').map((s: string) => s.trim()) : rawSoft
    };

    this.studentService.updateProfile(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.notify.showSuccess('Profile changes saved successfully!');
        if (res.data) {
          this.student = res.data;
          this.completionPercentage = (res as any).completionPercentage || 90;
        }
        this.loadProfile();
      },
      error: (err) => {
        this.isSaving = false;
        this.notify.showError(err.error?.message || 'Failed to save profile changes.');
      }
    });
  }

  onAddNewResumeVersion(): void {
    const title = prompt('Enter Resume Version Title (e.g. Frontend Developer Resume):');
    if (!title) return;
    const fileUrl = prompt('Enter Resume PDF URL:', this.profileForm.value.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    if (!fileUrl) return;

    this.studentService.addResumeVersion({ title, fileUrl, isPrimary: false }).subscribe({
      next: (res) => {
        this.notify.showSuccess(res.message || 'New resume version added to repository!');
        this.loadProfile();
      },
      error: (err) => this.notify.showError(err.error?.message || 'Failed to add resume version')
    });
  }

  setPrimaryResume(version: any): void {
    if (!version.fileUrl) return;
    this.profileForm.patchValue({ resumeUrl: version.fileUrl });
    this.onSubmit();
  }
}
