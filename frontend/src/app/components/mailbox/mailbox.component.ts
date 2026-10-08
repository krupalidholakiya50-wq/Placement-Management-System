import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EmailService,
  EmailMessage,
  EmailAttachment,
  EmailContact,
  EmailThread,
  InboxResponse,
  SentResponse,
  DraftsResponse
} from '../../core/services/email.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-mailbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mailbox.component.html',
  styleUrls: ['./mailbox.component.scss']
})
export class MailboxComponent implements OnInit {
  private emailService = inject(EmailService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);

  // Email Lists
  emails: EmailMessage[] = [];
  sentEmails: EmailMessage[] = [];
  threads: EmailThread[] = [];
  drafts: EmailMessage[] = [];
  contacts: EmailContact[] = [];
  filteredContacts: EmailContact[] = [];

  // Filtered views
  displayedEmails: EmailMessage[] = [];
  displayedThreads: EmailThread[] = [];
  displayedDrafts: EmailMessage[] = [];

  // Selection
  selectedEmail: EmailMessage | null = null;
  selectedThread: EmailThread | null = null;
  selectedDraft: EmailMessage | null = null;
  threadMessages: EmailMessage[] = [];

  // Metrics & State
  unreadCount = 0;
  isLoading = true;
  isSending = false;
  isUploadingAttachment = false;
  isMobileView = false;
  activeTab: 'inbox' | 'threads' | 'sent' | 'drafts' = 'inbox';
  searchQuery = '';
  filterReadStatus: 'ALL' | 'UNREAD' | 'READ' = 'ALL';
  filterType = 'ALL';

  // Modals & Drawers
  isComposeModalOpen = false;
  isSimulateModalOpen = false;
  isDirectoryModalOpen = false;
  directoryTab: 'students' | 'companies' | 'admins' = 'students';
  directorySearch = '';

  // Current User Info
  userRole = this.authService.getUserRole() || 'student';
  currentUserName = this.authService.currentUser()?.name || 'User';
  currentUserEmail = this.authService.currentUser()?.email || 'user@placement.edu';

  // Compose State
  currentDraftId: string | null = null;
  composeTo = '';
  composeCc = '';
  composeSubject = '';
  composeCategory = 'Direct Message';
  composeBody = '';
  composeThreadId = '';
  composeInReplyTo = '';
  composeAttachments: EmailAttachment[] = [];
  isReplyMode = false;
  isForwardMode = false;
  showContactSuggestions = false;

  // Inbound Simulation State
  simulateFrom = 'student@gmail.com';
  simulateTo = '';
  simulateSubject = 'Re: Interview Invitation';
  simulateBody = 'Thank you for the update. I confirm my availability for the upcoming interview round.';

  ngOnInit(): void {
    this.checkMobileView();
    this.simulateTo = this.currentUserEmail;
    this.refreshAll();
    this.loadContacts();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.checkMobileView();
  }

  checkMobileView(): void {
    this.isMobileView = typeof window !== 'undefined' && window.innerWidth < 992;
  }

  refreshAll(): void {
    this.loadInbox();
    this.loadSent();
    this.loadThreads();
    this.loadDrafts();
  }

  loadContacts(): void {
    this.emailService.getContacts().subscribe({
      next: (res) => {
        this.contacts = res.data || [];
        this.filteredContacts = [...this.contacts];
      },
      error: () => { }
    });
  }

  loadInbox(): void {
    this.isLoading = true;
    this.emailService.getInbox().subscribe({
      next: (res: InboxResponse) => {
        this.emails = res.data || [];
        this.unreadCount = res.unreadCount || 0;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.emails = [];
        this.isLoading = false;
      }
    });
  }

  loadSent(): void {
    this.emailService.getSent().subscribe({
      next: (res: SentResponse) => {
        this.sentEmails = res.data || [];
        if (this.activeTab === 'sent') {
          this.applyFilters();
        }
      },
      error: () => {
        this.sentEmails = [];
      }
    });
  }

