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
          <div class="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden" style="background: linear-gradient(135deg, #090d16 0%, #131b2e 50%, #1e1b4b 100%);">
            <!-- Decorative Radial Background Glows -->
            <div class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none" style="background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%);"></div>

            <div class="position-relative z-1">
              <div class="d-flex align-items-center mb-4">
                <div class="brand-hero-icon me-3">
                  <i class="bi bi-mortarboard-fill"></i>
                </div>
                <div>
                  <h3 class="fw-extrabold text-white mb-0" style="letter-spacing: -0.5px;">Placement<span class="text-info">Pro</span></h3>
                  <small class="text-primary-light font-mono fw-bold text-uppercase" style="font-size: 0.72rem; letter-spacing: 1px;">CAMPUS PLACEMENT ECOSYSTEM</small>
                </div>
              </div>
            </div>

            <div class="position-relative z-1 my-auto py-5">
              <div class="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-4" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3);">
                <span class="status-dot"></span>
                <span class="text-primary-light font-mono fw-bold" style="font-size: 0.72rem;">ENTERPRISE TPO ARCHITECTURE 2026</span>
              </div>

              <h1 class="fw-extrabold text-white display-5 mb-3" style="letter-spacing: -1.5px; line-height: 1.15;">
                Transforming Campus Placements with <span class="text-gradient">Automated Intelligence</span>
              </h1>
              <p class="text-slate-300 fs-5 mb-4" style="max-width: 520px; line-height: 1.6;">
                Streamlined 7-stage candidate lifecycle, instant ATS candidate tracking, criteria verification, and multi-tier recruitment drive management.
              </p>

              <!-- Placement Key Stats -->
              <div class="row g-3 pt-2">
                <div class="col-4">
                  <div class="hero-stat-card">
                    <h3 class="fw-extrabold text-white mb-1">98.4%</h3>
                    <small class="text-slate-400 font-mono">Placement Rate</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="hero-stat-card">
                    <h3 class="fw-extrabold text-emerald mb-1">32.0 LPA</h3>
                    <small class="text-slate-400 font-mono">Highest Package</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="hero-stat-card">
                    <h3 class="fw-extrabold text-info mb-1">150+</h3>
                    <small class="text-slate-400 font-mono">Recruiter Drives</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top Recruiter Logos Footer -->
            <div class="position-relative z-1 pt-4 border-top border-slate-700">
              <small class="text-slate-400 font-mono text-uppercase fw-semibold mb-3 d-block" style="font-size: 0.68rem; letter-spacing: 0.8px;">TRUSTED BY LEADING GLOBAL RECRUITERS</small>
              <div class="d-flex align-items-center gap-4 text-slate-300 fw-bold fs-6 flex-wrap">
                <span class="recruiter-pill">Google</span>
                <span class="recruiter-pill">Microsoft</span>
                <span class="recruiter-pill">Amazon</span>
                <span class="recruiter-pill">TCS</span>
                <span class="recruiter-pill">Infosys</span>
                <span class="recruiter-pill">Adobe</span>
              </div>
            </div>
          </div>

          <!-- RIGHT LOGIN FORM PANEL -->
          <div class="col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5 bg-main">
            <div class="w-100" style="max-width: 480px;">
              <!-- Form Header -->
              <div class="text-center mb-4">
                <div class="d-inline-flex text-primary rounded-20 p-3 mb-3 shadow-sm" style="background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.2);">
                  <i class="bi bi-shield-lock-fill fs-2"></i>
                </div>
                <h2 class="fw-extrabold text-slate-900 mb-1" style="letter-spacing: -0.5px;">Sign In to Workspace</h2>
                <p class="text-muted small">Choose your workspace role to authenticate</p>
              </div>

              <!-- Role Selector Tabs -->
              <div class="role-switcher-grid mb-4">
                <button
                  type="button"
                  [class.active]="selectedRole === 'student'"
                  class="role-switch-btn"
                  (click)="selectRole('student')"
                >
                  <i class="bi bi-mortarboard me-1"></i> Student
                </button>
                <button
                  type="button"
                  [class.active]="selectedRole === 'company'"
                  class="role-switch-btn"
                  (click)="selectRole('company')"
                >
                  <i class="bi bi-building me-1"></i> Recruiter
                </button>
                <button
                  type="button"
                  [class.active]="selectedRole === 'admin'"
                  class="role-switch-btn"
                  (click)="selectRole('admin')"
                >
                  <i class="bi bi-shield-check me-1"></i> TPO Admin
                </button>
              </div>

              <!-- 1-Click Demo Shortcut Box -->
              <div class="demo-shortcut-box mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="demo-label"><i class="bi bi-lightning-charge-fill text-warning me-1"></i> 1-Click Demo Preset Credentials</span>
                  <span class="badge bg-primary bg-opacity-25 text-primary font-mono" style="font-size: 0.62rem;">AUTO-FILL</span>
                </div>
                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-sm btn-secondary flex-grow-1" (click)="fillDemoCredentials('admin')">
                    Admin
                  </button>
                  <button type="button" class="btn btn-sm btn-secondary flex-grow-1" (click)="fillDemoCredentials('student')">
                    Student
                  </button>
                  <button type="button" class="btn btn-sm btn-secondary flex-grow-1" (click)="fillDemoCredentials('company')">
                    Recruiter
                  </button>
                </div>
              </div>

              <!-- Login Form -->
              <div class="glass-card p-4 p-md-5">
                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label class="form-label text-slate-700 fw-semibold small">Registered Email Address</label>
                    <div class="input-group">
                      <span class="input-group-text bg-white border-slate-300 text-muted"><i class="bi bi-envelope"></i></span>
                      <input
                        type="email"
                        formControlName="email"
                        class="form-control"
                        placeholder="name@university.edu"
                      />
                    </div>
                  </div>

                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <label class="form-label text-slate-700 fw-semibold small mb-0">Password</label>
                      <span class="text-primary small fw-semibold font-mono" style="font-size: 0.72rem;">Demo: 123456</span>
                    </div>
                    <div class="input-group">
                      <span class="input-group-text bg-white border-slate-300 text-muted"><i class="bi bi-lock"></i></span>
                      <input
                        type="password"
                        formControlName="password"
                        class="form-control"
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
                    class="btn btn-primary w-100 py-3 rounded-12 fw-bold"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Sign In to Portal ➔
                  </button>
                </form>
              </div>

              <div class="text-center mt-4 text-muted small">
                Don't have an active student account? 
                <a routerLink="/register" class="text-primary fw-bold text-decoration-none">Register Candidate Profile</a>
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
    .text-gradient {
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .text-primary-light { color: #818cf8 !important; }
    .text-emerald { color: #34d399 !important; }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .hero-stat-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
    }
    .recruiter-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.8rem;
    }
    .role-switcher-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      background: #f1f5f9;
      padding: 5px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
    }
    .role-switch-btn {
      border: none;
      background: transparent;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #64748b;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .role-switch-btn.active {
      background: #ffffff;
      color: #4f46e5;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      font-weight: 700;
    }
    .demo-shortcut-box {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(56, 189, 248, 0.06) 100%);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 14px;
      padding: 12px 14px;
    }
    .demo-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #334155;
    }
  `]
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
