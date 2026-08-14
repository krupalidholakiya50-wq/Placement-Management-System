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
    <header class="navbar navbar-expand-lg sticky-top glass-header px-4 py-2 border-bottom">
      <div class="container-fluid p-0">
        <!-- Sidebar Toggle & University Logo Branding -->
        <div class="d-flex align-items-center">
          <button class="btn btn-icon btn-light rounded-circle me-3 border-0 shadow-none text-slate-700" (click)="toggleSidebar.emit()" aria-label="Toggle Sidebar Navigation">
            <i class="bi bi-list fs-4"></i>
          </button>
          
          <a routerLink="/dashboard" class="navbar-brand d-flex align-items-center me-4">
            <div class="rounded-12 bg-primary p-2 text-white me-2 d-flex align-items-center justify-content-center shadow-sm" style="width: 38px; height: 38px;">
              <i class="bi bi-mortarboard-fill fs-5"></i>
            </div>
            <div>
              <span class="fw-extrabold text-slate-900 fs-5 lh-1 d-block">PlacementCell</span>
              <small class="text-primary font-monospace fw-semibold" style="font-size: 0.65rem;">UNIVERSITY T&P CELL • 2025-2026</small>
            </div>
          </a>
        </div>

        <!-- Global Search Bar in Header -->
        <div class="d-none d-md-flex flex-grow-1 mx-4 justify-content-center" style="max-width: 480px;">
          <div class="input-group search-input-group shadow-sm rounded-pill overflow-hidden border">
            <span class="input-group-text bg-white border-0 text-muted ps-3"><i class="bi bi-search"></i></span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="onGlobalSearch()"
              class="form-control border-0 bg-white py-2 small shadow-none"
              placeholder="Search students, companies, job drives..."
              aria-label="Global Search Query"
            />
            <button class="btn btn-primary px-3 fw-bold small" (click)="onGlobalSearch()">Search</button>
          </div>
        </div>

        <!-- Header Actions: Notifications, Theme, Profile Dropdown -->
        <div class="d-flex align-items-center gap-2">
          <!-- Notification Bell Drawer Button -->
          <div class="dropdown">
            <button class="btn btn-icon btn-light rounded-circle border-0 position-relative text-slate-700 p-2" data-bs-toggle="dropdown" aria-expanded="false" aria-label="View Notifications">
              <i class="bi bi-bell fs-5"></i>
              <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span class="visually-hidden">Unread notifications</span>
              </span>
            </button>
            <div class="dropdown-menu dropdown-menu-end shadow-lg border-0 p-0 rounded-16 overflow-hidden" style="width: 320px;">
              <div class="p-3 bg-slate-900 text-white d-flex justify-content-between align-items-center">
                <h6 class="fw-bold mb-0"><i class="bi bi-bell-fill me-2 text-warning"></i>Notification Center</h6>
                <span class="badge bg-warning text-dark rounded-pill font-monospace">3 Unread</span>
              </div>
              <div class="p-2 border-bottom bg-slate-50 d-flex justify-content-between align-items-center">
                <small class="text-muted font-monospace">Recent Activity Alerts</small>
                <button class="btn btn-link btn-sm text-primary text-decoration-none p-0 small fw-bold" (click)="markAllRead()">Mark All Read</button>
              </div>
              <div class="list-group list-group-flush small" style="max-height: 260px; overflow-y: auto;">
                <a class="list-group-item list-group-item-action p-3">
                  <div class="fw-bold text-slate-900"><i class="bi bi-check-circle-fill me-2 text-success"></i>Profile Verified</div>
                  <div class="text-muted small">Your academic records are verified by TPO.</div>
                  <small class="text-slate-400 font-monospace" style="font-size: 0.65rem;">10 mins ago</small>
                </a>
                <a class="list-group-item list-group-item-action p-3">
                  <div class="fw-bold text-slate-900"><i class="bi bi-building-fill me-2 text-primary"></i>Google India Drive</div>
                  <div class="text-muted small">New drive published for 18.0 LPA.</div>
                  <small class="text-slate-400 font-monospace" style="font-size: 0.65rem;">1 hour ago</small>
                </a>
              </div>
            </div>
          </div>

          <!-- Theme Toggle Button -->
          <button class="btn btn-icon btn-light rounded-circle border-0 text-slate-700 p-2" (click)="toggleTheme()" title="Toggle Dark/Light Mode" aria-label="Toggle Theme Mode">
            <i [class]="isDarkMode ? 'bi bi-sun-fill text-warning fs-5' : 'bi bi-moon-stars-fill fs-5'"></i>
          </button>

          <!-- User Profile Dropdown -->
          <div class="dropdown ms-2">
            <button class="btn p-1 d-flex align-items-center rounded-pill border border-slate-200 bg-white shadow-sm" data-bs-toggle="dropdown" aria-expanded="false" aria-label="User Menu">
              <img [src]="getUserPhoto()" class="rounded-circle me-2 border" style="width: 32px; height: 32px; object-fit: cover;" />
              <span class="fw-semibold text-slate-900 small me-2 d-none d-sm-inline">{{ user()?.name || 'TPO User' }}</span>
              <i class="bi bi-chevron-down text-slate-400 small me-1"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-16 p-2" style="min-width: 200px;">
              <li class="px-3 py-2 border-bottom mb-1">
                <div class="fw-bold text-slate-900">{{ user()?.name || 'TPO User' }}</div>
                <small class="text-muted font-monospace text-uppercase" style="font-size: 0.65rem;">Role: {{ userRole() }}</small>
              </li>
              <li><a routerLink="/profile" class="dropdown-item rounded-8 py-2 small"><i class="bi bi-person-badge me-2 text-primary"></i>My Profile</a></li>
              <li><a routerLink="/reports" class="dropdown-item rounded-8 py-2 small"><i class="bi bi-bar-chart-line me-2 text-info"></i>Placement Reports</a></li>
              <li><hr class="dropdown-divider my-1"></li>
              <li><button class="dropdown-item rounded-8 py-2 small text-danger fw-bold" (click)="logout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</button></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  `
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

  markAllRead(): void {
    this.notify.showSuccess('All notifications marked as read.');
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.notify.showSuccess(`Switched to ${this.isDarkMode ? 'Dark' : 'Light'} Mode theme.`);
  }

  logout(): void {
    this.authService.logout();
    this.notify.showSuccess('Signed out successfully.');
  }
}
