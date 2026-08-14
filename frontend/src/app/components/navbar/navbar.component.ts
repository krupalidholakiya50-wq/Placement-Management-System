import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg bg-white border-bottom border-secondary border-opacity-10 mb-4 px-4 py-2 shadow-sm sticky-top">
      <div class="container-fluid">
        <!-- Brand logo for mobile/desktop -->
        <a class="navbar-brand d-flex align-items-center text-dark fw-bold fs-4 me-4" routerLink="/">
          <div class="bg-primary text-white rounded-3 p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
            <i class="bi bi-briefcase-fill fs-5"></i>
          </div>
          <div>
            <span class="fw-bold text-slate-900">VNSGU</span> <span class="text-primary fw-bold">PlacementCell</span>
            <span class="badge bg-primary bg-opacity-10 text-primary ms-2 fs-7 font-monospace border border-primary border-opacity-20">2025-2026</span>
          </div>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topNavbar">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="topNavbar">
          <!-- Role Badge indicator -->
          <div *ngIf="authService.isLoggedIn()" class="d-none d-md-flex align-items-center me-auto">
            <span class="badge bg-slate-900 text-white rounded-pill px-3 py-2 font-monospace fw-semibold" style="font-size: 0.75rem;">
              <i class="bi bi-shield-check me-1 text-success"></i> {{ userRoleName() }}
            </span>
          </div>

          <div class="d-flex align-items-center gap-3 ms-auto">
            <ng-container *ngIf="authService.isLoggedIn(); else authButtons">
              <!-- Real Notification Center Icon -->
              <div class="dropdown">
                <button class="btn btn-light rounded-circle p-2 position-relative border-0 shadow-sm" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-bell fs-5 text-slate-700"></i>
                  <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                </button>
                <div class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 p-3" style="width: 320px;">
                  <h6 class="fw-bold border-bottom pb-2 mb-2 text-slate-900"><i class="bi bi-bell-fill me-1 text-primary"></i> Placement Notifications</h6>
                  <div class="list-group list-group-flush small">
                    <div class="list-group-item px-0 py-2 border-0">
                      <div class="fw-bold text-dark">Google India Placement Drive</div>
                      <small class="text-muted">Shortlist declared for Tech Round.</small>
                    </div>
                    <div class="list-group-item px-0 py-2 border-0">
                      <div class="fw-bold text-dark">Microsoft IDC</div>
                      <small class="text-muted">Interview schedule updated for tomorrow.</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- User Profile Menu -->
              <div class="d-flex align-items-center text-dark">
                <img [src]="user()?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'" class="rounded-circle me-2 border border-2 border-primary" style="width: 40px; height: 40px; object-fit: cover;" />
                <div class="d-none d-sm-block">
                  <div class="fw-bold lh-1 text-slate-900 fs-6">{{ user()?.name }}</div>
                  <small class="text-muted text-capitalize" style="font-size: 0.75rem;">{{ user()?.role }}</small>
                </div>
              </div>

              <button class="btn btn-outline-danger btn-sm px-3 rounded-pill" (click)="onLogout()">
                <i class="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </ng-container>

            <ng-template #authButtons>
              <a routerLink="/login" class="btn btn-outline-primary btn-sm px-4 rounded-pill">Login</a>
              <a routerLink="/register" class="btn btn-primary btn-sm px-4 rounded-pill">Register</a>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser;

  userRoleName(): string {
    const role = this.authService.getUserRole();
    if (role === 'admin') return 'TPO Officer (Admin)';
    if (role === 'company') return 'Recruiter / Corporate HR';
    return 'Student Workspace';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
