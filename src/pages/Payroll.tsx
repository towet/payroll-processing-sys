import { useState } from 'react';
import { PayrollForm } from '../components/PayrollForm';
import { PayrollList } from '../components/PayrollList';
import { supabase } from '../lib/supabase';
import type { Employee } from '../types/dashboard';
import { Users, Search, X } from 'lucide-react';

export const Payroll = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const searchEmployees = async (term: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .or(`first_name.ilike.${term}%,last_name.ilike.${term}%,department.ilike.${term}%,position.ilike.${term}%`)
        .limit(10);

      if (error) {
        console.error('Supabase search error:', error);
        throw error;
      }
      
      console.log('Search results:', data); // Debug log
      setEmployees(data || []);
    } catch (error) {
      console.error('Error searching employees:', error);
      setEmployees([]); // Clear results on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim().length >= 1) { // Reduced minimum length to 1 character
      searchEmployees(term.trim());
    } else {
      setEmployees([]);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
    setSearchTerm('');
    setEmployees([]);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payroll Management</h1>
        
        {!showForm && (
          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search employee by name or department..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {searchTerm && employees.length > 0 && (
              <div className="absolute z-10 w-full max-w-md bg-white mt-1 rounded-lg shadow-lg border border-gray-200">
                <ul className="py-1">
                  {employees.map((employee) => (
                    <li
                      key={employee.id}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.department} • {employee.position}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {showForm ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Process Payroll for {selectedEmployee?.first_name} {selectedEmployee?.last_name}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <PayrollForm
              employee={selectedEmployee || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : null}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Payroll History</h2>
        <PayrollList employeeId={selectedEmployee?.id} />
      </div>
    </div>
  );
};
