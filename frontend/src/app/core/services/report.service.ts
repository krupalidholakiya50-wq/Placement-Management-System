import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AnalyticsData {
  totalStudents: number;
  verifiedStudents: number;
  placedStudents: number;
  blacklistedStudents: number;
  unplacedStudents: number;
  totalApplications: number;
  totalJobs: number;
  totalCompanies: number;
  totalOffers: number;
  totalAssessments?: number;
  totalAssessmentAttempts?: number;
  assessmentPassRate?: number;
  placementRate: number;
  highestPackage: number;
  avgPackage: number;
  lowestPackage: number;
  dreamOffersCount: number;
  branchWise: Array<{
    branch: string;
    total: number;
    placed: number;
    percentage: number;
    avgPackage: number;
  }>;
  companyWise: Array<{
    name: string;
    hires: number;
    avgPackage: number;
  }>;
  funnel?: {
    applied: number;
    shortlisted: number;
    aptitude: number;
    technical: number;
    hr: number;
    selected: number;
    rejected: number;
  };
  salarySlabs?: Array<{
    _id: number | string;
    count: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  // Persistent live analytics cache
  private analyticsSubject = new BehaviorSubject<AnalyticsData | null>(null);
  public analytics$ = this.analyticsSubject.asObservable();

  getAnalytics(forceRefresh: boolean = false): Observable<{ success: boolean; data: AnalyticsData }> {
    return this.http.get<{ success: boolean; data: AnalyticsData }>(`${this.apiUrl}/analytics`).pipe(
      tap((res) => {
        if (res && res.success && res.data) {
          this.analyticsSubject.next(res.data);
        }
      })
    );
  }

  getCurrentAnalytics(): AnalyticsData | null {
    return this.analyticsSubject.getValue();
  }
}

