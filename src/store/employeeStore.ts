import { create } from 'zustand';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  joinDate: string;
}

interface Leave {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'annual' | 'sick' | 'personal' | 'unpaid';
}

interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  status: 'present' | 'absent' | 'late';
}

interface PaySlip {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  generatedDate: string;
}

interface EmployeeState {
  employees: Employee[];
  leaves: Leave[];
  attendance: Attendance[];
  payslips: PaySlip[];
  isLoading: boolean;
  error: string | null;
  fetchEmployeeData: (email: string) => Promise<void>;
  addEmployee: (employee: Employee) => Promise<void>;
  requestLeave: (leave: Omit<Leave, 'id' | 'status'>) => void;
  approveLeave: (leaveId: string) => void;
  rejectLeave: (leaveId: string) => void;
  markAttendance: (attendance: Omit<Attendance, 'id'>) => void;
  generatePayslip: (employeeId: string, month: string, year: number) => Promise<PaySlip>;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  leaves: [],
  attendance: [],
  payslips: [],
  isLoading: false,
  error: null,

  fetchEmployeeData: async (email) => {
    try {
      set({ isLoading: true, error: null });
      
      // Fetch employee data using email
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();

      if (employeeError) {
        console.error('Error fetching employee:', employeeError);
        throw employeeError;
      }

      if (!employeeData) {
        throw new Error('Employee profile not found. Please contact your administrator.');
      }

      set(state => ({
        employees: [...state.employees, employeeData]
      }));

      // Now use the employee ID from the found record for related data
      const employeeId = employeeData.id;

      // Fetch all related data in parallel for better performance
      const [leavesResponse, attendanceResponse, payslipsResponse] = await Promise.all([
        // Fetch leaves with error handling
        supabase
          .from('leaves')
          .select('*')
          .eq('employee_id', employeeId)
          .then(({ data, error }) => {
            if (error) {
              if (error.code === '42P01') { // Table doesn't exist
                console.warn('Leaves table not found:', error);
                return [];
              }
              throw error;
            }
            return data || [];
          }),

        // Fetch attendance with error handling
        supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employeeId)
          .then(({ data, error }) => {
            if (error) {
              if (error.code === '42P01') { // Table doesn't exist
                console.warn('Attendance table not found:', error);
                return [];
              }
              throw error;
            }
            return data || [];
          }),

        // Fetch payslips with error handling
        supabase
          .from('payslips')
          .select('*')
          .eq('employee_id', employeeId)
          .then(({ data, error }) => {
            if (error) {
              if (error.code === '42P01') { // Table doesn't exist
                console.warn('Payslips table not found:', error);
                return [];
              }
              throw error;
            }
            return data || [];
          })
      ]);

      // Update state with all fetched data
      set(state => ({
        leaves: [...state.leaves, ...leavesResponse],
        attendance: [...state.attendance, ...attendanceResponse],
        payslips: [...state.payslips, ...payslipsResponse],
        isLoading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch employee data';
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      console.error('Error in fetchEmployeeData:', error);
    }
  },

  addEmployee: async (employee) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        employees: [...state.employees, data],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add employee',
        isLoading: false 
      });
      throw error;
    }
  },

  requestLeave: (leave) =>
    set((state) => ({
      leaves: [...state.leaves, { ...leave, id: crypto.randomUUID(), status: 'pending' }]
    })),

  approveLeave: (leaveId) =>
    set((state) => ({
      leaves: state.leaves.map(leave =>
        leave.id === leaveId ? { ...leave, status: 'approved' } : leave
      )
    })),

  rejectLeave: (leaveId) =>
    set((state) => ({
      leaves: state.leaves.map(leave =>
        leave.id === leaveId ? { ...leave, status: 'rejected' } : leave
      )
    })),

  markAttendance: (attendance) => {
    const now = new Date();
    set((state) => ({
      attendance: [...state.attendance, {
        ...attendance,
        id: crypto.randomUUID(),
        date: format(now, 'yyyy-MM-dd')
      }]
    }));
  },

  generatePayslip: async (employeeId, month, year) => {
    try {
      const employee = get().employees.find(e => e.id === employeeId);
      if (!employee) throw new Error('Employee not found');

      const basicSalary = employee.salary;
      const allowances = basicSalary * 0.1; // 10% allowances
      const deductions = basicSalary * 0.15; // 15% deductions (tax, insurance, etc.)
      const netSalary = basicSalary + allowances - deductions;

      const payslip: PaySlip = {
        id: crypto.randomUUID(),
        employeeId,
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        generatedDate: format(new Date(), 'yyyy-MM-dd')
      };

      set((state) => ({
        payslips: [...state.payslips, payslip]
      }));

      return payslip;
    } catch (error) {
      throw error;
    }
  }
}));