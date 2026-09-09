import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="w-100 d-flex align-items-center justify-content-between">
      <!-- Left: Toggle & Brand Mobile -->
      <div class="d-flex align-items-center gap-3">
        <button 
          class="btn btn-icon btn-secondary text-slate-700 shadow-sm" 
          (click)="toggleSidebar.emit()" 
          aria-label="Toggle Sidebar"
        >
          <i class="bi bi-list fs-5"></i>
        </button>

        <div class="d-none d-sm-flex align-items-center gap-2">
          <div class="portal-tag">
            <i class="bi bi-mortarboard-fill text-primary me-1"></i>
            <span>University T&P Portal</span>
          </div>
        </div>
      </div>

      <!-- Center: Global Search Bar -->
      <div class="d-none d-md-flex flex-grow-1 mx-4 justify-content-center" style="max-width: 480px;">
        <div class="input-group search-bar-pill">
          <span class="input-group-text bg-transparent border-0 text-muted ps-3">
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (keyup.enter)="onGlobalSearch()"
            class="form-control border-0 bg-transparent py-2 small shadow-none"
            placeholder="Search placement drives, companies, students..."
            aria-label="Search"
          />
          <span class="input-group-text bg-transparent border-0 pe-3">
            <kbd class="search-kbd">↵ Enter</kbd>
          </span>
        </div>
      </div>

      <!-- Right: Role Badge, Notifications & Profile -->
      <div class="d-flex align-items-center gap-2 ms-auto">
        <!-- Role Badge -->
        <div class="d-none d-lg-block me-1">
          <span *ngIf="userRole() === 'admin'" class="role-pill-badge admin">
            <i class="bi bi-shield-lock-fill"></i> ADMIN CONSOLE
          </span>
          <span *ngIf="userRole() === 'company'" class="role-pill-badge recruiter">
            <i class="bi bi-building-fill-check"></i> CORPORATE PARTNER
          </span>
          <span *ngIf="userRole() === 'student'" class="role-pill-badge student">
            <i class="bi bi-person-check-fill"></i> CANDIDATE PROFILE
          </span>
        </div>

        <!-- Notices Inbox Button -->
        <a routerLink="/notices" class="btn btn-icon btn-secondary text-slate-700 position-relative shadow-sm" title="Placement Notices">
          <i class="bi bi-envelope-fill text-primary"></i>
          <span class="pulse-indicator"></span>
        </a>

        <!-- Notifications Dropdown -->
        <div class="dropdown">
          <button class="btn btn-icon btn-secondary text-slate-700 position-relative shadow-sm" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-bell-fill text-slate-600"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white font-mono" style="font-size: 0.6rem;">
              3
            </span>
          </button>
          <div class="dropdown-menu dropdown-menu-end shadow-lg border-0 p-0 rounded-16 overflow-hidden mt-2" style="width: 350px;">
            <div class="p-3 bg-slate-900 text-white d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-bell-fill text-warning"></i>
                <span class="fw-bold mb-0">Placement Alerts</span>
              </div>
              <span class="badge bg-warning text-dark rounded-pill font-mono">3 Unread</span>
            </div>
            <div class="list-group list-group-flush small" style="max-height: 280px; overflow-y: auto;">
              <a routerLink="/notices" class="list-group-item list-group-item-action p-3 border-bottom">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold text-slate-900"><i class="bi bi-lightning-charge-fill text-danger me-1"></i> Google India Drive</span>
                  <small class="text-muted font-mono" style="font-size: 0.65rem;">Today</small>
                </div>
                <p class="text-muted small mb-0">Shortlisting round interview schedule released for Software Engineer roles.</p>
              </a>
              <a routerLink="/notices" class="list-group-item list-group-item-action p-3 border-bottom">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold text-slate-900"><i class="bi bi-building-check text-primary me-1"></i> Microsoft IDC</span>
                  <small class="text-muted font-mono" style="font-size: 0.65rem;">Yesterday</small>
                </div>
                <p class="text-muted small mb-0">New placement opening posted: Cloud Solution Architect (24.0 LPA).</p>
              </a>
            </div>
            <div class="p-2 text-center bg-slate-50 border-top">
              <a routerLink="/notices" class="text-primary fw-bold text-decoration-none small">View All Campus Notices ➔</a>
            </div>
          </div>
        </div>

        <!-- Theme Toggle -->
        <button class="btn btn-icon btn-secondary text-slate-700 shadow-sm" (click)="toggleTheme()" title="Toggle Theme">
          <i [class]="isDarkMode ? 'bi bi-sun-fill text-warning fs-6' : 'bi bi-moon-stars-fill text-primary fs-6'"></i>
        </button>

        <!-- Profile / Account Switcher -->
        <div class="dropdown ms-1">
          <button class="btn p-1 d-flex align-items-center rounded-pill bg-white border border-slate-200 shadow-sm account-btn" data-bs-toggle="dropdown" aria-expanded="false">
            <img [src]="getUserPhoto()" class="rounded-circle me-2" style="width: 32px; height: 32px; object-fit: cover;" alt="Avatar" />
            <div class="text-start me-2 d-none d-sm-block lh-1">
              <span class="fw-bold text-slate-900 small d-block">{{ user()?.name || 'TPO User' }}</span>
              <span class="text-muted font-mono text-uppercase" style="font-size: 0.6rem;">{{ userRole() }}</span>
            </div>
            <i class="bi bi-chevron-down text-muted small me-1"></i>
          </button>

          <!-- Dropdown Box -->
          <div class="dropdown-menu dropdown-menu-end shadow-xl border-0 rounded-20 p-3 mt-2" style="width: 320px;">
            <div class="p-3 bg-slate-900 text-white rounded-16 mb-3 shadow-sm">
              <div class="d-flex align-items-center gap-3">
                <img [src]="getUserPhoto()" class="rounded-circle border border-2 border-primary" style="width: 44px; height: 44px; object-fit: cover;" alt="Avatar" />
                <div class="overflow-hidden">
                  <div class="fw-bold text-white fs-6 text-truncate">{{ user()?.name || 'TPO User' }}</div>
                  <small class="text-slate-300 font-mono text-truncate d-block" style="font-size: 0.7rem;">{{ user()?.email || 'user@university.edu' }}</small>
                  <span class="badge bg-primary bg-opacity-25 text-primary-light font-mono mt-1" style="font-size: 0.6rem;">
                    {{ userRole().toUpperCase() }} SESSION
                  </span>
                </div>
              </div>
            </div>

            <!-- Role Quick Switcher -->
            <div class="d-flex justify-content-between align-items-center px-1 mb-2">
              <span class="text-slate-400 font-mono fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px;">SWITCH DEMO ROLE</span>
              <span class="badge bg-slate-100 text-slate-600 rounded-pill font-mono" style="font-size: 0.6rem;">INSTANT</span>
            </div>

            <div class="d-flex flex-column gap-1 mb-2">
              <button 
                class="btn btn-light text-start rounded-12 p-2 d-flex align-items-center justify-content-between border" 
                [class.border-primary]="userRole() === 'admin'"
                [class.bg-primary-subtle]="userRole() === 'admin'"
                (click)="switchAccount('admin')"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-shield-check text-primary fs-5"></i>
                  <div>
                    <div class="fw-bold text-slate-900 small">TPO Admin Director</div>
                    <small class="text-muted font-mono" style="font-size: 0.65rem;">admin&#64;placement.com</small>
                  </div>
                </div>
                <i *ngIf="userRole() === 'admin'" class="bi bi-check-circle-fill text-primary"></i>
              </button>

              <button 
                class="btn btn-light text-start rounded-12 p-2 d-flex align-items-center justify-content-between border" 
                [class.border-primary]="userRole() === 'student'"
                [class.bg-primary-subtle]="userRole() === 'student'"
                (click)="switchAccount('student')"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-mortarboard text-success fs-5"></i>
                  <div>
                    <div class="fw-bold text-slate-900 small">Alex Johnson (Student)</div>
                    <small class="text-muted font-mono" style="font-size: 0.65rem;">student&#64;placement.com</small>
                  </div>
                </div>
                <i *ngIf="userRole() === 'student'" class="bi bi-check-circle-fill text-primary"></i>
              </button>

              <button 
                class="btn btn-light text-start rounded-12 p-2 d-flex align-items-center justify-content-between border" 
                [class.border-primary]="userRole() === 'company'"
                [class.bg-primary-subtle]="userRole() === 'company'"
                (click)="switchAccount('company')"
              >
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-building text-warning fs-5"></i>
                  <div>
                    <div class="fw-bold text-slate-900 small">Tech HR Recruiter</div>
                    <small class="text-muted font-mono" style="font-size: 0.65rem;">company&#64;placement.com</small>
                  </div>
                </div>
                <i *ngIf="userRole() === 'company'" class="bi bi-check-circle-fill text-primary"></i>
              </button>
            </div>

            <hr class="my-2 border-slate-200" />

            <div class="d-flex flex-column gap-1">
              <a routerLink="/profile" class="dropdown-item rounded-10 py-2 small fw-semibold text-slate-700">
                <i class="bi bi-person-gear me-2 text-primary"></i>My Profile Settings
              </a>
              <button class="dropdown-item rounded-10 py-2 small text-danger fw-bold" (click)="logout()">
                <i class="bi bi-box-arrow-right me-2"></i>Sign Out of Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .portal-tag {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #334155;
      display: flex;
      align-items: center;
    }
    .search-bar-pill {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
      transition: all 0.2s ease;
      width: 100%;
    }
    .search-bar-pill:focus-within {
      background: #ffffff;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    .search-kbd {
      background: #e2e8f0;
      color: #64748b;
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .role-pill-badge {
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.6px;
      font-family: 'JetBrains Mono', monospace;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .role-pill-badge.admin {
      background: rgba(79, 70, 229, 0.1);
      color: #4f46e5;
      border: 1px solid rgba(79, 70, 229, 0.25);
    }
    .role-pill-badge.recruiter {
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
    .role-pill-badge.student {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .pulse-indicator {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      box-shadow: 0 0 6px #ef4444;
    }
    .account-btn:hover {
      border-color: #6366f1 !important;
    }
  `]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private router = inject(Router);
  authService = inject(AuthService);
  notify = inject(NotificationService);

  user = this.authService.currentUser;
  userRole = () => this.authService.getUserRole() || 'student';

  searchQuery = '';
  isDarkMode = false;

  constructor() {
    const saved = localStorage.getItem('portal_theme');
    if (saved === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    }
  }

  getUserPhoto(): string {
    const u = this.user();
    if (u && (u as any).photoUrl) {
      return (u as any).photoUrl;
    }
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
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
