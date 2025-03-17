import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hire_date: string;
  gross_salary: number;
  pay_period: string;
  tax_deduction: number;
  insurance_deduction: number;
  other_deductions: number;
}

interface EmployeeFormProps {
  onSuccess?: () => void;
}

const initialFormData: EmployeeFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  hire_date: new Date().toISOString().split('T')[0],
  gross_salary: 0,
  pay_period: 'MONTHLY',
  tax_deduction: 0,
  insurance_deduction: 0,
  other_deductions: 0,
};

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('salary') || name.includes('deduction') ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('employees')
        .insert([formData]);

      if (error) throw error;

      setSuccess(true);
      setFormData(initialFormData);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving employee data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">Hire Date</label>
          <input
            type="date"
            id="hire_date"
            name="hire_date"
            value={formData.hire_date}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="pay_period" className="block text-sm font-medium text-gray-700">Pay Period</label>
          <select
            id="pay_period"
            name="pay_period"
            value={formData.pay_period}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="BI-WEEKLY">Bi-Weekly</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </div>

        <div>
          <label htmlFor="gross_salary" className="block text-sm font-medium text-gray-700">Gross Salary</label>
          <input
            type="number"
            id="gross_salary"
            name="gross_salary"
            value={formData.gross_salary}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="tax_deduction" className="block text-sm font-medium text-gray-700">Tax Deduction</label>
          <input
            type="number"
            id="tax_deduction"
            name="tax_deduction"
            value={formData.tax_deduction}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="insurance_deduction" className="block text-sm font-medium text-gray-700">Insurance Deduction</label>
          <input
            type="number"
            id="insurance_deduction"
            name="insurance_deduction"
            value={formData.insurance_deduction}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="other_deductions" className="block text-sm font-medium text-gray-700">Other Deductions</label>
          <input
            type="number"
            id="other_deductions"
            name="other_deductions"
            value={formData.other_deductions}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Employee added successfully!</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Employee'}
        </button>
      </div>
    </form>
  );
};
