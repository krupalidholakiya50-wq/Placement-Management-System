import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  uploadResume(file: File): Observable<{ success: boolean; message: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('resume', file);
    return this.http.post<{ success: boolean; message: string; fileUrl: string }>(`${this.apiUrl}/upload-resume`, formData);
  }

  getStudents(filters: any = {}): Observable<{ success: boolean; count: number; data: Student[] }> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<{ success: boolean; count: number; data: Student[] }>(
      this.apiUrl,
      { params }
    );
  }

  getStudentById(id: string): Observable<{ success: boolean; data: Student }> {
    return this.http.get<{ success: boolean; data: Student }>(`${this.apiUrl}/${id}`);
  }

  getProfile(): Observable<{ success: boolean; data: Student; completionPercentage: number; missingFields: string[] }> {
    return this.http.get<{ success: boolean; data: Student; completionPercentage: number; missingFields: string[] }>(`${this.apiUrl}/profile/me`);
  }

  submitForVerification(): Observable<{ success: boolean; message: string; data: Student }> {
    return this.http.post<{ success: boolean; message: string; data: Student }>(`${this.apiUrl}/submit-verification`, {});
  }

  verifyStudentProfile(id: string, action: 'approve' | 'reject', note?: string): Observable<{ success: boolean; message: string; data: Student }> {
    return this.http.put<{ success: boolean; message: string; data: Student }>(`${this.apiUrl}/${id}/verify`, { action, note });
  }

  unlockStudentProfile(id: string): Observable<{ success: boolean; message: string; data: Student }> {
    return this.http.put<{ success: boolean; message: string; data: Student }>(`${this.apiUrl}/${id}/unlock`, {});
  }

  updateProfile(profileData: any): Observable<{ success: boolean; data: Student }> {
    return this.http.put<{ success: boolean; data: Student }>(`${this.apiUrl}/profile/me`, profileData);
  }

  createStudent(studentData: Student): Observable<{ success: boolean; data: Student }> {
    return this.http.post<{ success: boolean; data: Student }>(this.apiUrl, studentData);
  }

  updateStudent(id: string, studentData: Student): Observable<{ success: boolean; data: Student }> {
    return this.http.put<{ success: boolean; data: Student }>(`${this.apiUrl}/${id}`, studentData);
  }

  deleteStudent(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  exportStudentsToExcel(filters: any = {}): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${this.apiUrl}/export-excel`, {
      params,
      responseType: 'blob'
    });
  }

  bulkVerifyStudents(studentIds: string[], action: 'approve' | 'reject', note?: string): Observable<{ success: boolean; message: string; modifiedCount: number }> {
    return this.http.post<{ success: boolean; message: string; modifiedCount: number }>(`${this.apiUrl}/bulk-verify`, { studentIds, action, note });
  }

  addResumeVersion(resumeData: { title: string; fileUrl: string; isPrimary?: boolean }): Observable<{ success: boolean; message: string; data: Student }> {
    return this.http.post<{ success: boolean; message: string; data: Student }>(`${this.apiUrl}/resume-version`, resumeData);
  }
}
