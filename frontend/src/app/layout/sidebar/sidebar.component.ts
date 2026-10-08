import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { EmailService } from '../../core/services/email.service';
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
            <span class="brand-subtitle">UNIVERSITY T&P PORTAL</span>
          </div>
        </a>
      </div>

      <!-- Navigation Links Container -->
      <nav class="sidebar-nav-container flex-grow-1 custom-scroll">
        <!-- ==================== ADMIN / TPO NAVIGATION ==================== -->
        <ng-container *ngIf="userRole() === 'admin'">
          <div class="nav-section-label">OVERVIEW</div>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-grid-1x2-fill nav-item-icon"></i>
              <span class="nav-label">Dashboard</span>
            </div>
          </a>

          <div class="nav-section-label">PLACEMENT MANAGEMENT</div>
          <a routerLink="/students" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-people-fill nav-item-icon"></i>
              <span class="nav-label">Students</span>
            </div>
          </a>

          <a routerLink="/companies" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-building-fill-check nav-item-icon"></i>
              <span class="nav-label">Companies</span>
            </div>
          </a>

          <a routerLink="/jobs" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-briefcase-fill nav-item-icon"></i>
              <span class="nav-label">Placement Drives</span>
            </div>
          </a>

          <a routerLink="/applications" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-kanban-fill nav-item-icon"></i>
              <span class="nav-label">Applications</span>
            </div>
          </a>

          <div class="nav-section-label">SELECTION PROCESS</div>
          <a routerLink="/assessments" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-laptop-fill nav-item-icon"></i>
              <span class="nav-label">Assessments</span>
            </div>
          </a>

          <a routerLink="/dashboard" [fragment]="'interviews'" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-calendar-event-fill nav-item-icon"></i>
              <span class="nav-label">Interviews</span>
            </div>
          </a>

          <a routerLink="/applications" [queryParams]="{stage: 'Selected'}" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-patch-check-fill nav-item-icon"></i>
              <span class="nav-label">Offers</span>
            </div>
          </a>

          <div class="nav-section-label">COMMUNICATION</div>
          <a routerLink="/notices" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-megaphone-fill nav-item-icon"></i>
              <span class="nav-label">Notices</span>
            </div>
          </a>

          <a routerLink="/mailbox" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-envelope-fill nav-item-icon"></i>
              <span class="nav-label">Mailbox</span>
            </div>
            <span *ngIf="mailboxUnreadCount > 0" class="nav-badge-alert font-mono">
              {{ mailboxUnreadCount }}
            </span>
          </a>

          <div class="nav-section-label">ANALYTICS</div>
          <a routerLink="/reports" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-bar-chart-line-fill nav-item-icon"></i>
              <span class="nav-label">Reports</span>
            </div>
          </a>
        </ng-container>

        <!-- ==================== STUDENT NAVIGATION ==================== -->
        <ng-container *ngIf="userRole() === 'student'">
          <div class="nav-section-label">OVERVIEW</div>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-grid-1x2-fill nav-item-icon"></i>
              <span class="nav-label">Dashboard</span>
            </div>
          </a>

          <div class="nav-section-label">MY PLACEMENT</div>
          <a routerLink="/profile" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-person-badge-fill nav-item-icon"></i>
              <span class="nav-label">Profile</span>
            </div>
          </a>

          <a routerLink="/jobs" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-briefcase-fill nav-item-icon"></i>
              <span class="nav-label">Placement Drives</span>
            </div>
          </a>

          <a routerLink="/applications" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-diagram-3-fill nav-item-icon"></i>
              <span class="nav-label">My Applications</span>
            </div>
          </a>

          <a routerLink="/assessments" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-laptop-fill nav-item-icon"></i>
              <span class="nav-label">Assessments</span>
            </div>
          </a>

          <a routerLink="/dashboard" [fragment]="'interviews'" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-calendar-event-fill nav-item-icon"></i>
              <span class="nav-label">Interviews</span>
            </div>
          </a>

          <a routerLink="/dashboard" [fragment]="'offers'" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-patch-check-fill nav-item-icon"></i>
              <span class="nav-label">Offers</span>
            </div>
          </a>

          <div class="nav-section-label">COMMUNICATION</div>
          <a routerLink="/mailbox" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-envelope-fill nav-item-icon"></i>
              <span class="nav-label">Mailbox</span>
            </div>
            <span *ngIf="mailboxUnreadCount > 0" class="nav-badge-alert font-mono">
              {{ mailboxUnreadCount }}
            </span>
          </a>

          <a routerLink="/notices" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-megaphone-fill nav-item-icon"></i>
              <span class="nav-label">Notices</span>
            </div>
          </a>
        </ng-container>

        <!-- ==================== RECRUITER NAVIGATION ==================== -->
        <ng-container *ngIf="userRole() === 'company'">
          <div class="nav-section-label">OVERVIEW</div>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-grid-1x2-fill nav-item-icon"></i>
              <span class="nav-label">Dashboard</span>
            </div>
          </a>

          <div class="nav-section-label">RECRUITMENT</div>
          <a routerLink="/profile" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-building-gear nav-item-icon"></i>
              <span class="nav-label">Company Profile</span>
            </div>
          </a>

          <a routerLink="/jobs" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-briefcase-fill nav-item-icon"></i>
              <span class="nav-label">Placement Drives</span>
            </div>
          </a>

          <a routerLink="/applications" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-people-fill nav-item-icon"></i>
              <span class="nav-label">Applicants</span>
            </div>
          </a>

          <a routerLink="/assessments" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-laptop-fill nav-item-icon"></i>
              <span class="nav-label">Assessments</span>
            </div>
          </a>

          <a routerLink="/dashboard" [fragment]="'interviews'" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-calendar-event-fill nav-item-icon"></i>
              <span class="nav-label">Interviews</span>
            </div>
          </a>

          <a routerLink="/applications" [queryParams]="{stage: 'Selected'}" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-patch-check-fill nav-item-icon"></i>
              <span class="nav-label">Offers</span>
            </div>
          </a>

          <a routerLink="/reports" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-bar-chart-line-fill nav-item-icon"></i>
              <span class="nav-label">Reports</span>
            </div>
          </a>

          <div class="nav-section-label">COMMUNICATION</div>
          <a routerLink="/mailbox" routerLinkActive="active" class="sidebar-nav-item">
            <div class="nav-item-content">
              <i class="bi bi-envelope-fill nav-item-icon"></i>
              <span class="nav-label">Mailbox</span>
            </div>
            <span *ngIf="mailboxUnreadCount > 0" class="nav-badge-alert font-mono">
              {{ mailboxUnreadCount }}
            </span>
          </a>
        </ng-container>
      </nav>

      <!-- Bottom User Profile & Settings Section -->
      <div class="sidebar-footer">
        <div class="d-flex flex-column gap-1 mb-2">
          <a routerLink="/profile" routerLinkActive="active" class="sidebar-nav-item footer-link">
            <div class="nav-item-content">
              <i class="bi bi-person-circle nav-item-icon"></i>
              <span class="nav-label">Profile</span>
            </div>
          </a>
          <a *ngIf="userRole() === 'admin'" routerLink="/settings" routerLinkActive="active" class="sidebar-nav-item footer-link">
            <div class="nav-item-content">
              <i class="bi bi-gear-fill nav-item-icon"></i>
              <span class="nav-label">Settings</span>
            </div>
          </a>
        </div>

        <!-- User Profile Tile -->
        <div class="user-profile-tile">
          <img [src]="getUserPhoto()" class="user-avatar" alt="Avatar" />
          <div class="user-details">
            <span class="user-name">{{ user()?.name || 'TPO User' }}</span>
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
      background: #1E293B;
      color: #FFFFFF;
      user-select: none;
      width: 100%;
    }
    .sidebar-brand-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: #151E2E;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .brand-logo-icon {
      width: 36px;
      height: 36px;
      background: #0F766E;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 1.15rem;
    }
    .brand-text-block {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.15;
      letter-spacing: -0.3px;
    }
    .brand-highlight {
      color: #2DD4BF;
    }
    .brand-subtitle {
      font-size: 0.62rem;
      font-weight: 700;
      color: #94A3B8;
      letter-spacing: 0.6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .sidebar-nav-container {
      padding: 12px 10px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav-section-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #94A3B8;
      font-family: 'JetBrains Mono', monospace;
      padding: 12px 12px 4px 12px;
      text-transform: uppercase;
    }
    .sidebar-nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 12px;
      border-radius: 8px;
      color: #CBD5E1;
      text-decoration: none;
      font-size: 0.84rem;
      font-weight: 500;
      transition: all 0.15s ease;
      position: relative;
    }
    .sidebar-nav-item:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #FFFFFF;
    }
    .sidebar-nav-item.active {
      background: #0F766E !important;
      color: #FFFFFF !important;
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    .sidebar-nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      bottom: 6px;
      width: 3px;
      background: #5EEAD4;
      border-radius: 0 3px 3px 0;
    }
    .nav-item-content {
      display: flex;
      align-items: center;
      gap: 11px;
    }
    .nav-item-icon {
      font-size: 1rem;
      opacity: 0.9;
      width: 18px;
      text-align: center;
    }
    .nav-badge-alert {
      background: #EF4444;
      color: #FFFFFF;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 9999px;
    }
    .sidebar-footer {
      padding: 12px 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: #151E2E;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .footer-link {
      padding: 6px 10px;
      font-size: 0.8rem;
    }
    .user-profile-tile {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 6px 8px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .user-details {
      flex-grow: 1;
      min-width: 0;
    }
    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }
    .user-role {
      font-size: 0.62rem;
      color: #94A3B8;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      display: block;
    }
    :host-context(.collapsed) {
      .brand-text-block,
      .nav-label,
      .nav-section-label,
      .user-details,
      .nav-badge-alert,
      .brand-subtitle {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
      }
      .sidebar-brand-header {
        padding: 14px 8px !important;
        justify-content: center !important;
      }
      .brand-link {
        justify-content: center !important;
        gap: 0 !important;
        width: 100% !important;
      }
      .sidebar-nav-container {
        padding: 12px 6px !important;
        align-items: center !important;
      }
      .sidebar-nav-item {
        padding: 10px 0 !important;
        justify-content: center !important;
        width: 44px !important;
        height: 44px !important;
        margin: 2px auto !important;
      }
      .nav-item-content {
        gap: 0 !important;
        justify-content: center !important;
        width: 100% !important;
      }
      .nav-item-icon {
        margin: 0 auto !important;
        font-size: 1.2rem !important;
      }
      .sidebar-footer {
        padding: 12px 6px !important;
        align-items: center !important;
      }
      .user-profile-tile {
        padding: 6px !important;
        justify-content: center !important;
        width: 44px !important;
        height: 44px !important;
        margin: 0 auto !important;
      }
      .logout-btn {
        display: none !important;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed: boolean = false;

  private router = inject(Router);
  authService = inject(AuthService);
  notify = inject(NotificationService);
  private emailService = inject(EmailService);
  private reportService = inject(ReportService);
  private studentService = inject(StudentService);

  user = this.authService.currentUser;
  userRole = () => this.authService.getUserRole() || 'student';
  mailboxUnreadCount: number = 0;

  ngOnInit(): void {
    this.loadMailboxCount();
  }

  loadMailboxCount(): void {
    this.emailService.getUnreadCount().subscribe({
      next: (res) => {
        this.mailboxUnreadCount = res.count || 0;
      },
      error: () => {
        this.mailboxUnreadCount = 0;
      }
    });
  }

  getRoleBadge(): string {
    const role = this.userRole();
    if (role === 'admin') return 'T&P SuperAdmin';
    if (role === 'company') return 'Corporate Partner';
    return 'Registered Student';
  }

  getRoleTitle(): string {
    const role = this.userRole();
    if (role === 'admin') return 'TPO Admin';
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
