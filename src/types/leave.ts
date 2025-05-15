export interface Leave {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  type: 'annual' | 'sick' | 'personal' | 'unpaid';
  status: 'pending' | 'approved' | 'rejected';
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
