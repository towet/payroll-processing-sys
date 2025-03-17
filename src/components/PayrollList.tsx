import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Download, Filter, Search } from 'lucide-react';
import type { PayrollHistoryItem } from '../types/dashboard';

interface PayrollListProps {
  employeeId?: string;
}

export const PayrollList: React.FC<PayrollListProps> = ({ employeeId }) => {
  const [payrollItems, setPayrollItems] = useState<PayrollHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, thisMonth, lastMonth
  const [sortField, setSortField] = useState<keyof PayrollHistoryItem>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const loadPayrollHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('payroll_history')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setPayrollItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payroll history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrollHistory();
  }, [employeeId, sortField, sortDirection]);

  const handleSort = (field: keyof PayrollHistoryItem) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredItems = payrollItems.filter(item => {
    const searchMatch = 
      item.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.position.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    if (filterPeriod === 'all') return true;

    const itemDate = new Date(item.period_start);
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    if (filterPeriod === 'thisMonth') {
      return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
    }

    if (filterPeriod === 'lastMonth') {
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastMonthYear;
    }

    return true;
  });

  const downloadPayrollReport = (item: PayrollHistoryItem) => {
    const reportContent = `
Payroll Report
-------------
Employee: ${item.first_name} ${item.last_name}
Department: ${item.department}
Position: ${item.position}
Period: ${format(new Date(item.period_start), 'MMM d, yyyy')} - ${format(new Date(item.period_end), 'MMM d, yyyy')}

Earnings
--------
Base Salary: $${item.base_salary.toFixed(2)}
Overtime Hours: ${item.overtime_hours}
Overtime Rate: $${item.overtime_rate.toFixed(2)}
Overtime Pay: $${item.overtime_pay.toFixed(2)}
Allowances: $${item.allowances.toFixed(2)}
Bonuses: $${item.bonuses.toFixed(2)}

Deductions
----------
Tax: $${item.tax_deductions.toFixed(2)}
Insurance: $${item.insurance_deductions.toFixed(2)}
Other: $${item.other_deductions.toFixed(2)}

Summary
-------
Gross Pay: $${item.gross_pay.toFixed(2)}
Net Pay: $${item.net_pay.toFixed(2)}

Notes: ${item.notes || 'N/A'}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-report-${item.first_name}-${item.last_name}-${item.period_start}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, department, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Periods</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('last_name')}
              >
                Employee
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('department')}
              >
                Department
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('gross_pay')}
              >
                Gross Pay
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('net_pay')}
              >
                Net Pay
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(item.period_start), 'MMM d, yyyy')} - {format(new Date(item.period_end), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.first_name} {item.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{item.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${item.gross_pay.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${item.net_pay.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => downloadPayrollReport(item)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payroll records found</p>
          </div>
        )}
      </div>
    </div>
  );
};
