export interface Project {
  title: string;
  description?: string;
  techStack?: string;
  githubUrl?: string;
}

export interface Internship {
  company: string;
  role: string;
  duration?: string;
  description?: string;
}

export interface Achievement {
  title: string;
  year?: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  year?: string;
  credentialUrl?: string;
}

export interface StudentDocument {
  name: string;
  type: '10th Marksheet' | '12th Marksheet' | 'Semester Marksheet' | 'Identity Card' | 'Certificates' | 'Resume';
  documentUrl: string;
  uploadedAt?: string | Date;
}

export interface ResumeVersion {
  title: string;
  fileUrl: string;
  isPrimary?: boolean;
  uploadedAt?: string | Date;
}

export interface Student {
  _id?: string;
  user?: string;
  studentId: string;
  registerNumber?: string;
  photoUrl?: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob?: string | Date;
  address?: string;
  department: 'Computer Science' | 'Information Technology' | 'Electronics' | 'Mechanical' | 'Civil';
  branch: string;
  semester?: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  cgpa: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  backlogs?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  projects?: Project[];
  internships?: Internship[];
  achievements?: Achievement[];
  certifications?: Certification[];
  resumeUrl: string;
  resumeVersions?: ResumeVersion[];
  documents?: StudentDocument[];
  // Stage 1 Verification & Data Freeze
  profileCompletion?: number;
  missingFields?: string[];
  verificationStatus?: 'Draft' | 'Pending Verification' | 'Verified' | 'Rejected';
  verificationNote?: string;
  isFrozen?: boolean;
  placementStatus: 'Placed' | 'Unplaced' | 'Blacklisted' | 'Opted Out';
  placedCompany?: string;
  placedPackage?: number;
  package?: string;
  blacklistedUntilDrives?: number;
  createdAt?: string | Date;
}
