import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-5 text-center">
      <div class="glass-card p-5 mx-auto" style="max-width: 500px;">
        <h1 class="display-1 fw-bold text-primary mb-0">404</h1>
        <h3 class="text-white mb-3">Page Not Found</h3>
        <p class="text-muted mb-4">The page or placement resource you are looking for does not exist or has been moved.</p>
        <a routerLink="/dashboard" class="btn btn-primary rounded-pill px-4 py-2 fw-bold">
          <i class="bi bi-house-door me-2"></i> Return to Dashboard
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
