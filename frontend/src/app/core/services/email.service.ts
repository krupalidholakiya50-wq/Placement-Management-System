import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmailLogItem {
  _id: string;
  recipient: string;
  recipientName?: string;
  subject: string;
  templateType: string;
  status: 'Delivered' | 'Failed' | 'Configuration Required';
  errorDetails?: string;
  sentBy?: any;
  createdAt: string;
}

export interface EmailStatusResponse {
  success: boolean;
  isConfigured: boolean;
  message: string;
  counts: {
    total: number;
    delivered: number;
    failed: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/emails`;

  getEmailLogs(): Observable<{ success: boolean; count: number; isSmtpConfigured: boolean; data: EmailLogItem[] }> {
    return this.http.get<{ success: boolean; count: number; isSmtpConfigured: boolean; data: EmailLogItem[] }>(`${this.apiUrl}/logs`);
  }

  getSmtpStatus(): Observable<EmailStatusResponse> {
    return this.http.get<EmailStatusResponse>(`${this.apiUrl}/status`);
  }

  sendEmail(payload: {
    to: string;
    subject: string;
    templateType?: string;
    html?: string;
    recipientName?: string;
    templateData?: Record<string, any>;
  }): Observable<{ success: boolean; message: string; data?: any }> {
    return this.http.post<{ success: boolean; message: string; data?: any }>(`${this.apiUrl}/send`, payload);
  }
}
