import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  X
} from 'lucide-react';
import { EmployeeForm } from '../components/EmployeeForm';
import { supabase } from '../lib/supabase';
import type { Employee } from '../types/dashboard';

interface EmployeeCardProps {
  employee: Employee;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => (
  <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center space-x-4">
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${employee.first_name} ${employee.last_name}`)}&background=random`}
        alt={`${employee.first_name} ${employee.last_name}`}
        className="w-12 h-12 rounded-full"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{employee.first_name} {employee.last_name}</h3>
        <p className="text-sm text-gray-500">{employee.position || 'No position set'}</p>
        <p className="text-sm text-gray-500">{employee.department || 'No department set'}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">Salary: ${employee.gross_salary.toLocaleString()}</p>
        <p className="text-xs text-gray-500">{employee.pay_period}</p>
      </div>
      <button className="ml-2 text-gray-400 hover:text-gray-600">
        <MoreVertical className="h-5 w-5" />
      </button>
    </div>
  </div>
);

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEmployeeAdded = () => {
    setShowAddModal(false);
    loadEmployees();
  };

  const filteredEmployees = employees.filter(emp => 
    emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.position?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (emp.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            {employees.length} {employees.length === 1 ? 'employee' : 'employees'} total
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Employee
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-2 text-gray-500" />
          Filter
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new employee.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Employee</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <EmployeeForm onSuccess={handleEmployeeAdded} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;