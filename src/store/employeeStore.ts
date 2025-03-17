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
  requestLeave: (leave: Omit<LeaveRequest, 'id' | 'status'>) => Promise<void>;
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
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();

      if (employeeError) throw employeeError;
      if (!employeeData) throw new Error('No employee record found');

      // Get attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeData.id)
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Get leave requests
      const { data: leaveData, error: leaveError } = await supabase
        .from('leaves')
        .select('*')
        .eq('employee_id', employeeData.id)
        .order('start_date', { ascending: false });

      if (leaveError) throw leaveError;

      // Get payslips
      const { data: payslipData, error: payslipError } = await supabase
        .from('payslips')
        .select('*')
        .eq('employee_id', employeeData.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (payslipError) throw payslipError;

      // Format attendance records
      const formattedAttendance = (attendanceData || []).map(record => ({
        id: record.id,
        employeeId: record.employee_id,
        date: record.date,
        timeIn: record.time_in ? format(new Date(record.time_in), 'HH:mm') : '',
        timeOut: record.time_out ? format(new Date(record.time_out), 'HH:mm') : '',
        status: record.status
      }));

      // Format leave requests
      const formattedLeaves = (leaveData || []).map(record => ({
        id: record.id,
        employeeId: record.employee_id,
        startDate: record.start_date,
        endDate: record.end_date,
        type: record.type,
        reason: record.reason,
        status: record.status
      }));

      // Format payslips
      const formattedPayslips = (payslipData || []).map(record => ({
        id: record.id,
        employeeId: record.employee_id,
        month: record.month,
        year: record.year,
        basicSalary: record.basic_salary,
        allowances: record.allowances,
        deductions: record.deductions,
        netSalary: record.net_salary,
        generatedDate: record.generated_date
      }));

      set({
        employee: {
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
        },
        attendance: formattedAttendance,
        leaves: formattedLeaves,
        payslips: formattedPayslips,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch employee data',
        isLoading: false 
      });
    }
  },

  markAttendance: async (attendance: Omit<AttendanceRecord, 'id'>) => {
    try {
      set({ isLoading: true, error: null });

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // First get the employee record to verify ownership
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (employeeError || !employeeData) {
        throw new Error('Employee record not found');
      }

      // Ensure the user can only mark their own attendance
      if (employeeData.id !== attendance.employeeId) {
        throw new Error('Unauthorized to mark attendance for this employee');
      }

      // Format the time to match Supabase's timestamp format
      const date = attendance.date;
      const timeIn = attendance.timeIn ? `${date} ${attendance.timeIn}:00` : null;
      const timeOut = attendance.timeOut ? `${date} ${attendance.timeOut}:00` : null;

      // First try to get existing attendance record
      const { data: existingRecord, error: fetchError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', attendance.employeeId)
        .eq('date', date)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching attendance:', fetchError);
        throw fetchError;
      }

      let data;
      let error;

      if (existingRecord) {
        // Update existing record
        const { data: updateData, error: updateError } = await supabase
          .from('attendance')
          .update({
            time_in: timeIn,
            time_out: timeOut,
            status: attendance.status
          })
          .eq('id', existingRecord.id)
          .eq('employee_id', attendance.employeeId)
          .select()
          .single();

        data = updateData;
        error = updateError;
      } else {
        // Insert new record
        const { data: insertData, error: insertError } = await supabase
          .from('attendance')
          .insert({
            employee_id: attendance.employeeId,
            date: date,
            time_in: timeIn,
            time_out: timeOut,
            status: attendance.status
          })
          .select()
          .single();

        data = insertData;
        error = insertError;
      }

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Failed to save attendance record');
      }

      // Convert the timestamps back to time format for local state
      const formattedData = {
        id: data.id,
        employeeId: data.employee_id,
        date: data.date,
        timeIn: data.time_in ? format(new Date(data.time_in), 'HH:mm') : '',
        timeOut: data.time_out ? format(new Date(data.time_out), 'HH:mm') : '',
        status: data.status
      };

      set(state => ({
        attendance: state.attendance.map(a => 
          a.employeeId === attendance.employeeId && a.date === attendance.date ? formattedData : a
        ).concat(!state.attendance.some(a => 
          a.employeeId === attendance.employeeId && a.date === attendance.date
        ) ? [formattedData] : []),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error marking attendance:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark attendance',
        isLoading: false 
      });
      throw error;
    }
  },

  requestLeave: async (leave: Omit<LeaveRequest, 'id' | 'status'>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('leaves')
        .insert({
          employee_id: leave.employeeId,
          start_date: leave.startDate,
          end_date: leave.endDate,
          reason: leave.reason,
          type: leave.type,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        leaves: [...state.leaves, data],
        isLoading: false,
        error: null
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit leave request',
        isLoading: false 
      });
      throw error;
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

      // Format the payslip for local state
      const payslip: Payslip = {
        id: data.id, // Use the database-generated UUID
        employeeId: data.employee_id,
        month: data.month,
        year: data.year,
        basicSalary: data.basic_salary,
        allowances: data.allowances,
        deductions: data.deductions,
        netSalary: data.net_salary,
        generatedDate: data.generated_date
      };

      // Update local state
      set((state) => ({
        payslips: [...state.payslips, payslip]
      }));

      return payslip;
    } catch (error) {
      console.error('Error generating payslip:', error);
      throw error;
    }
  }
}));

export default useEmployeeStore;