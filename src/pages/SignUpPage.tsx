import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signUp, error: authError, isLoading, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);
  const [signupStatus, setSignupStatus] = useState<{message: string, type: 'info' | 'success' | 'error' | null}>({message: '', type: null});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    department: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (authError) clearError();
    if (localError) setLocalError(null);
  };

  useEffect(() => {
    // Update the local error state when authError changes
    if (authError) {
      setSignupStatus({message: authError, type: 'error'});
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSignupStatus({message: 'Validating input...', type: 'info'});
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords don't match!");
      setSignupStatus({message: "Passwords don't match!", type: 'error'});
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      setSignupStatus({message: "Password must be at least 6 characters long", type: 'error'});
      return;
    }

    try {
      setSignupStatus({message: 'Creating your account...', type: 'info'});
      console.log('SignupPage: Starting account creation process');
      
      await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        department: formData.department,
        role: 'employee'
      });
      
      console.log('SignupPage: Account creation was successful');
      setSignupStatus({message: 'Account created successfully! Redirecting to login...', type: 'success'});
      
      // Show success message before redirecting
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('SignupPage: Signup error:', err);
      setSignupStatus({message: err instanceof Error ? err.message : 'An unknown error occurred', type: 'error'});
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in if you already have an account
            </Link>
          </p>
          
          {/* Status message */}
          {signupStatus.type && (
            <div className={`rounded-md p-4 mt-4 ${signupStatus.type === 'error' ? 'bg-red-50' : 
                                                 signupStatus.type === 'success' ? 'bg-green-50' : 'bg-blue-50'}`}>
              <div className="flex">
                <div className="ml-3 w-full">
                  <h3 className={`text-sm font-medium ${signupStatus.type === 'error' ? 'text-red-800' : 
                                                        signupStatus.type === 'success' ? 'text-green-800' : 'text-blue-800'}`}>
                    {signupStatus.type === 'error' ? 'Error' : 
                     signupStatus.type === 'success' ? 'Success' : 'Info'}
                  </h3>
                  <div className={`mt-2 text-sm ${signupStatus.type === 'error' ? 'text-red-700' : 
                                                     signupStatus.type === 'success' ? 'text-green-700' : 'text-blue-700'}`}>
                    <p>{signupStatus.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Local error only displayed if no status message */}
          {(!signupStatus.type && localError) && (
            <div className="rounded-md bg-red-50 p-4 mt-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{localError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.password}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  required
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                data-testid="signup-button"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Sign up'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
