import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Clock,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { LeaveRequest } from '../components/LeaveRequest';

interface LeaveRequestData {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'personal' | 'unpaid';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AttendanceRecord {
  id?: string;
  employeeId: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  status: 'present' | 'late' | 'absent';
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

export default function EmployeeDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuthStore();
  const { employee, leaves, attendance, payslips, fetchEmployeeData, isLoading, error } = useEmployeeStore();

  console.log('EmployeeDashboard rendering:', {
    isAuthenticated,
    employee,
    leaves,
    attendance,
    isLoading,
    error
  });

  useEffect(() => {
    if (isAuthenticated && userProfile?.email) {
      fetchEmployeeData(userProfile.email);
    }
  }, [isAuthenticated, userProfile?.email, fetchEmployeeData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600">No employee data found. Please contact your administrator.</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    const { signOut } = useAuthStore.getState();
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leave Requests', icon: Calendar },
    { id: 'payslips', label: 'Payslips', icon: FileText }
  ];

  const myLeaves = leaves.filter((leave: LeaveRequestData) => leave.employeeId === employee.id);
  const myAttendance = attendance.filter((a: AttendanceRecord) => a.employeeId === employee.id);
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = myAttendance.find((a: AttendanceRecord) => a.date === today);
  const approvedLeaves = myLeaves.filter((leave: LeaveRequestData) => leave.status === 'approved').length;
  const pendingLeaves = myLeaves.filter((leave: LeaveRequestData) => leave.status === 'pending').length;

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <Profile />;
      case 'attendance':
        return <AttendanceTracking />;
      case 'leaves':
        return <LeaveRequest />;
      case 'payslips':
        return <PayslipView />;
      default:
        return (
          <div className="grid grid-cols-1 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    if (!employee?.id) return;
                    const { markAttendance } = useEmployeeStore.getState();
                    markAttendance({
                      employeeId: employee.id,
                      date: today,
                      timeIn: format(new Date(), 'HH:mm'),
                      timeOut: '',
                      status: 'present'
                    });
                  }}
                  disabled={!!todayAttendance}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Time In
                </button>
                <button
                  onClick={() => {
                    if (!employee?.id || !todayAttendance) return;
                    const { markAttendance } = useEmployeeStore.getState();
                    markAttendance({
                      employeeId: employee.id,
                      date: today,
                      timeIn: todayAttendance.timeIn,
                      timeOut: format(new Date(), 'HH:mm'),
                      status: todayAttendance.status
                    });
                  }}
                  disabled={!todayAttendance || todayAttendance.timeOut !== ''}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Time Out
                </button>
              </div>
            </div>

            {/* Leave Request Form */}
            <LeaveRequest />

            {/* Leave History */}
            <LeaveRequests />

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {/* Recent Attendance */}
                {todayAttendance && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    <span>
                      Today's Time In: {todayAttendance.timeIn}
                      {todayAttendance.timeOut && ` | Time Out: ${todayAttendance.timeOut}`}
                    </span>
                  </div>
                )}
                
