export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position?: string;
  department?: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollPeriod {
  id: string;
  period_start: string;
  period_end: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PayrollItem {
  id: string;
  period_id: string;
  employee_id: string;
  base_salary: number;
  overtime_hours: number;
  overtime_rate: number;
  overtime_pay: number;
  allowances: number;
  bonuses: number;
  tax_deductions: number;
  insurance_deductions: number;
  other_deductions: number;
  gross_pay: number;
  net_pay: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollHistoryItem extends PayrollItem {
  period_start: string;
  period_end: string;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
}

export interface TaxRecord {
  id: number;
  employee_id: string;
  year: number;
  month: number;
  amount: number;
  type: string;
  status: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string | null;
  status: 'present' | 'absent' | 'late';
}

export interface StatItem {
  title: string;
  value: string | number;
  change: string;
  color: string;
}

export interface ActivityItem {
  id: number;
  action: string;
  user: string;
  time: string;
}

export interface DashboardStats {
  total_employees: number;
  total_payroll: number;
  average_salary: number;
  departments: number;
}
