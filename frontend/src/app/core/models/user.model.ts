export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'company' | 'admin';
  photoUrl?: string;
  department?: string;
  createdAt?: string | Date;
  [key: string]: any;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}
