import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="app-sidebar-panel-fixed">
      <!-- Brand Zone with Crisp Contrast Fields -->
      <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 8px;">
        <a routerLink="/dashboard" style="text-decoration: none; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 1.15rem; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">PlacementCell</div>
          <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; font-family: monospace;">ACTIVE</span>
        </a>
        <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.15); padding: 8px 12px; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: block;">T&P Enterprise Node</span>
          <span style="font-size: 12px; font-weight: 400; color: #94a3b8; display: block; margin-top: 2px;">Session Status: Active</span>
        </div>
      </div>

      <!-- High-Density Navigation Workspace Links -->
      <nav style="flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto;">
        <div style="font-size: 10px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; padding: 0 8px 8px 8px;">Recruitment Pipeline</div>

        <!-- Dashboard -->
        <a routerLink="/dashboard" routerLinkActive="active" class="sidebar-nav-link">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="bi bi-grid-1x2-fill" style="color: #38bdf8;"></i>
            <span>Dashboard Telemetry</span>
          </div>
        </a>

        <!-- Incoming Mailbox -->
        <a routerLink="/notices" routerLinkActive="active" class="sidebar-nav-link" style="justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="bi bi-envelope-paper-fill" style="color: #f59e0b;"></i>
            <span>Incoming Mailbox</span>
          </div>
          <span style="background: #ef4444; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px;">3 New</span>
        </a>

        <!-- Admin Role Navigation -->
        <ng-container *ngIf="userRole() === 'admin'">
          <a routerLink="/students" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-shield-lock-fill" style="color: #6366f1;"></i>
              <span>Gatekeeping Vault</span>
            </div>
          </a>
          <a routerLink="/companies" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-building-fill-check" style="color: #10b981;"></i>
              <span>Corporate Partners</span>
            </div>
          </a>
          <a routerLink="/jobs" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-card-checklist" style="color: #f59e0b;"></i>
              <span>JNF Authorizations</span>
            </div>
          </a>
          <a routerLink="/applications" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-kanban-fill" style="color: #c084fc;"></i>
              <span>ATS Telemetry Matrix</span>
            </div>
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-bar-chart-line-fill" style="color: #38bdf8;"></i>
              <span>Mission Control Reports</span>
            </div>
          </a>
        </ng-container>

        <!-- Student Role Navigation -->
        <ng-container *ngIf="userRole() === 'student'">
          <a routerLink="/profile" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-person-bounding-box" style="color: #6366f1;"></i>
              <span>Frozen Credentials</span>
            </div>
          </a>
          <a routerLink="/jobs" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-building-check" style="color: #10b981;"></i>
              <span>JNF Campus Drives</span>
            </div>
          </a>
          <a routerLink="/applications" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-diagram-3-fill" style="color: #c084fc;"></i>
              <span>ATS 7-Stage Tracker</span>
            </div>
          </a>
        </ng-container>

        <!-- Company Role Navigation -->
        <ng-container *ngIf="userRole() === 'company'">
          <a routerLink="/jobs" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-file-earmark-text-fill" style="color: #6366f1;"></i>
              <span>Post & Manage JNFs</span>
            </div>
          </a>
          <a routerLink="/applications" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-people-fill" style="color: #10b981;"></i>
              <span>ATS Candidate Pipeline</span>
            </div>
          </a>
          <a routerLink="/companies" routerLinkActive="active" class="sidebar-nav-link">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class="bi bi-building-gear" style="color: #38bdf8;"></i>
              <span>Company Profile</span>
            </div>
          </a>
        </ng-container>
      </nav>

      <!-- Telemetry Card & Fixed Profile Anchor -->
      <div style="padding: 16px; border-top: 1px solid rgba(255,255,255,0.06); background: #070a12; display: flex; flex-direction: column; gap: 12px;">
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 500; color: #64748b; margin-bottom: 4px;">
            <span>Batch Placement Rate</span>
            <span style="color: #38bdf8; font-weight: 600;">82.5%</span>
          </div>
          <div style="width: 100%; height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden;">
            <div style="width: 82.5%; height: 100%; background: #38bdf8;"></div>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.06); pt: 12px; margin-top: 4px; padding-top: 8px;">
          <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
            <img [src]="getUserPhoto()" style="width: 32px; height: 32px; border-radius: 9999px; object-fit: cover; border: 1px solid #38bdf8;" alt="Avatar" />
            <div style="overflow: hidden;">
              <p style="font-size: 12px; font-weight: 600; color: #e2e8f0; margin: 0; white-space: nowrap; text-overflow: ellipsis;">{{ user()?.name || 'Dr. Placement Director' }}</p>
              <p style="font-size: 10px; color: #64748b; margin: 0; text-transform: uppercase;">{{ getRoleTitle() }}</p>
            </div>
          </div>
          <button (click)="onLogout()" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Sign Out">
            <i class="bi bi-box-arrow-right" style="font-size: 1rem;"></i>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-nav-link {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .sidebar-nav-link:hover {
      background-color: rgba(255, 255, 255, 0.06);
      color: #ffffff;
    }
    .sidebar-nav-link.active {
      color: #ffffff !important;
      background-color: #4f46e5 !important;
    }
  `]
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;

  private router = inject(Router);
  authService = inject(AuthService);
  notify = inject(NotificationService);

  user = this.authService.currentUser;
  userRole = () => this.authService.getUserRole() || 'student';

  getRoleTitle(): string {
    const role = this.userRole();
    if (role === 'admin') return 'System Administrator';
    if (role === 'company') return 'Recruiter';
    return 'Verified Student';
  }

  getUserPhoto(): string {
    const u = this.user();
    if (u && (u as any).photoUrl) return (u as any).photoUrl;
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
  }

  onLogout(): void {
    this.authService.logout();
    this.notify.showSuccess('Signed out of account workspace.');
    this.router.navigate(['/login']);
  }
}


