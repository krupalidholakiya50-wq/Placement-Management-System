import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificationItem {
  _id: string;
  recipient: string;
  recipientRole: 'admin' | 'student' | 'company';
  title: string;
  message: string;
  type: 'DRIVE_ANNOUNCEMENT' | 'APPLICATION_UPDATE' | 'ASSESSMENT_INVITATION' | 'ASSESSMENT_RESULT' | 'INTERVIEW_SCHEDULED' | 'OFFER_EXTENDED' | 'STUDENT_VERIFICATION' | 'COMPANY_APPROVAL' | 'SYSTEM_ALERT';
  relatedEntity?: string;
  relatedEntityId?: string;
  link: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  data: NotificationItem[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  // UI Feedback Toasts
  showSuccess(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['bg-success', 'text-white'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showError(message: string, duration = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['bg-danger', 'text-white'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showInfo(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['bg-info', 'text-white'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Live Backend Notification APIs
  getNotifications(limit = 50): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.apiUrl}?limit=${limit}`);
  }

  getUnreadCount(): Observable<{ success: boolean; count: number }> {
    return this.http.get<{ success: boolean; count: number }>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(id: string): Observable<{ success: boolean; message: string; data: NotificationItem }> {
    return this.http.patch<{ success: boolean; message: string; data: NotificationItem }>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<{ success: boolean; message: string; modifiedCount: number }> {
    return this.http.patch<{ success: boolean; message: string; modifiedCount: number }>(`${this.apiUrl}/mark-all-read`, {});
  }
}
