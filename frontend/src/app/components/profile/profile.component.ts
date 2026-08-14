import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { StudentService } from '../../core/services/student.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Student, StudentDocument } from '../../core/models/student.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container py-3">
      <div class="row justify-content-center">
        <div class="col-lg-11">
          <!-- Profile Completion Banner -->
          <div class="enterprise-card p-4 mb-4 bg-white">
            <div class="row align-items-center">
              <div class="col-md-3 text-center border-end border-slate-200">
                <div class="position-relative d-inline-flex align-items-center justify-content-center">
                  <div class="display-6 fw-extrabold text-primary">{{ completionPercentage }}%</div>
                </div>
                <div class="text-muted small fw-bold mt-1 text-uppercase font-monospace">PROFILE COMPLETION</div>
              </div>

              <div class="col-md-6 my-3 my-md-0">
                <h5 class="fw-bold text-slate-900 mb-1">Student Profile Setup</h5>
                <p class="text-muted small mb-2">Complete all academic credentials, resume PDF, and marksheet documents for TPO Stage 1 Verification.</p>

                <!-- Missing Fields Chips -->
                <div *ngIf="missingFields.length > 0" class="d-flex flex-wrap gap-1 align-items-center">
                  <small class="text-warning fw-bold me-1"><i class="bi bi-exclamation-triangle-fill me-1"></i>Missing:</small>
                  <span *ngFor="let field of missingFields" class="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-30 rounded-pill px-2 py-1 small">
                    {{ field }}
                  </span>
                </div>
                <div *ngIf="missingFields.length === 0" class="text-success small fw-bold">
                  <i class="bi bi-check-circle-fill me-1"></i> All required profile information & documents completed!
                </div>
              </div>

              <div class="col-md-3 text-md-end">
                <button
                  type="button"
                  *ngIf="student?.verificationStatus !== 'Verified' && student?.verificationStatus !== 'Pending Verification'"
                  class="btn btn-warning rounded-pill px-4 fw-bold text-dark shadow-sm"
                  (click)="submitVerification()"
                >
                  <i class="bi bi-send-fill me-1"></i> Submit to TPO Cell
                </button>

                <div *ngIf="student?.verificationStatus === 'Pending Verification'" class="badge bg-warning text-dark px-3 py-2 rounded-pill font-monospace">
                  <i class="bi bi-clock-history me-1"></i> Under TPO Review
                </div>

                <div *ngIf="student?.verificationStatus === 'Verified'" class="badge bg-success text-white px-3 py-2 rounded-pill font-monospace">
                  <i class="bi bi-shield-check me-1"></i> Verified & Frozen
                </div>
              </div>
            </div>
          </div>

          <!-- Data Freeze Alert Banner -->
          <div *ngIf="student?.verificationStatus === 'Verified'" class="alert alert-success bg-success bg-opacity-10 text-success border border-success border-opacity-30 rounded-16 p-4 mb-4 d-flex align-items-center">
            <i class="bi bi-lock-fill fs-1 me-3"></i>
            <div>
              <strong class="d-block fs-6">🔒 STAGE 1 VERIFIED & PROFILE DATA FROZEN BY TPO CELL</strong>
              Your academic records (CGPA, Branch, Semester, Backlogs & Resume PDF) are verified by the University Placement Office and locked for drive eligibility. Contact Admin TPO Officer if unlocking is required.
            </div>
          </div>

          <!-- Tabbed Profile Form Card -->
          <div class="enterprise-card p-4 p-md-5 bg-white">
            <!-- Navigation Tabs -->
            <ul class="nav nav-tabs border-bottom mb-4">
              <li class="nav-item">
                <button [class]="activeTab === 'personal' ? 'nav-link active fw-bold text-primary' : 'nav-link text-slate-600'" (click)="activeTab = 'personal'">
                  <i class="bi bi-person-badge me-1"></i> Personal & Contact
                </button>
              </li>
              <li class="nav-item">
                <button [class]="activeTab === 'academic' ? 'nav-link active fw-bold text-primary' : 'nav-link text-slate-600'" (click)="activeTab = 'academic'">
                  <i class="bi bi-mortarboard me-1"></i> Academic Records
                </button>
              </li>
              <li class="nav-item">
                <button [class]="activeTab === 'skills' ? 'nav-link active fw-bold text-primary' : 'nav-link text-slate-600'" (click)="activeTab = 'skills'">
                  <i class="bi bi-code-slash me-1"></i> Skills & Portfolio
                </button>
              </li>
              <li class="nav-item">
                <button [class]="activeTab === 'documents' ? 'nav-link active fw-bold text-primary' : 'nav-link text-slate-600'" (click)="activeTab = 'documents'">
                  <i class="bi bi-file-earmark-pdf me-1"></i> Resume & Documents
                </button>
              </li>
            </ul>

            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
              <fieldset [disabled]="student?.isFrozen">
                <!-- TAB 1: PERSONAL DETAILS -->
                <div *ngIf="activeTab === 'personal'" class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-semibold">Enrollment Number / Student ID</label>
                    <input type="text" formControlName="studentId" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-semibold">Full Name</label>
                    <input type="text" formControlName="fullName" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-semibold">Email Address</label>
                    <input type="email" formControlName="email" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-semibold">Phone Number</label>
                    <input type="text" formControlName="phone" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-semibold">Gender</label>
                    <select formControlName="gender" class="form-select">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label text-slate-700 fw-semibold">Permanent Address</label>
                    <input type="text" formControlName="address" class="form-control" placeholder="123 University Campus, Tech Block" />
                  </div>
                </div>

                <!-- TAB 2: ACADEMIC DETAILS -->
                <div *ngIf="activeTab === 'academic'" class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-semibold">Department</label>
                    <select formControlName="department" class="form-select">
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Tech</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-semibold">Branch</label>
                    <input type="text" formControlName="branch" class="form-control" placeholder="B.Tech CSE" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-semibold">Current Semester</label>
                    <input type="text" formControlName="semester" class="form-control" placeholder="7th Semester" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-semibold">Academic Year</label>
                    <select formControlName="year" class="form-select">
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label text-slate-700 fw-semibold">CGPA (0 - 10)</label>
                    <input type="number" step="0.1" formControlName="cgpa" class="form-control" />
                  </div>
                  <div class="col-md-2">
                    <label class="form-label text-slate-700 fw-semibold">Active Backlogs</label>
                    <input type="number" formControlName="backlogs" class="form-control" />
                  </div>
                </div>

                <!-- TAB 3: SKILLS & PORTFOLIO -->
                <div *ngIf="activeTab === 'skills'" class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-semibold">Technical Skills (comma separated)</label>
                    <input type="text" formControlName="technicalSkills" class="form-control" placeholder="Angular 20, TypeScript, Node.js, Express, MongoDB" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-semibold">Soft Skills (comma separated)</label>
                    <input type="text" formControlName="softSkills" class="form-control" placeholder="Communication, Team Leadership, Problem Solving" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-semibold">LinkedIn Profile URL</label>
                    <input type="url" formControlName="linkedinUrl" class="form-control" placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-semibold">GitHub Profile URL</label>
                    <input type="url" formControlName="githubUrl" class="form-control" placeholder="https://github.com/..." />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-semibold">Portfolio Website URL</label>
                    <input type="url" formControlName="portfolioUrl" class="form-control" placeholder="https://myportfolio.com" />
                  </div>
                </div>

                <!-- TAB 4: RESUME PDF & DOCUMENTS -->
                <div *ngIf="activeTab === 'documents'" class="row g-3">
                  <div class="col-12">
                    <label class="form-label text-slate-700 fw-semibold">Primary Resume PDF URL</label>
                    <div class="input-group">
                      <span class="input-group-text bg-white border-slate-300 text-danger"><i class="bi bi-file-earmark-pdf-fill"></i></span>
                      <input type="url" formControlName="resumeUrl" class="form-control" placeholder="https://drive.google.com/your-resume.pdf" />
                      <a *ngIf="profileForm.value.resumeUrl" [href]="profileForm.value.resumeUrl" target="_blank" class="btn btn-outline-info">
                        Preview Resume ↗
                      </a>
                    </div>
                  </div>

                  <!-- Resume Versions Repository Card -->
                  <div class="col-12 mt-4">
                    <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                      <h6 class="fw-bold text-slate-900 mb-0"><i class="bi bi-folder2-open text-primary me-2"></i>Multi-Resume Version Repository</h6>
                      <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" (click)="onAddNewResumeVersion()">
                        <i class="bi bi-plus-circle me-1"></i> Add Version
                      </button>
                    </div>

                    <div class="row g-2 mb-3">
                      <div class="col-md-6" *ngFor="let v of (student?.resumeVersions || defaultResumeVersions)">
                        <div class="p-3 border rounded-12 bg-slate-50 d-flex justify-content-between align-items-center">
                          <div>
                            <div class="fw-bold text-slate-900 small d-flex align-items-center gap-1">
                              {{ v.title }}
                              <span *ngIf="v.isPrimary" class="badge bg-success text-white rounded-pill" style="font-size: 0.65rem;">Primary Active</span>
                            </div>
                            <a [href]="v.fileUrl" target="_blank" class="extra-small text-primary text-decoration-none font-monospace">
                              <i class="bi bi-link-45deg me-1"></i>Preview Resume PDF ↗
                            </a>
                          </div>
                          <button
                            *ngIf="!v.isPrimary"
                            type="button"
                            class="btn btn-sm btn-outline-success rounded-pill px-2 py-0 extra-small"
                            (click)="setPrimaryResume(v)"
                          >
                            Set Primary
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Uploaded Academic Marksheets & Identity Documents -->
                  <div class="col-12 mt-4">
                    <h6 class="fw-bold text-slate-900 border-bottom pb-2">Academic Marksheets & ID Documents</h6>
                    
                    <div class="table-responsive">
                      <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                          <tr class="text-muted small">
                            <th>Document Type</th>
                            <th>Document Name</th>
                            <th>Link URL</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><span class="badge bg-primary bg-opacity-10 text-primary">10th Marksheet</span></td>
                            <td>SSC Secondary Certificate</td>
                            <td><a [href]="profileForm.value.resumeUrl" target="_blank" class="text-primary text-decoration-none">View Marksheet ↗</a></td>
                            <td><span class="badge bg-success">Uploaded</span></td>
                          </tr>
                          <tr>
                            <td><span class="badge bg-primary bg-opacity-10 text-primary">12th Marksheet</span></td>
                            <td>HSC Higher Secondary Certificate</td>
                            <td><a [href]="profileForm.value.resumeUrl" target="_blank" class="text-primary text-decoration-none">View Marksheet ↗</a></td>
                            <td><span class="badge bg-success">Uploaded</span></td>
                          </tr>
                          <tr>
                            <td><span class="badge bg-info bg-opacity-10 text-info">Identity Card</span></td>
                            <td>University Student ID Card</td>
                            <td><a [href]="profileForm.value.resumeUrl" target="_blank" class="text-info text-decoration-none">View ID Card ↗</a></td>
                            <td><span class="badge bg-success">Uploaded</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </fieldset>

              <!-- Action Footer -->
              <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <button type="button" class="btn btn-light rounded-pill px-4" (click)="activeTab = 'personal'">Reset Tabs</button>

                <button
                  type="submit"
                  [disabled]="student?.isFrozen || profileForm.invalid || isSaving"
                  class="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm"
                >
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ student?.isFrozen ? 'Data Locked by TPO' : 'Save Profile Changes' }}
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
  completionPercentage = 80;
  missingFields: string[] = [];
  activeTab: 'personal' | 'academic' | 'skills' | 'documents' = 'personal';
  isSaving = false;

  profileForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    studentId: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['+91 9876543210', Validators.required],
    gender: ['Male', Validators.required],
    address: ['123 Campus Lane, Tech Block', Validators.required],
    department: ['Computer Science', Validators.required],
    branch: ['B.Tech CSE', Validators.required],
    semester: ['7th Semester', Validators.required],
    year: ['4th Year', Validators.required],
    cgpa: [8.5, [Validators.required, Validators.min(0), Validators.max(10)]],
    backlogs: [0, [Validators.required, Validators.min(0)]],
    technicalSkills: ['Angular 20, TypeScript, Node.js, Express, MongoDB', Validators.required],
    softSkills: ['Communication, Team Leadership', Validators.required],
    linkedinUrl: ['https://linkedin.com/in/student', Validators.required],
    githubUrl: ['https://github.com/student', Validators.required],
    portfolioUrl: ['https://portfolio.student.dev', Validators.required],
    resumeUrl: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', Validators.required]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.studentService.getProfile().subscribe({
      next: (res) => {
        if (res.data) {
          this.student = res.data;
          this.completionPercentage = res.completionPercentage || res.data.profileCompletion || 80;
          this.missingFields = res.missingFields || [];

          this.profileForm.patchValue({
            fullName: res.data.fullName,
            studentId: res.data.studentId,
            email: res.data.email,
            phone: res.data.phone,
            gender: res.data.gender,
            address: res.data.address || '123 Campus Lane, Tech Block',
            department: res.data.department,
            branch: res.data.branch,
            semester: res.data.semester || '7th Semester',
            year: res.data.year,
            cgpa: res.data.cgpa,
            backlogs: res.data.backlogs || 0,
            technicalSkills: Array.isArray(res.data.technicalSkills) ? res.data.technicalSkills.join(', ') : res.data.technicalSkills,
            softSkills: Array.isArray(res.data.softSkills) ? res.data.softSkills.join(', ') : res.data.softSkills,
            linkedinUrl: res.data.linkedinUrl || 'https://linkedin.com/in/student',
            githubUrl: res.data.githubUrl || 'https://github.com/student',
            portfolioUrl: res.data.portfolioUrl || 'https://portfolio.student.dev',
            resumeUrl: res.data.resumeUrl
          });

          if (res.data.isFrozen) {
            this.profileForm.disable();
          }
        }
      }
    });
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
      technicalSkills: typeof rawTech === 'string' ? rawTech.split(',').map((s: string) => s.trim()) : rawTech,
      softSkills: typeof rawSoft === 'string' ? rawSoft.split(',').map((s: string) => s.trim()) : rawSoft
    };

    const request$ = this.student?._id
      ? this.studentService.updateStudent(this.student._id, payload)
      : this.studentService.updateProfile(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.notify.showSuccess('Profile changes saved successfully!');
        this.loadProfile();
      },
      error: (err) => {
        this.isSaving = false;
        this.notify.showError(err.error?.message || 'Failed to save profile.');
      }
    });
  }

  defaultResumeVersions = [
    { title: 'Software Engineering Resume (SDE)', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isPrimary: true },
    { title: 'Data Analytics & Cloud Resume', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isPrimary: false }
  ];

  onAddNewResumeVersion(): void {
    const title = prompt('Enter Resume Version Title (e.g. Frontend Developer Resume):');
    if (!title) return;
    const fileUrl = prompt('Enter Resume PDF URL:', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
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
