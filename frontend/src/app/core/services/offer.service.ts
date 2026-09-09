import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offer } from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/offers`;

  getMyOffers(): Observable<{ success: boolean; count: number; data: Offer[] }> {
    return this.http.get<{ success: boolean; count: number; data: Offer[] }>(`${this.apiUrl}/my`);
  }

  respondToOffer(id: string, action: 'Accept' | 'Decline'): Observable<{ success: boolean; message: string; data: Offer }> {
    return this.http.put<{ success: boolean; message: string; data: Offer }>(`${this.apiUrl}/${id}/respond`, { action });
  }

  getOffers(): Observable<{ success: boolean; count: number; data: Offer[] }> {
    return this.http.get<{ success: boolean; count: number; data: Offer[] }>(this.apiUrl);
  }
}
