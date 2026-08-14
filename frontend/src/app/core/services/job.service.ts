import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Job, EligibilityResult } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getJobs(status?: string): Observable<{ success: boolean; count: number; data: Job[] }> {
    let url = this.apiUrl;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<{ success: boolean; count: number; data: Job[] }>(url);
  }

  getJobById(id: string): Observable<{ success: boolean; data: Job }> {
    return this.http.get<{ success: boolean; data: Job }>(`${this.apiUrl}/${id}`);
  }

  checkEligibility(jobId: string): Observable<EligibilityResult> {
    return this.http.post<EligibilityResult>(`${this.apiUrl}/${jobId}/check-eligibility`, {});
  }

  approveJobDrive(jobId: string, approvalStatus: 'Approved' | 'Rejected'): Observable<{ success: boolean; data: Job }> {
    return this.http.put<{ success: boolean; data: Job }>(`${this.apiUrl}/${jobId}/approve`, { approvalStatus });
  }

  createJob(jobData: Job): Observable<{ success: boolean; message?: string; data: Job }> {
    return this.http.post<{ success: boolean; message?: string; data: Job }>(this.apiUrl, jobData);
  }

  updateJob(id: string, jobData: Job): Observable<{ success: boolean; data: Job }> {
    return this.http.put<{ success: boolean; data: Job }>(`${this.apiUrl}/${id}`, jobData);
  }

  deleteJob(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
