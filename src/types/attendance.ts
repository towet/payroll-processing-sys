export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string | null;
  status: 'present' | 'absent' | 'late';
  created_at: string;
  updated_at: string;
  employees?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string | null;
  };
}
