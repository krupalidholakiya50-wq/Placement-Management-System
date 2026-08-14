import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside [class]="'sidebar-wrapper p-3 d-flex flex-column h-100 ' + (isCollapsed ? 'collapsed' : '')">
      <!-- Role Badge Header -->
      <div *ngIf="!isCollapsed" class="px-3 py-2 mb-3 bg-slate-800 bg-opacity-60 rounded-12 border border-slate-700">
        <small class="text-primary font-monospace fw-bold text-uppercase d-block" style="font-size: 0.65rem;">
          {{ userRole() }} WORKSPACE
        </small>
        <span class="text-white fw-bold fs-6">{{ user()?.name || 'TPO User' }}</span>
      </div>

      <!-- Navigation Links Grouped by Section -->
      <ul class="nav nav-pills flex-column mb-auto gap-1">
        <li *ngIf="!isCollapsed" class="nav-header text-slate-500 font-monospace fw-bold text-uppercase px-3 pt-2 pb-1" style="font-size: 0.65rem;">
          CORE WORKSPACE
        </li>
        <li class="nav-item">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Dashboard' : ''">
            <i class="bi bi-grid-1x2-fill fs-5 me-3"></i>
            <span *ngIf="!isCollapsed" class="fw-semibold">Dashboard</span>
          </a>
        </li>

        <!-- Student Navigation -->
        <ng-container *ngIf="userRole() === 'student'">
          <li *ngIf="!isCollapsed" class="nav-header text-slate-500 font-monospace fw-bold text-uppercase px-3 pt-3 pb-1" style="font-size: 0.65rem;">
            MY PROFILE & DRIVES
          </li>
          <li class="nav-item">
            <a routerLink="/profile" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Profile & Documents' : ''">
              <i class="bi bi-file-earmark-person-fill fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Profile & Documents</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/jobs" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Campus Drives' : ''">
              <i class="bi bi-building-check fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Campus Drives</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/applications" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'My Applications' : ''">
              <i class="bi bi-file-earmark-check-fill fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">My Applications</span>
            </a>
          </li>
        </ng-container>

        <!-- Recruiter Navigation -->
        <ng-container *ngIf="userRole() === 'company'">
          <li *ngIf="!isCollapsed" class="nav-header text-slate-500 font-monospace fw-bold text-uppercase px-3 pt-3 pb-1" style="font-size: 0.65rem;">
            RECRUITMENT OPERATIONS
          </li>
          <li class="nav-item">
            <a routerLink="/jobs" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Manage Drives' : ''">
              <i class="bi bi-briefcase-fill fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Manage Drives</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/applications" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Applicants' : ''">
              <i class="bi bi-people-fill fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Applicants</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/companies" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Company Profile' : ''">
              <i class="bi bi-building fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Company Profile</span>
            </a>
          </li>
        </ng-container>

        <!-- Admin Only Navigation -->
        <ng-container *ngIf="userRole() === 'admin'">
          <li *ngIf="!isCollapsed" class="nav-header text-slate-500 font-monospace fw-bold text-uppercase px-3 pt-3 pb-1" style="font-size: 0.65rem;">
            OPERATIONS
          </li>
          <li class="nav-item">
            <a routerLink="/students" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Students Directory' : ''">
              <i class="bi bi-people-fill fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Students Directory</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/companies" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Companies Directory' : ''">
              <i class="bi bi-building-fill fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Companies Directory</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/jobs" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Placement Drives' : ''">
              <i class="bi bi-card-heading fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Placement Drives</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/applications" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Interview Pipeline' : ''">
              <i class="bi bi-diagram-3-fill fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Interview Pipeline</span>
            </a>
          </li>

          <li *ngIf="!isCollapsed" class="nav-header text-slate-500 font-monospace fw-bold text-uppercase px-3 pt-3 pb-1" style="font-size: 0.65rem;">
            ANALYTICS & CONFIG
          </li>
          <li class="nav-item">
            <a routerLink="/reports" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Analytics & Reports' : ''">
              <i class="bi bi-bar-chart-line-fill fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Analytics & Reports</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/settings" routerLinkActive="active" class="nav-link d-flex align-items-center" [title]="isCollapsed ? 'Portal Settings' : ''">
              <i class="bi bi-gear-fill fs-5 me-3"></i>
              <span *ngIf="!isCollapsed" class="fw-semibold">Portal Settings</span>
            </a>
          </li>
        </ng-container>
      </ul>

      <!-- User Profile Footer -->
      <div *ngIf="!isCollapsed" class="p-3 bg-slate-900 border border-slate-800 rounded-12 mt-4">
        <small class="text-slate-400 font-monospace d-block mb-1" style="font-size: 0.65rem;">UNIVERSITY CELL</small>
        <div class="fw-bold text-white small">Placement Office v2026</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-wrapper {
      background-color: #0f172a;
      width: 260px;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar-wrapper.collapsed {
      width: 76px;
    }
    .nav-link {
      color: #94a3b8;
      border-radius: 12px;
      padding: 10px 16px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
    .nav-link.active {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
      border-left: 4px solid #60a5fa;
    }
  `]
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;

  authService = inject(AuthService);
  user = this.authService.currentUser;
  userRole = () => this.authService.getUserRole() || 'student';
}
