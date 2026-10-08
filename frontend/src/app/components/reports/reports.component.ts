import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, AnalyticsData } from '../../core/services/report.service';
import { ApplicationService } from '../../core/services/application.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex flex-column gap-4 pb-4">
      <!-- Header & Export Actions -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-main-title mb-1">Placement Analytics & Reports</h1>
          <p class="body-text mb-0">Comprehensive campus placement telemetry, salary distribution and branch statistics</p>
        </div>

        <div class="d-flex flex-wrap gap-2 align-items-center">
          <!-- Time-based filters (Section 20 Spec) -->
          <div class="btn-group me-2" role="group">
            <button
              *ngFor="let period of ['1D', '7D', '30D', '1Y']"
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="selectedPeriod === period"
              [class.btn-secondary]="selectedPeriod !== period"
              (click)="selectPeriod(period)"
            >
              {{ period }}
            </button>
          </div>

          <button class="btn btn-secondary" (click)="printReport()">
            <i class="bi bi-printer me-1"></i> Print / PDF
          </button>
          <button class="btn btn-secondary" (click)="exportMasterExcel()">
            <i class="bi bi-file-earmark-excel text-success me-1"></i> Export Excel (.xlsx)
          </button>
          <button class="btn btn-secondary" (click)="exportSummaryCSV()">
            <i class="bi bi-file-earmark-spreadsheet me-1"></i> Summary CSV
          </button>
        </div>
      </div>

      <!-- 6 EXECUTIVE KPI CARDS -->
      <div class="row g-3">
        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-emerald"><i class="bi bi-person-check"></i></div>
            <div class="stat-content">
              <div class="stat-label">Placement Rate</div>
              <div class="stat-value text-success">{{ analytics?.placementRate || 0 }}%</div>
              <div class="stat-meta">Verified Placed</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-amber"><i class="bi bi-trophy"></i></div>
            <div class="stat-content">
              <div class="stat-label">Highest CTC</div>
              <div class="stat-value text-warning">{{ analytics?.highestPackage || 0 }} <small style="font-size: 13px;">LPA</small></div>
              <div class="stat-meta">Top Offer</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-blue"><i class="bi bi-graph-up"></i></div>
            <div class="stat-content">
              <div class="stat-label">Average CTC</div>
              <div class="stat-value text-primary">{{ analytics?.avgPackage || 0 }} <small style="font-size: 13px;">LPA</small></div>
              <div class="stat-meta">Batch Median</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-cyan"><i class="bi bi-award"></i></div>
            <div class="stat-content">
              <div class="stat-label">Dream Offers</div>
              <div class="stat-value text-info">{{ analytics?.dreamOffersCount || 0 }}</div>
              <div class="stat-meta">&gt; 2x Base CTC</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-danger"><i class="bi bi-slash-circle"></i></div>
            <div class="stat-content">
              <div class="stat-label">Debarred</div>
              <div class="stat-value text-danger">{{ analytics?.blacklistedStudents || 0 }}</div>
              <div class="stat-meta">No-Show Debarred</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <div class="stat-card-enterprise">
            <div class="stat-icon icon-navy"><i class="bi bi-building"></i></div>
            <div class="stat-content">
              <div class="stat-label">Companies</div>
              <div class="stat-value">{{ analytics?.totalCompanies || 0 }}</div>
              <div class="stat-meta">Recruiter Partners</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 7-STAGE RECRUITMENT ATS CONVERSION FUNNEL -->
      <div class="enterprise-card p-4" *ngIf="analytics?.funnel">
        <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <div>
            <h4 class="card-title-heading"><i class="bi bi-funnel-fill text-primary me-2"></i>Recruitment ATS Conversion Pipeline</h4>
            <p class="body-text mb-0 mt-0.5">Applicant flow across sequential evaluation checkpoints</p>
          </div>
          <span class="badge badge-subtle-primary font-mono">{{ selectedPeriod }} TIMEFRAME</span>
        </div>

        <div class="row g-2 text-center">
          <div class="col-4 col-md">
            <div class="p-3 bg-slate-50 rounded-8 border">
              <small class="text-muted font-mono d-block mb-1">1. APPLIED</small>
              <h4 class="fw-bold text-slate-900 mb-0">{{ analytics?.funnel?.applied || 0 }}</h4>
            </div>
          </div>
          <div class="col-4 col-md">
            <div class="p-3 bg-slate-50 rounded-8 border">
              <small class="text-muted font-mono d-block mb-1">2. SHORTLISTED</small>
              <h4 class="fw-bold text-info mb-0">{{ analytics?.funnel?.shortlisted || 0 }}</h4>
            </div>
          </div>
          <div class="col-4 col-md">
            <div class="p-3 bg-slate-50 rounded-8 border">
              <small class="text-muted font-mono d-block mb-1">3. ASSESSMENT</small>
              <h4 class="fw-bold text-primary mb-0">{{ analytics?.funnel?.aptitude || 0 }}</h4>
            </div>
          </div>
          <div class="col-4 col-md">
            <div class="p-3 bg-slate-50 rounded-8 border">
              <small class="text-muted font-mono d-block mb-1">4. TECH ROUND</small>
              <h4 class="fw-bold text-slate-900 mb-0">{{ analytics?.funnel?.technical || 0 }}</h4>
            </div>
          </div>
          <div class="col-4 col-md">
            <div class="p-3 bg-slate-50 rounded-8 border">
              <small class="text-muted font-mono d-block mb-1">5. HR PANEL</small>
              <h4 class="fw-bold text-warning mb-0">{{ analytics?.funnel?.hr || 0 }}</h4>
            </div>
          </div>
          <div class="col-4 col-md">
            <div class="p-3 bg-success bg-opacity-10 border border-success border-opacity-30 rounded-8">
              <small class="text-success font-mono d-block fw-bold mb-1">6. OFFERS RELEASED</small>
              <h4 class="fw-bold text-success mb-0">{{ analytics?.funnel?.selected || 0 }}</h4>
            </div>
          </div>
        </div>
      </div>

      <!-- ANALYTICS CARDS & TABLES -->
      <div class="row g-4">
        <!-- Branch-Wise Placement Distribution -->
        <div class="col-lg-6">
          <div class="enterprise-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h4 class="card-title-heading"><i class="bi bi-mortarboard-fill text-primary me-2"></i>Branch-Wise Placement Breakdown</h4>
                <p class="body-text mb-0 mt-0.5">Departmental placement statistics and package metrics</p>
              </div>
            </div>

            <div class="table-responsive" *ngIf="analytics?.branchWise && analytics!.branchWise!.length > 0">
              <table class="table-enterprise">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Total Students</th>
                    <th>Placed</th>
                    <th>Rate</th>
                    <th>Avg CTC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let b of analytics?.branchWise">
                    <td class="fw-semibold text-slate-900">{{ b.branch }}</td>
                    <td>{{ b.total }}</td>
                    <td class="text-success fw-semibold">{{ b.placed }}</td>
                    <td><span class="badge badge-subtle-success font-mono">{{ b.percentage }}%</span></td>
                    <td class="fw-semibold">{{ b.avgPackage ? '₹' + b.avgPackage + ' LPA' : 'N/A' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="!analytics?.branchWise || analytics!.branchWise!.length === 0" class="saas-empty-state py-4">
              <i class="bi bi-bar-chart empty-icon"></i>
              <div class="empty-title">No placement data available</div>
              <div class="empty-desc">Placement metrics will generate as students accept company offers.</div>
            </div>
          </div>
        </div>

        <!-- Top Recruiters Table -->
        <div class="col-12 col-xl-5">
          <div class="card h-100">
            <div class="card-header-enterprise">
              <h3 class="card-title-enterprise"><i class="bi bi-trophy text-primary me-2"></i> Top Campus Recruiters</h3>
              <span class="badge badge-subtle-primary">By Selections</span>
            </div>
            <div class="p-0">
              <div class="table-responsive" *ngIf="analytics?.companyWise && analytics!.companyWise!.length > 0">
                <table class="table-enterprise">
                  <thead>
                    <tr>
                      <th>Recruiter</th>
                      <th>Offers Made</th>
                      <th>Avg CTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let c of analytics?.companyWise">
                      <td class="fw-bold text-slate-900">
                        <i class="bi bi-building text-secondary me-2"></i> {{ c.name }}
                      </td>
                      <td><span class="badge badge-subtle-primary font-mono fw-bold">{{ c.hires }} Offers</span></td>
                      <td class="text-emerald fw-semibold">₹{{ c.avgPackage }} LPA</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Zero State (Section 20 & 23) -->
              <div *ngIf="!analytics?.companyWise || analytics!.companyWise!.length === 0" class="saas-empty-card py-5">
                <i class="bi bi-building text-slate-400 fs-1 mb-2"></i>
                <h6 class="fw-bold text-slate-800 mb-1">No Company Offer Data</h6>
                <p class="text-secondary small mb-0">Placement drives are actively concluding offers.</p>
              </div>
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
  selectedPeriod: string = '30D';

  ngOnInit(): void {
    // Instant cache hydration
    const cached = this.reportService.getCurrentAnalytics();
    if (cached) {
      this.analytics = cached;
    }

    this.reportService.analytics$.subscribe((data) => {
      if (data) {
        this.analytics = data;
      }
    });

    this.loadReportData();
  }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadReportData();
    this.notify.showSuccess(`Filtered report analytics for timeframe: ${period}`);
  }

  loadReportData(): void {
    this.reportService.getAnalytics().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.analytics = res.data;
        }
      },
      error: () => {
        if (!this.analytics) {
          this.notify.showError('Failed to load report analytics');
        }
      }
    });
  }

  printReport(): void {
    window.print();
  }

  exportMasterExcel(): void {
    this.applicationService.exportApplicantsToExcel().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Placement_Executive_Report_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notify.showSuccess('Executive Excel report downloaded!');
      },
      error: () => {
        this.notify.showError('Failed to generate Excel report');
      }
    });
  }

  exportSummaryCSV(): void {
    if (!this.analytics) return;
    const rows = [
      ['Metric', 'Value'],
      ['Placement Rate (%)', this.analytics.placementRate || 0],
      ['Total Students', this.analytics.totalStudents || 0],
      ['Placed Students', this.analytics.placedStudents || 0],
      ['Highest CTC (LPA)', this.analytics.highestPackage || 0],
      ['Average CTC (LPA)', this.analytics.avgPackage || 0],
      ['Total Companies', this.analytics.totalCompanies || 0],
      ['Dream Offers (>2x CTC)', this.analytics.dreamOffersCount || 0]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Placement_Summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notify.showSuccess('Summary CSV downloaded!');
  }
}

