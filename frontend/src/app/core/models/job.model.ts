export interface Job {
  _id?: string;
  title: string;
  company?: any;
  companyName: string;
  companyLogo?: string;
  description: string;
  eligibility?: string;
  salary?: string;
  salaryPackage?: number;
  packageOffered?: string;
  requirements?: string;
  location: string;
  jobType: 'Full Time' | 'Internship' | 'Internship + Full Time';
  eligibleBranches?: string[];
  eligibleDepartments?: string[];
  allowedSemesters?: string[];
  passingYear?: string;
  selectionProcess?: string;
  bond?: string;
  openPositions?: number;
  minCgpa: number;
  min10thPercent?: number;
  min12thPercent?: number;
  maxBacklogs?: number;
  deadline: string | Date;
  driveDate?: string | Date;
  eligibleStudentCount?: number;
  ineligibleStudentCount?: number;
  eligibilityPercentage?: number;
  approvalStatus?: 'Pending Admin Approval' | 'Approved' | 'Rejected';
  status: 'Active' | 'Closed' | 'Upcoming';
  postedBy?: string;
  createdAt?: string | Date;
}

export interface EligibilityResult {
  success: boolean;
  isEligible: boolean;
  isDreamOffer?: boolean;
  reasons: string[];
  studentData?: any;
}
