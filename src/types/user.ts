export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  department: string;
  role: 'employee' | 'admin';
  created_at: string;
  updated_at: string;
}
