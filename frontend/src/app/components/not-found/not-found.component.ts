import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-5 text-center">
      <div class="card p-5 mx-auto text-center" style="max-width: 480px;">
        <div class="mb-3">
          <div class="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle" style="width: 72px; height: 72px;">
            <i class="bi bi-compass fs-1"></i>
          </div>
        </div>
        <h1 class="display-3 fw-bold text-slate-900 mb-1">404</h1>
        <h4 class="fw-bold text-slate-800 mb-2">Page Not Found</h4>
        <p class="text-secondary small mb-4">The placement portal resource, drive or view you requested does not exist or has been relocated.</p>
        <div>
          <a routerLink="/dashboard" class="btn btn-primary px-4 py-2 fw-semibold">
            <i class="bi bi-arrow-left me-2"></i> Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}

