import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar-wrapper glass-card rounded-4 p-3 d-flex flex-column h-100">
      <!-- Portal Brand -->
      <div class="brand-box px-3 py-2 mb-4 d-flex align-items-center">
        <div class="brand-icon bg-primary text-white rounded-3 p-2 me-2 shadow">
          <i class="bi bi-briefcase-fill fs-4"></i>
        </div>
        <div>
          <h5 class="fw-bold text-white mb-0">Placement<span class="text-primary ms-1">Hub</span></h5>
          <small class="text-primary fw-semibold text-uppercase" style="font-size: 0.65rem;">{{ userRole() }} Portal</small>
        </div>
      </div>

      <!-- Navigation Links per Role -->
      <ul class="nav nav-pills flex-column mb-auto gap-2">
        <li class="nav-item">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
            <i class="bi bi-grid-1x2-fill me-3 fs-5"></i>
            <span class="fw-semibold">Dashboard</span>
          </a>
        </li>

        <!-- Student Only Navigation -->
        <ng-container *ngIf="userRole() === 'student'">
          <li class="nav-item">
            <a routerLink="/profile" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-file-earmark-person-fill me-3 fs-5"></i>
              <span class="fw-semibold">Profile & Documents</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/jobs" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-building-check me-3 fs-5"></i>
              <span class="fw-semibold">Campus Drives</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/applications" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-file-earmark-check-fill me-3 fs-5"></i>
              <span class="fw-semibold">My Applications</span>
            </a>
          </li>
        </ng-container>

        <!-- Recruiter Only Navigation -->
        <ng-container *ngIf="userRole() === 'company'">
          <li class="nav-item">
            <a routerLink="/jobs" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-briefcase-fill me-3 fs-5"></i>
              <span class="fw-semibold">Post & Manage Drives</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/applications" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-people-fill me-3 fs-5"></i>
              <span class="fw-semibold">Drive Applicants</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/companies" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-building me-3 fs-5"></i>
              <span class="fw-semibold">Company Profile</span>
            </a>
          </li>
        </ng-container>

        <!-- Admin / TPO Only Navigation -->
        <ng-container *ngIf="userRole() === 'admin'">
          <li class="nav-item">
            <a routerLink="/students" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-people-fill me-3 fs-5"></i>
              <span class="fw-semibold">Students Directory</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/companies" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-building-fill me-3 fs-5"></i>
              <span class="fw-semibold">Companies Directory</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/jobs" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-card-heading me-3 fs-5"></i>
              <span class="fw-semibold">Job Drives & Approvals</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/applications" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-diagram-3-fill me-3 fs-5"></i>
              <span class="fw-semibold">Interview Pipeline</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/reports" routerLinkActive="active" class="nav-link text-white-50 py-3 px-3 d-flex align-items-center">
              <i class="bi bi-bar-chart-line-fill me-3 fs-5"></i>
              <span class="fw-semibold">Reports & Analytics</span>
            </a>
          </li>
        </ng-container>
      </ul>

      <!-- User Profile Card -->
      <div class="user-footer bg-dark bg-opacity-60 border border-secondary border-opacity-30 rounded-3 p-3 mt-4">
        <div class="d-flex align-items-center">
          <img [src]="user()?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'" class="rounded-circle me-2 border border-primary" style="width: 40px; height: 40px; object-fit: cover;" />
          <div class="overflow-hidden">
            <div class="fw-bold text-white text-truncate" style="max-width: 130px;">{{ user()?.name }}</div>
            <small class="text-primary text-uppercase fw-semibold" style="font-size: 0.7rem;">{{ userRole() }}</small>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-wrapper { min-width: 260px; }
    .nav-link { border-radius: 12px; transition: all 0.3s ease; }
    .nav-link:hover { background: rgba(99, 102, 241, 0.15); color: #fff !important; }
    .nav-link.active { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important; color: #fff !important; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.4); }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
  user = this.authService.currentUser;
  userRole = () => this.authService.getUserRole() || 'student';
}
