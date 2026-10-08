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
  ApexYAxis,
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
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  colors: string[];
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  legend: ApexLegend;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, NgApexchartsModule],
  template: `
    <div class="d-flex flex-column gap-4 pb-4">
      <!-- ==========================================================================
           1. TPO / ADMIN DASHBOARD INTERFACE
           ========================================================================== -->
      <ng-container *ngIf="userRole() === 'admin'">
        <!-- TOP: Page Title + Quick Operational Actions -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h1 class="page-main-title mb-1">TPO Placement Dashboard</h1>
            <p class="body-text mb-0">University campus recruitment telemetry and operations control • <strong>{{ today | date:'fullDate' }}</strong></p>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <button
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#inviteRecruiterModal"
            >
              <i class="bi bi-envelope-plus"></i> Invite Recruiter
            </button>

            <a routerLink="/notices" class="btn btn-secondary">
              <i class="bi bi-megaphone"></i> Broadcast Notice
            </a>

            <button
              class="btn btn-secondary"
              (click)="onInjectDemoData()"
              [disabled]="isInjectingDemo"
            >
              <span *ngIf="isInjectingDemo" class="spinner-border spinner-border-sm me-1"></span>
              <i *ngIf="!isInjectingDemo" class="bi bi-database-gear"></i> Seed Demo Data
            </button>

            <button class="btn btn-secondary" (click)="exportAllLedgerExcel()">
              <i class="bi bi-file-earmark-excel text-success"></i> Export Ledger (.xlsx)
            </button>
          </div>
        </div>

        <!-- ROW 1: 4 PRIMARY KPI CARDS -->
        <div class="row g-3">
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-emerald"><i class="bi bi-graph-up-arrow"></i></div>
              <div class="stat-content">
                <div class="stat-label">Placement Rate</div>
                <div class="stat-value text-success">{{ analytics?.placementRate || 0 }}%</div>
                <div class="stat-meta">{{ analytics?.placedStudents || 0 }} of {{ analytics?.totalStudents || 0 }} placed</div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-blue"><i class="bi bi-award"></i></div>
              <div class="stat-content">
                <div class="stat-label">Total Offers</div>
                <div class="stat-value text-primary">{{ analytics?.totalOffers || analytics?.placedStudents || 0 }}</div>
                <div class="stat-meta">Avg CTC: {{ analytics?.avgPackage || 0 }} LPA</div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-cyan"><i class="bi bi-briefcase"></i></div>
              <div class="stat-content">
                <div class="stat-label">Active Drives</div>
                <div class="stat-value">{{ analytics?.totalJobs || recruiterJobs.length || 0 }}</div>
                <div class="stat-meta">Highest CTC: {{ analytics?.highestPackage || 0 }} LPA</div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-amber"><i class="bi bi-people"></i></div>
              <div class="stat-content">
                <div class="stat-label">Unplaced Eligible</div>
                <div class="stat-value text-warning">{{ getUnplacedStudentsCount() }}</div>
                <div class="stat-meta">Total Candidates: {{ analytics?.totalStudents || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ROW 2: 4 SECONDARY KPI CARDS -->
        <div class="row g-3">
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-navy"><i class="bi bi-building"></i></div>
              <div class="stat-content">
                <div class="stat-label">Corporate Partners</div>
                <div class="stat-value">{{ analytics?.totalCompanies || 0 }}</div>
                <div class="stat-meta">Verified Recruiter Orgs</div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-blue"><i class="bi bi-file-earmark-person"></i></div>
              <div class="stat-content">
                <div class="stat-label">Total Applications</div>
                <div class="stat-value">{{ analytics?.funnel?.applied || applications.length || 0 }}</div>
                <div class="stat-meta">Candidate Submissions</div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-amber"><i class="bi bi-clock-history"></i></div>
              <div class="stat-content">
                <div class="stat-label">Queued Verifications</div>
                <div class="stat-value text-warning">{{ pendingVerifications.length }}</div>
                <div class="stat-meta">Pending Profile Freeze</div>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-emerald"><i class="bi bi-stars"></i></div>
              <div class="stat-content">
                <div class="stat-label">Dream Offers</div>
                <div class="stat-value text-success">{{ analytics?.dreamOffersCount || 0 }}</div>
                <div class="stat-meta">&gt; 2x Base CTC Upgrades</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ROW 3: 8-STAGE PLACEMENT WORKFLOW PIPELINE -->
        <div class="workflow-stepper-container">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
            <div>
              <h4 class="card-title-heading"><i class="bi bi-diagram-3-fill text-primary me-2"></i>Campus Placement Pipeline Workflow</h4>
              <p class="body-text mb-0 mt-0.5">Real-time status progression from corporate partner onboarding to final offer acceptance</p>
            </div>
            <span class="badge badge-subtle-primary font-mono">8-STAGE ENGINE</span>
          </div>

          <div class="workflow-stepper-track">
            <div class="workflow-step-node completed">
              <div class="node-circle"><i class="bi bi-building"></i></div>
              <div class="node-title">1. Onboarding</div>
              <div class="node-count">{{ analytics?.totalCompanies || 0 }} Partners</div>
            </div>

            <div class="workflow-step-node completed">
              <div class="node-circle"><i class="bi bi-briefcase"></i></div>
              <div class="node-title">2. Drive Published</div>
              <div class="node-count">{{ analytics?.totalJobs || recruiterJobs.length || 0 }} Drives</div>
            </div>

            <div class="workflow-step-node active">
              <div class="node-circle"><i class="bi bi-file-earmark-person"></i></div>
              <div class="node-title">3. Applications</div>
              <div class="node-count">{{ analytics?.funnel?.applied || applications.length || 0 }} Apps</div>
            </div>

            <div class="workflow-step-node active">
              <div class="node-circle"><i class="bi bi-laptop"></i></div>
              <div class="node-title">4. Assessment</div>
              <div class="node-count">{{ analytics?.totalAssessments || analytics?.funnel?.aptitude || 0 }} Tests</div>
            </div>

            <div class="workflow-step-node active">
              <div class="node-circle"><i class="bi bi-check2-circle"></i></div>
              <div class="node-title">5. Shortlisting</div>
              <div class="node-count">{{ analytics?.funnel?.shortlisted || getShortlistedCount() }} Candidates</div>
            </div>

            <div class="workflow-step-node active">
              <div class="node-circle"><i class="bi bi-calendar-event"></i></div>
              <div class="node-title">6. Interview</div>
              <div class="node-count">{{ (analytics?.funnel?.technical || 0) + (analytics?.funnel?.hr || 0) || liveInterviews.length || 0 }} Panels</div>
            </div>

            <div class="workflow-step-node completed">
              <div class="node-circle"><i class="bi bi-award"></i></div>
              <div class="node-title">7. Final Selection</div>
              <div class="node-count">{{ analytics?.placedStudents || getSelectedCount() }} Selected</div>
            </div>

            <div class="workflow-step-node completed">
              <div class="node-circle"><i class="bi bi-patch-check"></i></div>
              <div class="node-title">8. Offer</div>
              <div class="node-count">{{ analytics?.totalOffers || analytics?.placedStudents || 0 }} Extended</div>
            </div>
          </div>
        </div>

        <!-- ROW 4: CHARTS / PLACEMENT ANALYTICS -->
        <div class="row g-4">
          <div class="col-lg-6">
            <div class="enterprise-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h4 class="card-title-heading"><i class="bi bi-pie-chart-fill text-teal me-2"></i>Placed vs Unplaced Candidates</h4>
                <span class="badge badge-subtle-teal font-mono">{{ analytics?.placementRate || 0 }}% Placed</span>
              </div>
              <div class="d-flex justify-content-center py-2" *ngIf="hasPieChartData && pieChartOptions">
                <apx-chart
                  [series]="pieChartOptions.series"
                  [chart]="pieChartOptions.chart"
                  [labels]="pieChartOptions.labels"
                  [colors]="pieChartOptions.colors"
                  [legend]="pieChartOptions.legend"
                  [responsive]="pieChartOptions.responsive"
                ></apx-chart>
              </div>
              <div *ngIf="!hasPieChartData" class="text-center py-5 text-muted">
                <i class="bi bi-pie-chart fs-2 text-slate-400 d-block mb-2"></i>
                <div class="fw-semibold">No candidate distribution yet</div>
                <div class="small text-muted">Placement ratio chart will appear as candidates register in the database.</div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="enterprise-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h4 class="card-title-heading"><i class="bi bi-bar-chart-fill text-teal me-2"></i>Average Salary Package by Branch (LPA)</h4>
                <span class="badge badge-subtle-primary font-mono">CTC DISTRIBUTION</span>
              </div>
              <div class="d-flex justify-content-center py-2" *ngIf="hasBarChartData && barChartOptions">
                <apx-chart
                  class="w-100"
                  [series]="barChartOptions.series"
                  [chart]="barChartOptions.chart"
                  [xaxis]="barChartOptions.xaxis"
                  [yaxis]="barChartOptions.yaxis"
                  [plotOptions]="barChartOptions.plotOptions"
                  [colors]="barChartOptions.colors"
                  [dataLabels]="barChartOptions.dataLabels"
                  [tooltip]="barChartOptions.tooltip"
                ></apx-chart>
              </div>
              <div *ngIf="!hasBarChartData" class="text-center py-5 text-muted">
                <i class="bi bi-bar-chart fs-2 text-slate-400 d-block mb-2"></i>
                <div class="fw-semibold">No branch salary data available</div>
                <div class="small text-muted">Salary benchmarks will appear as company placement drives and offers progress.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ROW 5: STUDENT GATEKEEPING & VERIFICATION QUEUE -->
        <div class="enterprise-card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
            <div>
              <h4 class="card-title-heading"><i class="bi bi-shield-lock-fill text-primary me-2"></i>Student Data Gatekeeping Vault & Academic Verification</h4>
              <p class="body-text mb-0 mt-0.5">Review academic credentials (10th%, 12th%, CGPA, backlogs) and freeze verified profiles</p>
            </div>
            <a routerLink="/students" class="btn btn-secondary btn-sm">Full Directory ➔</a>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th class="text-nowrap">Student ID & Name</th>
                  <th class="text-nowrap">Branch & Year</th>
                  <th class="text-nowrap">Academic Credentials</th>
                  <th class="text-nowrap">Backlogs</th>
                  <th class="text-nowrap">Resume</th>
                  <th class="text-nowrap">Status</th>
                  <th class="text-end text-nowrap" style="min-width: 160px;">Verification Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of allStudentsList.slice(0, 6)">
                  <td>
                    <div class="fw-semibold text-slate-900 text-nowrap">{{ s.fullName }}</div>
                    <small class="text-muted font-mono">{{ s.studentId }} • {{ s.email }}</small>
                  </td>
                  <td>
                    <div class="text-nowrap">{{ s.branch || 'B.Tech CSE' }}</div>
                    <small class="text-muted text-nowrap">{{ s.year || '4th Year' }}</small>
                  </td>
                  <td>
                    <div><span class="badge badge-subtle-primary font-mono text-nowrap">CGPA: {{ s.cgpa }}</span></div>
                    <small class="text-muted text-nowrap">10th: {{ s.tenthPercentage || 85 }}% • 12th: {{ s.twelfthPercentage || 85 }}%</small>
                  </td>
                  <td>
                    <span [class]="(s.backlogs || 0) === 0 ? 'badge badge-subtle-success font-mono text-nowrap' : 'badge badge-subtle-danger font-mono text-nowrap'">
                      {{ s.backlogs || 0 }} Backlogs
                    </span>
                  </td>
                  <td>
                    <a [href]="s.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'" target="_blank" class="btn btn-outline-secondary btn-sm py-0 px-2 text-nowrap" style="font-size: 0.72rem;">
                      PDF ↗
                    </a>
                  </td>
                  <td>
                    <span *ngIf="s.isFrozen" class="badge badge-subtle-success font-mono text-nowrap">
                      <i class="bi bi-lock-fill me-1"></i> VERIFIED & FROZEN
                    </span>
                    <span *ngIf="!s.isFrozen" class="badge badge-subtle-warning font-mono text-nowrap">
                      {{ s.verificationStatus || 'PENDING' }}
                    </span>
                  </td>
                  <td class="text-end text-nowrap">
                    <button
                      *ngIf="!s.isFrozen"
                      class="btn btn-success btn-sm py-1 px-3 fw-bold text-nowrap"
                      (click)="verifyAndFreezeStudent(s._id!)"
                    >
                      <i class="bi bi-shield-check me-1"></i> Verify & Freeze
                    </button>
                    <span *ngIf="s.isFrozen" class="text-success small fw-semibold font-mono text-nowrap">
                      <i class="bi bi-check-circle-fill me-1"></i> Locked
                    </span>
                  </td>
                </tr>
                <tr *ngIf="allStudentsList.length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    <div class="saas-empty-state py-3">
                      <i class="bi bi-people empty-icon"></i>
                      <div class="empty-title">No student records found</div>
                      <div class="empty-desc">Seed demo data or wait for students to register their profiles.</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ROW 6: LIVE ACTIVITY STREAM & AUDIT TRAIL -->
        <div class="enterprise-card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
            <div>
              <h4 class="card-title-heading"><i class="bi bi-activity text-primary me-2"></i>Live Placement Activity Stream</h4>
              <p class="body-text mb-0 mt-0.5">Real-time audit log of university placement drives, assessments, shortlists and offers</p>
            </div>
            <input type="text" [(ngModel)]="activitySearch" class="form-control form-control-sm" style="max-width: 240px;" placeholder="Filter activities..." />
          </div>

          <div class="list-group list-group-flush small" style="max-height: 260px; overflow-y: auto;">
            <div *ngFor="let act of filteredActivities()" class="list-group-item px-0 py-2.5 border-bottom">
              <div class="d-flex justify-content-between align-items-start">
                <span class="fw-semibold text-slate-900">
                  <i class="bi bi-check-circle-fill text-success me-1.5"></i> {{ act.title }}
                </span>
                <span class="badge badge-subtle-secondary font-mono">{{ act.type }}</span>
              </div>
              <small class="text-muted d-block mt-1">{{ act.description }} • Actor: <strong>{{ act.actor }}</strong> ({{ act.actorRole }}) • {{ act.createdAt | date:'shortTime' }}</small>
            </div>

            <div *ngIf="filteredActivities().length === 0" class="text-center py-4 text-muted">
              No recent activity recorded yet.
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ==========================================================================
           2. RECRUITER / COMPANY DASHBOARD INTERFACE
           ========================================================================== -->
      <ng-container *ngIf="userRole() === 'company'">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h1 class="page-main-title mb-1">Recruiter Console</h1>
            <p class="body-text mb-0">Post Job Notification Forms (JNF), manage ATS stages, schedule interview panels and issue offers</p>
          </div>

          <button
            class="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#recruiterJnfModal"
          >
            <i class="bi bi-plus-circle"></i> Post Job Notification Form (JNF)
          </button>
        </div>

        <!-- 4 RECRUITER STAT CARDS -->
        <div class="row g-3">
          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-blue"><i class="bi bi-briefcase"></i></div>
              <div class="stat-content">
                <div class="stat-label">Active Drives</div>
                <div class="stat-value">{{ recruiterJobs.length }}</div>
                <div class="stat-meta">Posted JNFs</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-cyan"><i class="bi bi-people"></i></div>
              <div class="stat-content">
                <div class="stat-label">Total Applicants</div>
                <div class="stat-value">{{ applications.length }}</div>
                <div class="stat-meta">Candidate Submissions</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-amber"><i class="bi bi-check2-circle"></i></div>
              <div class="stat-content">
                <div class="stat-label">Shortlisted</div>
                <div class="stat-value text-warning">{{ getShortlistedCount() }}</div>
                <div class="stat-meta">In Review / Evaluation</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-emerald"><i class="bi bi-trophy"></i></div>
              <div class="stat-content">
                <div class="stat-label">Offers Released</div>
                <div class="stat-value text-success">{{ getSelectedCount() }}</div>
                <div class="stat-meta">Selected Candidates</div>
              </div>
            </div>
          </div>
        </div>

        <!-- RECRUITER ATS CANDIDATE PIPELINE -->
        <div class="enterprise-card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
            <div>
              <h4 class="card-title-heading"><i class="bi bi-kanban-fill text-primary me-2"></i>Candidate ATS Pipeline</h4>
              <p class="body-text mb-0 mt-0.5">Advance candidates sequentially through shortlisting, assessments, interviews, and final selection</p>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="exportAllLedgerExcel()">
              <i class="bi bi-file-earmark-excel text-success me-1"></i> Export Excel
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Branch & CGPA</th>
                  <th>Resume</th>
                  <th>Current ATS Stage</th>
                  <th>Advance Stage</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let app of applications">
                  <td>
                    <div class="fw-semibold text-slate-900">{{ app.studentName }}</div>
                    <small class="text-muted">{{ app.studentEmail }}</small>
                  </td>
                  <td>
                    <div>{{ app.branch || 'B.Tech CSE' }}</div>
                    <small class="text-primary fw-bold font-mono">CGPA: {{ app.cgpa || 8.5 }}</small>
                  </td>
                  <td>
                    <a [href]="app.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'" target="_blank" class="btn btn-outline-secondary btn-sm py-0 px-2" style="font-size: 0.72rem;">
                      PDF ↗
                    </a>
                  </td>
                  <td>
                    <span class="badge badge-subtle-primary font-mono">
                      {{ app.status }}
                    </span>
                  </td>
                  <td>
                    <div class="dropdown d-inline-block">
                      <button class="btn btn-primary btn-sm py-1 px-2.5 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Advance Stage ➔
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end shadow-sm border p-1" style="font-size: 0.8rem;">
                        <li><a class="dropdown-item py-1.5 rounded-8" (click)="advanceAtsStage(app._id!, 'Resume Shortlisted')">2. Resume Shortlisted</a></li>
                        <li><a class="dropdown-item py-1.5 rounded-8" (click)="advanceAtsStage(app._id!, 'Aptitude Test Cleared')">3. Assessment Cleared</a></li>
                        <li><a class="dropdown-item py-1.5 rounded-8" (click)="advanceAtsStage(app._id!, 'Group Discussion Cleared')">4. GD Cleared</a></li>
                        <li><a class="dropdown-item py-1.5 rounded-8" (click)="advanceAtsStage(app._id!, 'Technical Interview Cleared')">5. Tech Interview Cleared</a></li>
                        <li><a class="dropdown-item py-1.5 rounded-8" (click)="advanceAtsStage(app._id!, 'HR Interview Cleared')">6. HR Panel Cleared</a></li>
                        <li><a class="dropdown-item py-1.5 rounded-8 text-success fw-bold" (click)="advanceAtsStage(app._id!, 'Selected')">7. Release Offer (LOI)</a></li>
                      </ul>
                    </div>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-outline-secondary btn-sm py-1 px-2 text-danger" (click)="advanceAtsStage(app._id!, 'Rejected')">
                      Reject
                    </button>
                  </td>
                </tr>

                <tr *ngIf="applications.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    <div class="saas-empty-state py-3">
                      <i class="bi bi-people empty-icon"></i>
                      <div class="empty-title">No candidate applications yet</div>
                      <div class="empty-desc">Applications will appear here once candidates apply to your published JNFs.</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- RECRUITER INTERVIEW SCHEDULE TABLE -->
        <div class="enterprise-card p-4" id="interviews">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div>
              <h4 class="card-title-heading"><i class="bi bi-calendar-event-fill text-primary me-2"></i>Scheduled Interview Panels</h4>
              <p class="body-text mb-0 mt-0.5">Manage interview rounds, timing, and meeting links for shortlisted candidates</p>
            </div>
            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#scheduleInterviewModal">
              <i class="bi bi-plus-circle me-1"></i> Schedule Interview
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Candidate Student</th>
                  <th>Drive Role</th>
                  <th>Date & Time</th>
                  <th>Meeting Link</th>
                  <th class="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let slot of liveInterviews">
                  <td><span class="badge badge-subtle-primary font-mono">Round {{ slot.roundNumber }}: {{ slot.roundName }}</span></td>
                  <td><div class="fw-semibold text-slate-900">{{ slot.student?.fullName || 'Candidate' }}</div><small class="text-muted">{{ slot.student?.email }}</small></td>
                  <td><span>{{ slot.job?.title || 'Engineering Role' }}</span></td>
                  <td><div class="text-primary font-mono"><i class="bi bi-clock me-1"></i>{{ slot.interviewDate | date:'medium' }}</div></td>
                  <td>
                    <a *ngIf="slot.meetingLink" [href]="slot.meetingLink" target="_blank" class="text-primary fw-semibold small text-decoration-none">
                      <i class="bi bi-camera-video me-1"></i> Join Meeting
                    </a>
                  </td>
                  <td class="text-end">
                    <span class="badge badge-subtle-success font-mono">{{ slot.status }}</span>
                  </td>
                </tr>
                <tr *ngIf="liveInterviews.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    <div class="saas-empty-state py-3">
                      <i class="bi bi-calendar-x empty-icon"></i>
                      <div class="empty-title">No upcoming interviews</div>
                      <div class="empty-desc">Schedule interview panels for candidates who cleared the initial rounds.</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- ==========================================================================
           3. STUDENT DASHBOARD INTERFACE
           ========================================================================== -->
      <ng-container *ngIf="userRole() === 'student'">
        <!-- TOP: Student Welcome & Academic Status -->
        <div class="enterprise-card p-4">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span class="badge badge-subtle-primary font-mono">STUDENT PORTAL</span>
                <span *ngIf="studentProfile?.isFrozen" class="badge badge-subtle-success font-mono">
                  <i class="bi bi-shield-check me-1"></i> PROFILE VERIFIED
                </span>
                <span *ngIf="studentProfile?.placementStatus === 'Placed'" class="badge badge-subtle-teal font-mono">
                  <i class="bi bi-award me-1"></i> PLACED
                </span>
              </div>
              <h1 class="page-main-title mb-1">Welcome back, {{ user()?.name }} 👋</h1>
              <p class="body-text mb-0">Check placement drive eligibility, track your active ATS applications, and view LOI offer letters</p>
            </div>

            <div class="d-flex gap-3 text-end">
              <div class="p-3 bg-slate-50 border rounded-10 text-center" style="min-width: 110px;">
                <div class="text-muted font-mono" style="font-size: 0.7rem;">ACADEMIC CGPA</div>
                <div class="fw-bold fs-4 text-slate-900">{{ studentProfile?.cgpa || 8.5 }}</div>
                <small class="text-muted font-mono">{{ studentProfile?.backlogs || 0 }} Backlogs</small>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI ROW: 4 STUDENT METRICS -->
        <div class="row g-3">
          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-blue"><i class="bi bi-briefcase"></i></div>
              <div class="stat-content">
                <div class="stat-label">Available Drives</div>
                <div class="stat-value">{{ studentJobsFeed.length }}</div>
                <div class="stat-meta">Active Campus Openings</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-cyan"><i class="bi bi-send-check"></i></div>
              <div class="stat-content">
                <div class="stat-label">My Applications</div>
                <div class="stat-value">{{ studentApplications.length }}</div>
                <div class="stat-meta">Submitted JNFs</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-amber"><i class="bi bi-laptop"></i></div>
              <div class="stat-content">
                <div class="stat-label">Assessments</div>
                <div class="stat-value">{{ getAssessmentsCount() }}</div>
                <div class="stat-meta">Online Tests</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon icon-emerald"><i class="bi bi-trophy"></i></div>
              <div class="stat-content">
                <div class="stat-label">Offer Letters</div>
                <div class="stat-value text-success">{{ studentOffers.length }}</div>
                <div class="stat-meta">Extended LOIs</div>
              </div>
            </div>
          </div>
        </div>

        <!-- OFFER ACCEPTANCE HUB (IF EXTENDED) -->
        <div *ngIf="studentOffers.length > 0" id="offers">
          <div *ngFor="let offer of studentOffers" class="enterprise-card p-4 border-start border-4 border-success mb-3">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <span class="badge badge-subtle-success font-mono mb-2">
                  <i class="bi bi-award-fill me-1"></i> OFFICIAL LETTER OF INTENT (LOI)
                </span>
                <h3 class="fw-bold text-slate-900 mb-1">Offer Extended: {{ offer.companyName }}</h3>
                <p class="body-text mb-0">Role: <strong>{{ offer.role }}</strong> • CTC Package: <strong class="text-success font-mono">{{ offer.packageOffered }} LPA</strong></p>
              </div>
              <span [class]="getOfferStatusBadge(offer.status)">
                Status: {{ offer.status }}
              </span>
            </div>

            <div class="bg-slate-50 border rounded-8 p-3 mb-3 small font-mono text-slate-800">
              <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">{{ offer.loiText }}</pre>
            </div>

            <div *ngIf="offer.status === 'Pending'" class="d-flex gap-2">
              <button class="btn btn-success" (click)="acceptLoiOffer(offer)">
                <i class="bi bi-check-circle-fill me-1"></i> Accept Offer (Activate Placement)
              </button>
              <button class="btn btn-outline-secondary text-danger" (click)="respondToOffer(offer._id!, 'Decline')">
                Decline Offer
              </button>
            </div>

            <div *ngIf="offer.status === 'Accepted'" class="badge badge-subtle-success p-2.5 rounded-8 w-100 text-start fw-normal">
              <i class="bi bi-check-circle-fill me-1"></i> You are placed at {{ offer.companyName }} ({{ offer.packageOffered }} LPA). Campus Dream policy unlocks for opportunities &gt; {{ (offer.packageOffered || 12) * 2 }} LPA.
            </div>
          </div>
        </div>

        <!-- AVAILABLE PLACEMENT DRIVES -->
        <div class="enterprise-card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div>
              <h4 class="card-title-heading"><i class="bi bi-briefcase-fill text-primary me-2"></i>Available Placement Drives</h4>
              <p class="body-text mb-0 mt-0.5">Explore open recruitment drives matching your eligibility criteria</p>
            </div>
            <a routerLink="/jobs" class="btn btn-secondary btn-sm">View All Drives ➔</a>
          </div>

          <div class="row g-3">
            <div *ngFor="let j of studentJobsFeed.slice(0, 4)" class="col-md-6">
              <div class="p-3.5 bg-slate-50 rounded-10 border h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-between align-items-start mb-2 gap-2 flex-wrap">
                    <div class="min-w-0 flex-grow-1">
                      <h4 class="fw-bold text-slate-900 mb-0 text-break">{{ j.title }}</h4>
                      <span class="text-primary fw-semibold small text-break">{{ j.companyName }}</span>
                    </div>
                    <span class="badge badge-subtle-success font-mono flex-shrink-0">{{ j.salaryPackage }} LPA</span>
                  </div>

                  <p class="body-text small mb-2.5 text-clamp-2 text-break">{{ j.description }}</p>

                  <div class="meta-text bg-white p-2 rounded-8 border mb-3">
                    <div class="text-break"><i class="bi bi-geo-alt text-danger me-1"></i> Location: {{ j.location }}</div>
                    <div><i class="bi bi-mortarboard text-info me-1"></i> Min CGPA: <strong>{{ j.minCgpa }}</strong></div>
                    <div><i class="bi bi-clock text-warning me-1"></i> Deadline: <strong>{{ j.deadline | date:'mediumDate' }}</strong></div>
                  </div>
                </div>

                <div class="pt-2.5 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <ng-container *ngIf="studentProfile?.placementStatus !== 'Blacklisted'">
                    <div *ngIf="checkJnfEligibility(j) === 'ELIGIBLE'">
                      <span class="badge badge-subtle-success font-mono">
                        <i class="bi bi-check-circle-fill me-1"></i> Eligible
                      </span>
                    </div>

                    <button
                      *ngIf="checkJnfEligibility(j) === 'ELIGIBLE'"
                      class="btn btn-primary btn-sm px-3"
                      (click)="applyDriveDirectly(j._id!)"
                    >
                      Apply Now ➔
                    </button>

                    <div *ngIf="checkJnfEligibility(j) === 'INELIGIBLE'" class="w-100">
                      <span class="badge badge-subtle-danger font-mono w-100 text-start text-break">
                        <i class="bi bi-lock-fill me-1"></i> Required CGPA &gt;= {{ j.minCgpa }} (Your CGPA: {{ studentProfile?.cgpa || 7.9 }})
                      </span>
                    </div>

                    <div *ngIf="checkJnfEligibility(j) === 'EXPIRED'" class="w-100">
                      <span class="badge badge-subtle-secondary font-mono w-100 text-start text-break">
                        Deadline Expired
                      </span>
                    </div>


                    <div *ngIf="checkJnfEligibility(j) === 'DEBARRED_PLACED'" class="w-100">
                      <span class="badge badge-subtle-warning font-mono w-100 text-start">
                        Placed: Dream Offer Unlocks at &gt; {{ (acceptedCtc || 12) * 2 }} LPA
                      </span>
                    </div>
                  </ng-container>
                </div>
              </div>
            </div>

            <div *ngIf="studentJobsFeed.length === 0" class="col-12 text-center py-4 text-muted">
              <div class="saas-empty-state py-3">
                <i class="bi bi-briefcase empty-icon"></i>
                <div class="empty-title">No active drives available</div>
                <div class="empty-desc">New placement drives posted by corporate partners will appear here.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- MY APPLICATIONS ATS PROGRESSION -->
        <div class="enterprise-card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div>
              <h4 class="card-title-heading"><i class="bi bi-diagram-3-fill text-primary me-2"></i>My Applications & ATS Status</h4>
              <p class="body-text mb-0 mt-0.5">Track your candidacy progression across all applied campus drives</p>
            </div>
            <a routerLink="/applications" class="btn btn-secondary btn-sm">View ATS ➔</a>
          </div>

          <div *ngFor="let app of studentApplications" class="p-3 bg-slate-50 rounded-10 border mb-2.5">
            <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap">
              <strong class="text-slate-900">{{ app.job?.title || 'Software Engineer' }} ({{ app.job?.companyName || 'Company' }})</strong>
              <span class="badge badge-subtle-primary font-mono">Stage: {{ app.status }}</span>
            </div>

            <div class="d-flex gap-1.5 flex-wrap">
              <span class="badge" [class.badge-subtle-success]="true">1. Applied ✓</span>
              <span class="badge" [class.badge-subtle-success]="app.status !== 'Applied'" [class.badge-subtle-secondary]="app.status === 'Applied'">2. Shortlist</span>
              <span class="badge" [class.badge-subtle-success]="app.status.includes('Test') || app.status.includes('Interview') || app.status === 'Selected'" [class.badge-subtle-secondary]="!app.status.includes('Test') && !app.status.includes('Interview') && app.status !== 'Selected'">3. Assessment</span>
              <span class="badge" [class.badge-subtle-success]="app.status.includes('Technical') || app.status.includes('HR') || app.status === 'Selected'" [class.badge-subtle-secondary]="!app.status.includes('Technical') && !app.status.includes('HR') && app.status !== 'Selected'">4. Interview</span>
              <span class="badge" [class.badge-subtle-success]="app.status === 'Selected'" [class.badge-subtle-secondary]="app.status !== 'Selected'">5. Offer</span>
            </div>
          </div>

          <div *ngIf="studentApplications.length === 0" class="text-center py-4 text-muted">
            <div class="saas-empty-state py-3">
              <i class="bi bi-inbox empty-icon"></i>
              <div class="empty-title">No applications submitted</div>
              <div class="empty-desc">Explore available drives above to apply for suitable campus placement openings.</div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- MODALS -->
      <!-- POST JNF MODAL -->
      <div class="modal fade" id="recruiterJnfModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900">
                <i class="bi bi-file-earmark-plus-fill text-primary me-2"></i> Post Job Notification Form (JNF)
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="jobForm" (ngSubmit)="onCreateRecruiterJob()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Profile Designation *</label>
                    <input type="text" formControlName="title" class="form-control" placeholder="Software Engineer" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Company Name *</label>
                    <input type="text" formControlName="companyName" class="form-control" placeholder="Google India" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">CTC Package (LPA) *</label>
                    <input type="number" step="0.5" formControlName="salaryPackage" class="form-control" placeholder="18.0" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Open Positions</label>
                    <input type="number" formControlName="openPositions" class="form-control" placeholder="10" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Job Location *</label>
                    <input type="text" formControlName="location" class="form-control" placeholder="Bangalore" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Min CGPA Cutoff *</label>
                    <input type="number" step="0.1" formControlName="minCgpa" class="form-control" placeholder="7.5" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Max Backlogs Allowed *</label>
                    <input type="number" formControlName="maxBacklogs" class="form-control" placeholder="0" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">10th Grade Cutoff %</label>
                    <input type="number" formControlName="min10thPercent" class="form-control" placeholder="75" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Application Expiry Deadline *</label>
                    <input type="datetime-local" formControlName="deadline" class="form-control" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">JNF Description & Role Overview *</label>
                    <textarea formControlName="description" class="form-control" rows="3" placeholder="Describe role requirements and technology stack..."></textarea>
                  </div>
                </div>

                <div class="mt-4 text-end border-top pt-3">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" [disabled]="jobForm.invalid" class="btn btn-primary" data-bs-dismiss="modal">
                    Publish JNF Drive ➔
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- INVITE RECRUITER MODAL -->
      <div class="modal fade" id="inviteRecruiterModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900">
                <i class="bi bi-envelope-plus text-primary me-2"></i> Invite Corporate Recruiter
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Recruiter Name</label>
                <input type="text" [(ngModel)]="inviteName" class="form-control" placeholder="Sarah Jenkins" />
              </div>
              <div class="mb-3">
                <label class="form-label">Recruiter Email Address</label>
                <input type="email" [(ngModel)]="inviteEmail" class="form-control" placeholder="careers@company.com" />
              </div>
              <div class="mb-3">
                <label class="form-label">Company Name</label>
                <input type="text" [(ngModel)]="inviteCompany" class="form-control" placeholder="Google India" />
              </div>

              <div class="mt-4 text-end border-top pt-3">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" (click)="onSendInvitation()" data-bs-dismiss="modal">
                  Send Invitation ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SCHEDULE INTERVIEW MODAL -->
      <div class="modal fade" id="scheduleInterviewModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 p-2">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-slate-900">
                <i class="bi bi-calendar-plus text-primary me-2"></i> Schedule Interview Round
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Select Job Drive</label>
                <select [(ngModel)]="newInterviewJobId" class="form-select">
                  <option *ngFor="let j of recruiterJobs" [value]="j._id">{{ j.companyName }} - {{ j.title }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Candidate Student</label>
                <select [(ngModel)]="newInterviewStudentId" class="form-select">
                  <option *ngFor="let app of applications" [value]="app.student?._id || app.student">{{ app.studentName }} ({{ app.studentEmail }})</option>
                </select>
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Round Name</label>
                  <input type="text" [(ngModel)]="newInterviewRound" class="form-control" placeholder="Technical Round 1" />
                </div>
                <div class="col-6">
                  <label class="form-label">Round Number</label>
                  <input type="number" [(ngModel)]="newInterviewRoundNum" class="form-control" value="1" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Interview Date & Time</label>
                <input type="datetime-local" [(ngModel)]="newInterviewDate" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Meeting Link</label>
                <input type="text" [(ngModel)]="newInterviewMeetingLink" class="form-control" placeholder="https://meet.google.com/abc-defg-hij" />
              </div>

              <div class="mt-4 text-end border-top pt-3">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" (click)="onScheduleInterviewSubmit()" data-bs-dismiss="modal">
                  Confirm Schedule ➔
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
  hasPieChartData: boolean = false;
  hasBarChartData: boolean = false;
  isLoadingAnalytics: boolean = true;
  analyticsError: string | null = null;

  jobForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    companyName: ['Google India', Validators.required],
    salaryPackage: [18.0, [Validators.required, Validators.min(0)]],
    openPositions: [10, [Validators.required, Validators.min(1)]],
    location: ['Bangalore', Validators.required],
    minCgpa: [7.5, [Validators.required, Validators.min(0), Validators.max(10)]],
    maxBacklogs: [0, [Validators.required, Validators.min(0)]],
    min10thPercent: [75, [Validators.required, Validators.min(0)]],
    deadline: [new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 16), Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
    this.initChartOptions();

    // 1. Instant Cache Hydration to prevent 0/0 flicker
    const cachedAnalytics = this.reportService.getCurrentAnalytics();
    if (cachedAnalytics) {
      this.analytics = cachedAnalytics;
      this.isLoadingAnalytics = false;
      this.updateChartsWithLiveData(cachedAnalytics);
    }

    // 2. Subscribe to reactive analytics stream
    this.reportService.analytics$.subscribe((data) => {
      if (data) {
        this.analytics = data;
        this.isLoadingAnalytics = false;
        this.updateChartsWithLiveData(data);
      }
    });

    // 3. Fetch latest live MongoDB data
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
          this.isLoadingAnalytics = false;
          this.analyticsError = null;
          this.updateChartsWithLiveData(res.data);
        }
      },
      error: (err) => {
        console.error('Failed to fetch analytics:', err);
        this.isLoadingAnalytics = false;
        // Keep existing valid analytics data intact instead of resetting to null/zero
        if (!this.analytics) {
          this.analyticsError = 'Unable to connect to live telemetry API';
        }
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

    this.interviewService.getInterviews().subscribe({
      next: (res) => {
        this.liveInterviews = res.data || [];
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

  verifyAndFreezeStudent(studentId: string): void {
    this.studentService.verifyStudentProfile(studentId, 'approve').subscribe({
      next: () => {
        this.notify.showSuccess('Student verified & academic credentials frozen!');
        this.loadAdminOperationsData();
        this.loadAnalyticsData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Failed to verify student');
      }
    });
  }

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

  advanceAtsStage(appId: string, status: string): void {
    this.applicationService.updateStatus(appId, status).subscribe({
      next: () => {
        this.notify.showSuccess(`Advanced candidate stage to [${status}]!`);
        this.loadRecruiterDashboardData();
        this.loadAnalyticsData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Failed to update candidate status');
      }
    });
  }

  acceptLoiOffer(offer: Offer): void {
    this.offerService.respondToOffer(offer._id!, 'Accept').subscribe({
      next: () => {
        this.acceptedCtc = offer.packageOffered;
        this.notify.showSuccess(`Offer accepted! You are officially placed at ${offer.companyName}.`);
        this.loadStudentOffers();
        this.loadAnalyticsData();
        this.loadLiveActivities();
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Failed to accept offer');
      }
    });
  }

  onInjectDemoData(): void {
    this.isInjectingDemo = true;
    this.noticeService.injectDemoData().subscribe({
      next: () => {
        this.isInjectingDemo = false;
        this.notify.showSuccess('Demo records seeded successfully!');
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
        this.notify.showSuccess('Placement ledger exported as Excel (.xlsx)!');
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
    return this.analytics.unplacedStudents !== undefined 
      ? this.analytics.unplacedStudents 
      : Math.max(0, (this.analytics.totalStudents || 0) - (this.analytics.placedStudents || 0));
  }

  getShortlistedCount(): number {
    return this.applications.filter((a) => a.status === 'Resume Shortlisted' || a.status === 'Technical Interview Cleared' || a.status === 'Aptitude Test Cleared').length;
  }

  getSelectedCount(): number {
    return this.applications.filter((a) => a.status === 'HR Interview Cleared' || a.status === 'Selected').length;
  }

  getAssessmentsCount(): number {
    return this.analytics?.totalAssessments || this.analytics?.funnel?.aptitude || 2;
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
        this.notify.showSuccess('Interview scheduled and notification dispatched!');
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
        this.notify.showSuccess('Application submitted successfully for this drive!');
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
      case 'Accepted': return 'badge badge-subtle-success font-mono';
      case 'Declined': return 'badge badge-subtle-danger font-mono';
      default: return 'badge badge-subtle-warning font-mono';
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
        this.notify.showSuccess(`Invitation email dispatched to ${this.inviteEmail}`);
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
        this.notify.showSuccess('Job Notification Form (JNF) published!');
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
      series: [1, 0],
      chart: { type: 'donut', height: 260, toolbar: { show: false } },
      labels: ['Placed Candidates', 'Unplaced Candidates'],
      colors: ['#10B981', '#F59E0B'],
      legend: { position: 'bottom' },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
    };

    this.barChartOptions = {
      series: [{ name: 'Average Package (LPA)', data: [] }],
      chart: { type: 'bar', height: 270, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 } },
      colors: ['#0F766E'],
      dataLabels: { enabled: true },
      xaxis: { categories: [] },
      yaxis: { labels: { formatter: (val: number) => `${val} LPA` } },
      tooltip: { y: { formatter: (val: number) => `${val} LPA` } },
      legend: { show: false }
    };
  }

  private updateChartsWithLiveData(data: AnalyticsData): void {
    const placed = Number(data.placedStudents || 0);
    const unplaced = Math.max(0, Number(data.totalStudents || 0) - placed);
    const total = placed + unplaced;

    if (total > 0) {
      this.hasPieChartData = true;
      this.pieChartOptions = {
        series: [placed, unplaced],
        chart: { type: 'donut', height: 260, toolbar: { show: false } },
        labels: [`Placed (${placed})`, `Unplaced (${unplaced})`],
        colors: ['#10B981', '#F59E0B'],
        legend: { position: 'bottom' },
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
      };
    } else {
      this.hasPieChartData = false;
    }

    if (data.branchWise && data.branchWise.length > 0) {
      const validBranches = data.branchWise.filter((b) => (b.avgPackage || 0) > 0 || (b.total || 0) > 0);
      
      if (validBranches.length > 0) {
        const categories = validBranches.map((b) => b.branch ? b.branch.replace('B.Tech ', '') : 'General');
        const hasSalaryMetrics = validBranches.some((b) => (b.avgPackage || 0) > 0);
        
        const seriesName = hasSalaryMetrics ? 'Average CTC (LPA)' : 'Enrolled Candidates';
        const values = hasSalaryMetrics 
          ? validBranches.map((b) => Number((b.avgPackage || 0).toFixed(1)))
          : validBranches.map((b) => Number(b.total || 0));

        this.hasBarChartData = true;
        this.barChartOptions = {
          series: [
            {
              name: seriesName,
              data: values
            }
          ],
          chart: {
            type: 'bar',
            height: 270,
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 600 }
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '45%',
              borderRadius: 6,
              distributed: true,
              dataLabels: {
                position: 'top'
              }
            }
          },
          colors: ['#0F766E', '#0284C7', '#10B981', '#F59E0B', '#6366F1', '#EC4899'],
          dataLabels: {
            enabled: true,
            formatter: (val: any) => hasSalaryMetrics ? `${val} LPA` : `${val}`,
            offsetY: -20,
            style: {
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              colors: ['#1E293B']
            }
          },
          xaxis: {
            categories,
            labels: {
              style: {
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600
              }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
          },
          yaxis: {
            title: {
              text: hasSalaryMetrics ? 'Package in LPA' : 'Candidates',
              style: {
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748B'
              }
            },
            labels: {
              formatter: (val: number) => hasSalaryMetrics ? `${val} LPA` : `${val}`,
              style: {
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace'
              }
            }
          },
          tooltip: {
            y: {
              formatter: (val: number) => hasSalaryMetrics ? `${val} LPA` : `${val} Candidates`
            }
          },
          legend: {
            show: false
          }
        };
      } else {
        this.hasBarChartData = false;
      }
    } else {
      this.hasBarChartData = false;
    }
  }
}

