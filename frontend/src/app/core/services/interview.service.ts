import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InterviewSchedule {
  _id: string;
  job: any;
  student: any;
  company: any;
  roundName: string;
  roundNumber: number;
  interviewDate: string;
  meetingLink?: string;
  interviewerName?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  instructions?: string;
  feedback?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/interviews`;

  getInterviews(): Observable<{ success: boolean; count: number; data: InterviewSchedule[] }> {
    return this.http.get<{ success: boolean; count: number; data: InterviewSchedule[] }>(this.apiUrl);
  }

  scheduleInterview(payload: Partial<InterviewSchedule>): Observable<{ success: boolean; message: string; data: InterviewSchedule }> {
    return this.http.post<{ success: boolean; message: string; data: InterviewSchedule }>(this.apiUrl, payload);
  }

  updateInterview(id: string, payload: Partial<InterviewSchedule>): Observable<{ success: boolean; message: string; data: InterviewSchedule }> {
    return this.http.put<{ success: boolean; message: string; data: InterviewSchedule }>(`${this.apiUrl}/${id}`, payload);
  }

  deleteInterview(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
