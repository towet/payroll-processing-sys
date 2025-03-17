import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle2, Plus, Search } from 'lucide-react';
import type { TaxFormData, EmployeeTaxDetails, TaxType } from '../types/tax';
import type { Employee } from '../types/dashboard';

export const TaxManagement: React.FC = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [taxDetails, setTaxDetails] = useState<EmployeeTaxDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TaxFormData>({
    tax_year: new Date().getFullYear(),
    filing_status: 'single',
    allowances: 0,
    additional_withholding: 0,
    state_code: '',
    locality: ''
  });

  const [previewIncome, setPreviewIncome] = useState<number>(0);
  const [taxPreview, setTaxPreview] = useState<{
    federal: number;
    state: number;
    local: number;
    total: number;
  } | null>(null);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees');
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadTaxDetails = async () => {
    if (!selectedEmployeeId) {
      setTaxDetails(null);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee_tax_details')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .eq('tax_year', new Date().getFullYear())
        .single();

      if (error) throw error;
      setTaxDetails(data);
    } catch (err) {
      console.error('Error loading tax details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tax details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxDetails();
  }, [selectedEmployeeId]);

  const calculateTaxAmount = async (income: number, taxType: TaxType): Promise<number> => {
    try {
      const { data: taxRates, error } = await supabase
        .from('tax_rates')
        .select('*')
        .eq('tax_type', taxType)
        .lte('income_to', income)
        .gte('income_from', income)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching ${taxType} tax rates:`, error);
        return 0;
      }

      if (!taxRates) {
        // Fallback to default rates if no specific rate is found
        const defaultRates = {
          federal: 0.22, // 22% federal tax
          state: 0.05,   // 5% state tax
          local: 0.01    // 1% local tax
        };
        return income * defaultRates[taxType];
      }

      return income * (taxRates.rate / 100);
    } catch (error) {
      console.error(`Error calculating ${taxType} tax:`, error);
      return 0;
    }
  };

  const handleTaxCalculation = async (income: number) => {
    try {
      const federalTax = await calculateTaxAmount(income, 'federal');
      const stateTax = await calculateTaxAmount(income, 'state');
      const localTax = await calculateTaxAmount(income, 'local');

      const totalTax = federalTax + stateTax + localTax;
      return {
        federal: federalTax,
        state: stateTax,
        local: localTax,
        total: totalTax
      };
    } catch (error) {
      console.error('Error in tax calculation:', error);
      return null;
    }
  };

  const handlePreviewCalculation = async () => {
    if (previewIncome <= 0) {
      setError('Please enter a valid income amount');
      return;
    }
    setError(null);
    const result = await handleTaxCalculation(previewIncome);
    if (result) {
      setTaxPreview(result);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'allowances' ? parseInt(value) || 0 : 
              name === 'additional_withholding' ? parseFloat(value) || 0 : 
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError('No employee selected');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: upsertError } = await supabase
        .from('employee_tax_details')
        .upsert({
          employee_id: selectedEmployeeId,
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      setSuccess(true);
      loadTaxDetails();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving tax details:', err);
      setError(err instanceof Error ? err.message : 'Failed to save tax details');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.position?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <span>Tax details saved successfully!</span>
          </div>
        </div>
      )}

      {/* Employee Selector */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Employee</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {filteredEmployees.map((employee) => (
            <button
              key={employee.id}
              onClick={() => setSelectedEmployeeId(employee.id)}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                selectedEmployeeId === employee.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${employee.first_name} ${employee.last_name}`
                  )}&background=random`}
                  alt={`${employee.first_name} ${employee.last_name}`}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{employee.position}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tax Preview Calculator */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tax Calculator Preview</h2>
        {!selectedEmployeeId && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p>This is a preview calculator. Select an employee to save their tax details.</p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="previewIncome" className="block text-sm font-medium text-gray-700">
              Annual Income
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="previewIncome"
                id="previewIncome"
                value={previewIncome}
                onChange={(e) => setPreviewIncome(Number(e.target.value))}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                min="0"
                step="1000"
              />
            </div>
          </div>
          
          <button
            onClick={handlePreviewCalculation}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Calculate Taxes
          </button>

          {taxPreview && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Federal Tax</h3>
                <p className="mt-1 text-lg font-semibold">${taxPreview.federal.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">State Tax</h3>
                <p className="mt-1 text-lg font-semibold">${taxPreview.state.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Local Tax</h3>
                <p className="mt-1 text-lg font-semibold">${taxPreview.local.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Total Tax</h3>
                <p className="mt-1 text-lg font-semibold text-blue-600">${taxPreview.total.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedEmployeeId ? (
        <>
          {taxDetails ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Current Tax Details</h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Update Details
                </button>
              </div>

              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tax Year</dt>
                  <dd className="mt-1 text-sm text-gray-900">{taxDetails.tax_year}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Filing Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{taxDetails.filing_status.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Allowances</dt>
                  <dd className="mt-1 text-sm text-gray-900">{taxDetails.allowances}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Additional Withholding</dt>
                  <dd className="mt-1 text-sm text-gray-900">${taxDetails.additional_withholding.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">State</dt>
                  <dd className="mt-1 text-sm text-gray-900">{taxDetails.state_code || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Locality</dt>
                  <dd className="mt-1 text-sm text-gray-900">{taxDetails.locality || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Tax Details
              </button>
            </div>
          )}
        </>
      ) : null}

      {showForm && selectedEmployeeId && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              {taxDetails ? 'Update Tax Details' : 'Add Tax Details'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tax_year" className="block text-sm font-medium text-gray-700">
                  Tax Year
                </label>
                <input
                  type="number"
                  name="tax_year"
                  id="tax_year"
                  value={formData.tax_year}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="filing_status" className="block text-sm font-medium text-gray-700">
                  Filing Status
                </label>
                <select
                  id="filing_status"
                  name="filing_status"
                  value={formData.filing_status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="single">Single</option>
                  <option value="married_joint">Married Filing Jointly</option>
                  <option value="married_separate">Married Filing Separately</option>
                  <option value="head_household">Head of Household</option>
                </select>
              </div>

              <div>
                <label htmlFor="allowances" className="block text-sm font-medium text-gray-700">
                  Allowances
                </label>
                <input
                  type="number"
                  name="allowances"
                  id="allowances"
                  min="0"
                  value={formData.allowances}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="additional_withholding" className="block text-sm font-medium text-gray-700">
                  Additional Withholding
                </label>
                <input
                  type="number"
                  name="additional_withholding"
                  id="additional_withholding"
                  min="0"
                  step="0.01"
                  value={formData.additional_withholding}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="state_code" className="block text-sm font-medium text-gray-700">
                  State Code
                </label>
                <input
                  type="text"
                  name="state_code"
                  id="state_code"
                  maxLength={2}
                  value={formData.state_code}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="locality" className="block text-sm font-medium text-gray-700">
                  Locality
                </label>
                <input
                  type="text"
                  name="locality"
                  id="locality"
                  value={formData.locality}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
