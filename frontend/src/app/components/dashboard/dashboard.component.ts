import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  ApexFill
} from 'ng-apexcharts';
import { AuthService } from '../../core/services/auth.service';
import { StudentService } from '../../core/services/student.service';
import { JobService } from '../../core/services/job.service';
import { CompanyService } from '../../core/services/company.service';
import { ApplicationService } from '../../core/services/application.service';
import { NotificationService } from '../../core/services/notification.service';
import { Student } from '../../core/models/student.model';
import { Job } from '../../core/models/job.model';
import { Company } from '../../core/models/company.model';
import { Application } from '../../core/models/application.model';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
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
  imports: [CommonModule, RouterLink, NgApexchartsModule],
  template: `
    <div>
      <!-- COMPACT HIGH-CONTRAST TPO HERO BANNER FOR ADMIN -->
      <div *ngIf="userRole() === 'admin'" class="tpo-hero-banner p-4 mb-4 position-relative overflow-hidden">
        <div class="row align-items-center g-3">
          <div class="col-lg-8">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-primary text-white rounded-pill px-3 py-1 font-monospace" style="font-size: 0.7rem;">
                <i class="bi bi-shield-check me-1"></i> TPO OPERATIONS CENTER
              </span>
              <span class="badge bg-warning text-dark rounded-pill px-3 py-1 font-monospace" style="font-size: 0.7rem;">
                {{ pendingVerifications.length + pendingDriveApprovals.length }} PENDING TASKS
              </span>
            </div>

            <h2 class="fw-extrabold text-white mb-1">Placement Season 2025 - 2026</h2>
            <p class="text-slate-300 small mb-3">
              Academic Year 2025-2026 • Today is <strong>{{ today | date:'fullDate' }}</strong>
            </p>

            <!-- Standardized Quick Action Shortcuts -->
            <div class="d-flex flex-wrap gap-2">
              <a routerLink="/students" class="btn btn-warning btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm">
                <i class="bi bi-clock-history me-1"></i> Student Verifications ({{ pendingVerifications.length }})
              </a>
              <a routerLink="/jobs" class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold shadow-sm">
                <i class="bi bi-card-heading me-1"></i> Drive Approvals ({{ pendingDriveApprovals.length }})
              </a>
              <a routerLink="/applications" class="btn btn-secondary btn-sm rounded-pill px-3 fw-semibold shadow-sm">
                <i class="bi bi-diagram-3-fill me-1"></i> Pipeline Tracker ({{ applications.length }})
              </a>
              <a routerLink="/reports" class="btn btn-secondary btn-sm rounded-pill px-3 fw-semibold shadow-sm">
                <i class="bi bi-file-earmark-bar-graph me-1"></i> Analytics
              </a>
            </div>
          </div>

          <div class="col-lg-4 text-lg-end d-none d-lg-block">
            <div class="p-3 rounded-16 bg-white bg-opacity-10 border border-white border-opacity-10 backdrop-blur d-inline-block text-center" style="min-width: 200px;">
              <div class="text-warning small text-uppercase font-monospace fw-bold mb-1">PLACEMENT TARGET</div>
              <h2 class="fw-bold text-white mb-0">{{ verifiedCount }} / {{ totalStudentsCount }}</h2>
              <small class="text-slate-300">Profiles Verified & Frozen</small>
            </div>
          </div>
        </div>
      </div>

      <!-- RECRUITER WORKSPACE DASHBOARD HERO -->
      <div *ngIf="userRole() === 'company'" class="tpo-hero-banner p-4 mb-4 position-relative overflow-hidden">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span class="badge bg-primary text-white rounded-pill px-3 py-1 font-monospace mb-2" style="font-size: 0.7rem;">
              RECRUITER PORTAL WORKSPACE
            </span>
            <h2 class="fw-bold text-white mb-1">Welcome, Corporate Recruiter 👋</h2>
            <p class="text-slate-300 small mb-0">Manage published job drives, review applicants & schedule campus interviews.</p>
          </div>
          <a routerLink="/jobs" class="btn btn-warning rounded-pill px-4 fw-bold text-dark shadow-sm">
            <i class="bi bi-plus-circle me-1"></i> Publish New Placement Drive
          </a>
        </div>
      </div>

      <!-- STUDENT WORKSPACE TITLE -->
      <div *ngIf="userRole() === 'student'" class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 rounded-pill px-3 py-1 mb-1 font-monospace">
            STUDENT PLACEMENT PORTAL
          </span>
          <h2 class="fw-bold text-slate-900 mb-0">Welcome, {{ user()?.name }}</h2>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/jobs" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
            <i class="bi bi-building-check me-1"></i> Explore Campus Drives
          </a>
          <a routerLink="/applications" class="btn btn-secondary rounded-pill px-4 fw-semibold shadow-sm">
            <i class="bi bi-diagram-3-fill me-1"></i> My Applications
          </a>
        </div>
      </div>

      <!-- 6 OPERATIONAL STAT CARDS FOR ADMIN (NO OVERLAPS) -->
      <div *ngIf="userRole() === 'admin'" class="row g-3 mb-4">
        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon bg-warning bg-opacity-10 text-warning"><i class="bi bi-clock-history"></i></div>
            <div class="stat-content">
              <div class="stat-label">WAITING VERIFY</div>
              <div class="stat-value">{{ pendingVerifications.length }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon bg-primary bg-opacity-10 text-primary"><i class="bi bi-diagram-3"></i></div>
            <div class="stat-content">
              <div class="stat-label">APPLICATIONS</div>
              <div class="stat-value">{{ applications.length }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon bg-success bg-opacity-10 text-success"><i class="bi bi-lock-fill"></i></div>
            <div class="stat-content">
              <div class="stat-label">VERIFIED & FROZEN</div>
              <div class="stat-value">{{ verifiedCount }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon bg-info bg-opacity-10 text-info"><i class="bi bi-building"></i></div>
            <div class="stat-content">
              <div class="stat-label">RECRUITERS</div>
              <div class="stat-value">{{ companies.length }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon bg-danger bg-opacity-10 text-danger"><i class="bi bi-briefcase"></i></div>
            <div class="stat-content">
              <div class="stat-label">OPEN DRIVES</div>
              <div class="stat-value">{{ recruiterJobs.length }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon bg-secondary bg-opacity-10 text-primary"><i class="bi bi-pie-chart"></i></div>
            <div class="stat-content">
              <div class="stat-label">PLACEMENT RATE</div>
              <div class="stat-value">82.5%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- STUDENT WORKSPACE DASHBOARD WIDGETS -->
      <ng-container *ngIf="userRole() === 'student'">
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-primary bg-opacity-10 text-primary"><i class="bi bi-send-fill"></i></div>
              <div class="stat-content">
                <div class="stat-label">APPLIED DRIVES</div>
                <div class="stat-value">{{ studentApplications.length }}</div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-success bg-opacity-10 text-success"><i class="bi bi-check-circle-fill"></i></div>
              <div class="stat-content">
                <div class="stat-label">PROFILE COMPLETION</div>
                <div class="stat-value">{{ completionPercentage }}%</div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-info bg-opacity-10 text-info"><i class="bi bi-shield-check"></i></div>
              <div class="stat-content">
                <div class="stat-label">VERIFICATION</div>
                <div class="stat-value fs-6">{{ studentProfile?.verificationStatus || 'Draft' }}</div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card-enterprise">
              <div class="stat-icon bg-danger bg-opacity-10 text-danger"><i class="bi bi-file-earmark-pdf"></i></div>
              <div class="stat-content">
                <div class="stat-label">RESUME PDF</div>
                <a [href]="studentProfile?.resumeUrl" target="_blank" class="btn btn-sm btn-secondary rounded-pill px-2 py-0 mt-1 font-monospace" style="font-size: 0.75rem;">
                  Preview ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ADMIN TPO OPERATIONS CENTER WIDGETS -->
      <ng-container *ngIf="userRole() === 'admin'">
        <div class="row g-4 mb-4">
          <!-- Placement Ratio ApexChart -->
          <div class="col-lg-4">
            <div class="enterprise-card p-4 bg-white h-100">
              <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
                <i class="bi bi-pie-chart-fill text-primary me-2"></i>Placed vs Unplaced Ratio
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

          <!-- Average Package by Branch Bar Chart -->
          <div class="col-lg-5">
            <div class="enterprise-card p-4 bg-white h-100">
              <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
                <i class="bi bi-bar-chart-line-fill text-success me-2"></i>Average Package by Department (LPA)
              </h5>
              <div *ngIf="barChartOptions">
                <apx-chart
                  [series]="barChartOptions.series"
                  [chart]="barChartOptions.chart"
                  [xaxis]="barChartOptions.xaxis"
                  [colors]="barChartOptions.colors"
                  [plotOptions]="barChartOptions.plotOptions"
                  [dataLabels]="barChartOptions.dataLabels"
                ></apx-chart>
              </div>
            </div>
          </div>

          <!-- Upcoming Drive Scheduler Calendar -->
          <div class="col-lg-3">
            <div class="enterprise-card p-4 bg-white h-100">
              <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
                <i class="bi bi-calendar-event-fill text-warning me-2"></i>Drive Scheduler
              </h5>
              <div class="upcoming-drives-list">
                <div class="p-2 mb-2 rounded bg-slate-50 border-start border-4 border-primary">
                  <div class="fw-bold text-slate-900 small">Google India - SDE</div>
                  <div class="text-primary font-monospace extra-small"><i class="bi bi-calendar-check me-1"></i>Tomorrow • 10:00 AM</div>
                  <span class="badge bg-primary text-white rounded-pill px-2" style="font-size: 0.65rem;">Auditorium A</span>
                </div>

                <div class="p-2 mb-2 rounded bg-slate-50 border-start border-4 border-success">
                  <div class="fw-bold text-slate-900 small">Microsoft IDC - Cloud</div>
                  <div class="text-success font-monospace extra-small"><i class="bi bi-calendar-check me-1"></i>Aug 18 • 09:30 AM</div>
                  <span class="badge bg-success text-white rounded-pill px-2" style="font-size: 0.65rem;">Lab 302</span>
                </div>

                <div class="p-2 rounded bg-slate-50 border-start border-4 border-warning">
                  <div class="fw-bold text-slate-900 small">AWS - DevOps Drive</div>
                  <div class="text-warning text-dark font-monospace extra-small"><i class="bi bi-calendar-check me-1"></i>Aug 22 • 11:00 AM</div>
                  <span class="badge bg-warning text-dark rounded-pill px-2" style="font-size: 0.65rem;">Online Assessment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private studentService = inject(StudentService);
  private jobService = inject(JobService);
  private companyService = inject(CompanyService);
  private applicationService = inject(ApplicationService);

  today = new Date();
  user = this.authService.currentUser;
  userRole = () => this.authService.getUserRole() || 'student';

  studentProfile: Student | null = null;
  studentApplications: Application[] = [];
  completionPercentage = 80;

  recruiterJobs: Job[] = [];
  companies: Company[] = [];
  applications: Application[] = [];
  pendingVerifications: Student[] = [];
  pendingDriveApprovals: Job[] = [];
  totalStudentsCount = 0;
  verifiedCount = 0;

  pieChartOptions!: PieChartOptions;
  barChartOptions!: BarChartOptions;

  ngOnInit(): void {
    this.initChartOptions();

    if (this.userRole() === 'student') {
      this.studentService.getProfile().subscribe({
        next: (res) => {
          this.studentProfile = res.data;
          this.completionPercentage = res.completionPercentage || res.data?.profileCompletion || 80;
        }
      });
      this.applicationService.getMyApplications().subscribe({
        next: (res) => { this.studentApplications = res.data || []; }
      });
    } else if (this.userRole() === 'admin') {
      this.loadAdminOperationsData();
    } else if (this.userRole() === 'company') {
      this.jobService.getJobs().subscribe({
        next: (res) => { this.recruiterJobs = res.data || []; }
      });
      this.applicationService.getApplications().subscribe({
        next: (res) => { this.applications = res.data || []; }
      });
    }
  }

  loadAdminOperationsData(): void {
    this.studentService.getStudents().subscribe({
      next: (res) => {
        const all = res.data || [];
        this.totalStudentsCount = all.length;
        this.pendingVerifications = all.filter((s) => s.verificationStatus === 'Pending Verification');
        this.verifiedCount = all.filter((s) => s.verificationStatus === 'Verified').length;
      }
    });

    this.jobService.getJobs().subscribe({
      next: (res) => {
        this.recruiterJobs = res.data || [];
        this.pendingDriveApprovals = (res.data || []).filter((j) => j.approvalStatus === 'Pending Admin Approval');
      }
    });

    this.companyService.getCompanies().subscribe({
      next: (res) => { this.companies = res.data || []; }
    });

    this.applicationService.getApplications().subscribe({
      next: (res) => { this.applications = res.data || []; }
    });
  }

  private initChartOptions(): void {
    this.pieChartOptions = {
      series: [82.5, 17.5],
      chart: {
        type: 'donut',
        height: 250
      },
      labels: ['Placed Candidates (82.5%)', 'Unplaced Candidates (17.5%)'],
      colors: ['#10B981', '#F59E0B'],
      legend: {
        position: 'bottom'
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: 'bottom' }
          }
        }
      ]
    };

    this.barChartOptions = {
      series: [
        {
          name: 'Average Package (LPA)',
          data: [16.5, 14.8, 11.2, 8.5]
        }
      ],
      chart: {
        type: 'bar',
        height: 250
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '45%'
        }
      },
      colors: ['#0EA5E9'],
      dataLabels: {
        enabled: true
      },
      xaxis: {
        categories: ['CSE', 'IT', 'ECE', 'ME']
      }
    };
  }
}
