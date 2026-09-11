import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ReportService } from '../../core/services/report.service';
import { StudentService } from '../../core/services/student.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar-inner d-flex flex-column h-100">
      <!-- Brand Header -->
      <div class="sidebar-brand-header">
        <a routerLink="/dashboard" class="brand-link">
          <div class="brand-logo-icon">
            <i class="bi bi-mortarboard-fill"></i>
          </div>
          <div class="brand-text-block">
            <span class="brand-title">Placement<span class="brand-highlight">Pro</span></span>
            <span class="brand-subtitle">CAMPUS T&P CELL</span>
          </div>
        </a>
        <div class="status-indicator-badge">
          <span class="status-dot"></span>
          <span>LIVE</span>
        </div>
      </div>

      <!-- Quick Session Badge -->
      <div class="px-3 pt-3">
        <div class="session-node-card">
          <div class="d-flex align-items-center justify-content-between">
            <span class="node-title"><i class="bi bi-shield-check me-1"></i> {{ getRoleBadge() }}</span>
            <span class="badge bg-primary bg-opacity-25 text-primary-light font-mono" style="font-size: 0.6rem;">AY 2025-26</span>
          </div>
          <div class="node-subtitle mt-1">Verified Session Active</div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav-container flex-grow-1">
        <div class="nav-section-label">MAIN RECRUITMENT HUB</div>

        <!-- Dashboard -->
        <a routerLink="/dashboard" routerLinkActive="active" class="sidebar-nav-item">
          <div class="nav-item-content">
            <div class="nav-icon-wrapper cyan">
              <i class="bi bi-grid-1x2-fill"></i>
            </div>
            <span class="nav-label">Dashboard Telemetry</span>
          </div>
          <i class="bi bi-chevron-right nav-arrow"></i>
        </a>

        <!-- Notices / Mailbox -->
        <a routerLink="/notices" routerLinkActive="active" class="sidebar-nav-item">
          <div class="nav-item-content">
            <div class="nav-icon-wrapper amber">
              <i class="bi bi-bell-fill"></i>
            </div>
            <span class="nav-label">Notices & Alerts</span>
          </div>
          <span class="nav-badge-alert">3 New</span>
        </a>

        <!-- ADMIN Role Navigation -->
        <ng-container *ngIf="userRole() === 'admin'">
          <div class="nav-section-label mt-3">ADMINISTRATION</div>

          <a routerLink="/students" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper purple">
                <i class="bi bi-people-fill"></i>
              </div>
              <span class="nav-label">Student Directory</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>

          <a routerLink="/companies" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper emerald">
                <i class="bi bi-building-fill-check"></i>
              </div>
              <span class="nav-label">Corporate Partners</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>

          <a routerLink="/jobs" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper indigo">
                <i class="bi bi-briefcase-fill"></i>
              </div>
              <span class="nav-label">Placement Drives (JNF)</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>

          <a routerLink="/applications" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper pink">
                <i class="bi bi-kanban-fill"></i>
              </div>
              <span class="nav-label">ATS Telemetry Matrix</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>

          <a routerLink="/reports" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper cyan">
                <i class="bi bi-bar-chart-line-fill"></i>
              </div>
              <span class="nav-label">Placement Reports</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>
        </ng-container>

        <!-- STUDENT Role Navigation -->
        <ng-container *ngIf="userRole() === 'student'">
          <div class="nav-section-label mt-3">STUDENT PORTAL</div>

          <a routerLink="/profile" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper indigo">
                <i class="bi bi-person-badge-fill"></i>
              </div>
              <span class="nav-label">My Verified Profile</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>

          <a routerLink="/jobs" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper emerald">
                <i class="bi bi-building-check"></i>
              </div>
              <span class="nav-label">Campus Job Drives</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>

          <a routerLink="/applications" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper purple">
                <i class="bi bi-diagram-3-fill"></i>
              </div>
              <span class="nav-label">Application Tracker</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>
        </ng-container>

        <!-- COMPANY Role Navigation -->
        <ng-container *ngIf="userRole() === 'company'">
          <div class="nav-section-label mt-3">RECRUITER WORKSPACE</div>

          <a routerLink="/jobs" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper indigo">
                <i class="bi bi-file-earmark-plus-fill"></i>
              </div>
              <span class="nav-label">Post & Manage JNFs</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>

          <a routerLink="/applications" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper emerald">
                <i class="bi bi-person-lines-fill"></i>
              </div>
              <span class="nav-label">Candidate Pipeline</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>

          <a routerLink="/companies" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <div class="nav-icon-wrapper cyan">
                <i class="bi bi-buildings-fill"></i>
              </div>
              <span class="nav-label">Company Profile</span>
            </div>
            <i class="bi bi-chevron-right nav-arrow"></i>
          </a>
        </ng-container>

        <div class="nav-section-label mt-3">SYSTEM</div>
        <a routerLink="/settings" routerLinkActive="active" class="sidebar-nav-item">
          <div class="nav-item-content">
            <div class="nav-icon-wrapper slate">
              <i class="bi bi-gear-fill"></i>
            </div>
            <span class="nav-label">Portal Settings</span>
          </div>
          <i class="bi bi-chevron-right nav-arrow"></i>
        </a>
      </nav>

      <!-- Bottom Mini Telemetry & User Card -->
      <div class="sidebar-footer">
        <!-- Placement / Profile Completion Progress Pill -->
        <div class="placement-progress-box">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="progress-title">{{ userRole() === 'student' ? 'Profile Completion' : 'Batch Placement Ratio' }}</span>
            <span class="progress-pct">{{ progressMetric }}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" [style.width.%]="progressMetric"></div>
          </div>
        </div>

        <!-- User Profile Card -->
        <div class="user-profile-tile">
          <img [src]="getUserPhoto()" class="user-avatar" alt="Avatar" />
          <div class="user-details">
            <span class="user-name">{{ user()?.name || 'Dr. Placement Officer' }}</span>
            <span class="user-role">{{ getRoleTitle() }}</span>
          </div>
          <button (click)="onLogout()" class="logout-btn" title="Sign Out">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-inner {
      background: #090d16;
      color: #cbd5e1;
      height: 100%;
    }
    .sidebar-brand-header {
      padding: 20px 22px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%);
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .brand-logo-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
      line-height: 1;
      display: block;
    }
    .brand-highlight {
      color: #38bdf8;
      margin-left: 2px;
    }
    .brand-subtitle {
      font-size: 0.62rem;
      font-weight: 700;
      color: #818cf8;
      letter-spacing: 0.8px;
      font-family: 'JetBrains Mono', monospace;
      display: block;
      margin-top: 3px;
    }
    .status-indicator-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 3px 8px;
      border-radius: 9999px;
      font-size: 0.65rem;
      font-weight: 800;
      color: #10b981;
      font-family: 'JetBrains Mono', monospace;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .session-node-card {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 12px;
      padding: 10px 14px;
    }
    .node-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .node-subtitle {
      font-size: 0.7rem;
      color: #94a3b8;
    }
    .sidebar-nav-container {
      padding: 16px 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-section-label {
      font-size: 0.65rem;
      font-weight: 800;
      color: #475569;
      letter-spacing: 0.8px;
      padding: 6px 12px 4px 12px;
      font-family: 'JetBrains Mono', monospace;
    }
    .sidebar-nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 12px;
      border-radius: 10px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.86rem;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .sidebar-nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      transform: translateX(2px);
    }
    .sidebar-nav-item.active {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.3) 0%, rgba(99, 102, 241, 0.15) 100%);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #ffffff !important;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.15);
    }
    .sidebar-nav-item.active .nav-arrow {
      color: #818cf8;
      opacity: 1;
      transform: translateX(0);
    }
    .nav-item-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .nav-icon-wrapper {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: rgba(255, 255, 255, 0.05);
      transition: all 0.2s ease;
    }
    .nav-icon-wrapper.cyan { color: #38bdf8; }
    .nav-icon-wrapper.amber { color: #fbbf24; }
    .nav-icon-wrapper.purple { color: #c084fc; }
    .nav-icon-wrapper.emerald { color: #34d399; }
    .nav-icon-wrapper.indigo { color: #818cf8; }
    .nav-icon-wrapper.pink { color: #f472b6; }
    .nav-icon-wrapper.slate { color: #94a3b8; }
    .nav-arrow {
      font-size: 0.75rem;
      color: #64748b;
      opacity: 0;
      transform: translateX(-4px);
      transition: all 0.2s ease;
    }
    .sidebar-nav-item:hover .nav-arrow {
      opacity: 0.7;
      transform: translateX(0);
    }
    .nav-badge-alert {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 9999px;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    }
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
      background: #060910;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .placement-progress-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 10px 12px;
    }
    .progress-title {
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
    }
    .progress-pct {
      font-size: 0.75rem;
      font-weight: 800;
      color: #38bdf8;
      font-family: 'JetBrains Mono', monospace;
    }
    .progress-bar-track {
      width: 100%;
      height: 5px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 9999px;
      overflow: hidden;
      margin-top: 6px;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8 0%, #6366f1 100%);
      border-radius: 9999px;
    }
    .user-profile-tile {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(99, 102, 241, 0.5);
    }
    .user-details {
      flex-grow: 1;
      min-width: 0;
    }
    .user-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }
    .user-role {
      font-size: 0.65rem;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      display: block;
    }
    .logout-btn {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .logout-btn:hover {
      background: #ef4444;
      color: #ffffff;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed: boolean = false;

  private router = inject(Router);
  authService = inject(AuthService);
  notify = inject(NotificationService);
  private reportService = inject(ReportService);
  private studentService = inject(StudentService);

  user = this.authService.currentUser;
  userRole = () => this.authService.getUserRole() || 'student';
  progressMetric: number = 0;

  ngOnInit(): void {
    this.loadLiveMetrics();
  }

  loadLiveMetrics(): void {
    if (this.userRole() === 'student') {
      this.studentService.getProfileCompletion().subscribe({
        next: (res: { success: boolean; completionPercentage: number; missingFields: string[] }) => {
          this.progressMetric = res.completionPercentage || 0;
        },
        error: () => {
          this.progressMetric = 0;
        }
      });
    } else {
      this.reportService.getAnalytics().subscribe({
        next: (res: { success: boolean; data: any }) => {
          this.progressMetric = res.data?.placementRate || 0;
        },
        error: () => {
          this.progressMetric = 0;
        }
      });
    }
  }

  getRoleBadge(): string {
    const role = this.userRole();
    if (role === 'admin') return 'T&P SuperAdmin';
    if (role === 'company') return 'Corporate Partner';
    return 'Registered Student';
  }

  getRoleTitle(): string {
    const role = this.userRole();
    if (role === 'admin') return 'Administrator';
    if (role === 'company') return 'HR Recruiter';
    return 'Candidate';
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
