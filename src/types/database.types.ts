export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          department: string | null
          position: string | null
          hire_date: string
          gross_salary: number
          pay_period: string
          tax_deduction: number
          insurance_deduction: number
          other_deductions: number
          net_salary: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          department?: string | null
          position?: string | null
          hire_date: string
          gross_salary: number
          pay_period: string
          tax_deduction?: number
          insurance_deduction?: number
          other_deductions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          department?: string | null
          position?: string | null
          hire_date?: string
          gross_salary?: number
          pay_period?: string
          tax_deduction?: number
          insurance_deduction?: number
          other_deductions?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone_number: string
          department: string
          role: 'admin' | 'employee'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone_number: string
          department: string
          role?: 'admin' | 'employee'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone_number?: string
          department?: string
          role?: 'admin' | 'employee'
          created_at?: string
          updated_at?: string
        }
      }
      leaves: {
        Row: {
          id: string
          employee_id: string
          start_date: string
          end_date: string
          reason: string
          type: 'annual' | 'sick' | 'personal' | 'unpaid'
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          start_date: string
          end_date: string
          reason: string
          type: 'annual' | 'sick' | 'personal' | 'unpaid'
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          start_date?: string
          end_date?: string
          reason?: string
          type?: 'annual' | 'sick' | 'personal' | 'unpaid'
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          employee_id: string
          date: string
          time_in: string
          time_out: string | null
          status: 'present' | 'absent' | 'late'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          date: string
          time_in: string
          time_out?: string | null
          status: 'present' | 'absent' | 'late'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          time_in?: string
          time_out?: string | null
          status?: 'present' | 'absent' | 'late'
          created_at?: string
          updated_at?: string
        }
      }
      payslips: {
        Row: {
          id: string
          employee_id: string
          month: string
          year: number
          basic_salary: number
          allowances: number
          deductions: number
          net_salary: number
          generated_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          month: string
          year: number
          basic_salary: number
          allowances?: number
          deductions?: number
          net_salary: number
          generated_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          month?: string
          year?: number
          basic_salary?: number
          allowances?: number
          deductions?: number
          net_salary?: number
          generated_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      payroll_periods: {
        Row: {
          id: string
          period_start: string
          period_end: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          period_start: string
          period_end: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          period_start?: string
          period_end?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      payroll_items: {
        Row: {
          id: string
          period_id: string
          employee_id: string
          base_salary: number
          overtime_hours: number
          overtime_rate: number
          overtime_pay: number
          allowances: number
          bonuses: number
          tax_deductions: number
          insurance_deductions: number
          other_deductions: number
          gross_pay: number
          net_pay: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          period_id: string
          employee_id: string
          base_salary: number
          overtime_hours?: number
          overtime_rate?: number
          allowances?: number
          bonuses?: number
          tax_deductions?: number
          insurance_deductions?: number
          other_deductions?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          period_id?: string
          employee_id?: string
          base_salary?: number
          overtime_hours?: number
          overtime_rate?: number
          allowances?: number
          bonuses?: number
          tax_deductions?: number
          insurance_deductions?: number
          other_deductions?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      payroll_history: {
        Row: {
          id: string
          period_id: string
          period_start: string
          period_end: string
          employee_id: string
          first_name: string
          last_name: string
          department: string
          position: string
          base_salary: number
          overtime_hours: number
          overtime_rate: number
          overtime_pay: number
          allowances: number
          bonuses: number
          tax_deductions: number
          insurance_deductions: number
          other_deductions: number
          gross_pay: number
          net_pay: number
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
