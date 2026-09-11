import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexStroke,
  ApexFill,
  ApexTooltip
} from 'ng-apexcharts';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { OfferService } from '../../core/services/offer.service';
import { NoticeService } from '../../core/services/notice.service';
import { InvitationService } from '../../core/services/invitation.service';
import { NotificationService } from '../../core/services/notification.service';
import { ReportService, AnalyticsData } from '../../core/services/report.service';
import { ActivityService, ActivityItem } from '../../core/services/activity.service';
import { InterviewService, InterviewSchedule } from '../../core/services/interview.service';
import { Student } from '../../core/models/student.model';
import { Job } from '../../core/models/job.model';
import { Application } from '../../core/models/application.model';
import { Offer } from '../../core/models/offer.model';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  colors: string[];
  legend: ApexLegend;
};

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  colors: string[];
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, NgApexchartsModule],
  template: `
    <div class="pb-5">
      <!-- ==========================================================================
           1. TPO / ADMIN DASHBOARD INTERFACE (COMMAND CENTER & MISSION CONTROL)
           ========================================================================== -->
      <ng-container *ngIf="userRole() === 'admin'">
        <!-- TPO COMMAND CENTER HERO BANNER -->
        <div class="tpo-hero-banner p-4 p-md-5 mb-4 position-relative overflow-hidden shadow-lg rounded-24 border border-slate-800">
          <div class="row align-items-center g-4">
            <div class="col-lg-8">
              <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span class="badge bg-primary text-white rounded-pill px-3 py-1 font-monospace" style="font-size: 0.75rem;">
                  <i class="bi bi-shield-check me-1"></i> TPO COMMAND CENTER (ADMIN)
                </span>
                <span class="badge bg-warning text-dark rounded-pill px-3 py-1 font-monospace" style="font-size: 0.75rem;">
                  <i class="bi bi-clock-history me-1"></i> {{ pendingVerifications.length }} VERIFICATIONS QUEUED
                </span>
                <span class="badge bg-info text-white rounded-pill px-3 py-1 font-monospace" style="font-size: 0.75rem;">
                  <i class="bi bi-briefcase me-1"></i> {{ pendingDriveApprovals.length }} JNFS PENDING APPROVAL
                </span>
              </div>

              <h2 class="fw-extrabold text-white mb-1">University Placement Operations & Telemetry</h2>
              <p class="text-slate-300 small mb-4">
                Real-World 6-Phase Campus Placement Gatekeeping & Verification Vault • Today is <strong>{{ today | date:'fullDate' }}</strong>
              </p>

              <!-- Quick Operational Actions -->
              <div class="d-flex flex-wrap gap-2">
                <button
                  class="btn btn-warning btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm d-flex align-items-center gap-1"
                  data-bs-toggle="modal"
                  data-bs-target="#inviteRecruiterModal"
                >
                  <i class="bi bi-envelope-at-fill"></i> Invite Corporate HR
                </button>

                <a
                  routerLink="/notices"
                  class="btn btn-success btn-sm rounded-pill px-3 fw-bold text-white shadow-sm d-flex align-items-center gap-1"
                >
                  <i class="bi bi-megaphone-fill"></i> Broadcast Placement Notice
                </a>

                <button
                  class="btn btn-info btn-sm rounded-pill px-3 fw-bold text-white shadow-sm d-flex align-items-center gap-1"
                  (click)="onInjectDemoData()"
                  [disabled]="isInjectingDemo"
                >
                  <span *ngIf="isInjectingDemo" class="spinner-border spinner-border-sm"></span>
                  <i *ngIf="!isInjectingDemo" class="bi bi-database-fill-gear"></i> Inject 20+ Demo Records
                </button>

                <button
                  class="btn btn-secondary btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm d-flex align-items-center gap-1"
                  (click)="exportAllLedgerExcel()"
                >
                  <i class="bi bi-file-earmark-spreadsheet-fill text-success"></i> Export Excel Ledger (.XLSX)
                </button>
              </div>
            </div>

            <div class="col-lg-4 text-lg-end d-none d-lg-block">
              <div class="p-3.5 rounded-20 bg-white bg-opacity-10 border border-white border-opacity-10 backdrop-blur d-inline-block text-center" style="min-width: 230px;">
                <div class="text-warning small text-uppercase font-monospace fw-bold mb-1">PLACED TARGET METRIC</div>
                <h1 class="fw-extrabold text-white mb-0">{{ analytics?.placementRate || 0 }}%</h1>
                <small class="text-slate-300 font-monospace">{{ analytics?.placedStudents || 0 }} Placed / {{ analytics?.totalStudents || 0 }} Total</small>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI HIGHLIGHT CARDS (BOUND TO LIVE MONGO AGGREGATIONS) -->
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-success bg-opacity-10 text-success"><i class="bi bi-graph-up-arrow"></i></div>
              <div class="stat-content">
                <div class="stat-label">PLACEMENT PERCENTAGE</div>
                <div class="stat-value text-success">{{ analytics?.placementRate || 0 }}%</div>
                <small class="text-muted font-monospace">{{ analytics?.placedStudents || 0 }} of {{ analytics?.totalStudents || 0 }} students</small>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-primary bg-opacity-10 text-primary"><i class="bi bi-award-fill"></i></div>
              <div class="stat-content">
                <div class="stat-label">TOTAL OFFERS EXTENDED</div>
                <div class="stat-value text-primary">{{ analytics?.totalOffers || analytics?.placedStudents || 0 }} Offers</div>
                <small class="text-muted font-monospace">Avg CTC: {{ analytics?.avgPackage || 0 }} LPA</small>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-info bg-opacity-10 text-info"><i class="bi bi-building-check"></i></div>
              <div class="stat-content">
                <div class="stat-label">ACTIVE CORPORATE DRIVES</div>
                <div class="stat-value text-info">{{ analytics?.totalJobs || recruiterJobs.length || 0 }} Drives</div>
                <small class="text-muted font-monospace">Highest CTC: {{ analytics?.highestPackage || 0 }} LPA</small>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-warning bg-opacity-10 text-warning"><i class="bi bi-person-lines-fill"></i></div>
              <div class="stat-content">
                <div class="stat-label">UNPLACED ELIGIBLE</div>
                <div class="stat-value text-warning">{{ getUnplacedStudentsCount() }} Students</div>
                <small class="text-muted font-monospace">Dream Offers: {{ analytics?.dreamOffersCount || 0 }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- PHASE 1: STUDENT DATA GATEKEEPING VAULT & ADMIN VERIFICATION -->
        <div class="enterprise-card p-4 bg-white mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2 flex-wrap gap-2">
            <div>
              <h5 class="fw-bold text-slate-900 mb-0">
                <i class="bi bi-shield-lock-fill text-primary me-2"></i>Phase 1: Student Data Gatekeeping Vault & Profile Freeze Verification
              </h5>
              <small class="text-muted">Verify student academic records (10th%, 12th%, CGPA, backlogs) and freeze profile (isFrozen: true) to prevent self-reporting fraud.</small>
            </div>
            <a routerLink="/students" class="btn btn-sm btn-outline-primary rounded-pill">Full Directory ➔</a>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 small">
              <thead class="bg-light">
                <tr class="text-muted border-bottom">
                  <th>Student ID & Name</th>
                  <th>Branch & Year</th>
                  <th>Academic Credentials</th>
                  <th>Backlogs</th>
                  <th>Resume PDF</th>
                  <th>Freeze Status</th>
                  <th class="text-end">Verification Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of allStudentsList.slice(0, 6)">
                  <td>
                    <div class="fw-bold text-slate-900">{{ s.fullName }}</div>
                    <small class="text-muted font-monospace">{{ s.studentId }} • {{ s.email }}</small>
                  </td>
                  <td>
                    <div class="text-slate-800 fw-semibold">{{ s.branch || 'B.Tech CSE' }}</div>
                    <small class="text-muted">{{ s.year || '4th Year' }}</small>
                  </td>
                  <td>
                    <div><span class="badge bg-primary text-white font-monospace">CGPA: {{ s.cgpa }}</span></div>
                    <small class="text-muted">10th: {{ s.tenthPercentage || 90 }}% • 12th: {{ s.twelfthPercentage || 88 }}%</small>
                  </td>
                  <td>
                    <span [class]="(s.backlogs || 0) === 0 ? 'badge bg-success bg-opacity-10 text-success border font-monospace' : 'badge bg-danger bg-opacity-10 text-danger border font-monospace'">
                      {{ s.backlogs || 0 }} Active Backlogs
                    </span>
                  </td>
                  <td>
                    <a [href]="s.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'" target="_blank" class="btn btn-sm btn-outline-danger rounded-pill px-2 py-0 extra-small">
                      PDF ↗
                    </a>
                  </td>
                  <td>
                    <span *ngIf="s.isFrozen" class="badge bg-success text-white rounded-pill px-3 py-1 font-monospace">
                      <i class="bi bi-lock-fill me-1"></i> FROZEN & VERIFIED
                    </span>
                    <span *ngIf="!s.isFrozen" class="badge bg-warning text-dark rounded-pill px-3 py-1 font-monospace">
                      {{ s.verificationStatus || 'UNVERIFIED' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button
                      *ngIf="!s.isFrozen"
                      class="btn btn-sm btn-success rounded-pill px-3 font-monospace fw-bold extra-small"
                      (click)="verifyAndFreezeStudent(s._id!)"
                    >
                      <i class="bi bi-shield-check me-1"></i> Verify & Freeze Profile
                    </button>
                    <span *ngIf="s.isFrozen" class="text-success small fw-bold font-monospace">
                      <i class="bi bi-check-circle-fill me-1"></i> Vault Locked
                    </span>
                  </td>
                </tr>
                <tr *ngIf="allStudentsList.length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    No student records found in database. Click "Inject 20+ Demo Records" to seed live records.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PHASE 5: MISSION CONTROL ANALYTICS CHARTS (APEXCHARTS) -->
        <div class="row g-4 mb-4">
          <div class="col-lg-6">
            <div class="enterprise-card p-4 bg-white h-100">
              <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
                <i class="bi bi-pie-chart-fill text-primary me-2"></i>Placed vs Unplaced Telemetry Ratio
              </h5>
              <div class="d-flex justify-content-center py-2" *ngIf="pieChartOptions">
                <apx-chart
                  [series]="pieChartOptions.series"
                  [chart]="pieChartOptions.chart"
                  [labels]="pieChartOptions.labels"
                  [colors]="pieChartOptions.colors"
                  [legend]="pieChartOptions.legend"
                  [responsive]="pieChartOptions.responsive"
                ></apx-chart>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="enterprise-card p-4 bg-white h-100">
              <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
                <i class="bi bi-bar-chart-fill text-info me-2"></i>Average Salary Package (LPA) by Branch
              </h5>
              <div class="d-flex justify-content-center py-2" *ngIf="barChartOptions">
                <apx-chart
                  [series]="barChartOptions.series"
                  [chart]="barChartOptions.chart"
                  [xaxis]="barChartOptions.xaxis"
                  [plotOptions]="barChartOptions.plotOptions"
                  [colors]="barChartOptions.colors"
                  [dataLabels]="barChartOptions.dataLabels"
                ></apx-chart>
              </div>
            </div>
          </div>
        </div>

        <!-- LIVE REAL-TIME ACTIVITY TIMELINE FEED -->
        <div class="enterprise-card p-4 bg-white mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h5 class="fw-bold text-slate-900 mb-0">
              <i class="bi bi-activity text-primary me-2"></i>Live Placement Operations Feed & Audit Stream
            </h5>
            <input type="text" [(ngModel)]="activitySearch" class="form-control form-control-sm rounded-pill" style="max-width: 260px;" placeholder="Filter activities..." />
          </div>

          <div class="list-group list-group-flush extra-small font-monospace" style="max-height: 280px; overflow-y: auto;">
            <div *ngFor="let act of filteredActivities()" class="list-group-item px-0 py-2 border-bottom">
              <div class="d-flex justify-content-between align-items-start">
                <span class="fw-bold text-slate-900">
                  <i class="bi bi-check-circle-fill text-success me-1"></i> [{{ act.createdAt | date:'shortTime' }}] {{ act.title }}
                </span>
                <span class="badge bg-slate-100 text-slate-700 border">{{ act.type }}</span>
              </div>
              <small class="text-muted d-block mt-0.5">{{ act.description }} • Actor: <strong>{{ act.actor }}</strong> ({{ act.actorRole }}) • Branch: {{ act.targetBranch || 'All Branches' }}</small>
            </div>

            <div *ngIf="filteredActivities().length === 0" class="text-center py-3 text-muted">
              No recent activity recorded yet.
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ==========================================================================
           2. CORPORATE RECRUITER PORTAL INTERFACE (JNF & 7-STAGE ATS)
           ========================================================================== -->
      <ng-container *ngIf="userRole() === 'company'">
        <!-- RECRUITER HERO BANNER -->
        <div class="tpo-hero-banner p-4 p-md-5 mb-4 position-relative overflow-hidden shadow-lg rounded-24">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span class="badge bg-info text-white rounded-pill px-3 py-1 font-monospace mb-2" style="font-size: 0.75rem;">
                <i class="bi bi-building me-1"></i> CORPORATE RECRUITER PORTAL
              </span>
              <h2 class="fw-bold text-white mb-1">Corporate Hiring & ATS Candidate Pipeline 👋</h2>
              <p class="text-slate-300 small mb-0">File Job Notification Forms (JNF), manage 7-stage candidate progression, schedule interview panels & export candidate ledgers.</p>
            </div>

            <button
              class="btn btn-warning rounded-pill px-4 fw-bold text-dark shadow-sm d-flex align-items-center gap-2"
              data-bs-toggle="modal"
              data-bs-target="#recruiterJnfModal"
            >
              <i class="bi bi-file-earmark-plus-fill"></i> Post Job Notification Form (JNF)
            </button>
          </div>
        </div>

        <!-- 4 RECRUITER STAT CARDS -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-primary bg-opacity-10 text-primary"><i class="bi bi-briefcase-fill"></i></div>
              <div class="stat-content">
                <div class="stat-label">JNFS POSTED</div>
                <div class="stat-value">{{ recruiterJobs.length }}</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-info bg-opacity-10 text-info"><i class="bi bi-people-fill"></i></div>
              <div class="stat-content">
                <div class="stat-label">TOTAL APPLICANTS</div>
                <div class="stat-value">{{ applications.length }}</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-warning bg-opacity-10 text-warning"><i class="bi bi-check2-circle"></i></div>
              <div class="stat-content">
                <div class="stat-label">SHORTLISTED</div>
                <div class="stat-value">{{ getShortlistedCount() }}</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-success bg-opacity-10 text-success"><i class="bi bi-trophy-fill"></i></div>
              <div class="stat-content">
                <div class="stat-label">OFFERS RELEASED</div>
                <div class="stat-value">{{ getSelectedCount() }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- PHASE 4: 7-STAGE ATS TRACKER PIPELINE MATRIX -->
        <div class="enterprise-card p-4 bg-white mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2 flex-wrap gap-2">
            <div>
              <h5 class="fw-bold text-slate-900 mb-0">
                <i class="bi bi-diagram-3-fill text-primary me-2"></i>Phase 4: 7-Stage Candidate ATS Pipeline & Automated Status Mails
              </h5>
              <small class="text-muted">Sequential 7 Stages: 1. Applied ➔ 2. Resume Shortlisted ➔ 3. Assessment Cleared ➔ 4. GD Cleared ➔ 5. Technical Interview ➔ 6. HR Panel ➔ 7. Offer Released.</small>
            </div>
            <button class="btn btn-sm btn-success rounded-pill px-3 fw-bold" (click)="exportAllLedgerExcel()">
              <i class="bi bi-download me-1"></i> Export Excel Ledger (.XLSX)
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 small">
              <thead class="bg-light">
                <tr class="text-muted border-bottom">
                  <th>Candidate Name</th>
                  <th>Branch & CGPA</th>
                  <th>Resume</th>
                  <th>Current ATS Stage</th>
                  <th>Advance Stage</th>
                  <th class="text-end">Blacklist / Debar</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let app of applications">
                  <td>
                    <div class="fw-bold text-slate-900">{{ app.studentName }}</div>
                    <small class="text-muted">{{ app.studentEmail }}</small>
                  </td>
                  <td>
                    <div class="text-slate-800 fw-semibold">{{ app.branch || 'B.Tech CSE' }}</div>
                    <small class="text-info fw-bold">CGPA: {{ app.cgpa || 8.5 }}</small>
                  </td>
                  <td>
                    <a [href]="app.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'" target="_blank" class="btn btn-sm btn-outline-danger rounded-pill px-2 py-0 extra-small">
                      PDF ↗
                    </a>
                  </td>
                  <td>
                    <span class="badge bg-primary text-white rounded-pill px-3 py-1 font-monospace extra-small">
                      {{ app.status }}
                    </span>
                  </td>
                  <td>
                    <div class="dropdown d-inline-block">
                      <button class="btn btn-sm btn-primary rounded-pill px-3 py-0.5 extra-small dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown">
                        Advance Stage ➔
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 extra-small">
                        <li><a class="dropdown-item" (click)="advanceAtsStage(app._id!, 'Resume Shortlisted')">2. Resume Shortlisted</a></li>
                        <li><a class="dropdown-item" (click)="advanceAtsStage(app._id!, 'Aptitude Test Cleared')">3. Assessment Cleared</a></li>
                        <li><a class="dropdown-item" (click)="advanceAtsStage(app._id!, 'Group Discussion Cleared')">4. GD Cleared</a></li>
                        <li><a class="dropdown-item" (click)="advanceAtsStage(app._id!, 'Technical Interview Cleared')">5. Tech Interview Cleared</a></li>
                        <li><a class="dropdown-item" (click)="advanceAtsStage(app._id!, 'HR Interview Cleared')">6. HR Panel Cleared</a></li>
                        <li><a class="dropdown-item text-success fw-bold" (click)="advanceAtsStage(app._id!, 'Selected')">7. Release Official Offer LOI</a></li>
                      </ul>
                    </div>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-2 py-0.5 extra-small fw-bold" (click)="advanceAtsStage(app._id!, 'Rejected')">
                      <i class="bi bi-slash-circle me-1"></i> Reject / Debar
                    </button>
                  </td>
                </tr>

                <tr *ngIf="applications.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    No candidate applications submitted yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PHASE 5: INTERVIEW SCHEDULE MAPPER TOOL -->
        <div class="enterprise-card p-4 bg-white mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h5 class="fw-bold text-slate-900 mb-0">
              <i class="bi bi-calendar-event-fill text-primary me-2"></i>Phase 5: Interview Schedule Mapper & Panel Evaluators
            </h5>
            <button class="btn btn-sm btn-primary rounded-pill px-3 fw-bold" data-bs-toggle="modal" data-bs-target="#scheduleInterviewModal">
              <i class="bi bi-plus-circle me-1"></i> Schedule Interview
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 small">
              <thead class="bg-light">
                <tr class="text-muted border-bottom">
                  <th>Round</th>
                  <th>Candidate Student</th>
                  <th>Drive Role</th>
                  <th>Date & Time</th>
                  <th>Meeting Link / Details</th>
                  <th class="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let slot of liveInterviews">
                  <td><span class="badge bg-slate-900 text-white font-monospace">Round {{ slot.roundNumber }}: {{ slot.roundName }}</span></td>
                  <td><div class="fw-bold text-slate-900">{{ slot.student?.fullName || 'Candidate' }}</div><small class="text-muted">{{ slot.student?.email }}</small></td>
                  <td><span class="badge bg-slate-100 text-slate-800 border font-monospace">{{ slot.job?.title || 'Engineering Role' }}</span></td>
                  <td><div class="fw-bold text-primary font-monospace"><i class="bi bi-clock me-1"></i>{{ slot.interviewDate | date:'medium' }}</div></td>
                  <td>
                    <div class="extra-small text-slate-700">
                      <a *ngIf="slot.meetingLink" [href]="slot.meetingLink" target="_blank" class="text-primary fw-semibold"><i class="bi bi-camera-video-fill me-1"></i> Join Meeting</a>
                      <div class="text-muted" *ngIf="slot.interviewerName">Interviewer: {{ slot.interviewerName }}</div>
                    </div>
                  </td>
                  <td class="text-end">
                    <span class="badge bg-success text-white rounded-pill px-3 py-1 font-monospace">{{ slot.status }}</span>
                  </td>
                </tr>
                <tr *ngIf="liveInterviews.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    No interviews scheduled yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- ==========================================================================
           3. STUDENT PORTAL INTERFACE (WORKSPACE & RECEIVE-ONLY MAILBOX)
           ========================================================================== -->
      <ng-container *ngIf="userRole() === 'student'">
        <!-- STUDENT HERO BANNER -->
        <div class="tpo-hero-banner p-4 p-md-5 mb-4 position-relative overflow-hidden shadow-lg rounded-24">
          <div class="row align-items-center g-4">
            <div class="col-lg-8">
              <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span class="badge bg-primary text-white rounded-pill px-3 py-1 font-monospace" style="font-size: 0.75rem;">
                  <i class="bi bi-mortarboard-fill me-1"></i> STUDENT PLACEMENT WORKSPACE
                </span>
                <span *ngIf="studentProfile?.isFrozen" class="badge bg-success text-white rounded-pill px-3 py-1 font-monospace" style="font-size: 0.75rem;">
                  <i class="bi bi-shield-check me-1"></i> PROFILE FROZEN & VERIFIED
                </span>
                <span *ngIf="studentProfile?.placementStatus === 'Placed'" class="badge bg-warning text-dark rounded-pill px-3 py-1 font-monospace" style="font-size: 0.75rem;">
                  <i class="bi bi-lock-fill me-1"></i> PLACED STATUS ENFORCED
                </span>
              </div>

              <h2 class="fw-extrabold text-white mb-1">Welcome back, {{ user()?.name }} 👋</h2>
              <p class="text-slate-300 small mb-3">
                Review your incoming campus drive feed, check JNF eligibility, track ATS progress, and accept official LOI offer letters.
              </p>

              <!-- PHASE 6: DREAM OFFER UNLOCKED BADGE (IF APPLICABLE) -->
              <div *ngIf="isDreamOfferUnlocked" class="d-inline-block mb-3">
                <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold shadow-lg">
                  <i class="bi bi-stars fs-5 me-1"></i> ✨ DREAM OFFER UNLOCKED (Package > 2x Accepted CTC)
                </span>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <a routerLink="/notices" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                  <i class="bi bi-envelope-paper-fill me-1"></i> Notices & Drive Alerts
                </a>
                <a routerLink="/profile" class="btn btn-light rounded-pill px-4 fw-semibold text-dark shadow-sm">
                  <i class="bi bi-person-gear me-1"></i> View Academic Profile
                </a>
              </div>
            </div>

            <div class="col-lg-4 text-lg-end d-none d-lg-block">
              <div class="p-3.5 rounded-20 bg-white bg-opacity-10 border border-white border-opacity-10 backdrop-blur d-inline-block text-center" style="min-width: 230px;">
                <div class="text-warning small text-uppercase font-monospace fw-bold mb-1">ACADEMIC CGPA</div>
                <h1 class="fw-extrabold text-white mb-0">{{ studentProfile?.cgpa || 8.5 }}</h1>
                <small class="text-slate-300 font-monospace">{{ studentProfile?.backlogs || 0 }} Active Backlogs • {{ studentProfile?.verificationStatus || 'Draft' }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- PHASE 6: FINAL LOI OFFER ACCEPTANCE HUB & 2X DREAM UPGRADE FREEZE -->
        <div *ngIf="studentOffers.length > 0" class="mb-4">
          <div *ngFor="let offer of studentOffers" class="enterprise-card p-4 bg-white border-start border-5 border-success shadow-lg mb-3">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <span class="badge bg-success text-white rounded-pill px-3 py-1 font-monospace mb-2">
                  🎓 PHASE 6: OFFICIAL LETTER OF INTENT (LOI) ISSUED
                </span>
                <h3 class="fw-extrabold text-slate-900 mb-1">Congratulations! Offer Released from {{ offer.companyName }}</h3>
                <p class="text-slate-600 mb-0">Role: <strong>{{ offer.role }}</strong> • CTC Package: <strong class="text-success font-monospace fs-5">{{ offer.packageOffered }} LPA</strong></p>
              </div>
              <span [class]="getOfferStatusBadge(offer.status)">
                Offer Status: {{ offer.status }}
              </span>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-12 p-3 mb-3 small font-monospace text-slate-800">
              <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">{{ offer.loiText }}</pre>
            </div>

            <div *ngIf="offer.status === 'Pending'" class="d-flex gap-3">
              <button class="btn btn-success rounded-pill px-4 py-2 fw-bold shadow-sm" (click)="acceptLoiOffer(offer)">
                <i class="bi bi-check-circle-fill me-2"></i> Accept Offer (Enforce University Campus Freeze)
              </button>
              <button class="btn btn-outline-danger rounded-pill px-4 py-2 fw-semibold" (click)="respondToOffer(offer._id!, 'Decline')">
                <i class="bi bi-x-circle me-2"></i> Decline Offer
              </button>
            </div>

            <div *ngIf="offer.status === 'Accepted'" class="alert alert-success bg-success bg-opacity-10 text-success border border-success border-opacity-30 p-3 mb-0 rounded-12 fw-bold">
              <i class="bi bi-lock-fill me-2"></i> Offer Accepted! You are officially PLACED at {{ offer.companyName }} ({{ offer.packageOffered }} LPA). Campus Freeze Policy is active. Only Dream JNFs with package &gt; {{ (offer.packageOffered || 12) * 2 }} LPA will unlock.
            </div>
          </div>
        </div>

        <!-- PHASE 3: LIVE ACTIVE PLACEMENT DRIVES -->
        <div class="enterprise-card p-4 bg-white mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h5 class="fw-bold text-slate-900 mb-0">
              <i class="bi bi-briefcase-fill text-primary me-2"></i>Phase 3: Active Campus Placement Drives (JNFs)
            </h5>
            <a routerLink="/jobs" class="btn btn-sm btn-outline-primary rounded-pill">View All Drives ➔</a>
          </div>

          <div class="row g-3">
            <div *ngFor="let j of studentJobsFeed.slice(0, 4)" class="col-md-6">
              <div class="p-4 bg-slate-50 rounded-20 border border-slate-200 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 class="fw-bold text-slate-900 mb-0">{{ j.title }}</h5>
                      <span class="text-primary fw-semibold small">{{ j.companyName }}</span>
                    </div>
                    <span class="badge bg-success text-white font-monospace fs-6">{{ j.salaryPackage }} LPA</span>
                  </div>

                  <p class="text-slate-600 small mb-3 text-break-word">{{ j.description | slice:0:110 }}...</p>

                  <div class="extra-small font-monospace text-slate-600 mb-3 bg-white p-2.5 rounded-12 border">
                    <div><i class="bi bi-geo-alt text-danger me-1"></i> Location: {{ j.location }}</div>
                    <div><i class="bi bi-mortarboard text-info me-1"></i> Min CGPA Required: <strong>{{ j.minCgpa }}</strong></div>
                    <div><i class="bi bi-clock-history text-warning me-1"></i> Deadline: <strong>{{ j.deadline | date:'medium' }}</strong></div>
                  </div>
                </div>

                <!-- DYNAMIC ELIGIBILITY MATCHER BADGE & ACTION BUTTON -->
                <div class="pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div *ngIf="studentProfile?.placementStatus === 'Blacklisted'" class="alert alert-danger p-2 mb-0 extra-small fw-bold font-monospace w-100">
                    <i class="bi bi-shield-lock-fill me-1"></i> 🔒 Account Blacklisted: Debarred due to interview no-show
                  </div>

                  <ng-container *ngIf="studentProfile?.placementStatus !== 'Blacklisted'">
                    <div *ngIf="checkJnfEligibility(j) === 'ELIGIBLE'">
                      <span class="badge bg-success text-white rounded-pill px-3 py-1 font-monospace">
                        <i class="bi bi-check-circle-fill me-1"></i> Eligible to Apply
                      </span>
                    </div>

                    <button
                      *ngIf="checkJnfEligibility(j) === 'ELIGIBLE'"
                      class="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm"
                      (click)="applyDriveDirectly(j._id!)"
                    >
                      🚀 Apply Now ➔
                    </button>

                    <div *ngIf="checkJnfEligibility(j) === 'INELIGIBLE'" class="w-100">
                      <div class="alert alert-danger p-2 mb-0 extra-small font-monospace fw-bold rounded-12">
                        🔒 Application Locked (Criteria Deficit: Required &gt;= {{ j.minCgpa }}, Your CGPA: {{ studentProfile?.cgpa || 7.9 }})
                      </div>
                    </div>

                    <div *ngIf="checkJnfEligibility(j) === 'EXPIRED'" class="w-100">
                      <div class="alert alert-secondary p-2 mb-0 extra-small font-monospace fw-bold rounded-12">
                        ⌛ Application Closed: Deadline Expired
                      </div>
                    </div>

                    <div *ngIf="checkJnfEligibility(j) === 'DEBARRED_PLACED'" class="w-100">
                      <div class="alert alert-warning p-2 mb-0 extra-small font-monospace fw-bold rounded-12 text-dark">
                        🔒 Campus Freeze Active: Already Placed (Package {{ j.salaryPackage }} LPA &lt;= Accepted CTC). Dream Offer Unlocks at &gt; {{ (acceptedCtc || 12) * 2 }} LPA.
                      </div>
                    </div>
                  </ng-container>
                </div>
              </div>
            </div>
            <div *ngIf="studentJobsFeed.length === 0" class="col-12 text-center py-4 text-muted">
              No active placement drives available right now.
            </div>
          </div>
        </div>

        <!-- 7-STAGE APPLICATION PROGRESSION TRACKER FOR STUDENT -->
        <div class="enterprise-card p-4 bg-white mb-4">
          <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
            <i class="bi bi-diagram-3-fill text-primary me-2"></i>My Active Applications ATS Progression
          </h5>

          <div *ngFor="let app of studentApplications" class="p-3 bg-slate-50 rounded-16 border mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap">
              <strong class="text-slate-900"><i class="bi bi-building text-primary me-1"></i> {{ app.job?.title || 'Software Development Engineer' }} ({{ app.job?.companyName || 'Company' }})</strong>
              <span class="badge bg-primary text-white font-monospace">Current Stage: {{ app.status }}</span>
            </div>

            <div class="d-flex gap-2 flex-wrap mt-2">
              <span class="badge" [class.bg-success]="true">1. Applied ✓</span>
              <span class="badge" [class.bg-success]="app.status !== 'Applied'" [class.bg-secondary]="app.status === 'Applied'">2. Shortlist</span>
              <span class="badge" [class.bg-success]="app.status.includes('Test') || app.status.includes('Interview') || app.status === 'Selected'" [class.bg-secondary]="!app.status.includes('Test') && !app.status.includes('Interview') && app.status !== 'Selected'">3. Assessment</span>
              <span class="badge" [class.bg-success]="app.status.includes('Technical') || app.status.includes('HR') || app.status === 'Selected'" [class.bg-secondary]="!app.status.includes('Technical') && !app.status.includes('HR') && app.status !== 'Selected'">4. Tech Interview</span>
              <span class="badge" [class.bg-success]="app.status === 'HR Interview Cleared' || app.status === 'Selected'" [class.bg-secondary]="app.status !== 'HR Interview Cleared' && app.status !== 'Selected'">5. HR Round</span>
              <span class="badge" [class.bg-success]="app.status === 'Selected'" [class.bg-secondary]="app.status !== 'Selected'">6. Offer LOI</span>
            </div>
          </div>

          <div *ngIf="studentApplications.length === 0" class="text-center py-4 text-muted">
            You haven't submitted applications to any placement drives yet.
          </div>
        </div>
      </ng-container>

      <!-- MODAL: RECRUITER POST JNF MODAL -->
      <div class="modal fade" id="recruiterJnfModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content enterprise-card border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900">
                <i class="bi bi-file-earmark-plus-fill text-primary me-2"></i> Corporate Job Notification Form (JNF) Registration
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="jobForm" (ngSubmit)="onCreateRecruiterJob()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-bold small">Profile Title / Designation *</label>
                    <input type="text" formControlName="title" class="form-control" placeholder="Software Engineer" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-bold small">Company Name *</label>
                    <input type="text" formControlName="companyName" class="form-control" placeholder="Google India" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-bold small">CTC Package (LPA) *</label>
                    <input type="number" step="0.5" formControlName="salaryPackage" class="form-control" placeholder="18.0" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-bold small">Open Positions Count</label>
                    <input type="number" formControlName="openPositions" class="form-control" placeholder="12" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-bold small">Job Location *</label>
                    <input type="text" formControlName="location" class="form-control" placeholder="Bangalore / Hybrid" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-bold small">Min CGPA Cutoff *</label>
                    <input type="number" step="0.1" formControlName="minCgpa" class="form-control" placeholder="7.5" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-bold small">Max Backlogs Allowed *</label>
                    <input type="number" formControlName="maxBacklogs" class="form-control" placeholder="0" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label text-slate-700 fw-bold small">10th Grade Cutoff %</label>
                    <input type="number" formControlName="min10thPercent" class="form-control" placeholder="75" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-slate-700 fw-bold small">Application Expiry Deadline *</label>
                    <input type="datetime-local" formControlName="deadline" class="form-control" />
                  </div>
                  <div class="col-12">
                    <label class="form-label text-slate-700 fw-bold small">JNF Overview & Required Stack *</label>
                    <textarea formControlName="description" class="form-control" rows="4" placeholder="Describe role requirements, tech stack (Angular, Node, Microservices)..."></textarea>
                  </div>
                </div>

                <div class="mt-4 text-end border-top pt-3">
                  <button type="button" class="btn btn-secondary me-2 rounded-pill" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" [disabled]="jobForm.invalid" class="btn btn-primary rounded-pill px-4 shadow-sm" data-bs-dismiss="modal">
                    Route JNF for Admin Confirmation ➔
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: INVITE RECRUITER MODAL -->
      <div class="modal fade" id="inviteRecruiterModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content enterprise-card border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900">
                <i class="bi bi-envelope-at-fill text-primary me-2"></i> Send Invitation Email to Recruiter HR
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label text-slate-700">Recruiter HR Name</label>
                <input type="text" [(ngModel)]="inviteName" class="form-control" placeholder="Sarah Jenkins" />
              </div>
              <div class="mb-3">
                <label class="form-label text-slate-700">Recruiter Email Address</label>
                <input type="email" [(ngModel)]="inviteEmail" class="form-control" placeholder="careers@google.com" />
              </div>
              <div class="mb-3">
                <label class="form-label text-slate-700">Company Name</label>
                <input type="text" [(ngModel)]="inviteCompany" class="form-control" placeholder="Google India" />
              </div>

              <div class="mt-4 text-end border-top pt-3">
                <button type="button" class="btn btn-secondary me-2 rounded-pill" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="onSendInvitation()" data-bs-dismiss="modal">
                  Dispatch Email Invite ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: SCHEDULE INTERVIEW MODAL -->
      <div class="modal fade" id="scheduleInterviewModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content enterprise-card border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900">
                <i class="bi bi-calendar-plus-fill text-primary me-2"></i> Schedule Interview Round
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label text-slate-700">Select Job Drive</label>
                <select [(ngModel)]="newInterviewJobId" class="form-select">
                  <option *ngFor="let j of recruiterJobs" [value]="j._id">{{ j.companyName }} - {{ j.title }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label text-slate-700">Candidate Student</label>
                <select [(ngModel)]="newInterviewStudentId" class="form-select">
                  <option *ngFor="let app of applications" [value]="app.student?._id || app.student">{{ app.studentName }} ({{ app.studentEmail }})</option>
                </select>
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label text-slate-700">Round Name</label>
                  <input type="text" [(ngModel)]="newInterviewRound" class="form-control" placeholder="Technical Round 1" />
                </div>
                <div class="col-6">
                  <label class="form-label text-slate-700">Round Number</label>
                  <input type="number" [(ngModel)]="newInterviewRoundNum" class="form-control" value="1" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label text-slate-700">Interview Date & Time</label>
                <input type="datetime-local" [(ngModel)]="newInterviewDate" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label text-slate-700">Meeting Link / Room</label>
                <input type="text" [(ngModel)]="newInterviewMeetingLink" class="form-control" placeholder="https://meet.google.com/xyz" />
              </div>

              <div class="mt-4 text-end border-top pt-3">
                <button type="button" class="btn btn-secondary me-2 rounded-pill" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="onScheduleInterviewSubmit()" data-bs-dismiss="modal">
                  Save & Notify Candidate ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private studentService = inject(StudentService);
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private offerService = inject(OfferService);
  private noticeService = inject(NoticeService);
  private invitationService = inject(InvitationService);
  private notify = inject(NotificationService);
  private reportService = inject(ReportService);
  private activityService = inject(ActivityService);
  private interviewService = inject(InterviewService);
  private fb = inject(FormBuilder);

  today = new Date();
  user = this.authService.currentUser;
  userRole = () => this.authService.getUserRole() || 'student';

  analytics: AnalyticsData | null = null;
  studentProfile: Student | null = null;
  studentApplications: Application[] = [];
  studentOffers: Offer[] = [];
  recruiterJobs: Job[] = [];
  applications: Application[] = [];
  pendingVerifications: Student[] = [];
  pendingDriveApprovals: Job[] = [];

  allStudentsList: Student[] = [];
  liveActivities: ActivityItem[] = [];
  liveInterviews: InterviewSchedule[] = [];
  activitySearch = '';
  acceptedCtc = 0;
  isDreamOfferUnlocked = false;

  studentJobsFeed: Job[] = [];

  inviteName = 'Sarah Jenkins';
  inviteEmail = 'careers@company.com';
  inviteCompany = 'Google India';
  isInjectingDemo = false;

  newInterviewJobId = '';
  newInterviewStudentId = '';
  newInterviewRound = 'Technical Interview';
  newInterviewRoundNum = 1;
  newInterviewDate = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16);
  newInterviewMeetingLink = 'https://meet.google.com/abc-defg-hij';

  pieChartOptions!: PieChartOptions;
  barChartOptions!: BarChartOptions;

  jobForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    companyName: ['Google India', Validators.required],
    salaryPackage: [18.0, [Validators.required, Validators.min(0)]],
    openPositions: [12, [Validators.required, Validators.min(1)]],
    location: ['Bangalore', Validators.required],
    minCgpa: [7.5, [Validators.required, Validators.min(0), Validators.max(10)]],
    maxBacklogs: [0, [Validators.required, Validators.min(0)]],
    min10thPercent: [75, [Validators.required, Validators.min(0)]],
    deadline: [new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 16), Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
    this.initChartOptions();
    this.loadAnalyticsData();
    this.loadLiveActivities();

    const role = this.userRole();
    if (role === 'student') {
      this.loadStudentPortalData();
    } else if (role === 'admin') {
      this.loadAdminOperationsData();
    } else if (role === 'company') {
      this.loadRecruiterDashboardData();
    }
  }

  loadAnalyticsData(): void {
    this.reportService.getAnalytics().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.analytics = res.data;
          this.updateChartsWithLiveData(res.data);
        }
      },
      error: (err) => {
        console.error('Failed to fetch analytics:', err);
      }
    });
  }

  loadLiveActivities(): void {
    this.activityService.getActivities(20).subscribe({
      next: (res) => {
        this.liveActivities = res.data || [];
      },
      error: () => {}
    });
  }

  loadStudentPortalData(): void {
    this.studentService.getProfile().subscribe({
      next: (res) => {
        this.studentProfile = res.data;
        if (this.studentProfile?.placedPackage) {
          this.acceptedCtc = this.studentProfile.placedPackage;
        }
      },
      error: () => {}
    });

    this.jobService.getJobs().subscribe({
      next: (res) => {
        this.studentJobsFeed = res.data || [];
      },
      error: () => {}
    });

    this.applicationService.getMyApplications().subscribe({
      next: (res) => {
        this.studentApplications = res.data || [];
      },
      error: () => {}
    });

    this.loadStudentOffers();
  }

  loadAdminOperationsData(): void {
    this.studentService.getStudents().subscribe({
      next: (res) => {
        this.allStudentsList = res.data || [];
        this.pendingVerifications = this.allStudentsList.filter((s) => !s.isFrozen || s.verificationStatus === 'Pending Verification');
      },
      error: () => {}
    });

    this.jobService.getJobs().subscribe({
      next: (res) => {
        this.recruiterJobs = res.data || [];
        this.pendingDriveApprovals = (res.data || []).filter((j) => j.approvalStatus === 'Pending Admin Approval');
      },
      error: () => {}
    });

    this.applicationService.getApplications().subscribe({
      next: (res) => {
        this.applications = res.data || [];
      },
      error: () => {}
    });
  }

  loadRecruiterDashboardData(): void {
    this.jobService.getJobs().subscribe({
      next: (res) => {
        this.recruiterJobs = res.data || [];
        if (this.recruiterJobs.length > 0 && !this.newInterviewJobId) {
          this.newInterviewJobId = this.recruiterJobs[0]._id!;
        }
      },
      error: () => {}
    });

    this.applicationService.getApplications().subscribe({
      next: (res) => {
        this.applications = res.data || [];
        if (this.applications.length > 0 && !this.newInterviewStudentId) {
          this.newInterviewStudentId = (this.applications[0].student?._id || this.applications[0].student) as string;
        }
      },
      error: () => {}
    });

    this.interviewService.getInterviews().subscribe({
      next: (res) => {
        this.liveInterviews = res.data || [];
      },
      error: () => {}
    });
  }

  loadStudentOffers(): void {
    this.offerService.getMyOffers().subscribe({
      next: (res) => {
        this.studentOffers = res.data || [];
        const accepted = this.studentOffers.find((o) => o.status === 'Accepted');
        if (accepted) {
          this.acceptedCtc = accepted.packageOffered;
        }
      },
      error: () => {}
    });
  }

  // Phase 1: Verify Credentials & Freeze Profile
  verifyAndFreezeStudent(studentId: string): void {
    this.studentService.verifyStudentProfile(studentId, 'approve').subscribe({
      next: () => {
        this.notify.showSuccess('✔ Student Verified & Academic Credentials Frozen in TPO Vault!');
        this.loadAdminOperationsData();
        this.loadAnalyticsData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Failed to verify student');
      }
    });
  }

  // Phase 3: Receive-Only JNF Dynamic Eligibility Matcher
  checkJnfEligibility(j: Job): 'ELIGIBLE' | 'INELIGIBLE' | 'EXPIRED' | 'DEBARRED_PLACED' {
    const cgpa = this.studentProfile?.cgpa || 8.5;
    const backlogs = this.studentProfile?.backlogs || 0;
    const deadline = new Date(j.deadline).getTime();
    const now = Date.now();

    if (now > deadline) {
      return 'EXPIRED';
    }

    if (this.acceptedCtc > 0) {
      if ((j.salaryPackage || 0) > 2 * this.acceptedCtc) {
        this.isDreamOfferUnlocked = true;
        return 'ELIGIBLE';
      }
      return 'DEBARRED_PLACED';
    }

    if (cgpa < j.minCgpa || backlogs > (j.maxBacklogs || 0)) {
      return 'INELIGIBLE';
    }

    return 'ELIGIBLE';
  }

  // Phase 4: Advance 7-Stage ATS & Automated Notification Mails
  advanceAtsStage(appId: string, status: string): void {
    this.applicationService.updateStatus(appId, status).subscribe({
      next: () => {
        this.notify.showSuccess(`✔ Advanced candidate stage to [${status}]!`);
        this.loadRecruiterDashboardData();
        this.loadAnalyticsData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Failed to update candidate status');
      }
    });
  }

  // Phase 6: Final LOI Offer Acceptance & 2x Freeze Policy Enforcer
  acceptLoiOffer(offer: Offer): void {
    this.offerService.respondToOffer(offer._id!, 'Accept').subscribe({
      next: () => {
        this.acceptedCtc = offer.packageOffered;
        this.notify.showSuccess(`🎓 Offer Accepted! You are officially PLACED at ${offer.companyName}. Campus Freeze Policy active.`);
        this.loadStudentOffers();
        this.loadAnalyticsData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Failed to accept offer');
      }
    });
  }

  // Demo Telemetry Injector & ExcelJS Export
  onInjectDemoData(): void {
    this.isInjectingDemo = true;
    this.noticeService.injectDemoData().subscribe({
      next: () => {
        this.isInjectingDemo = false;
        this.notify.showSuccess('⚡ 20+ Verified Students, 5 JNFs, Offers & Real Activities Injected!');
        this.loadAdminOperationsData();
        this.loadAnalyticsData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.isInjectingDemo = false;
        this.notify.showError(err?.error?.message || 'Failed to inject demo records');
      }
    });
  }

  exportAllLedgerExcel(): void {
    this.applicationService.exportApplicantsToExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Placement_Ledger_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notify.showSuccess('📊 Complete Placement Ledger exported as Excel (.XLSX) file!');
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Failed to export Excel ledger');
      }
    });
  }

  filteredActivities(): ActivityItem[] {
    const q = this.activitySearch.toLowerCase().trim();
    if (!q) return this.liveActivities;
    return this.liveActivities.filter((a) => 
      a.title.toLowerCase().includes(q) || 
      a.actor.toLowerCase().includes(q) || 
      a.description.toLowerCase().includes(q)
    );
  }

  getUnplacedStudentsCount(): number {
    if (!this.analytics) return 0;
    return this.analytics.unplacedStudents || Math.max(0, (this.analytics.totalStudents || 0) - (this.analytics.placedStudents || 0));
  }

  getShortlistedCount(): number {
    return this.applications.filter((a) => a.status === 'Resume Shortlisted' || a.status === 'Technical Interview Cleared' || a.status === 'Aptitude Test Cleared').length;
  }

  getSelectedCount(): number {
    return this.applications.filter((a) => a.status === 'HR Interview Cleared' || a.status === 'Selected').length;
  }

  onScheduleInterviewSubmit(): void {
    if (!this.newInterviewJobId || !this.newInterviewStudentId) {
      this.notify.showError('Please select a Job drive and Student candidate');
      return;
    }

    this.interviewService.scheduleInterview({
      job: this.newInterviewJobId,
      student: this.newInterviewStudentId,
      roundName: this.newInterviewRound,
      roundNumber: this.newInterviewRoundNum,
      interviewDate: this.newInterviewDate,
      meetingLink: this.newInterviewMeetingLink,
      status: 'Scheduled'
    }).subscribe({
      next: () => {
        this.notify.showSuccess('📅 Interview scheduled and notification dispatched to candidate!');
        this.loadRecruiterDashboardData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Failed to schedule interview');
      }
    });
  }

  applyDriveDirectly(jobId: string): void {
    this.applicationService.applyForJob({ jobId }).subscribe({
      next: () => {
        this.notify.showSuccess('🚀 Profile & Resume submitted for JNF Campus Drive!');
        this.loadStudentPortalData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Application could not be submitted');
      }
    });
  }

  getOfferStatusBadge(status: string): string {
    switch (status) {
      case 'Accepted': return 'badge bg-success text-white rounded-pill px-3 py-1 font-monospace';
      case 'Declined': return 'badge bg-danger text-white rounded-pill px-3 py-1 font-monospace';
      default: return 'badge bg-warning text-dark rounded-pill px-3 py-1 font-monospace';
    }
  }

  respondToOffer(offerId: string, action: 'Accept' | 'Decline'): void {
    this.offerService.respondToOffer(offerId, action).subscribe({
      next: () => {
        this.notify.showSuccess(`Offer ${action}ed successfully!`);
        this.loadStudentOffers();
        this.loadAnalyticsData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || `Failed to ${action} offer`);
      }
    });
  }

  onSendInvitation(): void {
    if (!this.inviteEmail || !this.inviteCompany) return;
    this.invitationService.sendInvitation({
      recruiterName: this.inviteName,
      recruiterEmail: this.inviteEmail,
      companyName: this.inviteCompany
    }).subscribe({
      next: () => {
        this.notify.showSuccess(`📧 Email invite dispatched to ${this.inviteEmail}`);
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Failed to dispatch email invite');
      }
    });
  }

  onCreateRecruiterJob(): void {
    if (this.jobForm.invalid) return;
    this.jobService.createJob(this.jobForm.value).subscribe({
      next: () => {
        this.notify.showSuccess('JNF registered and routed to Admin Queue for confirmation!');
        this.loadRecruiterDashboardData();
        this.loadAnalyticsData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Failed to post JNF');
      }
    });
  }

  private initChartOptions(): void {
    this.pieChartOptions = {
      series: [0, 0],
      chart: { type: 'donut', height: 260 },
      labels: ['Placed Candidates', 'Unplaced Candidates'],
      colors: ['#059669', '#F59E0B'],
      legend: { position: 'bottom' },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
    };

    this.barChartOptions = {
      series: [{ name: 'Average Package (LPA)', data: [] }],
      chart: { type: 'bar', height: 260 },
      plotOptions: { bar: { horizontal: false, columnWidth: '45%' } },
      colors: ['#4F46E5'],
      dataLabels: { enabled: true },
      xaxis: { categories: [] }
    };
  }

  private updateChartsWithLiveData(data: AnalyticsData): void {
    const placed = data.placedStudents || 0;
    const unplaced = Math.max(0, (data.totalStudents || 0) - placed);

    this.pieChartOptions = {
      series: [placed, unplaced],
      chart: { type: 'donut', height: 260 },
      labels: [`Placed (${placed})`, `Unplaced (${unplaced})`],
      colors: ['#059669', '#F59E0B'],
      legend: { position: 'bottom' },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
    };

    if (data.branchWise && data.branchWise.length > 0) {
      const categories = data.branchWise.map(b => b.branch.replace('B.Tech ', ''));
      const values = data.branchWise.map(b => b.avgPackage || 0);

      this.barChartOptions = {
        series: [{ name: 'Average Package (LPA)', data: values }],
        chart: { type: 'bar', height: 260 },
        plotOptions: { bar: { horizontal: false, columnWidth: '45%' } },
        colors: ['#4F46E5'],
        dataLabels: { enabled: true },
        xaxis: { categories }
      };
    }
  }
}
