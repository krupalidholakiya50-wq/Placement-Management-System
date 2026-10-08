import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, NotificationItem } from '../../core/services/notification.service';
import { EmailService } from '../../core/services/email.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="w-100 d-flex align-items-center justify-content-between header-container">
      <!-- LEFT: Sidebar Toggle, Title & Breadcrumb -->
      <div class="d-flex align-items-center gap-3">
        <button 
          class="btn btn-icon btn-secondary text-slate-700 shadow-none border" 
          (click)="toggleSidebar.emit()" 
          aria-label="Toggle Sidebar"
          style="width: 34px; height: 34px;"
        >
          <i class="bi bi-list fs-5"></i>
        </button>

        <div class="d-flex flex-column">
          <div class="d-flex align-items-center gap-2">
            <span class="header-page-title">{{ currentPageTitle }}</span>
          </div>
          <div class="header-breadcrumbs">
            <span>Portal</span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">{{ currentPageTitle }}</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Global Search, Notification Bell, Mailbox, Theme, User Avatar/Role -->
      <div class="d-flex align-items-center gap-2.5 ms-auto">
        <!-- Global Search Bar (Desktop) -->
        <div class="d-none d-lg-flex align-items-center me-1">
          <div class="input-group search-bar-compact">
            <span class="input-group-text bg-transparent border-0 text-muted ps-2.5 pe-1 py-1">
              <i class="bi bi-search" style="font-size: 0.8rem;"></i>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="onGlobalSearch()"
              class="form-control border-0 bg-transparent py-1 small shadow-none"
              placeholder="Search drives, students..."
              aria-label="Search"
              style="font-size: 0.82rem; width: 170px;"
            />
          </div>
        </div>

        <!-- Notification Bell Dropdown with Unread Count Badge -->
        <div class="dropdown position-relative">
          <button 
            class="btn btn-icon btn-secondary position-relative border header-action-btn" 
            data-bs-toggle="dropdown" 
            data-bs-display="static"
            aria-expanded="false" 
            (click)="loadNotifications()"
            title="Notifications"
            style="width: 36px; height: 36px;"
          >
            <i class="bi bi-bell-fill text-slate-600" style="font-size: 0.95rem;"></i>
            <span *ngIf="notificationUnreadCount > 0" class="header-badge-counter bg-danger border border-white font-mono">
              {{ notificationUnreadCount > 99 ? '99+' : notificationUnreadCount }}
            </span>
          </button>
          
          <div class="dropdown-menu dropdown-menu-end shadow-lg border p-0 rounded-12 mt-2 notification-panel-dropdown" style="width: 360px; max-width: calc(100vw - 20px); z-index: 1060; border-color: #E2E8F0;">
            <div class="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-bell-fill text-primary"></i>
                <span class="fw-bold mb-0 text-slate-900" style="font-size: 0.85rem;">Notifications</span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span *ngIf="notificationUnreadCount > 0" class="badge bg-warning bg-opacity-20 text-dark rounded-pill font-mono" style="font-size: 0.65rem;">
                  {{ notificationUnreadCount }} Unread
                </span>
                <button *ngIf="notificationUnreadCount > 0" (click)="markAllNotificationsRead($event)" class="btn btn-link p-0 text-primary small text-decoration-none" style="font-size: 0.72rem;">
                  Mark read
                </button>
              </div>
            </div>

            <!-- Notification Item List -->
            <div class="list-group list-group-flush small custom-scroll" style="max-height: min(320px, calc(100vh - 200px)); overflow-y: auto; overscroll-behavior: contain;">
              <div *ngIf="isLoadingNotifications" class="p-4 text-center text-muted">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                <span style="font-size: 0.8rem;">Loading notifications...</span>
              </div>

              <div *ngIf="!isLoadingNotifications && notifications.length === 0" class="p-4 text-center text-muted">
                <i class="bi bi-bell-slash fs-4 d-block mb-1 text-slate-400"></i>
                <span style="font-size: 0.8rem;">No unread notifications</span>
              </div>

              <div
                *ngFor="let item of notifications"
                (click)="onNotificationClick(item)"
                class="list-group-item list-group-item-action p-2.5 border-bottom cursor-pointer"
                [class.bg-slate-50]="!item.isRead"
              >
                <div class="d-flex justify-content-between align-items-start mb-0.5">
                  <span class="fw-semibold text-slate-900" style="font-size: 0.8rem;">
                    <span *ngIf="!item.isRead" class="unread-dot me-1"></span>
                    {{ item.title }}
                  </span>
                  <small class="text-muted font-mono" style="font-size: 0.65rem; flex-shrink: 0; margin-left: 6px;">
                    {{ item.createdAt | date:'shortTime' }}
                  </small>
                </div>
                <p class="text-muted small mb-0 lh-sm" style="font-size: 0.75rem; overflow-wrap: anywhere; word-break: break-word;">
                  {{ item.message }}
                </p>
              </div>
            </div>

            <div class="p-2.5 text-center bg-slate-50 border-top">
              <a routerLink="/mailbox" class="text-primary fw-semibold text-decoration-none small d-inline-flex align-items-center gap-1" style="font-size: 0.78rem;">
                <span>View All in Mailbox</span>
                <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Mailbox Link with Unread Count Badge -->
        <div class="position-relative">
          <a 
            routerLink="/mailbox" 
            class="btn btn-icon btn-secondary position-relative border header-action-btn" 
            title="Mailbox"
            style="width: 36px; height: 36px;"
          >
            <i class="bi bi-envelope-fill text-slate-600" style="font-size: 0.95rem;"></i>
            <span *ngIf="mailboxUnreadCount > 0" class="header-badge-counter bg-danger border border-white font-mono">
              {{ mailboxUnreadCount > 99 ? '99+' : mailboxUnreadCount }}
            </span>
          </a>
        </div>

        <!-- Theme Toggle Button -->
        <button 
          class="btn btn-icon btn-secondary border header-action-btn" 
          (click)="toggleTheme()" 
          title="Toggle Dark/Light Mode"
          style="width: 36px; height: 36px;"
        >
          <i [class]="isDarkMode ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-fill text-slate-600'" style="font-size: 0.9rem;"></i>
        </button>

        <div class="vr mx-1 my-auto" style="height: 24px; color: #E5E7EB;"></div>

        <!-- User Profile & Account Dropdown -->
        <div class="dropdown">
          <button class="btn p-1 d-flex align-items-center rounded-pill bg-white border shadow-none account-btn" data-bs-toggle="dropdown" aria-expanded="false">
            <img [src]="getUserPhoto()" class="rounded-circle me-2" style="width: 28px; height: 28px; object-fit: cover;" alt="Avatar" />
            <div class="text-start me-2 d-none d-sm-block lh-1">
              <span class="fw-semibold text-slate-900 d-block" style="font-size: 0.82rem;">{{ user()?.name || 'TPO User' }}</span>
              <span class="text-muted font-mono" style="font-size: 0.62rem; text-transform: uppercase;">{{ getRoleTitle() }}</span>
            </div>
            <i class="bi bi-chevron-down text-muted me-1" style="font-size: 0.7rem;"></i>
          </button>

          <!-- Dropdown Menu -->
          <div class="dropdown-menu dropdown-menu-end shadow-md border rounded-12 p-3 mt-2" style="width: 290px; border-color: #E5E7EB;">
            <div class="p-2.5 bg-slate-50 border rounded-8 mb-2.5">
              <div class="fw-bold text-slate-900 small text-truncate">{{ user()?.name || 'User' }}</div>
              <div class="text-muted font-mono text-truncate" style="font-size: 0.68rem;">{{ user()?.email || 'user@university.edu' }}</div>
              <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 font-mono mt-1" style="font-size: 0.62rem;">
                {{ userRole().toUpperCase() }} SESSION
              </span>
            </div>

            <!-- Role Switcher -->
            <div class="d-flex justify-content-between align-items-center mb-1.5 px-1">
              <span class="text-muted font-mono fw-bold" style="font-size: 0.62rem;">ROLE SWITCHER</span>
            </div>

            <div class="d-flex flex-column gap-1 mb-2">
              <button 
                class="btn btn-light text-start rounded-8 p-1.5 d-flex align-items-center justify-content-between border" 
                [class.border-primary]="userRole() === 'admin'"
                [class.bg-primary-subtle]="userRole() === 'admin'"
                (click)="switchAccount('admin')"
                style="font-size: 0.78rem;"
              >
                <span>TPO Admin</span>
                <i *ngIf="userRole() === 'admin'" class="bi bi-check-circle-fill text-primary" style="font-size: 0.8rem;"></i>
              </button>

              <button 
                class="btn btn-light text-start rounded-8 p-1.5 d-flex align-items-center justify-content-between border" 
                [class.border-primary]="userRole() === 'student'"
                [class.bg-primary-subtle]="userRole() === 'student'"
                (click)="switchAccount('student')"
                style="font-size: 0.78rem;"
              >
                <span>Student</span>
                <i *ngIf="userRole() === 'student'" class="bi bi-check-circle-fill text-primary" style="font-size: 0.8rem;"></i>
              </button>

              <button 
                class="btn btn-light text-start rounded-8 p-1.5 d-flex align-items-center justify-content-between border" 
                [class.border-primary]="userRole() === 'company'"
                [class.bg-primary-subtle]="userRole() === 'company'"
                (click)="switchAccount('company')"
                style="font-size: 0.78rem;"
              >
                <span>Recruiter / HR</span>
                <i *ngIf="userRole() === 'company'" class="bi bi-check-circle-fill text-primary" style="font-size: 0.8rem;"></i>
              </button>
            </div>

            <hr class="my-2 border-slate-200" />

            <div class="d-flex flex-column gap-1">
              <a routerLink="/profile" class="dropdown-item rounded-8 py-1.5 small text-slate-700">
                <i class="bi bi-person me-2 text-primary"></i>Profile
              </a>
              <button class="dropdown-item rounded-8 py-1.5 small text-danger fw-semibold" (click)="logout()">
                <i class="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-container {
      user-select: none;
      overflow: visible;
    }
    .header-page-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1F2937;
      line-height: 1.15;
    }
    .header-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      color: #6B7280;
    }
    .breadcrumb-separator {
      opacity: 0.5;
    }
    .breadcrumb-current {
      color: #0F766E;
      font-weight: 600;
    }
    .search-bar-compact {
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      transition: all 0.15s ease;
    }
    .search-bar-compact:focus-within {
      background: #FFFFFF;
      border-color: #0F766E;
      box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
    }
    .header-action-btn {
      position: relative;
      overflow: visible !important;
    }
    .header-badge-counter {
      position: absolute;
      top: -3px;
      right: -3px;
      font-size: 0.6rem;
      font-weight: 700;
      padding: 1.5px 4.5px;
      border-radius: 9999px;
      line-height: 1;
      pointer-events: none;
      z-index: 5;
    }
    .notification-panel-dropdown {
      z-index: 1060 !important;
      position: absolute;
      right: 0;
      left: auto;
      margin-top: 8px !important;
    }
    .unread-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #EF4444;
      flex-shrink: 0;
    }
    .cursor-pointer { cursor: pointer; }
    .account-btn:hover {
      border-color: #CBD5E1 !important;
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  private router = inject(Router);
  authService = inject(AuthService);
  notify = inject(NotificationService);
  emailService = inject(EmailService);

  user = this.authService.currentUser;
  userRole = () => this.authService.getUserRole() || 'student';

  searchQuery = '';
  isDarkMode = false;
  currentPageTitle = 'Dashboard';

  notifications: NotificationItem[] = [];
  notificationUnreadCount = 0;
  mailboxUnreadCount = 0;
  isLoadingNotifications = false;

  constructor() {
    const saved = localStorage.getItem('portal_theme');
    if (saved === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitleFromUrl(event.urlAfterRedirects || event.url);
    });
  }

  ngOnInit(): void {
    this.updateTitleFromUrl(this.router.url);
    this.loadCounts();
    this.loadNotifications();
  }

  private updateTitleFromUrl(url: string): void {
    const path = url.split('?')[0].split('#')[0].replace('/', '');
    switch (path) {
      case 'dashboard': this.currentPageTitle = 'Dashboard'; break;
      case 'students': this.currentPageTitle = 'Student Directory'; break;
      case 'companies': this.currentPageTitle = 'Corporate Partners'; break;
      case 'jobs': this.currentPageTitle = 'Placement Drives'; break;
      case 'applications': this.currentPageTitle = 'Applications Pipeline'; break;
      case 'assessments': this.currentPageTitle = 'Online Assessments'; break;
      case 'reports': this.currentPageTitle = 'Placement Reports'; break;
      case 'profile': this.currentPageTitle = 'User Profile'; break;
      case 'settings': this.currentPageTitle = 'System Settings'; break;
      case 'notices': this.currentPageTitle = 'Campus Notices'; break;
      case 'mailbox': this.currentPageTitle = 'Mailbox Center'; break;
      default: this.currentPageTitle = 'Dashboard'; break;
    }
  }

  loadCounts(): void {
    this.notify.getUnreadCount().subscribe({
      next: (res) => {
        this.notificationUnreadCount = res.count || 0;
      },
      error: () => {}
    });

    this.emailService.getUnreadCount().subscribe({
      next: (res) => {
        this.mailboxUnreadCount = res.count || 0;
      },
      error: () => {}
    });
  }

  loadNotifications(): void {
    this.isLoadingNotifications = true;
    this.notify.getNotifications(10).subscribe({
      next: (res) => {
        this.notifications = res.data || [];
        this.notificationUnreadCount = res.unreadCount || 0;
        this.isLoadingNotifications = false;
      },
      error: () => {
        this.isLoadingNotifications = false;
      }
    });
  }

  onNotificationClick(item: NotificationItem): void {
    if (!item.isRead) {
      this.notify.markAsRead(item._id).subscribe({
        next: () => {
          item.isRead = true;
          this.notificationUnreadCount = Math.max(0, this.notificationUnreadCount - 1);
        },
        error: () => {}
      });
    }
    if (item.link) {
      this.router.navigateByUrl(item.link);
    }
  }

  markAllNotificationsRead(event: Event): void {
    event.stopPropagation();
    this.notify.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.isRead = true));
        this.notificationUnreadCount = 0;
        this.notify.showSuccess('All notifications marked as read.');
      },
      error: () => {}
    });
  }

  getUserPhoto(): string {
    const u = this.user();
    if (u && (u as any).photoUrl) {
      return (u as any).photoUrl;
    }
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
  }

  getRoleTitle(): string {
    const role = this.userRole();
    if (role === 'admin') return 'TPO Admin';
    if (role === 'company') return 'HR Recruiter';
    return 'Candidate';
  }

  onGlobalSearch(): void {
    if (!this.searchQuery.trim()) return;
    const query = this.searchQuery.trim();
    this.router.navigate(['/jobs'], { queryParams: { search: query } });
    this.notify.showSuccess(`Searching for '${query}'...`);
  }

  switchAccount(role: 'admin' | 'student' | 'company'): void {
    let email = 'admin@placement.com';
    let password = 'admin123';

    if (role === 'student') {
      email = 'student@placement.com';
      password = 'student123';
    } else if (role === 'company') {
      email = 'company@placement.com';
      password = 'company123';
    }

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.notify.showSuccess(`Switched workspace to ${role.toUpperCase()} account!`);
        this.loadCounts();
        this.loadNotifications();
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.notify.showError('Account switch failed. Please check backend server.');
      }
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('portal_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('portal_theme', 'light');
    }
    this.notify.showSuccess(`Switched to ${this.isDarkMode ? 'Dark' : 'Light'} Mode theme.`);
  }

  logout(): void {
    this.authService.logout();
    this.notify.showSuccess('Signed out successfully.');
    this.router.navigate(['/login']);
  }
}
