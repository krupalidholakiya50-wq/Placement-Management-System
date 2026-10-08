import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmailAttachment {
  filename: string;
  storedFilename?: string;
  contentType?: string;
  size?: number;
  url?: string;
  diskPath?: string;
}

export interface EmailMessage {
  _id: string;
  threadId?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
  sender: string;
  senderName?: string;
  senderEmail?: string;
  senderId?: any;
  senderRole?: 'admin' | 'student' | 'company' | 'system';
  recipient: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientId?: any;
  recipientRole?: 'admin' | 'student' | 'company' | 'all' | 'custom';
  recipientEmails?: string[];
  cc?: string[];
  recipientCount?: number;
  subject: string;
  body: string;
  html?: string;
  direction?: 'outbound' | 'inbound';
  type: string;
  template?: string;
  recipientGroup?: string;
  relatedEntity?: string;
  relatedEntityId?: string;
  attachments?: EmailAttachment[];
  status: 'Sent' | 'Delivered' | 'Partially Failed' | 'Failed' | 'SMTP Not Configured' | 'Received' | 'Draft' | string;
  deliveryStatus?: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED' | 'RECEIVED' | 'DRAFT' | string;
  providerMessageId?: string;
  error?: string;
  errorMessage?: string;
  isRead: boolean;
  readAt?: string;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EmailContact {
  id: string;
  type: 'student' | 'company' | 'admin';
  name: string;
  email: string;
  subtitle: string;
  avatar?: string;
}

export interface EmailThread {
  threadId: string;
  subject: string;
  type: string;
  lastMessageAt: string;
  lastMessageBody: string;
  lastSenderName: string;
  lastSenderEmail?: string;
  participants: string[];
  messageCount: number;
  hasUnread: boolean;
  latestEmail: EmailMessage;
}

export interface EmailLogItem extends EmailMessage {
  templateType?: string;
  errorDetails?: string;
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

export interface InboxResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  data: EmailMessage[];
}

export interface SentResponse {
  success: boolean;
  count: number;
  data: EmailMessage[];
}

export interface DraftsResponse {
  success: boolean;
  count: number;
  data: EmailMessage[];
}

export interface SendEmailPayload {
  to?: string | string[];
  cc?: string | string[];
  subject: string;
  message?: string;
  html?: string;
  recipientGroup?: string;
  targetBranch?: string;
  customEmails?: string | string[];
  type?: string;
  category?: string;
  template?: string;
  templateType?: string;
  recipientName?: string;
  threadId?: string;
  inReplyTo?: string;
  attachments?: EmailAttachment[];
  draftId?: string;
  relatedEntity?: string;
  relatedEntityId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/emails`;

  /**
   * Get user's live mailbox inbox (filtered by identity on backend)
   */
  getInbox(paramsObj?: { search?: string; type?: string; isRead?: boolean | string; sort?: string; limit?: number }): Observable<InboxResponse> {
    let params = new HttpParams();
    if (paramsObj) {
      if (paramsObj.search) params = params.set('search', paramsObj.search);
      if (paramsObj.type && paramsObj.type !== 'ALL') params = params.set('type', paramsObj.type);
      if (paramsObj.isRead !== undefined && paramsObj.isRead !== '') params = params.set('isRead', String(paramsObj.isRead));
      if (paramsObj.sort) params = params.set('sort', paramsObj.sort);
      if (paramsObj.limit) params = params.set('limit', String(paramsObj.limit));
    }
    return this.http.get<InboxResponse>(`${this.apiUrl}/inbox`, { params });
  }

  /**
   * Get user's sent emails / Admin system sent dispatches
   */
  getSent(paramsObj?: { search?: string }): Observable<SentResponse> {
    let params = new HttpParams();
    if (paramsObj && paramsObj.search) {
      params = params.set('search', paramsObj.search);
    }
    return this.http.get<SentResponse>(`${this.apiUrl}/sent`, { params });
  }

  /**
   * Get user's saved email drafts
   */
  getDrafts(): Observable<DraftsResponse> {
    return this.http.get<DraftsResponse>(`${this.apiUrl}/drafts`);
  }

  /**
   * Save or update an email draft
   */
  saveDraft(draft: Partial<EmailMessage> & { id?: string; message?: string; to?: string | string[] }): Observable<{ success: boolean; message: string; data: EmailMessage }> {
    return this.http.post<{ success: boolean; message: string; data: EmailMessage }>(`${this.apiUrl}/drafts`, draft);
  }

  /**
   * Delete an email draft
   */
  deleteDraft(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/drafts/${id}`);
  }

  /**
   * Upload an attachment file for email composition
   */
  uploadAttachment(file: File): Observable<{ success: boolean; message: string; data: EmailAttachment }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; message: string; data: EmailAttachment }>(`${this.apiUrl}/upload-attachment`, formData);
  }

  /**
   * Get directory contacts for auto-complete and recipient picker
   */
  getContacts(): Observable<{ success: boolean; count: number; data: EmailContact[] }> {
    return this.http.get<{ success: boolean; count: number; data: EmailContact[] }>(`${this.apiUrl}/contacts`);
  }

  /**
   * Get grouped conversation threads
   */
  getThreads(): Observable<{ success: boolean; count: number; data: EmailThread[] }> {
    return this.http.get<{ success: boolean; count: number; data: EmailThread[] }>(`${this.apiUrl}/threads`);
  }

  /**
   * Get all messages in a specific conversation thread
   */
  getThreadMessages(threadId: string): Observable<{ success: boolean; count: number; data: EmailMessage[] }> {
    return this.http.get<{ success: boolean; count: number; data: EmailMessage[] }>(`${this.apiUrl}/threads/${threadId}`);
  }

  /**
   * Get unread email count
   */
  getUnreadCount(): Observable<{ success: boolean; count: number }> {
    return this.http.get<{ success: boolean; count: number }>(`${this.apiUrl}/unread-count`);
  }

  /**
   * Get single email detail & auto-mark as read
   */
  getEmailById(id: string): Observable<{ success: boolean; data: EmailMessage }> {
    return this.http.get<{ success: boolean; data: EmailMessage }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Mark a single email as read
   */
  markEmailAsRead(id: string): Observable<{ success: boolean; message: string; data: EmailMessage }> {
    return this.http.patch<{ success: boolean; message: string; data: EmailMessage }>(`${this.apiUrl}/${id}/read`, {});
  }

  /**
   * Mark all inbox emails as read
   */
  markAllEmailsAsRead(): Observable<{ success: boolean; message: string; modifiedCount: number }> {
    return this.http.patch<{ success: boolean; message: string; modifiedCount: number }>(`${this.apiUrl}/mark-all-read`, {});
  }

  /**
   * Get email logs for Admin / Recruiter telemetry
   */
  getEmailLogs(): Observable<{ success: boolean; count: number; isSmtpConfigured: boolean; data: EmailLogItem[] }> {
    return this.http.get<{ success: boolean; count: number; isSmtpConfigured: boolean; data: EmailLogItem[] }>(`${this.apiUrl}/logs`);
  }

  /**
   * Get SMTP server status and delivery counts
   */
  getSmtpStatus(): Observable<EmailStatusResponse> {
    return this.http.get<EmailStatusResponse>(`${this.apiUrl}/status`);
  }

  /**
   * Send custom broadcast, 1-on-1 direct email, or reply
   */
  sendEmail(payload: SendEmailPayload): Observable<{ success: boolean; message: string; isSmtpConfigured?: boolean; threadId?: string; data?: any }> {
    return this.http.post<{ success: boolean; message: string; isSmtpConfigured?: boolean; threadId?: string; data?: any }>(`${this.apiUrl}/send`, payload);
  }

  /**
   * Dev helper: Simulate external inbound email reply
   */
  simulateInboundEmail(payload: { from: string; to: string; subject: string; message: string; threadId?: string; inReplyTo?: string }): Observable<{ success: boolean; message: string; threadId?: string; data?: EmailMessage }> {
    return this.http.post<{ success: boolean; message: string; threadId?: string; data?: EmailMessage }>(`${this.apiUrl}/simulate-inbound`, payload);
  }
}
