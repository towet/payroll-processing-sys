export type TaxType = 'federal' | 'state' | 'local';
export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_household';

export interface TaxRate {
  id: string;
  tax_type: TaxType;
  state_code: string | null;
  locality: string | null;
  tax_year: number;
  income_from: number;
  income_to: number;
  rate: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeTaxDetails {
  id: string;
  employee_id: string;
  tax_year: number;
  filing_status: FilingStatus;
  allowances: number;
  additional_withholding: number;
  state_code: string | null;
  locality: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxCalculation {
  id: string;
  employee_id: string;
  payroll_item_id: string;
  tax_type: TaxType;
  taxable_income: number;
  tax_rate: number;
  tax_amount: number;
  created_at: string;
  updated_at: string;
}

export interface TaxFormData {
  tax_year: number;
  filing_status: FilingStatus;
  allowances: number;
  additional_withholding: number;
  state_code: string;
  locality: string;
}
