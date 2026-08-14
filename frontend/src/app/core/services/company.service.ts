import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  getCompanies(filters: any = {}): Observable<{ success: boolean; count: number; data: Company[] }> {
    let params = new HttpParams();

    if (typeof filters === 'string') {
      if (filters) params = params.set('search', filters);
    } else if (typeof filters === 'object' && filters !== null) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<{ success: boolean; count: number; data: Company[] }>(this.apiUrl, { params });
  }

  getCompanyById(id: string): Observable<{ success: boolean; data: Company }> {
    return this.http.get<{ success: boolean; data: Company }>(`${this.apiUrl}/${id}`);
  }

  approveCompany(id: string, action: 'approve' | 'reject' | 'suspend' | 'activate'): Observable<{ success: boolean; message: string; data: Company }> {
    return this.http.put<{ success: boolean; message: string; data: Company }>(`${this.apiUrl}/${id}/approve`, { action });
  }

  createCompany(companyData: Company): Observable<{ success: boolean; message: string; data: Company }> {
    return this.http.post<{ success: boolean; message: string; data: Company }>(this.apiUrl, companyData);
  }

  updateCompany(id: string, companyData: Company): Observable<{ success: boolean; data: Company }> {
    return this.http.put<{ success: boolean; data: Company }>(`${this.apiUrl}/${id}`, companyData);
  }

  deleteCompany(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
