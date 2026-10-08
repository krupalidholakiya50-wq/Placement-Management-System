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
    <div class="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4" style="background-color: #F1F5F9;">
      <div class="container" style="max-width: 1000px;">
        <div class="row g-0 overflow-hidden shadow-lg" style="border-radius: 16px; border: 1px solid #E2E8F0; background: #FFFFFF;">
          <!-- LEFT: Feature & Overview Panel -->
          <div class="col-lg-4 d-none d-lg-flex flex-column justify-content-between p-4 p-xl-5 text-white" style="background: linear-gradient(145deg, #1E293B 0%, #0F172A 100%);">
            <div>
              <div class="d-flex align-items-center gap-3 mb-4">
                <div class="brand-logo-badge">
                  <i class="bi bi-mortarboard-fill"></i>
                </div>
                <div>
                  <h3 class="fw-bold text-white mb-0 fs-5">Placement<span style="color: #60A5FA;">Pro</span></h3>
                  <span class="font-mono text-slate-400" style="font-size: 0.7rem;">UNIVERSITY T&P PORTAL</span>
                </div>
              </div>

              <h2 class="fw-bold text-white fs-4 lh-sm mb-3">Join the University Recruitment Ecosystem</h2>
              <p class="text-slate-300 small mb-4">Register as a Student Candidate, Corporate Recruiter HR, or TPO Administrator.</p>

              <div class="bg-slate-800 bg-opacity-50 p-3 rounded-10 border border-slate-700 mb-3">
                <div class="fw-semibold text-white small mb-1"><i class="bi bi-info-circle text-info me-1"></i> Registration Guidelines</div>
                <ul class="text-slate-300 small ps-3 mb-0" style="font-size: 0.78rem;">
                  <li>Students: Keep your university Roll ID and CGPA accurate.</li>
                  <li>Recruiters: Use official corporate domain email addresses.</li>
                  <li>All profiles undergo automated validation & verification.</li>
                </ul>
              </div>
            </div>

            <div class="pt-3 border-top border-slate-700 text-slate-400 font-mono" style="font-size: 0.72rem;">
              <i class="bi bi-shield-check text-success me-1"></i> High-Security University Portal
            </div>
          </div>

          <!-- RIGHT: Registration Form -->
          <div class="col-lg-8 p-4 p-md-5 d-flex flex-column justify-content-center bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 class="fw-bold text-slate-900 mb-0 fs-4">Create New Account</h3>
                <p class="body-text small mb-0">Select your account type to proceed</p>
              </div>
              <span class="badge badge-subtle-primary font-mono">STEP 1 OF 1</span>
            </div>

            <!-- Role Selection Tabs -->
            <div class="row g-2 mb-3">
              <div class="col-4">
                <button
                  type="button"
                  [class.btn-primary]="selectedRole === 'student'"
                  [class.btn-secondary]="selectedRole !== 'student'"
                  class="btn w-100 py-2 small fw-semibold"
                  (click)="onRoleChange('student')"
                >
                  <i class="bi bi-mortarboard me-1"></i> Student
                </button>
              </div>
              <div class="col-4">
                <button
                  type="button"
                  [class.btn-primary]="selectedRole === 'company'"
                  [class.btn-secondary]="selectedRole !== 'company'"
                  class="btn w-100 py-2 small fw-semibold"
                  (click)="onRoleChange('company')"
                >
                  <i class="bi bi-building me-1"></i> Recruiter
                </button>
              </div>
              <div class="col-4">
                <button
                  type="button"
                  [class.btn-primary]="selectedRole === 'admin'"
                  [class.btn-secondary]="selectedRole !== 'admin'"
                  class="btn w-100 py-2 small fw-semibold"
                  (click)="onRoleChange('admin')"
                >
                  <i class="bi bi-shield-check me-1"></i> TPO Admin
                </button>
              </div>
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <!-- Student Fields -->
              <ng-container *ngIf="selectedRole === 'student'">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Full Name *</label>
                    <input type="text" formControlName="name" class="form-control" placeholder="Alex Johnson" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Email Address *</label>
                    <input type="email" formControlName="email" class="form-control" placeholder="student@university.edu" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Student Roll ID *</label>
                    <input type="text" formControlName="studentId" class="form-control" placeholder="STU2026045" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Department *</label>
                    <select formControlName="department" class="form-select">
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics & Comm.</option>
                      <option value="Mechanical">Mechanical Engg.</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Branch *</label>
                    <input type="text" formControlName="branch" class="form-control" placeholder="B.Tech CSE" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Current CGPA *</label>
                    <input type="number" step="0.1" formControlName="cgpa" class="form-control" placeholder="8.5" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Backlogs *</label>
                    <input type="number" formControlName="backlogs" class="form-control" placeholder="0" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Account Password *</label>
                    <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
                  </div>
                </div>
              </ng-container>

              <!-- Recruiter Fields -->
              <ng-container *ngIf="selectedRole === 'company'">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Recruiter HR Name *</label>
                    <input type="text" formControlName="name" class="form-control" placeholder="Sarah Jenkins" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Corporate HR Email *</label>
                    <input type="email" formControlName="email" class="form-control" placeholder="recruitment@company.com" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Company Name *</label>
                    <input type="text" formControlName="companyName" class="form-control" placeholder="Google India" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Industry Domain *</label>
                    <select formControlName="department" class="form-select">
                      <option value="Computer Science">Product Development</option>
                      <option value="Information Technology">IT Services</option>
                      <option value="Electronics">Telecom & Cloud</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Account Password *</label>
                    <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
                  </div>
                </div>
              </ng-container>

              <!-- Admin Fields -->
              <ng-container *ngIf="selectedRole === 'admin'">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Placement Officer Name *</label>
                    <input type="text" formControlName="name" class="form-control" placeholder="Dr. Robert Vance" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">TPO Email Address *</label>
                    <input type="email" formControlName="email" class="form-control" placeholder="tpo.head@university.edu" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Officer Employee ID *</label>
                    <input type="text" formControlName="studentId" class="form-control" placeholder="TPO2026-01" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Department *</label>
                    <select formControlName="department" class="form-select">
                      <option value="Computer Science">University T&P Cell</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Master Password *</label>
                    <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
                  </div>
                </div>
              </ng-container>

              <button
                type="submit"
                [disabled]="registerForm.invalid || isLoading"
                class="btn btn-primary w-100 py-2.5 mt-3.5 fw-semibold"
              >
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                Create University Placement Account ➔
              </button>
            </form>

            <div class="text-center mt-3 pt-3 border-top">
              <span class="meta-text text-muted">Already registered? </span>
              <a routerLink="/login" class="text-primary fw-semibold small text-decoration-none ms-1">Sign In to Account</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .brand-logo-badge {
      width: 42px;
      height: 42px;
      background: #2563EB;
      color: #FFFFFF;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
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
  uploadedResumeUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    studentId: ['STU' + Math.floor(1000 + Math.random() * 9000), Validators.required],
    companyName: ['Corporate Partner'],
    role: ['student', Validators.required],
    department: ['Computer Science', Validators.required],
    branch: ['B.Tech CSE', Validators.required],
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

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;

    const payload = {
      ...this.registerForm.value,
      role: this.selectedRole,
      resumeUrl: this.uploadedResumeUrl
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.notify.showSuccess(`Account registered successfully for ${this.selectedRole.toUpperCase()}!`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.notify.showError(err.error?.message || 'Registration failed.');
      }
    });
  }
}