                {/* Recent Leave Requests */}
                {myLeaves.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    <span>
                      Latest Leave Request: {myLeaves[0].type} ({myLeaves[0].status})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
          <h1 className="text-xl font-bold">Employee Portal</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{employee.first_name}</h3>
              <p className="text-xs text-gray-500">{employee.position}</p>
            </div>
          </div>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center w-full px-6 py-3 text-left ${
                  activeSection === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-6 py-3 text-left text-gray-600 hover:bg-gray-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="flex items-center justify-between h-16 px-6 bg-white shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Today's Status</h3>
                <p className="text-2xl font-semibold">
                  {todayAttendance ? todayAttendance.status : 'Not Marked'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Approved Leaves</h3>
                <p className="text-2xl font-semibold">{approvedLeaves}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Pending Leaves</h3>
                <p className="text-2xl font-semibold">{pendingLeaves}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Latest Payslip</h3>
                <p className="text-2xl font-semibold">
                  {payslips.length > 0 ? `$${payslips[payslips.length - 1].netSalary.toLocaleString()}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const Profile = () => {
  const { employee } = useEmployeeStore();

  if (!employee) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {employee.first_name[0]}{employee.last_name[0]}
        </div>
        <div className="ml-4">
          <h2 className="text-2xl font-bold">{employee.first_name} {employee.last_name}</h2>
          <p className="text-gray-600">{employee.position}</p>
          <p className="text-gray-600">{employee.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Email</p>
          <p className="font-semibold">{employee.email}</p>
        </div>
        <div>
          <p className="text-gray-600">Phone</p>
          <p className="font-semibold">{employee.phone || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-gray-600">Hire Date</p>
          <p className="font-semibold">{format(new Date(employee.hire_date), 'MMMM dd, yyyy')}</p>
        </div>
        <div>
          <p className="text-gray-600">Gross Salary</p>
          <p className="font-semibold">${employee.gross_salary.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

const AttendanceTracking = () => {
  const { employee, attendance, markAttendance, isLoading, error: attendanceError } = useEmployeeStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-gray-600">No employee data found. Please contact your administrator.</div>
      </div>
    );
  }

  const myAttendance = attendance.filter((a: AttendanceRecord) => a.employeeId === employee.id);
  const todayAttendance = myAttendance.find((a: AttendanceRecord) => a.date === today);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const handleTimeIn = async () => {
    if (todayAttendance) return;
    
    try {
      const now = new Date();
      const timeIn = format(now, 'HH:mm');
      const status = parseInt(timeIn.split(':')[0]) > 9 ? 'late' : 'present';

      await markAttendance({
        employeeId: employee.id,
        date: today,
        timeIn,
        timeOut: '',
        status
      });
    } catch (error) {
      console.error('Error marking time in:', error);
    }
  };

  const handleTimeOut = async () => {
    if (!todayAttendance) return;
    
    try {
      const timeOut = format(new Date(), 'HH:mm');
      await markAttendance({
        employeeId: employee.id,
        date: today,
        timeIn: todayAttendance.timeIn,
        timeOut,
        status: todayAttendance.status
      });
    } catch (error) {
      console.error('Error marking time out:', error);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const filteredAttendance = myAttendance.filter((a: AttendanceRecord) => a.date.startsWith(selectedMonth));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Attendance Tracking</h2>
        <input
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Today's Attendance Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-gray-600">Time In: {todayAttendance?.timeIn || '-'}</p>
            <p className="text-gray-600">Time Out: {todayAttendance?.timeOut || '-'}</p>
            <p className="text-gray-600">Status: 
              <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                todayAttendance?.status === 'present' ? 'bg-green-100 text-green-800' :
                todayAttendance?.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {todayAttendance?.status ? todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1) : 'Not Marked'}
              </span>
            </p>
          </div>
          <div className="space-x-4">
            <button
              onClick={handleTimeIn}
              disabled={!!todayAttendance || isLoading}
              className={`px-4 py-2 rounded-lg ${
                todayAttendance || isLoading ? 'bg-gray-100 text-gray-500 cursor-not-allowed' :
                'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Time In'}
            </button>
            <button
              onClick={handleTimeOut}
              disabled={!todayAttendance || todayAttendance.timeOut !== '' || isLoading}
              className={`px-4 py-2 rounded-lg ${
                !todayAttendance || todayAttendance?.timeOut !== '' || isLoading ?
                'bg-gray-100 text-gray-500 cursor-not-allowed' :
                'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Time Out'}
            </button>
          </div>
        </div>
        {attendanceError && (
          <div className="mt-4 text-red-600 text-sm">
            {attendanceError}
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record: AttendanceRecord) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(record.date), 'PP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.timeIn || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.timeOut || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.timeIn && record.timeOut ? 
                      calculateDuration(record.timeIn, record.timeOut) : 
                      '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate duration between time in and time out
const calculateDuration = (timeIn: string, timeOut: string) => {
  const [inHours, inMinutes] = timeIn.split(':').map(Number);
  const [outHours, outMinutes] = timeOut.split(':').map(Number);
  
  const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

const LeaveRequests = () => {
  const { leaves, requestLeave, employee } = useEmployeeStore();
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'personal' | 'unpaid'>('annual');
  const [error, setError] = useState<string | null>(null);

  const myLeaves = leaves.filter((leave: LeaveRequestData) => leave.employeeId === employee?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?.id) {
      setError('Employee information not found');
      return;
    }
    
    try {
      // Basic validation
      if (!startDate || !endDate || !reason) {
        setError('Please fill in all fields');
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        setError('End date cannot be before start date');
        return;
      }

      await requestLeave({
        employeeId: employee.id,
        startDate,
        endDate,
        type: leaveType,
        reason
      });

      // Reset form on success
      setStartDate('');
      setEndDate('');
      setReason('');
      setLeaveType('annual');
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit leave request');
    }
  };

  const leaveTypes = [
    { id: 'annual' as const, label: 'Annual Leave' },
    { id: 'sick' as const, label: 'Sick Leave' },
    { id: 'personal' as const, label: 'Personal Leave' },
    { id: 'unpaid' as const, label: 'Unpaid Leave' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Leave Requests</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Request Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {leaveTypes.map((type) => (
          <div key={type.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.label}</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Available</span>
              <span className="text-2xl font-semibold text-blue-600">
                {type.id === 'annual' ? '15' : type.id === 'sick' ? '10' : '5'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">New Leave Request</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as 'annual' | 'sick' | 'personal' | 'unpaid')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Leave History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myLeaves.map((leave: LeaveRequestData) => (
                <tr key={leave.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(leave.startDate), 'PP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(leave.endDate), 'PP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{leave.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PayslipView = () => {
  const { employee, payslips, generatePayslip } = useEmployeeStore();

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-gray-600">No employee data found. Please contact your administrator.</div>
      </div>
    );
  }

  const myPayslips = payslips.filter((p: Payslip) => p.employeeId === employee.id);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generatingPayslip, setGeneratingPayslip] = useState(false);

  const handleGeneratePayslip = async () => {
    if (!employee) return;
    
    try {
      setGeneratingPayslip(true);
      await generatePayslip(employee.id, selectedMonth, selectedYear);
    } catch (error) {
      console.error('Error generating payslip:', error);
    } finally {
      setGeneratingPayslip(false);
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Payslips</h2>
        <div className="flex gap-4 mb-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border rounded-md"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            onClick={handleGeneratePayslip}
            disabled={generatingPayslip}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300`}
          >
            {generatingPayslip ? 'Generating...' : 'Generate Payslip'}
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {myPayslips.map((payslip: Payslip) => (
          <div key={payslip.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Payslip for {payslip.month} {payslip.year}
              </h3>
              <span className="text-sm text-gray-500">
                Generated on: {format(new Date(payslip.generatedDate), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Basic Salary</p>
                <p className="font-medium">{formatCurrency(payslip.basicSalary)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Allowances</p>
                <p className="font-medium">{formatCurrency(payslip.allowances)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deductions</p>
                <p className="font-medium text-red-600">
                  -{formatCurrency(payslip.deductions)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Net Salary</p>
                <p className="font-medium text-green-600">
                  {formatCurrency(payslip.netSalary)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};