import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Employee } from '../types/dashboard';

interface PayrollFormData {
  periodStart: string;
  periodEnd: string;
  employeeId: string;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  allowances: number;
  bonuses: number;
  taxDeductions: number;
  insuranceDeductions: number;
  otherDeductions: number;
  notes: string;
}

interface PayrollFormProps {
  employee?: Employee;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PayrollForm: React.FC<PayrollFormProps> = ({ employee, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<PayrollFormData>({
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    employeeId: employee?.id || '',
    baseSalary: employee?.gross_salary || 0,
    overtimeHours: 0,
    overtimeRate: 0,
    allowances: 0,
    bonuses: 0,
    taxDeductions: employee?.tax_deduction || 0,
    insuranceDeductions: employee?.insurance_deduction || 0,
    otherDeductions: employee?.other_deductions || 0,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('period') ? value : Number(value) || value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate dates
      const startDate = new Date(formData.periodStart);
      const endDate = new Date(formData.periodEnd);
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }

      // First create the pay period
      const { data: periodData, error: periodError } = await supabase
        .from('payroll_periods')
        .insert([{
          period_start: formData.periodStart,
          period_end: formData.periodEnd,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (periodError) {
        console.error('Period creation error:', periodError);
        throw new Error(periodError.message);
      }

      if (!periodData) {
        throw new Error('Failed to create pay period');
      }

      // Calculate overtime pay
      const overtimePay = formData.overtimeHours * formData.overtimeRate;
      const grossPay = formData.baseSalary + overtimePay + formData.allowances + formData.bonuses;
      const netPay = grossPay - formData.taxDeductions - formData.insuranceDeductions - formData.otherDeductions;

      // Then create the payroll item
      const { error: itemError } = await supabase
        .from('payroll_items')
        .insert([{
          period_id: periodData.id,
          employee_id: formData.employeeId,
          base_salary: formData.baseSalary,
          overtime_hours: formData.overtimeHours,
          overtime_rate: formData.overtimeRate,
          allowances: formData.allowances,
          bonuses: formData.bonuses,
          tax_deductions: formData.taxDeductions,
          insurance_deductions: formData.insuranceDeductions,
          other_deductions: formData.otherDeductions,
          notes: formData.notes,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (itemError) {
        console.error('Payroll item creation error:', itemError);
        throw new Error(itemError.message);
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Payroll processing error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            <span>Payroll processed successfully!</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Period Start Date
          </label>
          <input
            type="date"
            name="periodStart"
            value={formData.periodStart}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Period End Date
          </label>
          <input
            type="date"
            name="periodEnd"
            value={formData.periodEnd}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Salary
          </label>
          <input
            type="number"
            name="baseSalary"
            value={formData.baseSalary}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overtime Hours
          </label>
          <input
            type="number"
            name="overtimeHours"
            value={formData.overtimeHours}
            onChange={handleInputChange}
            min="0"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overtime Rate (per hour)
          </label>
          <input
            type="number"
            name="overtimeRate"
            value={formData.overtimeRate}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allowances
          </label>
          <input
            type="number"
            name="allowances"
            value={formData.allowances}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bonuses
          </label>
          <input
            type="number"
            name="bonuses"
            value={formData.bonuses}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax Deductions
          </label>
          <input
            type="number"
            name="taxDeductions"
            value={formData.taxDeductions}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Insurance Deductions
          </label>
          <input
            type="number"
            name="insuranceDeductions"
            value={formData.insuranceDeductions}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Other Deductions
          </label>
          <input
            type="number"
            name="otherDeductions"
            value={formData.otherDeductions}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processing...' : 'Process Payroll'}
        </button>
      </div>
    </form>
  );
};
