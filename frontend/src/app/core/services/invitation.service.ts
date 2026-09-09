import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecruiterInvite {
  _id?: string;
  recruiterName: string;
  recruiterEmail: string;
  companyName: string;
  status?: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/invitations`;

  sendInvitation(data: { recruiterName: string; recruiterEmail: string; companyName: string }): Observable<{ success: boolean; message: string; data: RecruiterInvite }> {
    return this.http.post<{ success: boolean; message: string; data: RecruiterInvite }>(this.apiUrl, data);
  }

  getInvitations(): Observable<{ success: boolean; count: number; data: RecruiterInvite[] }> {
    return this.http.get<{ success: boolean; count: number; data: RecruiterInvite[] }>(this.apiUrl);
  }
}
