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
    <div class="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4" style="background-color: #F1F5F9;">
      <div class="container" style="max-width: 960px;">
        <div class="row g-0 overflow-hidden shadow-lg" style="border-radius: 16px; border: 1px solid #E2E8F0; background: #FFFFFF;">
          <!-- LEFT: Enterprise Brand & Feature Panel -->
          <div class="col-lg-5 d-none d-lg-flex flex-column justify-content-between p-4 p-xl-5 text-white" style="background: linear-gradient(145deg, #1E293B 0%, #0F172A 100%);">
            <div>
              <div class="d-flex align-items-center gap-3 mb-4">
                <div class="brand-logo-badge">
                  <i class="bi bi-mortarboard-fill"></i>
                </div>
                <div>
                  <h3 class="fw-bold text-white mb-0 fs-5">Placement<span style="color: #60A5FA;">Pro</span></h3>
                  <span class="font-mono text-slate-400" style="font-size: 0.7rem; letter-spacing: 0.5px;">UNIVERSITY T&P PORTAL</span>
                </div>
              </div>

              <h2 class="fw-bold text-white fs-4 lh-sm mb-3">Enterprise Campus Recruitment & ATS System</h2>
              <p class="text-slate-300 small mb-4">Automated eligibility evaluation, 7-stage candidate ATS pipeline, and verified academic credential locks.</p>

              <div class="d-flex flex-column gap-3 mb-4">
                <div class="d-flex align-items-start gap-2.5">
                  <div class="p-1 rounded-circle bg-primary bg-opacity-25 text-primary">
                    <i class="bi bi-check2-circle fs-6"></i>
                  </div>
                  <div class="small">
                    <strong class="text-white d-block">Automated JNF Eligibility</strong>
                    <span class="text-slate-400">CGPA, 10th/12th, and backlogs filtering</span>
                  </div>
                </div>

                <div class="d-flex align-items-start gap-2.5">
                  <div class="p-1 rounded-circle bg-success bg-opacity-25 text-success">
                    <i class="bi bi-shield-check fs-6"></i>
                  </div>
                  <div class="small">
                    <strong class="text-white d-block">Stage 1 Credential Freeze</strong>
                    <span class="text-slate-400">Locked academic vault for verified candidates</span>
                  </div>
                </div>

                <div class="d-flex align-items-start gap-2.5">
                  <div class="p-1 rounded-circle bg-info bg-opacity-25 text-info">
                    <i class="bi bi-graph-up-arrow fs-6"></i>
                  </div>
                  <div class="small">
                    <strong class="text-white d-block">Real-time Placement Telemetry</strong>
                    <span class="text-slate-400">Live analytics, CTC slabs, and offer metrics</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-3 border-top border-slate-700 text-slate-400 font-mono" style="font-size: 0.72rem;">
              <i class="bi bi-patch-check-fill text-primary me-1"></i> Accredited University Placement System • v2026.2
            </div>
          </div>

          <!-- RIGHT: Sign In Workspace -->
          <div class="col-lg-7 p-4 p-md-5 d-flex flex-column justify-content-center bg-white">
            <div class="mb-4">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <h3 class="fw-bold text-slate-900 mb-0 fs-4">Sign In to Workspace</h3>
                <span class="badge badge-subtle-primary font-mono">SECURE ACCESS</span>
              </div>
              <p class="body-text small mb-0">Select your designated portal role or sign in with your credentials</p>
            </div>

            <!-- 1-Click Demo Presets -->
            <div class="bg-slate-50 border rounded-10 p-3 mb-3.5">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="meta-text fw-bold text-slate-700" style="font-size: 0.75rem;">
                  <i class="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Demo Presets (1-Click)
                </span>
                <span class="text-muted font-mono" style="font-size: 0.68rem;">Instant Switch</span>
              </div>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-secondary btn-sm flex-grow-1" (click)="fillDemoCredentials('admin')">
                  <i class="bi bi-shield-lock me-1 text-primary"></i> TPO Admin
                </button>
                <button type="button" class="btn btn-secondary btn-sm flex-grow-1" (click)="fillDemoCredentials('student')">
                  <i class="bi bi-mortarboard me-1 text-success"></i> Student
                </button>
                <button type="button" class="btn btn-secondary btn-sm flex-grow-1" (click)="fillDemoCredentials('company')">
                  <i class="bi bi-building me-1 text-info"></i> Recruiter
                </button>
              </div>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label">Email Address *</label>
                <div class="input-group">
                  <span class="input-group-text bg-transparent text-muted"><i class="bi bi-envelope"></i></span>
                  <input
                    type="email"
                    formControlName="email"
                    class="form-control"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label mb-0">Password *</label>
                </div>
                <div class="input-group">
                  <span class="input-group-text bg-transparent text-muted"><i class="bi bi-lock"></i></span>
                  <input
                    type="password"
                    formControlName="password"
                    class="form-control"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
                class="btn btn-primary w-100 py-2.5 mt-2 fw-semibold"
              >
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                Sign In to Placement Workspace ➔
              </button>
            </form>

            <div class="text-center mt-4 pt-3 border-top">
              <span class="meta-text text-muted">Don't have an account? </span>
              <a routerLink="/register" class="text-primary fw-semibold small text-decoration-none ms-1">Register New Student / Recruiter</a>
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  isLoading = false;

  loginForm: FormGroup = this.fb.group({
    email: ['admin@placement.com', [Validators.required, Validators.email]],
    password: ['admin123', Validators.required]
  });

  fillDemoCredentials(role: 'admin' | 'student' | 'company'): void {
    if (role === 'admin') {
      this.loginForm.setValue({
        email: 'admin@placement.com',
        password: 'admin123'
      });
    } else if (role === 'student') {
      this.loginForm.setValue({
        email: 'student@placement.com',
        password: 'student123'
      });
    } else if (role === 'company') {
      this.loginForm.setValue({
        email: 'company@placement.com',
        password: 'company123'
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.notify.showSuccess('Signed in successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.notify.showError(err?.error?.message || 'Invalid email or password');
      }
    });
  }
}
