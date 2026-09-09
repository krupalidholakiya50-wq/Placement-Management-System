export interface AlertLog {
  channel: string;
  recipientCount?: number;
  sentAt?: Date;
  status?: string;
}

export interface Notice {
  _id?: string;
  title: string;
  category?: 'General Notice' | 'Campus Drive' | 'Interview Schedule' | 'Shortlist Alert' | 'Policy Update';
  companyName: string;
  role: string;
  packageOffered: string | number;
  eligibilityCriteria: string;
  targetBranch?: string;
  priority?: 'Urgent' | 'High' | 'Normal';
  content: string;
  isEmailSent?: boolean;
  broadcastChannels?: string[];
  alertLogs?: AlertLog[];
  createdAt?: Date;
}

