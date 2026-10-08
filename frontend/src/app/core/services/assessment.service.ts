import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Assessment,
  StartAssessmentResponse,
  SubmitAssessmentResponse,
  AssessmentAttemptDetail
} from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assessments`;

  // Admin / Recruiter APIs
  getAssessments(params?: { job?: string; status?: string }): Observable<{ success: boolean; count: number; data: Assessment[] }> {
    return this.http.get<{ success: boolean; count: number; data: Assessment[] }>(this.apiUrl, { params });
  }

  getAssessmentById(id: string): Observable<{ success: boolean; data: Assessment }> {
    return this.http.get<{ success: boolean; data: Assessment }>(`${this.apiUrl}/${id}`);
  }

  createAssessment(payload: Partial<Assessment>): Observable<{ success: boolean; message: string; data: Assessment }> {
    return this.http.post<{ success: boolean; message: string; data: Assessment }>(this.apiUrl, payload);
  }

  updateAssessment(id: string, payload: Partial<Assessment>): Observable<{ success: boolean; message: string; data: Assessment }> {
    return this.http.put<{ success: boolean; message: string; data: Assessment }>(`${this.apiUrl}/${id}`, payload);
  }

  deleteAssessment(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  publishAssessment(id: string): Observable<{ success: boolean; message: string; data: Assessment; dispatchedCount: number }> {
    return this.http.put<{ success: boolean; message: string; data: Assessment; dispatchedCount: number }>(`${this.apiUrl}/${id}/publish`, {});
  }

  getAssessmentAttempts(id: string): Observable<{ success: boolean; count: number; data: AssessmentAttemptDetail[] }> {
    return this.http.get<{ success: boolean; count: number; data: AssessmentAttemptDetail[] }>(`${this.apiUrl}/${id}/attempts`);
  }

  shortlistFromAssessment(id: string, payload: { studentIds?: string[]; targetStatus?: string; note?: string }): Observable<{ success: boolean; message: string; updatedCount: number }> {
    return this.http.post<{ success: boolean; message: string; updatedCount: number }>(`${this.apiUrl}/${id}/shortlist`, payload);
  }

  // Student APIs
  getStudentAssessments(): Observable<{ success: boolean; count: number; data: Assessment[] }> {
    return this.http.get<{ success: boolean; count: number; data: Assessment[] }>(`${this.apiUrl}/student/my`);
  }

  startAssessment(id: string): Observable<StartAssessmentResponse> {
    return this.http.post<StartAssessmentResponse>(`${this.apiUrl}/${id}/start`, {});
  }

  submitAssessment(id: string, payload: { attemptId: string; answers: Array<{ questionIndex: number; selectedOption: number }> }): Observable<SubmitAssessmentResponse> {
    return this.http.post<SubmitAssessmentResponse>(`${this.apiUrl}/${id}/submit`, payload);
  }
}