  loadThreads(): void {
    this.emailService.getThreads().subscribe({
      next: (res) => {
        this.threads = res.data || [];
        if (this.activeTab === 'threads') {
          this.applyFilters();
        }
      },
      error: () => {
        this.threads = [];
      }
    });
  }

  loadDrafts(): void {
    this.emailService.getDrafts().subscribe({
      next: (res: DraftsResponse) => {
        this.drafts = res.data || [];
        if (this.activeTab === 'drafts') {
          this.applyFilters();
        }
      },
      error: () => {
        this.drafts = [];
      }
    });
  }

  switchTab(tab: 'inbox' | 'threads' | 'sent' | 'drafts'): void {
    this.activeTab = tab;
    this.selectedEmail = null;
    this.selectedThread = null;
    this.selectedDraft = null;
    this.applyFilters();
  }

  setFilterReadStatus(status: 'ALL' | 'UNREAD' | 'READ'): void {
    this.filterReadStatus = status;
    this.applyFilters();
  }

  applyFilters(): void {
    const q = (this.searchQuery || '').toLowerCase().trim();

    if (this.activeTab === 'threads') {
      let filtered = [...this.threads];
      if (this.filterReadStatus === 'UNREAD') {
        filtered = filtered.filter(t => t.hasUnread);
      } else if (this.filterReadStatus === 'READ') {
        filtered = filtered.filter(t => !t.hasUnread);
      }
      if (q) {
        filtered = filtered.filter(t =>
          (t.subject && t.subject.toLowerCase().includes(q)) ||
          (t.lastMessageBody && t.lastMessageBody.toLowerCase().includes(q)) ||
          (t.lastSenderName && t.lastSenderName.toLowerCase().includes(q)) ||
          (t.lastSenderEmail && t.lastSenderEmail.toLowerCase().includes(q))
        );
      }
      this.displayedThreads = filtered;
    } else if (this.activeTab === 'drafts') {
      let filtered = [...this.drafts];
      if (q) {
        filtered = filtered.filter(d =>
          (d.subject && d.subject.toLowerCase().includes(q)) ||
          (d.body && d.body.toLowerCase().includes(q)) ||
          (d.recipient && d.recipient.toLowerCase().includes(q))
        );
      }
      this.displayedDrafts = filtered;
    } else {
      const source = this.activeTab === 'inbox' ? this.emails : this.sentEmails;
      let filtered = [...source];

      if (this.activeTab === 'inbox') {
        if (this.filterReadStatus === 'UNREAD') {
          filtered = filtered.filter(e => !e.isRead);
        } else if (this.filterReadStatus === 'READ') {
          filtered = filtered.filter(e => e.isRead);
        }
      }

      if (this.filterType !== 'ALL') {
        filtered = filtered.filter(e => e.type === this.filterType);
      }

      if (q) {
        filtered = filtered.filter(e =>
          (e.subject && e.subject.toLowerCase().includes(q)) ||
          (e.body && e.body.toLowerCase().includes(q)) ||
          (e.sender && e.sender.toLowerCase().includes(q)) ||
          (e.senderEmail && e.senderEmail.toLowerCase().includes(q)) ||
          (e.recipient && e.recipient.toLowerCase().includes(q)) ||
          (e.recipientEmail && e.recipientEmail.toLowerCase().includes(q))
        );
      }
      this.displayedEmails = filtered;
    }
  }

