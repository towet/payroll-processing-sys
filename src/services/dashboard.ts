import { supabase } from '../lib/supabase';
import { 
  Employee, 
  PayrollItem, 
  TaxRecord, 
  AttendanceRecord,
  StatItem,
  ActivityItem 
} from '../types/dashboard';

interface DatabaseEmployee {
  id: string;
  position: string;
  department: string;
  salary: number;
  hire_date: string;
  profiles: {
    full_name: string;
  };
}

interface DatabasePayroll {
  id: string;
  amount: number;
  status: PayrollItem['status'];
  process_date: string;
  employees: {
    profiles: {
      full_name: string;
    };
  };
}

interface DatabaseActivity {
  id: string;
  action: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface DatabaseAttendance {
  id: string;
  status: AttendanceRecord['status'];
  time_in: string | null;
  time_out: string | null;
  date: string;
  employees: {
    profiles: {
      full_name: string;
    };
  };
}

// Employees
export const getEmployees = async () => {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      id,
      position,
      department,
      salary,
      hire_date,
      profiles!inner (
        full_name
      )
    `);

  if (error) throw error;

  return ((data || []) as unknown as DatabaseEmployee[]).map(emp => ({
    id: emp.id,
    name: emp.profiles.full_name,
    position: emp.position,
    department: emp.department
  })) as Employee[];
};

export const addEmployee = async (employee: Omit<Employee, 'id'>) => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employee])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Payroll
export const getPayrollItems = async () => {
  const { data, error } = await supabase
    .from('payroll')
    .select(`
      id,
      amount,
      status,
      process_date,
      employees!inner (
        profiles!inner (
          full_name
        )
      )
    `);

  if (error) throw error;

  return ((data || []) as unknown as DatabasePayroll[]).map(item => ({
    id: item.id,
    employee: item.employees.profiles.full_name,
    amount: item.amount,
    status: item.status
  })) as PayrollItem[];
};

export const processPayroll = async (payrollId: string) => {
  const { data, error } = await supabase
    .from('payroll')
    .update({ 
      status: 'Processed',
      process_date: new Date().toISOString()
    })
    .eq('id', payrollId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Tax Records
export const getTaxRecords = async () => {
  const { data, error } = await supabase
    .from('tax_records')
    .select('*');

  if (error) throw error;
  return (data || []) as TaxRecord[];
};

export const addTaxRecord = async (record: Omit<TaxRecord, 'id'>) => {
  const { data, error } = await supabase
    .from('tax_records')
    .insert([record])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Attendance
export const getAttendanceRecords = async (date?: string) => {
  let query = supabase
    .from('attendance')
    .select(`
      id,
      status,
      time_in,
      time_out,
      date,
      employees!inner (
        profiles!inner (
          full_name
        )
      )
    `);

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;

  if (error) throw error;

  return ((data || []) as unknown as DatabaseAttendance[]).map(record => ({
    id: record.id,
    employee: record.employees.profiles.full_name,
    status: record.status,
    timeIn: record.time_in ? new Date(record.time_in).toLocaleTimeString() : '-',
    timeOut: record.time_out ? new Date(record.time_out).toLocaleTimeString() : '-'
  })) as AttendanceRecord[];
};

export const markAttendance = async (employeeId: string, status: AttendanceRecord['status']) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance')
    .insert([{
      employee_id: employeeId,
      status,
      time_in: status !== 'Absent' ? now.toISOString() : null,
      date: today
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAttendance = async (attendanceId: string, timeOut: string) => {
  const { data, error } = await supabase
    .from('attendance')
    .update({ time_out: timeOut })
    .eq('id', attendanceId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Dashboard Stats
export const getDashboardStats = async (): Promise<StatItem[]> => {
  const { data: employees } = await supabase
    .from('employees')
    .select('id');

  const { data: pendingPayroll } = await supabase
    .from('payroll')
    .select('id')
    .eq('status', 'Pending');

  const { data: taxRecords } = await supabase
    .from('tax_records')
    .select('id');

  const { data: nextPayroll } = await supabase
    .from('payroll')
    .select('process_date')
    .eq('status', 'Pending')
    .order('process_date', { ascending: true })
    .limit(1)
    .single();

  return [
    { 
      title: 'Total Employees', 
      value: (employees || []).length.toString(),
      change: '+0%',
      color: 'blue'
    },
    { 
      title: 'Pending Approvals', 
      value: (pendingPayroll || []).length.toString(),
      change: '0%',
      color: 'orange'
    },
    { 
      title: 'Next Payroll', 
      value: nextPayroll?.process_date ? 
        new Date(nextPayroll.process_date).toLocaleDateString() : 
        'No pending',
      change: '$0',
      color: 'green'
    },
    { 
      title: 'Tax Returns', 
      value: (taxRecords || []).length.toString(),
      change: '0%',
      color: 'purple'
    }
  ];
};

// Activity Log
export const getRecentActivity = async (): Promise<ActivityItem[]> => {
  const { data, error } = await supabase
    .from('activity_log')
    .select(`
      id,
      action,
      created_at,
      profiles!inner (
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) throw error;

  return ((data || []) as unknown as DatabaseActivity[]).map(activity => ({
    id: activity.id,
    action: activity.action,
    user: activity.profiles?.full_name || 'System',
    time: getTimeAgo(new Date(activity.created_at))
  }));
};

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + ' years ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + ' months ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + ' days ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + ' hours ago';
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + ' minutes ago';
  
  return 'just now';
}
