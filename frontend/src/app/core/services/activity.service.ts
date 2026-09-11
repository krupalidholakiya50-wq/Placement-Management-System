import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ActivityItem {
  _id: string;
  type: 'JOB_POSTED' | 'APPLICATION_SUBMITTED' | 'STATUS_UPDATED' | 'OFFER_EXTENDED' | 'NOTICE_POSTED' | 'STUDENT_VERIFIED' | 'COMPANY_APPROVED' | 'INTERVIEW_SCHEDULED';
  title: string;
  description: string;
  actor: string;
  actorRole: string;
  targetBranch?: string;
  relatedId?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/activities`;

  getActivities(limit: number = 15): Observable<{ success: boolean; count: number; data: ActivityItem[] }> {
    return this.http.get<{ success: boolean; count: number; data: ActivityItem[] }>(`${this.apiUrl}?limit=${limit}`);
  }
}
