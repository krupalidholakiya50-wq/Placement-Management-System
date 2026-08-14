import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Application } from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  getApplications(filters: any = {}): Observable<{ success: boolean; count: number; data: Application[] }> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<{ success: boolean; count: number; data: Application[] }>(this.apiUrl, { params });
  }

  getMyApplications(): Observable<{ success: boolean; count: number; data: Application[] }> {
    return this.http.get<{ success: boolean; count: number; data: Application[] }>(`${this.apiUrl}/my`);
  }

  getApplicationById(id: string): Observable<{ success: boolean; data: Application }> {
    return this.http.get<{ success: boolean; data: Application }>(`${this.apiUrl}/${id}`);
  }

  applyForJob(data: { jobId: string }): Observable<{ success: boolean; message: string; data: Application }> {
    return this.http.post<{ success: boolean; message: string; data: Application }>(this.apiUrl, data);
  }

  updateStatus(id: string, status: string, note?: string): Observable<{ success: boolean; message: string; data: Application }> {
    return this.http.put<{ success: boolean; message: string; data: Application }>(`${this.apiUrl}/${id}/status`, { status, note });
  }

  exportApplicantsToExcel(jobId?: string, status?: string): Observable<Blob> {
    let params = new HttpParams();
    if (jobId) params = params.set('jobId', jobId);
    if (status) params = params.set('status', status);

    return this.http.get(`${this.apiUrl}/export-excel`, {
      params,
      responseType: 'blob'
    });
  }
}
