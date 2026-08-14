export interface StatusTimeline {
  status: 'Applied' | 'Shortlisted' | 'Online Test' | 'Tech Interview' | 'HR Interview' | 'Selected' | 'Rejected' | 'No Show';
  updatedAt: string | Date;
  note?: string;
}

export interface Application {
  _id?: string;
  job: any;
  student?: any;
  studentUser?: string;
  studentName: string;
  studentEmail: string;
  department?: string;
  branch?: string;
  cgpa?: number;
  backlogs?: number;
  resumeUrl: string;
  status: 'Applied' | 'Shortlisted' | 'Online Test' | 'Tech Interview' | 'HR Interview' | 'Selected' | 'Rejected' | 'No Show';
  statusTimeline?: StatusTimeline[];
  appliedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
