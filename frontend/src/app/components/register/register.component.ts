import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-7 col-lg-6">
          <div class="glass-card p-4 p-md-5">
            <div class="text-center mb-4">
              <div class="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-20 text-primary rounded-circle p-3 mb-3">
                <i class="bi bi-person-plus-fill fs-2"></i>
              </div>
              <h3 class="fw-bold text-white mb-1">Create an Account</h3>
              <p class="text-muted fs-6">Join Placement Portal as Student, Company or Admin</p>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger rounded-3 py-2 px-3 mb-4 text-center fs-6">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <div class="row">
                <div class="col-md-12 mb-3">
                  <label class="form-label text-muted fw-semibold">Full Name</label>
                  <input type="text" formControlName="name" class="form-control" placeholder="John Doe" />
                </div>
                <div class="col-md-12 mb-3">
                  <label class="form-label text-muted fw-semibold">Email Address</label>
                  <input type="email" formControlName="email" class="form-control" placeholder="student@college.edu" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted fw-semibold">Role</label>
                  <select formControlName="role" class="form-select">
                    <option value="student">Student</option>
                    <option value="company">Recruiter / Company</option>
                    <option value="admin">Placement Officer (Admin)</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted fw-semibold">Department</label>
                  <select formControlName="department" class="form-select">
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Tech</option>
                    <option value="Electronics">Electronics & Comm</option>
                    <option value="Mechanical">Mechanical Eng</option>
                    <option value="Civil">Civil Eng</option>
                  </select>
                </div>
                <div class="col-md-12 mb-3">
                  <label class="form-label text-muted fw-semibold">Password</label>
                  <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" [disabled]="registerForm.invalid || isLoading" class="btn btn-primary w-100 py-3 rounded-3 fw-bold fs-6 mt-3">
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                Complete Registration
              </button>
            </form>

            <div class="text-center mt-4">
              <p class="text-muted mb-0">Already registered? <a routerLink="/login" class="text-primary fw-semibold text-decoration-none">Sign in here</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['student', Validators.required],
    department: ['Computer Science', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed.';
      }
    });
  }
}
