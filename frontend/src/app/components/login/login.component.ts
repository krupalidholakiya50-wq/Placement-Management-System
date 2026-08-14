import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 d-flex bg-main">
      <div class="container-fluid p-0">
        <div class="row g-0 min-vh-100">
          <!-- LEFT BRANDING & STATS HERO PANEL -->
          <div class="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
            <!-- Decorative Background Glow -->
            <div class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none opacity-20" style="background: radial-gradient(circle at 20% 20%, #2563eb 0%, transparent 50%);"></div>

            <div class="position-relative z-1">
              <div class="d-flex align-items-center mb-4">
                <div class="bg-primary text-white rounded-16 p-3 me-3 shadow-lg d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                  <i class="bi bi-briefcase-fill fs-3"></i>
                </div>
                <div>
                  <h3 class="fw-extrabold text-white mb-0">Placement<span class="text-primary ms-1">Cell</span></h3>
                  <small class="text-primary font-monospace fw-bold text-uppercase" style="font-size: 0.75rem;">University Portal 2026</small>
                </div>
              </div>
            </div>

            <div class="position-relative z-1 my-auto py-5">
              <span class="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-30 rounded-pill px-3 py-2 font-monospace mb-3">
                ENTERPRISE RECRUITMENT SYSTEM
              </span>
              <h1 class="fw-extrabold text-white display-5 mb-3" style="letter-spacing: -1px;">
                Empowering University Careers & Campus Recruiting
              </h1>
              <p class="text-slate-300 fs-5 mb-4 max-w-lg">
                Automated 4-stage placement workflow, smart backend eligibility engine, real-time recruitment pipeline & TPO verification.
              </p>

              <!-- Placement Key Stats -->
              <div class="row g-3 pt-3">
                <div class="col-4">
                  <div class="p-3 bg-white bg-opacity-10 rounded-16 border border-white border-opacity-10 backdrop-blur">
                    <h3 class="fw-bold text-white mb-0">98%</h3>
                    <small class="text-slate-300">Placement Rate</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="p-3 bg-white bg-opacity-10 rounded-16 border border-white border-opacity-10 backdrop-blur">
                    <h3 class="fw-bold text-success mb-0">28.5 LPA</h3>
                    <small class="text-slate-300">Highest Package</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="p-3 bg-white bg-opacity-10 rounded-16 border border-white border-opacity-10 backdrop-blur">
                    <h3 class="fw-bold text-info mb-0">120+</h3>
                    <small class="text-slate-300">Recruiter Drives</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top Recruiter Logos Footer -->
            <div class="position-relative z-1 pt-4 border-top border-slate-700">
              <small class="text-slate-400 font-monospace text-uppercase fw-semibold mb-2 d-block" style="font-size: 0.7rem;">TOP RECRUITING PARTNERS</small>
              <div class="d-flex align-items-center gap-4 text-slate-400 fw-bold fs-6">
                <span>Google</span> • <span>Microsoft</span> • <span>Amazon</span> • <span>TCS</span> • <span>Infosys</span>
              </div>
            </div>
          </div>

          <!-- RIGHT LOGIN FORM PANEL -->
          <div class="col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5 bg-main">
            <div class="w-100" style="max-width: 460px;">
              <!-- Form Header -->
              <div class="text-center mb-4">
                <div class="d-inline-flex bg-primary bg-opacity-10 text-primary rounded-circle p-3 mb-3">
                  <i class="bi bi-person-badge-fill fs-2"></i>
                </div>
                <h2 class="fw-bold text-slate-900 mb-1">Sign In to Your Account</h2>
                <p class="text-muted small">Select your portal role and enter credentials to continue</p>
              </div>

              <!-- Role Selector Tabs -->
              <div class="btn-group w-100 mb-4 p-1 bg-white border border-slate-200 rounded-16 shadow-sm">
                <button
                  type="button"
                  [class]="selectedRole === 'student' ? 'btn btn-primary rounded-12 fw-bold py-2' : 'btn btn-light rounded-12 text-slate-600 py-2'"
                  (click)="selectRole('student')"
                >
                  <i class="bi bi-mortarboard me-1"></i> Student
                </button>
                <button
                  type="button"
                  [class]="selectedRole === 'company' ? 'btn btn-primary rounded-12 fw-bold py-2' : 'btn btn-light rounded-12 text-slate-600 py-2'"
                  (click)="selectRole('company')"
                >
                  <i class="bi bi-building me-1"></i> Recruiter
                </button>
                <button
                  type="button"
                  [class]="selectedRole === 'admin' ? 'btn btn-primary rounded-12 fw-bold py-2' : 'btn btn-light rounded-12 text-slate-600 py-2'"
                  (click)="selectRole('admin')"
                >
                  <i class="bi bi-shield-check me-1"></i> TPO Admin
                </button>
              </div>

              <!-- 1-Click Demo Shortcut Buttons -->
              <div class="alert alert-info bg-info bg-opacity-10 border-info border-opacity-20 rounded-16 p-3 mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <small class="fw-bold text-info"><i class="bi bi-lightning-charge-fill me-1"></i>1-Click Demo Shortcuts</small>
                </div>
                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-sm btn-outline-primary rounded-pill flex-grow-1" (click)="fillDemoCredentials('admin')">
                    Admin
                  </button>
                  <button type="button" class="btn btn-sm btn-outline-primary rounded-pill flex-grow-1" (click)="fillDemoCredentials('student')">
                    Student
                  </button>
                  <button type="button" class="btn btn-sm btn-outline-primary rounded-pill flex-grow-1" (click)="fillDemoCredentials('company')">
                    Recruiter
                  </button>
                </div>
              </div>

              <!-- Login Form -->
              <div class="enterprise-card p-4 p-md-5 bg-white">
                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label class="form-label text-slate-700 fw-semibold small">Email Address</label>
                    <div class="input-group">
                      <span class="input-group-text bg-white border-slate-300 text-muted"><i class="bi bi-envelope"></i></span>
                      <input
                        type="email"
                        formControlName="email"
                        class="form-control border-slate-300"
                        placeholder="name@university.edu"
                      />
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label text-slate-700 fw-semibold small">Password</label>
                    <div class="input-group">
                      <span class="input-group-text bg-white border-slate-300 text-muted"><i class="bi bi-lock"></i></span>
                      <input
                        type="password"
                        formControlName="password"
                        class="form-control border-slate-300"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div *ngIf="errorMessage" class="alert alert-danger bg-danger bg-opacity-10 text-danger border-danger border-opacity-20 p-3 rounded-12 mb-3 small">
                    <i class="bi bi-exclamation-circle-fill me-1"></i> {{ errorMessage }}
                  </div>

                  <button
                    type="submit"
                    [disabled]="loginForm.invalid || isLoading"
                    class="btn btn-primary w-100 py-3 rounded-12 fw-bold shadow-sm"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Sign In to Workspace ➔
                  </button>
                </form>
              </div>

              <div class="text-center mt-4 text-muted small">
                Don't have a student profile? <a routerLink="/register" class="text-primary fw-bold text-decoration-none">Register Here</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  selectedRole: 'student' | 'company' | 'admin' = 'admin';
  isLoading = false;
  errorMessage = '';

  loginForm: FormGroup = this.fb.group({
    email: ['admin@placement.com', [Validators.required, Validators.email]],
    password: ['admin123', [Validators.required, Validators.minLength(6)]]
  });

  selectRole(role: 'student' | 'company' | 'admin'): void {
    this.selectedRole = role;
    this.fillDemoCredentials(role);
  }

  fillDemoCredentials(role: 'student' | 'company' | 'admin'): void {
    this.selectedRole = role;
    if (role === 'admin') {
      this.loginForm.patchValue({ email: 'admin@placement.com', password: 'admin123' });
    } else if (role === 'student') {
      this.loginForm.patchValue({ email: 'student@placement.com', password: 'student123' });
    } else if (role === 'company') {
      this.loginForm.patchValue({ email: 'company@placement.com', password: 'company123' });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.notify.showSuccess('Login successful! Redirecting to workspace...');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid login credentials. Please try again.';
      }
    });
  }
}
