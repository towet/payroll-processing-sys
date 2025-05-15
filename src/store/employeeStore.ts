import { create } from 'zustand';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department: string | null;
  position: string | null;
  hire_date: string;
  gross_salary: number;
  pay_period: string;
}

interface AttendanceRecord {
  id?: string;
  employeeId: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: 'present' | 'late' | 'absent';
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'personal' | 'unpaid';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Payslip {
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
  employee: Employee | null;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payslips: Payslip[];
  isLoading: boolean;
  error: string | null;
  fetchEmployeeData: (email: string) => Promise<void>;
  markAttendance: (attendance: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  requestLeave: (leave: Omit<LeaveRequest, 'id' | 'status'>) => Promise<LeaveRequest>;
  generatePayslip: (employeeId: string, month: string, year: number) => Promise<Payslip>;
}

const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employee: null,
  attendance: [],
  leaves: [],
  payslips: [],
  isLoading: false,
  error: null,

  fetchEmployeeData: async (email: string) => {
    try {
      set({ isLoading: true, error: null });

      // Get employee data
      const { data: employeeData } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single()
        .throwOnError();

      if (!employeeData) throw new Error('No employee record found');

      // Get attendance records
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeData.id)
        .order('date', { ascending: false })
        .throwOnError();

      // Get leave records
      const { data: leaveData } = await supabase
        .from('leaves')
        .select('*')
        .eq('employee_id', employeeData.id)
        .order('start_date', { ascending: false })
        .throwOnError();

      // Get payslip records
      const { data: payslipData } = await supabase
        .from('payslips')
        .select('*')
        .eq('employee_id', employeeData.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .throwOnError();

      // Format employee data
      const employee: Employee = {
        id: employeeData.id,
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        email: employeeData.email,
        phone: employeeData.phone,
        department: employeeData.department,
        position: employeeData.position,
        hire_date: employeeData.hire_date,
        gross_salary: employeeData.gross_salary,
        pay_period: employeeData.pay_period
      };

      // Format attendance records
      const attendance: AttendanceRecord[] = attendanceData?.map(record => ({
        id: record.id,
        employeeId: record.employee_id,
        date: record.date,
        timeIn: record.time_in ? format(new Date(record.time_in), 'HH:mm') : '',
        timeOut: record.time_out ? format(new Date(record.time_out), 'HH:mm') : '',
        status: record.status
      })) || [];

      // Format leave records
      const leaves: LeaveRequest[] = leaveData?.map(record => ({
        id: record.id,
        employeeId: record.employee_id,
        startDate: record.start_date,
        endDate: record.end_date,
        reason: record.reason,
        type: record.type,
        status: record.status
      })) || [];

      // Format payslip records
      const payslips: Payslip[] = payslipData?.map(record => ({
        id: record.id,
        employeeId: record.employee_id,
        month: record.month,
        year: record.year,
        basicSalary: record.basic_salary,
        allowances: record.allowances,
        deductions: record.deductions,
        netSalary: record.net_salary,
        generatedDate: record.generated_date
      })) || [];

      set({
        employee,
        attendance,
        leaves,
        payslips,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employee data';
      set(state => ({ 
        ...state,
        error: errorMessage,
        isLoading: false 
      }));
    }
  },

  markAttendance: async (attendance: Omit<AttendanceRecord, 'id'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Get employee data
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('email', session.user.email)
        .single()
        .throwOnError();

      if (!employeeData) {
        throw new Error('Employee not found');
      }

      const date = new Date().toISOString().split('T')[0];

      // Check if attendance record exists for this date
      const { data: existingRecord } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', attendance.employeeId)
        .eq('date', date)
        .single();

      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('attendance')
          .update({
            time_out: new Date().toISOString(),
            status: attendance.status
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;

        // Format the updated record
        const updatedRecord: AttendanceRecord = {
          id: data.id,
          employeeId: data.employee_id,
          date: data.date,
          timeIn: data.time_in ? format(new Date(data.time_in), 'HH:mm') : '',
          timeOut: data.time_out ? format(new Date(data.time_out), 'HH:mm') : '',
          status: data.status
        };

        // Update state
        set(state => ({
          attendance: state.attendance.map(a =>
            a.id === updatedRecord.id ? updatedRecord : a
          )
        }));
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            employee_id: attendance.employeeId,
            date,
            time_in: new Date().toISOString(),
            status: attendance.status
          })
          .select()
          .single();

        if (error) throw error;

        // Format the new record
        const newRecord: AttendanceRecord = {
          id: data.id,
          employeeId: data.employee_id,
          date: data.date,
          timeIn: data.time_in ? format(new Date(data.time_in), 'HH:mm') : '',
          timeOut: data.time_out ? format(new Date(data.time_out), 'HH:mm') : '',
          status: data.status
        };

        // Update state
        set(state => ({
          attendance: [newRecord, ...state.attendance]
        }));
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  requestLeave: async (leave: Omit<LeaveRequest, 'id' | 'status'>) => {
    try {
      const employee = get().employee;
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Create the leave request with proper validation
      const { data } = await supabase
        .from('leaves')
        .insert({
          employee_id: employee.id,
          start_date: leave.startDate,
          end_date: leave.endDate,
          type: leave.type,
          reason: leave.reason,
          status: 'pending'
        })
        .select()
        .single();

      if (!data) {
        throw new Error('Failed to create leave request');
      }

      const newLeave: LeaveRequest = {
        id: data.id,
        employeeId: data.employee_id,
        startDate: data.start_date,
        endDate: data.end_date,
        type: data.type,
        reason: data.reason,
        status: data.status
      };

      set(state => ({
        leaves: [newLeave, ...state.leaves]
      }));

      return newLeave;
    } catch (error) {
      console.error('Error requesting leave:', error);
      let errorMessage = 'Failed to submit leave request';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  generatePayslip: async (employeeId: string, month: string, year: number) => {
    try {
      const employee = get().employee;
      if (!employee) throw new Error('Employee not found');

      const basicSalary = employee.gross_salary;
      const allowances = basicSalary * 0.1; // 10% allowances
      const deductions = basicSalary * 0.15; // 15% deductions (tax, insurance, etc.)
      const netSalary = basicSalary + allowances - deductions;

      // Insert into Supabase payslips table
      const { data, error } = await supabase
        .from('payslips')
        .insert({
          employee_id: employeeId,
          month,
          year,
          basic_salary: basicSalary,
          allowances,
          deductions,
          net_salary: netSalary,
          generated_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to generate payslip');

      const payslip: Payslip = {
        id: data.id,
        employeeId: data.employee_id,
        month: data.month,
        year: data.year,
        basicSalary: data.basic_salary,
        allowances: data.allowances,
        deductions: data.deductions,
        netSalary: data.net_salary,
        generatedDate: data.generated_date
      };

      set(state => ({
        payslips: [payslip, ...state.payslips]
      }));

      return payslip;
    } catch (error) {
      console.error('Error generating payslip:', error);
      throw error;
    }
  }
}));

export { useEmployeeStore };