  selectEmail(email: EmailMessage): void {
    this.selectedEmail = email;
    this.selectedThread = null;
    this.selectedDraft = null;

    if (!email.isRead && this.activeTab === 'inbox') {
      this.emailService.markEmailAsRead(email._id).subscribe({
        next: () => {
          email.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: () => { }
      });
    }
  }

  selectThread(thread: EmailThread): void {
    this.selectedThread = thread;
    this.selectedEmail = null;
    this.selectedDraft = null;

    this.emailService.getThreadMessages(thread.threadId).subscribe({
      next: (res) => {
        this.threadMessages = res.data || [];
        thread.hasUnread = false;
        this.loadInbox();
      },
      error: () => {
        this.threadMessages = [];
      }
    });
  }

  selectDraft(draft: EmailMessage): void {
    this.selectedDraft = draft;
    this.selectedEmail = null;
    this.selectedThread = null;
  }

  editDraft(draft: EmailMessage): void {
    this.currentDraftId = draft._id;
    this.composeTo = draft.recipientEmail || draft.recipient || '';
    this.composeCc = draft.cc ? draft.cc.join(', ') : '';
    this.composeSubject = draft.subject || '';
    this.composeCategory = draft.type || 'Direct Message';
    this.composeBody = draft.body || '';
    this.composeThreadId = draft.threadId || '';
    this.composeInReplyTo = draft.inReplyTo || '';
    this.composeAttachments = draft.attachments ? [...draft.attachments] : [];
    this.isReplyMode = false;
    this.isForwardMode = false;
    this.isComposeModalOpen = true;
  }

  discardDraft(draft: EmailMessage): void {
    if (confirm('Are you sure you want to discard this draft?')) {
      this.emailService.deleteDraft(draft._id).subscribe({
        next: () => {
          this.notify.showSuccess('Draft discarded.');
          this.selectedDraft = null;
          this.loadDrafts();
        },
        error: () => {
          this.notify.showError('Failed to discard draft.');
        }
      });
    }
  }

  markAllAsRead(): void {
    this.emailService.markAllEmailsAsRead().subscribe({
      next: () => {
        this.emails.forEach(e => e.isRead = true);
        this.threads.forEach(t => t.hasUnread = false);
        this.unreadCount = 0;
        this.applyFilters();
        this.notify.showSuccess('All messages marked as read.');
      },
      error: () => { }
    });
  }

  // --- Auto-complete & Directory Selection ---
  filterContacts(): void {
    const q = this.composeTo.toLowerCase().trim();
    if (!q) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q)
      );
    }
    this.showContactSuggestions = true;
  }

  toggleContactDropdown(): void {
    this.showContactSuggestions = !this.showContactSuggestions;
  }

  selectContact(contact: EmailContact): void {
    this.composeTo = contact.email;
    this.showContactSuggestions = false;
  }

  openDirectoryModal(): void {
    this.directorySearch = '';
    this.directoryTab = this.userRole === 'student' ? 'companies' : 'students';
    this.isDirectoryModalOpen = true;
  }

  closeDirectoryModal(): void {
    this.isDirectoryModalOpen = false;
  }

  getDirectoryFilteredContacts(): EmailContact[] {
    let list = this.contacts.filter(c => c.type === (this.directoryTab === 'students' ? 'student' : this.directoryTab === 'companies' ? 'company' : 'admin'));
    if (this.directorySearch) {
      const q = this.directorySearch.toLowerCase().trim();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q));
    }
    return list;
  }

  chooseDirectoryContact(contact: EmailContact): void {
    this.composeTo = contact.email;
    this.closeDirectoryModal();
  }

  // --- Attachment Uploading ---
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.notify.showError('File size exceeds maximum limit of 10MB.');
      return;
    }

    this.isUploadingAttachment = true;
    this.emailService.uploadAttachment(file).subscribe({
      next: (res) => {
        this.isUploadingAttachment = false;
        if (res.data) {
          this.composeAttachments.push(res.data);
          this.notify.showSuccess(`Attachment "${file.name}" added successfully.`);
        }
      },
      error: (err) => {
        this.isUploadingAttachment = false;
        this.notify.showError(err.error?.message || 'Failed to upload attachment file.');
      }
    });

    // Reset input
    event.target.value = '';
  }

  removeAttachment(index: number): void {
    this.composeAttachments.splice(index, 1);
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // --- Compose Modal Flow ---
  openComposeModal(): void {
    this.currentDraftId = null;
    this.isReplyMode = false;
    this.isForwardMode = false;
    this.composeTo = '';
    this.composeCc = '';
    this.composeSubject = '';
    this.composeCategory = 'Direct Message';
    this.composeBody = '';
    this.composeThreadId = '';
    this.composeInReplyTo = '';
    this.composeAttachments = [];
    this.showContactSuggestions = false;
    this.isComposeModalOpen = true;
  }

  closeComposeModal(): void {
    this.isComposeModalOpen = false;
  }

  replyToCurrent(): void {
    if (!this.selectedEmail) return;
    this.isReplyMode = true;
    this.isForwardMode = false;
    this.currentDraftId = null;
    this.composeTo = this.selectedEmail.senderEmail || this.selectedEmail.sender;
    this.composeCc = '';
    this.composeSubject = this.selectedEmail.subject.startsWith('Re:')
      ? this.selectedEmail.subject
      : `Re: ${this.selectedEmail.subject}`;
    this.composeCategory = this.selectedEmail.type || 'Direct Message';
    this.composeThreadId = this.selectedEmail.threadId || `thread_${this.selectedEmail._id}`;
    this.composeInReplyTo = this.selectedEmail.messageId || '';
    this.composeAttachments = [];
    this.composeBody = `\n\n--- On ${new Date(this.selectedEmail.createdAt).toLocaleString()}, ${this.selectedEmail.senderName || this.selectedEmail.sender} wrote:\n${this.selectedEmail.body}`;
    this.isComposeModalOpen = true;
  }

  replyToThread(thread: EmailThread): void {
    this.isReplyMode = true;
    this.isForwardMode = false;
    this.currentDraftId = null;
    const latest = thread.latestEmail;
    this.composeTo = latest.senderEmail || latest.sender;
    this.composeCc = '';
    this.composeSubject = thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`;
    this.composeCategory = thread.type || 'Direct Message';
    this.composeThreadId = thread.threadId;
    this.composeInReplyTo = latest.messageId || '';
    this.composeAttachments = [];
    this.composeBody = '';
    this.isComposeModalOpen = true;
  }

  forwardCurrent(): void {
    if (!this.selectedEmail) return;
    this.isReplyMode = false;
    this.isForwardMode = true;
    this.currentDraftId = null;
    this.composeTo = '';
    this.composeCc = '';
    this.composeSubject = this.selectedEmail.subject.startsWith('Fwd:') ? this.selectedEmail.subject : `Fwd: ${this.selectedEmail.subject}`;
    this.composeCategory = this.selectedEmail.type || 'Direct Message';
    this.composeThreadId = `thread_${Date.now()}`;
    this.composeInReplyTo = '';
    this.composeAttachments = this.selectedEmail.attachments ? [...this.selectedEmail.attachments] : [];
    this.composeBody = `\n\n---------- Forwarded message ---------\nFrom: ${this.selectedEmail.senderName || this.selectedEmail.sender} <${this.selectedEmail.senderEmail || this.selectedEmail.sender}>\nDate: ${new Date(this.selectedEmail.createdAt).toLocaleString()}\nSubject: ${this.selectedEmail.subject}\n\n${this.selectedEmail.body}`;
    this.isComposeModalOpen = true;
  }

  getStudentContactsCount(): number {
    return this.contacts.filter(c => c.type === 'student').length;
  }

  getCompanyContactsCount(): number {
    return this.contacts.filter(c => c.type === 'company').length;
  }

  getAdminContactsCount(): number {
    return this.contacts.filter(c => c.type === 'admin').length;
  }

  // --- Save Draft ---
  saveCurrentDraft(): void {
    if (!this.composeSubject && !this.composeBody && !this.composeTo) {
      this.notify.showError('Please enter at least a recipient, subject, or message body to save draft.');
      return;
    }

    this.emailService.saveDraft({
      id: this.currentDraftId || undefined,
      to: this.composeTo,
      cc: this.composeCc ? this.composeCc.split(',').map(e => e.trim()) : [],
      subject: this.composeSubject || '(Draft - No Subject)',
      type: this.composeCategory,
      message: this.composeBody,
      threadId: this.composeThreadId || undefined,
      inReplyTo: this.composeInReplyTo || undefined,
      attachments: this.composeAttachments
    }).subscribe({
      next: (res) => {
        this.currentDraftId = res.data._id;
        this.notify.showSuccess('Draft saved successfully.');
        this.loadDrafts();
        this.closeComposeModal();
      },
      error: (err) => {
        this.notify.showError(err.error?.message || 'Failed to save draft.');
      }
    });
  }

  // --- Send Email ---
  sendEmailDispatch(): void {
    if (!this.composeTo || !this.composeSubject || !this.composeBody) {
      this.notify.showError('Please fill in recipient email, subject and body.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipientEmails = this.composeTo.split(',').map(e => e.trim());
    for (const em of recipientEmails) {
      if (!emailRegex.test(em)) {
        this.notify.showError(`Invalid recipient email address format: "${em}"`);
        return;
      }
    }

    this.isSending = true;

    this.emailService.sendEmail({
      to: this.composeTo,
      cc: this.composeCc ? this.composeCc.split(',').map(e => e.trim()) : undefined,
      subject: this.composeSubject,
      category: this.composeCategory,
      message: this.composeBody,
      threadId: this.composeThreadId || undefined,
      inReplyTo: this.composeInReplyTo || undefined,
      attachments: this.composeAttachments,
      draftId: this.currentDraftId || undefined
    }).subscribe({
      next: (res) => {
        this.isSending = false;
        this.notify.showSuccess(res.message || 'Email dispatched successfully!');
        this.closeComposeModal();
        this.refreshAll();
      },
      error: (err: any) => {
        this.isSending = false;
        this.notify.showError(err.error?.message || 'Failed to dispatch email. Please check network or SMTP setup.');
      }
    });
  }

  // --- Inbound Simulation ---
  openSimulateModal(): void {
    this.simulateTo = this.currentUserEmail;
    if (this.selectedEmail) {
      this.simulateFrom = this.selectedEmail.senderEmail || 'candidate@gmail.com';
      this.simulateSubject = this.selectedEmail.subject.startsWith('Re:')
        ? this.selectedEmail.subject
        : `Re: ${this.selectedEmail.subject}`;
    } else {
      this.simulateFrom = this.userRole === 'company' ? 'shortlisted.student@gmail.com' : 'recruiter@topcompany.com';
      this.simulateSubject = 'Re: Campus Placement Interview & Assessment';
    }
    this.isSimulateModalOpen = true;
  }

  closeSimulateModal(): void {
    this.isSimulateModalOpen = false;
  }

  submitSimulatedInbound(): void {
    if (!this.simulateFrom || !this.simulateTo || !this.simulateSubject || !this.simulateBody) {
      this.notify.showError('All simulation fields are required.');
      return;
    }

    this.emailService.simulateInboundEmail({
      from: this.simulateFrom,
      to: this.simulateTo,
      subject: this.simulateSubject,
      message: this.simulateBody,
      threadId: this.selectedEmail?.threadId || this.selectedThread?.threadId,
      inReplyTo: this.selectedEmail?.messageId
    }).subscribe({
      next: () => {
        this.notify.showSuccess('External inbound reply simulated and captured into Mailbox!');
        this.closeSimulateModal();
        this.refreshAll();
      },
      error: (err) => {
        this.notify.showError(err.error?.message || 'Failed to simulate inbound email.');
      }
    });
  }

  // Helper for status badge class
  getStatusBadgeClass(status?: string, deliveryStatus?: string): string {
    const s = (deliveryStatus || status || '').toUpperCase();
    if (s === 'DELIVERED' || s === 'SENT') return 'badge-subtle-success';
    if (s === 'RECEIVED') return 'badge-subtle-teal';
    if (s === 'QUEUED') return 'badge-subtle-primary';
    if (s === 'DRAFT') return 'badge-subtle-warning';
    if (s === 'FAILED' || s === 'BOUNCED') return 'badge-subtle-danger';
    return 'badge-subtle-secondary';
  }
}
