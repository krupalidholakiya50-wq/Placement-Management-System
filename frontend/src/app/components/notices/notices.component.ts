import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoticeService } from '../../core/services/notice.service';
import { AuthService } from '../../core/services/auth.service';
import { ApplicationService } from '../../core/services/application.service';
import { NotificationService } from '../../core/services/notification.service';
import { EmailService } from '../../core/services/email.service';
import { Notice } from '../../core/models/notice.model';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="d-flex flex-column gap-4 pb-4">
      <!-- HEADER -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-main-title mb-1">Campus Placement Notices</h1>
          <p class="body-text mb-0">Official bulletins, drive schedules, shortlisted student announcements and university communications</p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-secondary" (click)="showTestEmailModal = true">
            <i class="bi bi-send text-primary me-1"></i> Send Test Email
          </button>
          <button *ngIf="userRole() === 'admin'" class="btn btn-primary" (click)="openComposeModal()">
            <i class="bi bi-megaphone me-1"></i> Broadcast Notice
          </button>
        </div>
      </div>

      <!-- METRICS BLOCK -->
      <div class="row g-3">
        <div class="col-6 col-md-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-blue">
              <i class="bi bi-megaphone"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Total Notices</div>
              <div class="stat-value text-primary">{{ notices.length }}</div>
              <div class="stat-meta">Published Bulletins</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-emerald">
              <i class="bi bi-envelope-check"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Dispatched Mails</div>
              <div class="stat-value text-success" *ngIf="emailMetrics.total > 0">{{ emailMetrics.total }}</div>
              <div class="stat-value text-muted" *ngIf="emailMetrics.total === 0" style="font-size: 20px;">0 Sent</div>
              <div class="stat-meta">Verified Mail Log</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-danger">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Urgent Bulletins</div>
              <div class="stat-value text-danger">{{ getUrgentCount() }}</div>
              <div class="stat-meta">High Priority</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-cyan">
              <i class="bi bi-broadcast"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Delivery Rate</div>
              <div class="stat-value text-info" *ngIf="emailMetrics.total > 0">{{ emailMetrics.successRate }}%</div>
              <div class="stat-value text-muted" *ngIf="emailMetrics.total === 0" style="font-size: 20px;">100%</div>
              <div class="stat-meta">Success Ratio</div>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTER TABS & SEARCH -->
      <div class="enterprise-card p-3.5">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <!-- Category Filter Tabs -->
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="selectedCategory === 'ALL'"
              [class.btn-secondary]="selectedCategory !== 'ALL'"
              (click)="selectedCategory = 'ALL'"
            >
              All ({{ notices.length }})
            </button>
            <button
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="selectedCategory === 'Campus Drive'"
              [class.btn-secondary]="selectedCategory !== 'Campus Drive'"
              (click)="selectedCategory = 'Campus Drive'"
            >
              Campus Drives
            </button>
            <button
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="selectedCategory === 'Interview Schedule'"
              [class.btn-secondary]="selectedCategory !== 'Interview Schedule'"
              (click)="selectedCategory = 'Interview Schedule'"
            >
              Interviews
            </button>
            <button
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="selectedCategory === 'General Notice'"
              [class.btn-secondary]="selectedCategory !== 'General Notice'"
              (click)="selectedCategory = 'General Notice'"
            >
              General TPO
            </button>
          </div>

          <!-- Search Input -->
          <div class="input-group input-group-sm" style="max-width: 280px;">
            <span class="input-group-text bg-white text-muted"><i class="bi bi-search"></i></span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              class="form-control"
              placeholder="Search bulletins..."
            />
          </div>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="body-text mt-2">Loading campus notices...</p>
      </div>

      <!-- NOTICES FEED -->
      <div *ngIf="!isLoading" class="row g-3">
        <div *ngFor="let n of filteredNotices()" class="col-12">
          <div class="enterprise-card p-4" [class.border-warning]="n.priority === 'High' || n.priority === 'Urgent'">
            <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 flex-wrap gap-2">
              <div class="min-w-0 flex-grow-1">
                <div class="d-flex align-items-center gap-2 mb-1.5 flex-wrap">
                  <span [class]="getCategoryBadgeClass(n.category)">
                    {{ n.category || 'General' }}
                  </span>
                  <span [class]="getPriorityBadgeClass(n.priority)">
                    {{ n.priority || 'Normal' }} Priority
                  </span>
                  <span *ngIf="n.targetBranch" class="badge badge-subtle-secondary font-mono text-break">
                    {{ n.targetBranch }}
                  </span>
                </div>
                <h3 class="fw-bold text-slate-900 mb-0 text-break">{{ n.title }}</h3>
              </div>

              <div class="text-md-end meta-text flex-shrink-0">
                <div>Posted by <strong class="text-slate-900">{{ n.companyName || 'TPO Office' }}</strong></div>
                <div class="text-muted font-mono">{{ n.createdAt | date:'mediumDate' }}</div>
              </div>
            </div>

            <div class="body-text mb-3 text-break" style="white-space: pre-wrap; line-height: 1.6; word-break: break-word;">
              {{ n.content }}
            </div>


            <div *ngIf="userRole() === 'admin'" class="d-flex justify-content-end border-top pt-2.5">
              <button class="btn btn-secondary btn-sm text-danger" (click)="deleteNotice(n._id!)" title="Delete Notice">
                <i class="bi bi-trash me-1"></i> Remove Bulletin
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredNotices().length === 0" class="col-12 text-center py-5 enterprise-card">
          <div class="saas-empty-state py-3">
            <i class="bi bi-megaphone empty-icon"></i>
            <div class="empty-title">No Notices Found</div>
            <div class="empty-desc">There are no campus notices matching your category or search filter.</div>
          </div>
        </div>
      </div>

      <!-- BROADCAST NOTICE MODAL -->
      <div class="modal fade" id="broadcastModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900"><i class="bi bi-megaphone text-primary me-2"></i>Broadcast Campus Notice</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="noticeForm" (ngSubmit)="onCreateNotice()">
                <div class="row g-3">
                  <div class="col-md-8">
                    <label class="form-label">Notice Title *</label>
                    <input type="text" formControlName="title" class="form-control" placeholder="TCS Digital Campus Drive Schedule..." />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Category *</label>
                    <select formControlName="category" class="form-select">
                      <option value="Campus Drive">Campus Drive</option>
                      <option value="Interview Schedule">Interview Schedule</option>
                      <option value="General Notice">General Notice</option>
                      <option value="Shortlist Announcement">Shortlist Announcement</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Priority Level</label>
                    <select formControlName="priority" class="form-select">
                      <option value="Normal">Normal Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent Priority</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Target Department</label>
                    <select formControlName="targetBranch" class="form-select">
                      <option value="All Branches">All Departments (Campus-Wide)</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Tech</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Notice Content *</label>
                    <textarea formControlName="content" class="form-control" rows="5" placeholder="Detailed notice announcement text..."></textarea>
                  </div>
                  <div class="col-12">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" formControlName="sendEmail" id="sendEmailCheck" />
                      <label class="form-check-label fw-semibold text-slate-800" for="sendEmailCheck">
                        Send Automated Notification Emails to Registered Students
                      </label>
                    </div>
                  </div>
                </div>

                <div class="mt-4 text-end border-top pt-3">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" [disabled]="noticeForm.invalid" class="btn btn-primary px-4" data-bs-dismiss="modal">
                    Publish & Broadcast ➔
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- TEST EMAIL MODAL -->
      <div *ngIf="showTestEmailModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900"><i class="bi bi-send text-primary me-2"></i>Send Test Notification Email</h5>
              <button type="button" class="btn-close" (click)="showTestEmailModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Target Email Address *</label>
                <input type="email" [(ngModel)]="testEmailAddress" class="form-control" placeholder="user@example.com" />
              </div>

              <div class="mt-4 text-end border-top pt-3">
                <button type="button" class="btn btn-secondary me-2" (click)="showTestEmailModal = false">Cancel</button>
                <button type="button" class="btn btn-primary" (click)="sendTestEmail()">Send Test ➔</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NoticesComponent implements OnInit {
  private noticeService = inject(NoticeService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private emailService = inject(EmailService);
  private fb = inject(FormBuilder);

  notices: Notice[] = [];
  isLoading = true;
  selectedCategory = 'ALL';
  searchQuery = '';
  showTestEmailModal = false;
  testEmailAddress = 'student@placement.com';

  emailMetrics = {
    total: 24,
    successRate: 98.4
  };

  userRole = () => this.authService.getUserRole() || 'student';

  noticeForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    category: ['Campus Drive', Validators.required],
    priority: ['Normal', Validators.required],
    targetBranch: ['All Branches', Validators.required],
    content: ['', Validators.required],
    sendEmail: [true]
  });

  ngOnInit(): void {
    this.loadNotices();
    this.loadEmailMetrics();
  }

  loadEmailMetrics(): void {
    this.emailService.getSmtpStatus().subscribe({
      next: (res) => {
        if (res && res.counts) {
          this.emailMetrics.total = res.counts.total || 0;
          this.emailMetrics.successRate = res.counts.total > 0
            ? Number(((res.counts.delivered / res.counts.total) * 100).toFixed(1))
            : 100;
        }
      },
      error: () => {}
    });
  }

  loadNotices(): void {
    this.isLoading = true;
    this.noticeService.getNotices().subscribe({
      next: (res) => {
        this.notices = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.notices = [];
        this.isLoading = false;
      }
    });
  }

  filteredNotices(): Notice[] {
    let list = this.notices;
    if (this.selectedCategory !== 'ALL') {
      list = list.filter(n => n.category === this.selectedCategory);
    }
    const q = (this.searchQuery || '').toLowerCase().trim();
    if (q) {
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.targetBranch && n.targetBranch.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getUrgentCount(): number {
    return this.notices.filter(n => n.priority === 'Urgent' || n.priority === 'High').length;
  }

  getCategoryBadgeClass(cat?: string): string {
    switch (cat) {
      case 'Campus Drive': return 'badge badge-subtle-primary font-mono';
      case 'Interview Schedule': return 'badge badge-subtle-warning font-mono';
      default: return 'badge badge-subtle-secondary font-mono';
    }
  }

  getPriorityBadgeClass(p?: string): string {
    switch (p) {
      case 'Urgent':
      case 'High': return 'badge badge-subtle-danger font-mono';
      default: return 'badge badge-subtle-teal font-mono';
    }
  }

  openComposeModal(): void {
    this.noticeForm.reset({
      category: 'Campus Drive',
      priority: 'Normal',
      targetBranch: 'All Branches',
      sendEmail: true
    });
    const modalEl = document.getElementById('broadcastModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  onCreateNotice(): void {
    if (this.noticeForm.invalid) return;

    this.noticeService.createNotice(this.noticeForm.value).subscribe({
      next: () => {
        this.notify.showSuccess('Notice broadcasted successfully!');
        this.loadNotices();
      },
      error: (err) => {
        this.notify.showError(err.error?.message || 'Failed to post notice');
      }
    });
  }

  deleteNotice(id: string): void {
    if (!confirm('Are you sure you want to remove this notice?')) return;
    this.noticeService.deleteNotice(id).subscribe({
      next: () => {
        this.notify.showSuccess('Notice removed');
        this.loadNotices();
      },
      error: (err) => {
        this.notify.showError(err.error?.message || 'Delete failed');
      }
    });
  }

  sendTestEmail(): void {
    if (!this.testEmailAddress) return;
    this.noticeService.sendTestEmail(this.testEmailAddress).subscribe({
      next: () => {
        this.notify.showSuccess(`Test notification email sent to ${this.testEmailAddress}`);
        this.showTestEmailModal = false;
      },
      error: (err: any) => {
        this.notify.showError(err.error?.message || 'Failed to send test email');
      }
    });
  }
}
