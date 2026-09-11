import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, AnalyticsData } from '../../core/services/report.service';
import { ApplicationService } from '../../core/services/application.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid px-4 py-3">
      <!-- Header & Export Actions -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-slate-900 mb-1"><i class="bi bi-bar-chart-line-fill text-primary me-2"></i>Executive Placement Analytics & Report Hub</h3>
          <p class="text-muted mb-0">Live placement statistics, package distribution, branch analytics & printable reports</p>
        </div>

        <!-- 1-Click Export Engine Buttons -->
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-primary rounded-pill px-3 fw-bold shadow-sm" (click)="printReport()">
            <i class="bi bi-printer-fill me-1"></i> Print / Save PDF
          </button>
          <button class="btn btn-success rounded-pill px-3 fw-bold shadow-sm" (click)="exportMasterExcel()">
            <i class="bi bi-file-earmark-excel-fill me-1"></i> Export Excel (.xlsx)
          </button>
          <button class="btn btn-secondary rounded-pill px-3 fw-semibold shadow-sm" (click)="exportSummaryCSV()">
            <i class="bi bi-file-earmark-spreadsheet me-1"></i> Summary CSV
          </button>
        </div>
      </div>

      <!-- 6 EXECUTIVE PLACEMENT KPI CARDS -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise bg-success bg-opacity-10 border-success border-opacity-20">
            <div class="stat-icon bg-white text-success shadow-sm"><i class="bi bi-person-check-fill"></i></div>
            <div class="stat-content">
              <div class="stat-label text-success">PLACEMENT RATE</div>
              <div class="stat-value">{{ analytics?.placementRate || 0 }}%</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon bg-warning bg-opacity-10 text-warning"><i class="bi bi-trophy-fill"></i></div>
            <div class="stat-content">
              <div class="stat-label">HIGHEST PACKAGE</div>
              <div class="stat-value">{{ analytics?.highestPackage || 0 }} <small class="fs-6 text-muted fw-bold">LPA</small></div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon bg-primary bg-opacity-10 text-primary"><i class="bi bi-graph-up-arrow"></i></div>
            <div class="stat-content">
              <div class="stat-label">AVERAGE PACKAGE</div>
              <div class="stat-value">{{ analytics?.avgPackage || 0 }} <small class="fs-6 text-muted fw-bold">LPA</small></div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon bg-info bg-opacity-10 text-info"><i class="bi bi-award-fill"></i></div>
            <div class="stat-content">
              <div class="stat-label">DREAM OFFERS</div>
              <div class="stat-value">{{ analytics?.dreamOffersCount || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise bg-danger bg-opacity-10 border-danger border-opacity-20">
            <div class="stat-icon bg-white text-danger shadow-sm"><i class="bi bi-slash-circle-fill"></i></div>
            <div class="stat-content">
              <div class="stat-label text-danger">BLACKLISTED</div>
              <div class="stat-value">{{ analytics?.blacklistedStudents || 0 }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon bg-secondary bg-opacity-10 text-primary"><i class="bi bi-building"></i></div>
            <div class="stat-content">
              <div class="stat-label">PARTNERS HIRING</div>
              <div class="stat-value">{{ analytics?.totalCompanies || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 7-STAGE ATS APPLICATION FUNNEL -->
      <div class="enterprise-card p-4 bg-white mb-4" *ngIf="analytics?.funnel">
        <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
          <i class="bi bi-funnel-fill text-primary me-2"></i>7-Stage Recruitment ATS Conversion Funnel
        </h5>
        <div class="row g-2 text-center">
          <div class="col-4 col-md">
            <div class="p-3 bg-slate-50 rounded-12 border">
              <small class="text-muted font-monospace d-block">APPLIED</small>
              <h4 class="fw-bold text-slate-900 mb-0">{{ analytics?.funnel?.applied || 0 }}</h4>
            </div>
          </div>
          <div class="col-4 col-md">
            <div class="p-3 bg-slate-50 rounded-12 border">
              <small class="text-muted font-monospace d-block">SHORTLISTED</small>
              <h4 class="fw-bold text-info mb-0">{{ analytics?.funnel?.shortlisted || 0 }}</h4>
            </div>
          </div>
          <div class="col-4 col-md">
            <div class="p-3 bg-slate-50 rounded-12 border">
              <small class="text-muted font-monospace d-block">ASSESSMENT</small>
              <h4 class="fw-bold text-primary mb-0">{{ analytics?.funnel?.aptitude || 0 }}</h4>
            </div>
          </div>
          <div class="col-4 col-md">
            <div class="p-3 bg-slate-50 rounded-12 border">
              <small class="text-muted font-monospace d-block">TECH INTERVIEW</small>
              <h4 class="fw-bold text-purple mb-0">{{ analytics?.funnel?.technical || 0 }}</h4>
            </div>
          </div>
          <div class="col-4 col-md">
            <div class="p-3 bg-slate-50 rounded-12 border">
              <small class="text-muted font-monospace d-block">HR ROUND</small>
              <h4 class="fw-bold text-warning mb-0">{{ analytics?.funnel?.hr || 0 }}</h4>
            </div>
          </div>
          <div class="col-4 col-md">
            <div class="p-3 bg-success bg-opacity-10 border border-success border-opacity-30 rounded-12">
              <small class="text-success font-monospace d-block fw-bold">SELECTED / OFFERS</small>
              <h4 class="fw-bold text-success mb-0">{{ analytics?.funnel?.selected || 0 }}</h4>
            </div>
          </div>
        </div>
      </div>

      <!-- ANALYTICS CARDS & TABLES -->
      <div class="row g-4">
        <!-- Branch-Wise Placement Distribution -->
        <div class="col-lg-6">
          <div class="enterprise-card p-4 bg-white h-100">
            <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
              <i class="bi bi-diagram-3 text-primary me-2"></i>Branch-Wise Placement Performance
            </h5>

            <div *ngFor="let b of analytics?.branchWise" class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold text-slate-900 small">{{ b.branch }}</span>
                <span class="font-monospace text-primary fw-bold small">{{ b.placed }}/{{ b.total }} Placed ({{ b.percentage }}%)</span>
              </div>
              <div class="progress mb-1" style="height: 10px;">
                <div class="progress-bar bg-primary" [style.width.%]="b.percentage"></div>
              </div>
              <small class="text-muted">Average Package Offered: <strong>{{ b.avgPackage }} LPA</strong></small>
            </div>

            <div *ngIf="!analytics?.branchWise || analytics?.branchWise?.length === 0" class="text-center py-4 text-muted">
              No branch placement metrics available yet.
            </div>
          </div>
        </div>

        <!-- Top Recruiter Company Distribution -->
        <div class="col-lg-6">
          <div class="enterprise-card p-4 bg-white h-100">
            <h5 class="fw-bold text-slate-900 mb-3 border-bottom pb-2">
              <i class="bi bi-building text-warning me-2"></i>Corporate Recruiter Hiring Distribution
            </h5>

            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead class="bg-light">
                  <tr class="text-muted small text-uppercase font-monospace">
                    <th>Company Partner</th>
                    <th>Students Placed</th>
                    <th>Average Package Offered</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of analytics?.companyWise">
                    <td class="fw-bold text-slate-900">{{ c.name }}</td>
                    <td><span class="badge bg-primary rounded-pill px-3 py-1 font-monospace">{{ c.hires }} Offers</span></td>
                    <td class="fw-bold text-success font-monospace">{{ c.avgPackage }} LPA</td>
                  </tr>
                  <tr *ngIf="!analytics?.companyWise || analytics?.companyWise?.length === 0">
                    <td colspan="3" class="text-center py-4 text-muted">No corporate hiring data recorded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private applicationService = inject(ApplicationService);
  private notify = inject(NotificationService);

  analytics: AnalyticsData | null = null;

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  fetchAnalytics(): void {
    this.reportService.getAnalytics().subscribe({
      next: (res) => {
        this.analytics = res.data;
      },
      error: () => {
        this.notify.showError('Failed to fetch live analytics data');
      }
    });
  }

  printReport(): void {
    window.print();
  }

  exportMasterExcel(): void {
    this.applicationService.exportApplicantsToExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Master_Placement_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notify.showSuccess('📊 Master Placement Ledger exported as Excel (.xlsx)!');
      },
      error: (err) => {
        this.notify.showError(err?.error?.message || 'Excel export failed');
      }
    });
  }

  exportSummaryCSV(): void {
    if (!this.analytics) {
      this.notify.showError('No analytics data available to export');
      return;
    }

    let csv = 'Branch,Total Students,Placed Students,Placement Rate (%),Avg Package (LPA)\n';
    (this.analytics.branchWise || []).forEach(b => {
      csv += `"${b.branch}",${b.total},${b.placed},${b.percentage}%,${b.avgPackage}\n`;
    });

    csv += '\nCompany Partner,Hires,Average Package (LPA)\n';
    (this.analytics.companyWise || []).forEach(c => {
      csv += `"${c.name}",${c.hires},${c.avgPackage}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Placement_Summary_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.notify.showSuccess('Summary CSV downloaded successfully!');
  }
}
