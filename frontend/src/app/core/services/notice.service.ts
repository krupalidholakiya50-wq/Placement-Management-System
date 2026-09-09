import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notice } from '../models/notice.model';

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notices`;

  getNotices(): Observable<{ success: boolean; count: number; data: Notice[] }> {
    return this.http.get<{ success: boolean; count: number; data: Notice[] }>(this.apiUrl);
  }

  createNotice(notice: Partial<Notice>): Observable<{ success: boolean; message: string; data: Notice; dispatchedCount?: number }> {
    return this.http.post<{ success: boolean; message: string; data: Notice; dispatchedCount?: number }>(this.apiUrl, notice);
  }

  sendTestEmail(toEmail: string, subject?: string, message?: string): Observable<{ success: boolean; message: string; result?: any }> {
    return this.http.post<{ success: boolean; message: string; result?: any }>(`${this.apiUrl}/test-email`, { toEmail, subject, message });
  }

  deleteNotice(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  injectDemoData(): Observable<{ success: boolean; message: string; counts?: any }> {
    return this.http.post<{ success: boolean; message: string; counts?: any }>(`${environment.apiUrl}/seeder/inject-demo`, {});
  }
}



