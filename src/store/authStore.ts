import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/user';

interface AuthState {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'email'>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Rate limiting helper
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_DURATION = 60000; // 60 seconds

const checkRateLimit = (email: string): boolean => {
  const now = Date.now();
  const lastAttempt = rateLimitMap.get(email);
  
  if (lastAttempt && now - lastAttempt < RATE_LIMIT_DURATION) {
    const remainingTime = Math.ceil((RATE_LIMIT_DURATION - (now - lastAttempt)) / 1000);
    throw new Error(`Please wait ${remainingTime} seconds before trying again.`);
  }
  
  rateLimitMap.set(email, now);
  return true;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userProfile: null,
  isLoading: false,
  error: null,

  signUp: async (email, password, profile) => {
    try {
      console.log('📝 Starting sign up process for:', email);
      // Check rate limit
      checkRateLimit(email);
      
      set({ isLoading: true, error: null });

      // First, check if the user already exists
      console.log('📝 Checking if user already exists in profiles...');
      const { data: existingUser, error: existingUserError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUserError) {
        console.log('📝 Error when checking existing user:', existingUserError);
        // This is expected if the user doesn't exist
      }

      if (existingUser) {
        console.error('📝 User already exists in profiles:', existingUser);
        throw new Error('An account with this email already exists');
      }

      // Create auth user with auto confirm enabled
      console.log('📝 Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profile.full_name,
            phone_number: profile.phone_number,
            department: profile.department,
            role: profile.role
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) {
        console.error('📝 Auth creation error:', authError);
        throw new Error(authError.message);
      }

      console.log('📝 Auth account created successfully:', authData);

      if (!authData.user) {
        console.error('📝 Auth data missing user object');
        throw new Error('User creation failed');
      }

      // Create user profile
      console.log('📝 Creating user profile...');
      const { error: profileError, data: profileData } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        department: profile.department,
        role: profile.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select();

      if (profileError) {
        console.error('📝 Profile creation error:', profileError);
        throw new Error('Failed to create user profile. Please try again.');
      }

      console.log('📝 User profile created successfully:', profileData);

      // Check if employees table exists and create employee record
      console.log('📝 Checking if employees table exists...');
      const { error: tableError } = await supabase
        .from('employees')
        .select('id')
        .limit(1);

      if (tableError) {
        console.error('📝 Error checking employees table:', tableError);
        console.warn('📝 Employees table might not exist or accessible. This could be the reason for login issues.');
      } else {
        // Try to create an employee record
        console.log('📝 Creating employee record...');
        const { error: employeeError, data: employeeData } = await supabase
          .from('employees')
          .insert({
            id: authData.user.id,
            first_name: profile.full_name.split(' ')[0],
            last_name: profile.full_name.split(' ').slice(1).join(' '),
            email: email,
            phone: profile.phone_number,
            department: profile.department,
            position: 'Employee', // Default position
            hire_date: new Date().toISOString().split('T')[0], // Today's date
            gross_salary: 0, // Default salary
            pay_period: 'monthly' // Default pay period
          })
          .select();

        if (employeeError) {
          console.error('📝 Employee record creation error:', employeeError);
          console.warn('📝 Failed to create employee record. This will cause issues when logging in.');
        } else {
          console.log('📝 Employee record created successfully:', employeeData);
        }
      }

      console.log('📝 Sign up process completed successfully!');
      set({ isLoading: false });
    } catch (error) {
      console.error('📝 Signup process failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during signup',
        isLoading: false 
      });
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      // Check rate limit
      checkRateLimit(email);

      set({ isLoading: true, error: null });
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Login failed');
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      set({ 
        isAuthenticated: true,
        userProfile: profile,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during signin',
        isLoading: false 
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }

      set({ 
        isAuthenticated: false,
        userProfile: null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during signout',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));