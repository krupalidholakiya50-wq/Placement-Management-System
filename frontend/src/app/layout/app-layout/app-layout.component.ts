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
    <div class="d-flex flex-column min-vh-100 bg-main">
      <!-- Fixed Glassmorphism Header -->
      <app-header (toggleSidebar)="isSidebarCollapsed = !isSidebarCollapsed"></app-header>

      <!-- Main Layout Body with Sidebar and Router Content -->
      <div class="d-flex flex-grow-1 position-relative">
        <!-- Collapsible Midnight Sidebar -->
        <app-sidebar [isCollapsed]="isSidebarCollapsed"></app-sidebar>

        <!-- Mobile Backdrop Overlay when Sidebar is expanded on mobile -->
        <div
          *ngIf="!isSidebarCollapsed && isMobile"
          class="position-fixed top-0 bottom-0 start-0 end-0 bg-dark bg-opacity-50"
          style="z-index: 1030;"
          (click)="isSidebarCollapsed = true"
        ></div>

        <!-- Main Content View Area wrapped in 1400px Container -->
        <main class="flex-grow-1 p-3 p-md-4 overflow-auto" style="min-width: 0;">
          <div class="app-main-container">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Footer -->
      <footer class="bg-white border-top border-slate-200 py-3 px-4 text-center text-muted small mt-auto">
        <div class="app-main-container d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>Placement Management System © 2026 University T&P Cell. All rights reserved.</div>
          <div class="d-flex gap-3">
            <span class="text-primary font-monospace fw-semibold">v2026.1.0-ENTERPRISE</span>
          </div>
        </div>
      </footer>
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
