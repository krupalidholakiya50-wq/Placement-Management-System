export interface Company {
  _id?: string;
  user?: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  website?: string;
  location?: string;
  headOffice?: string;
  contactPerson?: string;
  contactEmail?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  linkedinUrl?: string;
  employeeCount?: string;
  hiringDomains?: string[];
  campusHistory?: string[];
  isApprovedByAdmin?: boolean;
  status?: 'Active' | 'Pending Approval' | 'Suspended';
  createdAt?: string | Date;
  [key: string]: any;
}
