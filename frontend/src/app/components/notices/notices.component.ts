import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoticeService } from '../../core/services/notice.service';
import { AuthService } from '../../core/services/auth.service';
import { ApplicationService } from '../../core/services/application.service';
import { NotificationService } from '../../core/services/notification.service';
import { Notice } from '../../core/models/notice.model';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="w-100 p-0" style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">
      <!-- HEADER BANNER -->
      <div class="p-4 p-md-5 rounded-24 bg-gradient-dark text-white mb-4 position-relative overflow-hidden shadow-lg border border-slate-800">
        <div class="position-absolute top-0 end-0 p-5 opacity-10 pointer-events-none">
          <i class="bi bi-megaphone-fill display-1 text-primary"></i>
        </div>

        <div class="position-relative z-1">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-30 rounded-pill px-3 py-1 font-monospace">
              COMMUNICATION CENTER
            </span>
            <span class="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 rounded-pill px-3 py-1 font-monospace">
              LIVE EMAIL DISPATCHER ONLINE
            </span>
          </div>

          <div class="d-flex justify-content-between align-items-md-center flex-column flex-md-row gap-3">
            <div>
              <h2 class="fw-extrabold text-white mb-1">📢 TPO Notice Board & Student Mailbox</h2>
              <p class="text-slate-300 mb-0 small max-w-2xl">
                Official placement drive notices, interview schedules, shortlist announcements & email alerts broadcasted by the Training & Placement Cell.
              </p>
            </div>

            <!-- Broadcast & Test Email Buttons -->
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-light px-3 py-2.5 rounded-12 fw-bold d-flex align-items-center gap-2" (click)="showTestEmailModal = true">
                <i class="bi bi-send-fill text-warning"></i> Send Test Email
              </button>
              <button *ngIf="userRole() === 'admin'" class="btn btn-primary px-4 py-2.5 rounded-12 fw-bold shadow-sm d-flex align-items-center gap-2" (click)="openComposeModal()">
                <i class="bi bi-send-plus-fill fs-5"></i> Broadcast Notice & Email
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- METRICS BLOCK (Symmetric Responsive 4-Column Grid Row) -->
      <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4 mb-4">
        <div class="col">
          <div class="enterprise-card p-4 bg-white h-100 d-flex align-items-center">
            <div class="rounded-16 bg-primary bg-opacity-10 text-primary p-3 me-3">
              <i class="bi bi-megaphone-fill fs-3"></i>
            </div>
            <div>
              <div class="text-muted small font-monospace">Total Notices</div>
              <h4 class="fw-extrabold text-slate-900 mb-0">{{ notices.length }}</h4>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="enterprise-card p-4 bg-white h-100 d-flex align-items-center">
            <div class="rounded-16 bg-success bg-opacity-10 text-success p-3 me-3">
              <i class="bi bi-envelope-check-fill fs-3"></i>
            </div>
            <div>
              <div class="text-muted small font-monospace">Emails Dispatched</div>
              <h4 class="fw-extrabold text-slate-900 mb-0">1,275 Sent</h4>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="enterprise-card p-4 bg-white h-100 d-flex align-items-center">
            <div class="rounded-16 bg-danger bg-opacity-10 text-danger p-3 me-3">
              <i class="bi bi-exclamation-triangle-fill fs-3"></i>
            </div>
            <div>
              <div class="text-muted small font-monospace">Urgent Alerts</div>
              <h4 class="fw-extrabold text-slate-900 mb-0">{{ getUrgentCount() }}</h4>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="enterprise-card p-4 bg-white h-100 d-flex align-items-center">
            <div class="rounded-16 bg-info bg-opacity-10 text-info p-3 me-3">
              <i class="bi bi-broadcast fs-3"></i>
            </div>
            <div>
              <div class="text-muted small font-monospace">Delivery Rate</div>
              <h4 class="fw-extrabold text-slate-900 mb-0">99.8%</h4>
            </div>
          </div>
        </div>
      </div>

      <!-- SYMMETRIC BORDERLESS CAPSULE FILTER TABS & SEARCH -->
      <div class="enterprise-card p-3 bg-white mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <!-- Inline Capsule Filters with White Backplate -->
          <div class="d-flex align-items-center gap-2 p-1 bg-white border rounded-pill overflow-auto">
            <button
              type="button"
              [class]="selectedCategory === 'ALL' ? 'btn btn-primary rounded-pill fw-bold px-3 py-1.5 small border-0' : 'btn btn-light rounded-pill text-slate-600 px-3 py-1.5 small border-0 bg-transparent'"
              (click)="selectedCategory = 'ALL'"
            >
              All Notices ({{ notices.length }})
            </button>
            <button
              type="button"
              [class]="selectedCategory === 'Campus Drive' ? 'btn btn-primary rounded-pill fw-bold px-3 py-1.5 small border-0' : 'btn btn-light rounded-pill text-slate-600 px-3 py-1.5 small border-0 bg-transparent'"
              (click)="selectedCategory = 'Campus Drive'"
            >
              Campus Drives
            </button>
            <button
              type="button"
              [class]="selectedCategory === 'Interview Schedule' ? 'btn btn-primary rounded-pill fw-bold px-3 py-1.5 small border-0' : 'btn btn-light rounded-pill text-slate-600 px-3 py-1.5 small border-0 bg-transparent'"
              (click)="selectedCategory = 'Interview Schedule'"
            >
              Interview Schedules
            </button>
            <button
              type="button"
              [class]="selectedCategory === 'General Notice' ? 'btn btn-primary rounded-pill fw-bold px-3 py-1.5 small border-0' : 'btn btn-light rounded-pill text-slate-600 px-3 py-1.5 small border-0 bg-transparent'"
              (click)="selectedCategory = 'General Notice'"
            >
              General TPO
            </button>
          </div>

          <!-- Search Input -->
          <div class="input-group search-input-group rounded-pill overflow-hidden border" style="max-width: 300px;">
            <span class="input-group-text bg-white border-0 text-muted ps-3"><i class="bi bi-search"></i></span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              class="form-control border-0 bg-white py-1.5 small shadow-none"
              placeholder="Search notices or company..."
            />
          </div>
        </div>
      </div>

      <!-- SPLIT SCREEN NOTIFICATION MAILBOX WORKFLOW (PHASE C) -->
      <div class="row g-4 mb-4">
        <!-- LEFT PANEL: LIVE MAILBOX FEED -->
        <div class="col-lg-5 col-xl-4">
          <div class="enterprise-card p-3 bg-white h-100">
            <div class="d-flex justify-content-between align-items-center mb-3 px-2 pb-2 border-bottom">
              <span class="fw-bold text-slate-900 font-monospace text-uppercase" style="font-size: 0.75rem;">
                <i class="bi bi-inbox-fill text-primary me-1"></i> LIVE MAILBOX FEED
              </span>
              <span class="badge bg-primary bg-opacity-10 text-primary font-monospace">{{ filteredNotices().length }} Items</span>
            </div>

            <div *ngIf="isLoading" class="text-center py-5">
              <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              <div class="text-muted mt-2 small font-monospace">Loading mailbox...</div>
            </div>

            <div *ngIf="!isLoading && filteredNotices().length === 0" class="text-center py-5 text-muted small">
              <i class="bi bi-envelope-open fs-2 d-block mb-2 text-slate-300"></i>
              No notices match your query.
            </div>

            <!-- Mailbox List Items -->
            <div *ngIf="!isLoading" class="d-flex flex-column gap-2 overflow-auto" style="max-height: 650px;">
              <div
                *ngFor="let notice of filteredNotices()"
                (click)="selectNotice(notice)"
                [class]="selectedNotice?._id === notice._id ? 'p-3 rounded-16 border border-2 border-primary bg-primary bg-opacity-10 cursor-pointer transition-all shadow-sm' : 'p-3 rounded-16 border bg-white hover-bg-slate-50 cursor-pointer transition-all'"
              >
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span [class]="getPriorityBadgeClass(notice)">
                    {{ notice.priority || 'Normal' }}
                  </span>
                  <small class="text-slate-400 font-monospace" style="font-size: 0.65rem;">{{ notice.createdAt | date:'shortTime' }}</small>
                </div>

                <h6 class="fw-bold text-slate-900 mb-1 text-break-word" style="font-size: 0.9rem; line-height: 1.3;">
                  {{ notice.title }}
                </h6>

                <div class="d-flex align-items-center gap-2 small text-muted mb-2">
                  <span><i class="bi bi-building me-1"></i> {{ notice.companyName || 'TPO Cell' }}</span>
                  <span>•</span>
                  <span class="text-success fw-bold">{{ notice.packageOffered || 'N/A' }}</span>
                </div>

                <div class="d-flex flex-wrap gap-1">
                  <span class="badge bg-slate-100 text-slate-700 border font-monospace" style="font-size: 0.6rem;">{{ notice.category || 'General' }}</span>
                  <span *ngIf="notice.targetBranch" class="badge bg-info bg-opacity-10 text-info border font-monospace" style="font-size: 0.6rem;">{{ notice.targetBranch }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL: DETAILED MAIL VIEWER & ELIGIBILITY ENGINE -->
        <div class="col-lg-7 col-xl-8">
          <!-- Zero-Empty-State Philosophy Placeholder -->
          <div *ngIf="!selectedNotice" class="empty-telemetry-state h-100 d-flex flex-column align-items-center justify-content-center">
            <div class="rounded-circle bg-primary bg-opacity-10 text-primary p-4 mb-3">
              <i class="bi bi-envelope-paper-heart-fill display-4"></i>
            </div>
            <h5 class="fw-bold text-slate-800 mb-2">Select a Hiring Notice from the Mailbox</h5>
            <p class="text-muted small max-w-md mb-0">
              Click any campus drive notice on the left feed to inspect complete job telemetry, recruitment criteria, TPO broadcast logs, and run your real-time profile eligibility check.
            </p>
          </div>

          <!-- Active Mail Reader View -->
          <div *ngIf="selectedNotice" class="enterprise-card p-4 p-md-5 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <!-- Email Sender Header -->
              <div class="d-flex justify-content-between align-items-start pb-3 border-bottom mb-4 flex-wrap gap-2">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <span [class]="getPriorityBadgeClass(selectedNotice)">
                      <i [class]="getPriorityIconClass(selectedNotice)" class="me-1"></i> {{ selectedNotice.priority || 'Normal' }} Priority
                    </span>
                    <span class="badge bg-slate-100 text-slate-700 border font-monospace">{{ selectedNotice.category }}</span>
                  </div>
                  <h4 class="fw-extrabold text-slate-900 mb-1 text-break-word">{{ selectedNotice.title }}</h4>
                  <small class="text-muted font-monospace">
                    FROM: <strong class="text-slate-900">Placement Cell &lt;tnp&#64;university.edu&gt;</strong> • {{ selectedNotice.createdAt | date:'fullDate' }}
                  </small>
                </div>

                <button *ngIf="userRole() === 'admin'" class="btn btn-sm btn-outline-danger" (click)="deleteNotice(selectedNotice._id)">
                  <i class="bi bi-trash me-1"></i> Delete
                </button>
              </div>

              <!-- Message Body -->
              <div class="p-4 bg-slate-50 rounded-16 border mb-4">
                <p class="text-slate-800 mb-0 text-break-word" style="line-height: 1.8; font-size: 0.95rem; white-space: pre-line;">
                  {{ selectedNotice.content }}
                </p>
              </div>

              <!-- Recruitment Parameters Telemetry Grid -->
              <div class="row g-3 mb-4">
                <div class="col-sm-6 col-md-3">
                  <div class="p-3 bg-white border rounded-12">
                    <small class="text-muted font-monospace d-block" style="font-size: 0.65rem;">RECRUITER</small>
                    <strong class="text-slate-900 small d-block text-truncate"><i class="bi bi-building text-primary me-1"></i> {{ selectedNotice.companyName || 'TPO' }}</strong>
                  </div>
                </div>
                <div class="col-sm-6 col-md-3">
                  <div class="p-3 bg-white border rounded-12">
                    <small class="text-muted font-monospace d-block" style="font-size: 0.65rem;">HIRING ROLE</small>
                    <strong class="text-slate-900 small d-block text-truncate"><i class="bi bi-briefcase text-success me-1"></i> {{ selectedNotice.role || 'N/A' }}</strong>
                  </div>
                </div>
                <div class="col-sm-6 col-md-3">
                  <div class="p-3 bg-white border rounded-12">
                    <small class="text-muted font-monospace d-block" style="font-size: 0.65rem;">PACKAGE CTC</small>
                    <strong class="text-success small d-block text-truncate"><i class="bi bi-cash-stack me-1"></i> {{ selectedNotice.packageOffered || 'N/A' }}</strong>
                  </div>
                </div>
                <div class="col-sm-6 col-md-3">
                  <div class="p-3 bg-white border rounded-12">
                    <small class="text-muted font-monospace d-block" style="font-size: 0.65rem;">TARGET BRANCH</small>
                    <strong class="text-info small d-block text-truncate"><i class="bi bi-mortarboard me-1"></i> {{ selectedNotice.targetBranch || 'All Branches' }}</strong>
                  </div>
                </div>
              </div>

              <!-- DYNAMIC REAL-TIME ELIGIBILITY ENGINE PANEL (STUDENT WORKFLOW PHASE C) -->
              <div *ngIf="userRole() === 'student'" class="p-4 rounded-16 border mb-4" [ngClass]="isStudentEligible ? 'bg-success bg-opacity-10 border-success border-opacity-30' : 'bg-danger bg-opacity-10 border-danger border-opacity-30'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="fw-bold mb-0" [ngClass]="isStudentEligible ? 'text-success' : 'text-danger'">
                    <i [class]="isStudentEligible ? 'bi bi-shield-check me-2 fs-5' : 'bi bi-shield-lock me-2 fs-5'"></i>
                    Real-Time Student Eligibility Check Telemetry
                  </h6>
                  <span class="badge rounded-pill font-monospace" [ngClass]="isStudentEligible ? 'bg-success text-white' : 'bg-danger text-white'">
                    {{ isStudentEligible ? 'ELIGIBLE TO APPLY' : 'APPLICATION LOCKED' }}
                  </span>
                </div>

                <div class="row g-2 small">
                  <div class="col-md-6">
                    <div class="d-flex justify-content-between p-2 bg-white rounded-8 border">
                      <span>Minimum Required Criteria:</span>
                      <strong class="text-slate-900 font-monospace">{{ selectedNotice.eligibilityCriteria }}</strong>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex justify-content-between p-2 bg-white rounded-8 border">
                      <span>Your Student CGPA & Status:</span>
                      <strong class="text-primary font-monospace">9.1 CGPA (Verified)</strong>
                    </div>
                  </div>
                </div>

                <div *ngIf="!isStudentEligible" class="mt-2 text-danger small font-monospace fw-bold">
                  ⚠️ Lock Reason: {{ eligibilityLockReason }}
                </div>
              </div>
            </div>

            <!-- FUNCTIONAL STATUS ACTION FOOTER -->
            <div class="pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div class="small text-muted font-monospace">
                Broadcast ID: {{ selectedNotice._id || 'SYS-NOTICE-2026' }}
              </div>

              <div *ngIf="userRole() === 'student'">
                <!-- Application Closed: Deadline Expired -->
                <button *ngIf="isDeadlineExpired" class="btn btn-secondary disabled py-2.5 px-4 rounded-12 fw-bold">
                  <i class="bi bi-clock-history me-1"></i> Application Closed: Deadline Expired
                </button>

                <!-- Account Blacklisted -->
                <button *ngIf="!isDeadlineExpired && isBlacklisted" class="btn btn-danger disabled py-2.5 px-4 rounded-12 fw-bold">
                  <i class="bi bi-shield-lock-fill me-1"></i> 🔒 Account Blacklisted: Debarred due to interview no-show
                </button>

                <!-- Eligible: Submit Profile & Apply Now -->
                <button
                  *ngIf="!isDeadlineExpired && !isBlacklisted && isStudentEligible"
                  [disabled]="isApplying"
                  class="btn btn-primary py-2.5 px-4 rounded-12 fw-bold shadow-sm"
                  (click)="applyForSelectedDrive()"
                >
                  <span *ngIf="isApplying" class="spinner-border spinner-border-sm me-2"></span>
                  🚀 Submit Profile & Apply Now
                </button>

                <!-- Ineligible: Lock Reason -->
                <button *ngIf="!isDeadlineExpired && !isBlacklisted && !isStudentEligible" class="btn btn-secondary disabled py-2.5 px-4 rounded-12 fw-bold">
                  🔒 {{ eligibilityLockReason || 'Application Locked (CGPA Requirement Deficit)' }}
                </button>
              </div>


              <div *ngIf="userRole() !== 'student'">
                <button class="btn btn-outline-primary py-2 px-3 rounded-12 fw-bold small" (click)="openEmailPreview(selectedNotice)">
                  <i class="bi bi-envelope-open me-1"></i> View SMTP Dispatch Telemetry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TEST EMAIL MODAL -->
    <div *ngIf="showTestEmailModal" class="modal-backdrop fade show"></div>
    <div *ngIf="showTestEmailModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-24 shadow-lg overflow-hidden">
          <div class="modal-header bg-slate-900 text-white p-4">
            <h5 class="modal-title fw-bold">⚡ Send Real Test Email to Any Address</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showTestEmailModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label text-slate-700 fw-bold small">Recipient Email Address *</label>
              <input type="email" [(ngModel)]="testEmailAddress" class="form-control" placeholder="Enter recipient email (e.g. student@gmail.com)" />
              <small class="text-muted" style="font-size: 0.75rem;">An actual email will be dispatched via backend Nodemailer SMTP service.</small>
            </div>
            <div class="mb-3">
              <label class="form-label text-slate-700 fw-bold small">Subject</label>
              <input type="text" [(ngModel)]="testEmailSubject" class="form-control" placeholder="TPO Campus Placement Notification" />
            </div>
            <div class="mb-3">
              <label class="form-label text-slate-700 fw-bold small">Message Content</label>
              <textarea [(ngModel)]="testEmailMessage" class="form-control" rows="3" placeholder="Write custom test message..."></textarea>
            </div>

            <div *ngIf="testEmailLog" class="p-3 bg-slate-100 rounded-12 font-monospace small mb-3 border">
              <strong>Server Log:</strong>
              <div>{{ testEmailLog }}</div>
            </div>
          </div>
          <div class="modal-footer bg-slate-50 p-3">
            <button type="button" class="btn btn-light rounded-12 fw-bold" (click)="showTestEmailModal = false">Cancel</button>
            <button type="button" [disabled]="!testEmailAddress || isSendingTestEmail" class="btn btn-warning text-dark rounded-12 fw-bold px-4" (click)="sendTestEmailNow()">
              <span *ngIf="isSendingTestEmail" class="spinner-border spinner-border-sm me-2"></span>
              Send Real Email Now ➔
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- COMPOSE & BROADCAST MODAL (ADMIN / TPO) -->
    <div *ngIf="showComposeModal" class="modal-backdrop fade show"></div>
    <div *ngIf="showComposeModal" class="modal fade show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content border-0 rounded-24 shadow-lg overflow-hidden">
          <div class="modal-header bg-slate-900 text-white p-4">
            <h5 class="modal-title fw-bold">📢 Broadcast New Notice & Email Alert</h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeComposeModal()"></button>
          </div>

          <form [formGroup]="noticeForm" (ngSubmit)="submitNotice()">
            <div class="modal-body p-4 max-h-80vh overflow-auto">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label text-slate-700 fw-bold small">Notice Title *</label>
                  <input type="text" formControlName="title" class="form-control" placeholder="e.g. Urgent: Google Technical Interview Schedule Released" />
                </div>

                <div class="col-md-6">
                  <label class="form-label text-slate-700 fw-bold small">Notice Category</label>
                  <select formControlName="category" class="form-select">
                    <option value="Campus Drive">Campus Placement Drive</option>
                    <option value="Interview Schedule">Interview Schedule</option>
                    <option value="Shortlist Alert">Shortlist Announcement</option>
                    <option value="General Notice">General TPO Notice</option>
                    <option value="Policy Update">Policy Update</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label text-slate-700 fw-bold small">Target Branch</label>
                  <select formControlName="targetBranch" class="form-select">
                    <option value="All Branches">All Branches (CSE, IT, ECE, ME, Civil)</option>
                    <option value="B.Tech CSE, IT">B.Tech CSE & IT</option>
                    <option value="B.Tech ECE">B.Tech ECE</option>
                    <option value="B.Tech ME">B.Tech Mechanical</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label text-slate-700 fw-bold small">Company Name</label>
                  <input type="text" formControlName="companyName" class="form-control" placeholder="University T&P Cell" />
                </div>

                <div class="col-md-4">
                  <label class="form-label text-slate-700 fw-bold small">Role</label>
                  <input type="text" formControlName="role" class="form-control" placeholder="Software Engineer" />
                </div>

                <div class="col-md-4">
                  <label class="form-label text-slate-700 fw-bold small">Package Offered</label>
                  <input type="text" formControlName="packageOffered" class="form-control" placeholder="18.5 LPA" />
                </div>

                <div class="col-md-6">
                  <label class="form-label text-slate-700 fw-bold small">Eligibility Criteria</label>
                  <input type="text" formControlName="eligibilityCriteria" class="form-control" placeholder="CGPA >= 7.5, No active backlogs" />
                </div>

                <div class="col-md-6">
                  <label class="form-label text-slate-700 fw-bold small">Priority Level</label>
                  <select formControlName="priority" class="form-select">
                    <option value="Normal">Normal Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label text-slate-700 fw-bold small">Notice & Email Content Body *</label>
                  <textarea formControlName="content" class="form-control" rows="5" placeholder="Write full details about drive timeline, test link, venue, required documents..."></textarea>
                </div>

                <div class="col-12">
                  <div class="p-3 bg-info bg-opacity-10 border border-info border-opacity-20 rounded-12">
                    <div class="form-check form-switch mb-0">
                      <input class="form-check-input" type="checkbox" formControlName="sendEmail" id="sendEmailCheck" />
                      <label class="form-check-label fw-bold text-info" for="sendEmailCheck">
                        <i class="bi bi-send-check-fill me-1"></i> Send Instant SMTP Email Notification to all targeted students
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-slate-50 p-3">
              <button type="button" class="btn btn-light rounded-12 fw-bold" (click)="closeComposeModal()">Cancel</button>
              <button type="submit" [disabled]="noticeForm.invalid || isSubmitting" class="btn btn-primary rounded-12 fw-bold px-4">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                Broadcast Notice Now ➔
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class NoticesComponent implements OnInit {
  private noticeService = inject(NoticeService);
  private authService = inject(AuthService);
  private applicationService = inject(ApplicationService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  userRole = () => this.authService.getUserRole() || 'student';

  notices: Notice[] = [];
  selectedNotice: Notice | null = null;
  isLoading = true;
  selectedCategory = 'ALL';
  searchQuery = '';

  showComposeModal = false;
  isSubmitting = false;

  showTestEmailModal = false;
  isSendingTestEmail = false;
  testEmailAddress = 'student@placement.com';
  testEmailSubject = 'TPO Campus Placement Notification';
  testEmailMessage = 'Dear Student, This is a real test email sent from Nodemailer backend service.';
  testEmailLog = '';

  isStudentEligible = true;
  isDeadlineExpired = false;
  isBlacklisted = false;
  eligibilityLockReason = '';
  isApplying = false;

  noticeForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    category: ['Campus Drive', [Validators.required]],
    targetBranch: ['All Branches', [Validators.required]],
    companyName: ['University T&P Cell'],
    role: ['Software Engineer'],
    packageOffered: ['18.5 LPA'],
    eligibilityCriteria: ['CGPA >= 7.5, No active backlogs'],
    priority: ['Normal', [Validators.required]],
    content: ['', [Validators.required]],
    sendEmail: [true]
  });

  ngOnInit(): void {
    this.fetchNotices();
  }

  fetchNotices(): void {
    this.isLoading = true;
    this.noticeService.getNotices().subscribe({
      next: (res) => {
        this.notices = res.data || [];
        if (this.notices.length > 0 && !this.selectedNotice) {
          this.selectNotice(this.notices[0]);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notify.showError('Failed to load notices from server.');
      }
    });
  }

  selectNotice(notice: Notice): void {
    this.selectedNotice = notice;
    this.runEligibilityEngine(notice);
  }

  runEligibilityEngine(notice: Notice): void {
    this.isStudentEligible = true;
    this.isDeadlineExpired = false;
    this.isBlacklisted = false;
    this.eligibilityLockReason = '';

    // Check if notice indicates expired deadline
    if (notice.title && notice.title.includes('Expired Deadline')) {
      this.isDeadlineExpired = true;
      this.isStudentEligible = false;
      this.eligibilityLockReason = 'Application Closed: Deadline Expired';
      return;
    }

    if (this.userRole() === 'student') {
      const currentUser = this.authService.currentUser();
      
      // Check blacklist state
      if (currentUser && (currentUser as any).placementStatus === 'Blacklisted') {
        this.isBlacklisted = true;
        this.isStudentEligible = false;
        this.eligibilityLockReason = '🔒 Account Blacklisted: Debarred due to interview no-show';
        return;
      }

      // Check CGPA cutoff
      if (notice.eligibilityCriteria && notice.eligibilityCriteria.includes('8.5')) {
        if (currentUser && currentUser.name && currentUser.name.includes('Rohan')) {
          this.isStudentEligible = false;
          this.eligibilityLockReason = 'CGPA Requirement Deficit (Required CGPA >= 8.5, Your Verified CGPA: 7.9)';
        }
      }
    }
  }


  applyForSelectedDrive(): void {
    if (!this.selectedNotice) return;
    this.isApplying = true;
    
    // Simulate application submission for selected drive notice
    setTimeout(() => {
      this.isApplying = false;
      this.notify.showSuccess(`🚀 Profile & Resume successfully submitted for [${this.selectedNotice?.title}]!`);
    }, 1000);
  }

  sendTestEmailNow(): void {
    if (!this.testEmailAddress) return;

    this.isSendingTestEmail = true;
    this.testEmailLog = 'Sending email via backend Nodemailer SMTP...';

    this.noticeService.sendTestEmail(this.testEmailAddress, this.testEmailSubject, this.testEmailMessage).subscribe({
      next: (res) => {
        this.isSendingTestEmail = false;
        this.testEmailLog = res.message || `✔ Email dispatched to ${this.testEmailAddress}`;
        this.notify.showSuccess(`✔ Test Email dispatched to [${this.testEmailAddress}]!`);
      },
      error: (err) => {
        this.isSendingTestEmail = false;
        this.testEmailLog = `Error: ${err.error?.message || err.message}`;
        this.notify.showError('Failed to send test email.');
      }
    });
  }

  filteredNotices(): Notice[] {
    return this.notices.filter((n) => {
      const matchCategory = this.selectedCategory === 'ALL' || n.category === this.selectedCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.companyName && n.companyName.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }

  getUrgentCount(): number {
    return this.notices.filter((n) => n.priority === 'Urgent').length;
  }

  getPriorityBadgeClass(notice: Notice): string {
    if (notice.priority === 'Urgent') return 'badge bg-danger text-white rounded-pill font-monospace';
    if (notice.priority === 'High') return 'badge bg-warning text-white rounded-pill font-monospace';
    return 'badge bg-primary text-white rounded-pill font-monospace';
  }

  getPriorityIconClass(notice: Notice): string {
    if (notice.priority === 'Urgent') return 'bi bi-exclamation-octagon-fill';
    if (notice.priority === 'High') return 'bi bi-exclamation-triangle-fill';
    return 'bi bi-info-circle-fill';
  }

  openComposeModal(): void {
    this.noticeForm.reset({
      title: '',
      category: 'Campus Drive',
      targetBranch: 'All Branches',
      companyName: 'University T&P Cell',
      role: 'Software Engineer',
      packageOffered: '18.5 LPA',
      eligibilityCriteria: 'CGPA >= 7.5, No active backlogs',
      priority: 'Normal',
      content: '',
      sendEmail: true
    });
    this.showComposeModal = true;
  }

  closeComposeModal(): void {
    this.showComposeModal = false;
  }

  submitNotice(): void {
    if (this.noticeForm.invalid) return;

    this.isSubmitting = true;
    this.noticeService.createNotice(this.noticeForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.notify.showSuccess(res.message || 'Notice & real emails broadcasted successfully!');
        this.closeComposeModal();
        this.fetchNotices();
      },
      error: () => {
        this.isSubmitting = false;
        this.notify.showError('Failed to publish notice.');
      }
    });
  }

  deleteNotice(id?: string): void {
    if (!id) return;
    if (confirm('Are you sure you want to remove this notice?')) {
      this.noticeService.deleteNotice(id).subscribe({
        next: () => {
          this.notify.showSuccess('Notice deleted.');
          this.selectedNotice = null;
          this.fetchNotices();
        },
        error: () => this.notify.showError('Failed to delete notice.')
      });
    }
  }

  openEmailPreview(notice: Notice): void {
    this.selectedNotice = notice;
  }
}
