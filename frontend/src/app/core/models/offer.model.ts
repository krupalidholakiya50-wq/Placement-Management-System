export interface Offer {
  _id?: string;
  application?: any;
  job?: any;
  student?: any;
  studentName: string;
  companyName: string;
  role: string;
  packageOffered: number;
  location?: string;
  joiningDate?: Date;
  loiText?: string;
  offerLetterUrl?: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  respondedAt?: Date;
  createdAt?: Date;
}
