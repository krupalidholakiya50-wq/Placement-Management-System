import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-root-shell">
      <!-- Master Fixed Sidebar Frame -->
      <app-sidebar 
        class="app-sidebar-panel-fixed" 
        [class.collapsed]="isSidebarCollapsed && !isMobile"
        [class.mobile-open]="!isSidebarCollapsed && isMobile"
        [isCollapsed]="isSidebarCollapsed"
      ></app-sidebar>

      <!-- Floating Top Navbar Frame -->
      <app-header 
        class="app-navbar-strip-floating" 
        [class.sidebar-collapsed]="isSidebarCollapsed && !isMobile"
        (toggleSidebar)="isSidebarCollapsed = !isSidebarCollapsed"
      ></app-header>

      <!-- Mobile Backdrop Overlay -->
      <div
        *ngIf="!isSidebarCollapsed && isMobile"
        class="position-fixed top-0 bottom-0 start-0 end-0 bg-dark bg-opacity-50"
        style="z-index: 1045; backdrop-filter: blur(4px);"
        (click)="isSidebarCollapsed = true"
      ></div>

      <!-- Main Viewport Container & Canvas -->
      <main 
        class="app-main-content-viewport"
        [class.sidebar-collapsed]="isSidebarCollapsed && !isMobile"
      >
        <div class="app-inner-grid-canvas flex-grow-1">
          <router-outlet></router-outlet>
        </div>

        <!-- Sleek Glass Footer -->
        <footer class="bg-white border-top border-slate-200 py-3 px-4 text-muted small mt-auto" style="backdrop-filter: blur(10px);">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-mortarboard-fill text-primary"></i>
              <span class="text-slate-700 fw-medium">Placement Management System © 2026 University T&P Cell.</span>
            </div>
            <div class="d-flex align-items-center gap-3">
              <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 font-mono fw-semibold" style="font-size: 0.68rem;">
                <i class="bi bi-circle-fill me-1" style="font-size: 0.4rem;"></i> SYSTEM ONLINE
              </span>
              <span class="text-primary font-mono fw-bold" style="font-size: 0.72rem;">v2026.2.0-ULTRA</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  `
})
export class AppLayoutComponent implements OnInit {
  isSidebarCollapsed: boolean = false;
  isMobile: boolean = false;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 992;
    if (this.isMobile) {
      this.isSidebarCollapsed = true;
    }
  }
}
