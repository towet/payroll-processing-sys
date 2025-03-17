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
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';

export default function EmployeeDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const navigate = useNavigate();
  const { userProfile, isAuthenticated } = useAuthStore();
  const { employees, leaves, attendance, payslips, fetchEmployeeData, isLoading, error } = useEmployeeStore();
  const employee = employees.find(e => e.email === userProfile?.email);

  console.log('EmployeeDashboard rendering:', {
    userProfile,
    isAuthenticated,
    employeesCount: employees.length,
    employee,
    leaves,
    attendance,
    isLoading,
    error
  });

  // Fetch employee data when component mounts
  useEffect(() => {
    if (userProfile?.email && !employee && !isLoading) {
      console.log('Fetching employee data for:', userProfile.email);
      fetchEmployeeData(userProfile.email);
    }
  }, [userProfile?.email, employee, isLoading, fetchEmployeeData]);

  // Check authentication
  if (!isAuthenticated || !userProfile) {
    console.log('Not authenticated, redirecting to login');
    navigate('/login');
    return null;
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Your Dashboard</h2>
          <p className="text-gray-600">Please wait while we fetch your information...</p>
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => userProfile.email && fetchEmployeeData(userProfile.email)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show not found state if no employee data exists
  if (!employee) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Employee Profile Not Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn't find your employee profile. This could be because:
          </p>
          <ul className="text-gray-600 mb-6 list-disc list-inside">
            <li>Your profile hasn't been set up by the administrator yet</li>
            <li>There might be a mismatch in your email address</li>
            <li>Your account is still being processed</li>
          </ul>
          <p className="text-gray-600">
            Please contact your administrator and provide them with your email: <br/>
            <span className="font-medium text-blue-600">{userProfile.email}</span>
          </p>
        </div>
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
    { id: 'leave', label: 'Leave Requests', icon: Calendar },
    { id: 'payslips', label: 'Payslips', icon: FileText }
  ];

  const myLeaves = leaves.filter(leave => leave.employeeId === userProfile?.id);
  const myAttendance = attendance.filter(a => a.employeeId === userProfile?.id);
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = myAttendance.find(a => a.date === today);
  const approvedLeaves = myLeaves.filter(leave => leave.status === 'approved').length;
  const pendingLeaves = myLeaves.filter(leave => leave.status === 'pending').length;

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <Profile />;
      case 'attendance':
        return <AttendanceTracking />;
      case 'leave':
        return <LeaveRequests />;
      case 'payslips':
        return <PayslipView />;
      default:
        return <Profile />;
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
              <h3 className="text-sm font-medium text-gray-900">{employee.name}</h3>
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
  const { userProfile } = useAuthStore();
  const { employees } = useEmployeeStore();
  const employee = employees.find(e => e.email === userProfile?.email);

  if (!employee) return null;

  const sections = [
    { title: 'Personal Information', items: [
      { label: 'Full Name', value: `${employee.first_name} ${employee.last_name}` },
      { label: 'Email', value: employee.email },
      { label: 'Phone', value: employee.phone || 'Not provided' },
    ]},
    { title: 'Work Information', items: [
      { label: 'Position', value: employee.position || 'Not specified' },
      { label: 'Department', value: employee.department || 'Not specified' },
    ]},
    { title: 'Employment Details', items: [
      { label: 'Employee ID', value: employee.id },
      { label: 'Hire Date', value: employee.hire_date ? format(new Date(employee.hire_date), 'PPP') : 'Not specified' },
      { label: 'Gross Salary', value: employee.gross_salary ? `$${employee.gross_salary.toLocaleString()}` : 'Not specified' },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-blue-600">
              <User className="h-12 w-12" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{`${employee.first_name} ${employee.last_name}`}</h3>
              <p className="text-blue-100">{employee.position || 'Position not specified'}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-8 last:mb-0">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h4>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="bg-gray-50 px-4 py-3 rounded-lg">
                    <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AttendanceTracking = () => {
  const { userProfile } = useAuthStore();
  const { attendance, markAttendance } = useEmployeeStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const myAttendance = attendance.filter(a => a.employeeId === userProfile?.id);
  const todayAttendance = myAttendance.find(a => a.date === today);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const handleTimeIn = () => {
    if (!userProfile?.id || todayAttendance) return;
    
    const now = new Date();
    const timeIn = format(now, 'HH:mm');
    const isLate = now.getHours() >= 9; // Consider 9 AM as start time
    
    markAttendance({
      employeeId: userProfile.id,
      timeIn,
      timeOut: null,
      status: isLate ? 'late' : 'present',
      date: today
    });
  };

  const handleTimeOut = () => {
    if (!userProfile?.id || !todayAttendance || todayAttendance.timeOut) return;
    
    const timeOut = format(new Date(), 'HH:mm');
    markAttendance({
      ...todayAttendance,
      timeOut
    });
  };

  const filteredAttendance = myAttendance.filter(a => a.date.startsWith(selectedMonth));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Attendance Tracking</h2>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
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
                {todayAttendance?.status || 'Not Marked'}
              </span>
            </p>
          </div>
          <div className="space-x-4">
            <button
              onClick={handleTimeIn}
              disabled={!!todayAttendance}
              className={`px-4 py-2 rounded-lg ${
                todayAttendance ? 'bg-gray-100 text-gray-500 cursor-not-allowed' :
                'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Time In
            </button>
            <button
              onClick={handleTimeOut}
              disabled={!todayAttendance || !!todayAttendance?.timeOut}
              className={`px-4 py-2 rounded-lg ${
                !todayAttendance || !!todayAttendance?.timeOut ?
                'bg-gray-100 text-gray-500 cursor-not-allowed' :
                'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Time Out
            </button>
          </div>
        </div>
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
              {filteredAttendance.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(record.date), 'PP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.timeIn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.timeOut || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.timeOut ? 
                      `${Math.round((new Date(`2000/01/01 ${record.timeOut}`).getTime() - 
                        new Date(`2000/01/01 ${record.timeIn}`).getTime()) / (1000 * 60 * 60))} hrs` : 
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

const LeaveRequests = () => {
  const { userProfile } = useAuthStore();
  const { leaves, requestLeave } = useEmployeeStore();
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'personal' | 'unpaid'>('annual');
  const [error, setError] = useState<string | null>(null);

  const myLeaves = leaves.filter(leave => leave.employeeId === userProfile?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;
    
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

      requestLeave({
        employeeId: userProfile.id,
        startDate,
        endDate,
        reason,
        type: leaveType
      });

      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      setLeaveType('annual');
      setShowForm(false);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit leave request');
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
              {myLeaves.map((leave) => (
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
  const { userProfile } = useAuthStore();
  const { payslips, generatePayslip } = useEmployeeStore();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const myPayslips = payslips.filter(p => p.employeeId === userProfile?.id);

  const handleGeneratePayslip = async () => {
    if (!userProfile?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [year, month] = selectedMonth.split('-');
      await generatePayslip(userProfile.id, month, parseInt(year));
    } catch (error) {
      console.error('Error generating payslip:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate payslip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payslips</h2>
        <div className="flex items-center space-x-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={handleGeneratePayslip}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Payslip'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {myPayslips.map((payslip) => (
          <div
            key={payslip.id}
            className="bg-white rounded-lg shadow p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {format(new Date(payslip.year, parseInt(payslip.month) - 1), 'MMMM yyyy')}
              </h3>
              <span className="text-sm text-gray-500">
                Generated: {format(new Date(payslip.generatedDate), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-medium">${payslip.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Allowances</span>
                <span className="font-medium text-green-600">+${payslip.allowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deductions</span>
                <span className="font-medium text-red-600">-${payslip.deductions.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="font-semibold">Net Salary</span>
                  <span className="font-semibold">${payslip.netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};