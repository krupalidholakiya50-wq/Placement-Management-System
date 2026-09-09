export interface StatusTimeline {
  status: string;
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
  status:
    | 'Applied'
    | 'Resume Shortlisted'
    | 'Aptitude Test Cleared'
    | 'Group Discussion Cleared'
    | 'Technical Interview Cleared'
    | 'HR Interview Cleared'
    | 'Selected'
    | 'Rejected'
    | 'No Show'
    | string;
  statusTimeline?: StatusTimeline[];
  appliedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

