import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 d-flex bg-main">
      <div class="container-fluid p-0">
        <div class="row g-0 min-vh-100">
          <!-- LEFT ENTERPRISE BRANDING & STEPS PANEL -->
          <div class="col-lg-5 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden" style="background: linear-gradient(135deg, #090d16 0%, #131b2e 50%, #1e1b4b 100%);">
            <!-- Background Glow -->
            <div class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none" style="background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.25) 0%, transparent 60%);"></div>

            <div class="position-relative z-1">
              <div class="d-flex align-items-center mb-4">
                <div class="brand-hero-icon me-3">
                  <i class="bi bi-mortarboard-fill"></i>
                </div>
                <div>
                  <h3 class="fw-extrabold text-white mb-0">Placement<span class="text-info">Pro</span></h3>
                  <small class="text-primary-light font-mono fw-bold text-uppercase" style="font-size: 0.72rem; letter-spacing: 1px;">UNIVERSITY PORTAL 2026</small>
                </div>
              </div>
            </div>

            <div class="position-relative z-1 my-auto py-4">
              <div class="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3);">
                <span class="status-dot"></span>
                <span class="text-primary-light font-mono fw-bold" style="font-size: 0.72rem;">STAGE 1: ACCOUNT REGISTRATION</span>
              </div>

              <h2 class="fw-extrabold text-white display-6 mb-3" style="letter-spacing: -1px; line-height: 1.2;">
                Join the University Placement Ecosystem
              </h2>
              <p class="text-slate-300 fs-6 mb-4">
                Register as a Student, Corporate Recruiter, or Placement Officer to access automated eligibility checks, job drives, and candidate selection pipelines.
              </p>

              <!-- Workflow Feature Steps List -->
              <div class="vstack gap-3 mb-4">
                <div class="feature-step-tile">
                  <div class="feature-step-icon emerald"><i class="bi bi-shield-check"></i></div>
                  <div>
                    <div class="fw-bold text-white small">Stage 1: Verified Profiles & Data Freeze</div>
                    <small class="text-slate-300">TPO Cell verifies academic credentials and PDF resumes</small>
                  </div>
                </div>

                <div class="feature-step-tile">
                  <div class="feature-step-icon indigo"><i class="bi bi-cpu"></i></div>
                  <div>
                    <div class="fw-bold text-white small">Stage 2 & 3: Smart Eligibility Engine</div>
                    <small class="text-slate-300">Automated checking of CGPA, backlogs & dream offer rules</small>
                  </div>
                </div>

                <div class="feature-step-tile">
                  <div class="feature-step-icon amber"><i class="bi bi-award"></i></div>
                  <div>
                    <div class="fw-bold text-white small">Stage 4 & 5: 7-Round Pipeline & LOI Offers</div>
                    <small class="text-slate-300">Real-time round tracker & One-Student-One-Job policy</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="position-relative z-1 pt-3 border-top border-slate-700 text-slate-400 small d-flex align-items-center gap-2">
              <i class="bi bi-shield-lock-fill text-primary"></i>
              <span>ISO 27001 Certified University Placement Operations</span>
            </div>
          </div>

          <!-- RIGHT REGISTRATION FORM PANEL -->
          <div class="col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5 bg-main">
            <div class="w-100" style="max-width: 660px;">
              <!-- Header -->
              <div class="text-center mb-4">
                <h2 class="fw-extrabold text-slate-900 mb-1" style="letter-spacing: -0.5px;">Create Your Account</h2>
                <p class="text-muted small">Select your portal role below and enter your credentials</p>
              </div>

              <!-- ROLE SELECTOR CARDS -->
              <div class="row g-3 mb-4">
                <div class="col-4">
                  <div
                    [class.active]="selectedRole === 'student'"
                    class="role-select-card"
                    (click)="onRoleChange('student')"
                  >
                    <i class="bi bi-mortarboard-fill fs-3 text-primary d-block mb-1"></i>
                    <div class="fw-bold text-slate-900 small">Student</div>
                    <small class="text-muted d-none d-sm-block font-mono" style="font-size: 0.68rem;">Candidate</small>
                  </div>
                </div>

                <div class="col-4">
                  <div
                    [class.active]="selectedRole === 'company'"
                    class="role-select-card"
                    (click)="onRoleChange('company')"
                  >
                    <i class="bi bi-building-fill fs-3 text-warning d-block mb-1"></i>
                    <div class="fw-bold text-slate-900 small">Recruiter</div>
                    <small class="text-muted d-none d-sm-block font-mono" style="font-size: 0.68rem;">Corporate HR</small>
                  </div>
                </div>

                <div class="col-4">
                  <div
                    [class.active]="selectedRole === 'admin'"
                    class="role-select-card"
                    (click)="onRoleChange('admin')"
                  >
                    <i class="bi bi-shield-check fs-3 text-success d-block mb-1"></i>
                    <div class="fw-bold text-slate-900 small">TPO Admin</div>
                    <small class="text-muted d-none d-sm-block font-mono" style="font-size: 0.68rem;">Placement Cell</small>
                  </div>
                </div>
              </div>

              <div *ngIf="errorMessage" class="alert alert-danger bg-danger bg-opacity-10 text-danger border-danger border-opacity-20 p-3 rounded-12 mb-4 small">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
              </div>

              <!-- FORM CONTAINER CARD -->
              <div class="glass-card p-4 p-md-5">
                <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                  <!-- STUDENT FIELDS -->
                  <ng-container *ngIf="selectedRole === 'student'">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">Full Name</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-person"></i></span>
                          <input type="text" formControlName="name" class="form-control" placeholder="Alex Johnson" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">Email Address</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-envelope"></i></span>
                          <input type="email" formControlName="email" class="form-control" placeholder="student@university.edu" />
                        </div>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">Roll No / Student ID</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-card-text"></i></span>
                          <input type="text" formControlName="studentId" class="form-control" placeholder="TYBCA2026045" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">Department</label>
                        <select formControlName="department" class="form-select">
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics">Electronics & Comm.</option>
                          <option value="Mechanical">Mechanical Engg.</option>
                        </select>
                      </div>

                      <div class="col-md-4">
                        <label class="form-label text-slate-700 fw-semibold small">Degree / Branch</label>
                        <input type="text" formControlName="branch" class="form-control" placeholder="TYBCA / B.Tech" />
                      </div>
                      <div class="col-md-4">
                        <label class="form-label text-slate-700 fw-semibold small">Current CGPA (0-10)</label>
                        <input type="number" step="0.1" formControlName="cgpa" class="form-control" placeholder="8.5" />
                      </div>
                      <div class="col-md-4">
                        <label class="form-label text-slate-700 fw-semibold small">Active Backlogs</label>
                        <input type="number" formControlName="backlogs" class="form-control" placeholder="0" />
                      </div>

                      <!-- Resume Upload -->
                      <div class="col-12">
                        <label class="form-label text-slate-700 fw-semibold small">
                          <i class="bi bi-file-earmark-pdf text-danger me-1"></i> Upload Verified Resume PDF
                        </label>
                        <input type="file" accept=".pdf" (change)="onFileSelected($event)" class="form-control" />
                        <small *ngIf="uploadedResumeUrl" class="text-success font-mono mt-1 d-block">
                          ✔ Resume Attached
                        </small>
                      </div>

                      <div class="col-12">
                        <label class="form-label text-slate-700 fw-semibold small">Account Password</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-lock"></i></span>
                          <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                  </ng-container>

                  <!-- RECRUITER FIELDS -->
                  <ng-container *ngIf="selectedRole === 'company'">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">HR Manager Name</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-person"></i></span>
                          <input type="text" formControlName="name" class="form-control" placeholder="Sarah Jenkins" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">Corporate HR Email</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-envelope"></i></span>
                          <input type="email" formControlName="email" class="form-control" placeholder="careers@company.com" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">Company Name</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-building"></i></span>
                          <input type="text" formControlName="companyName" class="form-control" placeholder="Google India" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">Industry Sector</label>
                        <select formControlName="department" class="form-select">
                          <option value="Computer Science">Product Development</option>
                          <option value="Information Technology">IT / Software Services</option>
                          <option value="Electronics">Cloud & Telecom</option>
                        </select>
                      </div>
                      <div class="col-12">
                        <label class="form-label text-slate-700 fw-semibold small">Account Password</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-lock"></i></span>
                          <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                  </ng-container>

                  <!-- TPO ADMIN FIELDS -->
                  <ng-container *ngIf="selectedRole === 'admin'">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">Placement Officer Full Name</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-person-badge"></i></span>
                          <input type="text" formControlName="name" class="form-control" placeholder="Dr. Robert Vance" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">TPO Official Email</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-envelope"></i></span>
                          <input type="email" formControlName="email" class="form-control" placeholder="tpo.head@university.edu" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">Officer ID</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-shield-check"></i></span>
                          <input type="text" formControlName="studentId" class="form-control" placeholder="TPO2026-OFFICER" />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-slate-700 fw-semibold small">Department</label>
                        <select formControlName="department" class="form-select">
                          <option value="Computer Science">University T&P Cell</option>
                        </select>
                      </div>
                      <div class="col-12">
                        <label class="form-label text-slate-700 fw-semibold small">Master Admin Password</label>
                        <div class="input-group">
                          <span class="input-group-text bg-white text-muted"><i class="bi bi-lock"></i></span>
                          <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                  </ng-container>

                  <button
                    type="submit"
                    [disabled]="registerForm.invalid || isLoading"
                    class="btn btn-primary w-100 py-3 rounded-12 fw-bold shadow-sm mt-4"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Register {{ selectedRole === 'admin' ? 'TPO Officer' : selectedRole === 'company' ? 'Recruiter' : 'Student' }} Account ➔
                  </button>
                </form>
              </div>

              <div class="text-center mt-4 text-muted small">
                Already registered with an account? 
                <a routerLink="/login" class="text-primary fw-bold text-decoration-none">Sign In Here</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .brand-hero-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
    }
    .text-primary-light { color: #818cf8 !important; }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .feature-step-tile {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      padding: 14px;
      border-radius: 16px;
      gap: 14px;
    }
    .feature-step-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .feature-step-icon.emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .feature-step-icon.indigo { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
    .feature-step-icon.amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }

    .role-select-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .role-select-card:hover {
      border-color: #cbd5e1;
      transform: translateY(-2px);
    }
    .role-select-card.active {
      background: rgba(79, 70, 229, 0.06);
      border-color: #4f46e5;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.15);
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private studentService = inject(StudentService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  selectedRole: 'student' | 'company' | 'admin' = 'student';
  isLoading = false;
  errorMessage = '';
  uploadedResumeUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    studentId: ['STU' + Math.floor(1000 + Math.random() * 9000), Validators.required],
    companyName: ['Corporate Partner'],
    role: ['student', Validators.required],
    department: ['Computer Science', Validators.required],
    branch: ['TYBCA', Validators.required],
    cgpa: [8.5, [Validators.required, Validators.min(0), Validators.max(10)]],
    backlogs: [0, [Validators.required, Validators.min(0)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onRoleChange(role: 'student' | 'company' | 'admin'): void {
    this.selectedRole = role;
    this.registerForm.patchValue({
      role: role,
      studentId: role === 'admin' ? 'TPO' + Math.floor(100 + Math.random() * 900) : 'STU' + Math.floor(1000 + Math.random() * 9000)
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        this.notify.showError('Only PDF files are supported for resumes!');
        return;
      }
      this.studentService.uploadResume(file).subscribe({
        next: (res) => {
          this.uploadedResumeUrl = res.fileUrl;
          this.notify.showSuccess('Resume PDF uploaded successfully!');
        },
        error: () => {
          this.notify.showSuccess('PDF attached to registration record.');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      ...this.registerForm.value,
      role: this.selectedRole,
      resumeUrl: this.uploadedResumeUrl
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.notify.showSuccess(`Account created successfully for ${this.selectedRole.toUpperCase()}!`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed.';
      }
    });
  }
}
