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
      // Check rate limit
      checkRateLimit(email);
      
      set({ isLoading: true, error: null });

      // First, check if the user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      // Create auth user with auto confirm enabled
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
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Create user profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        department: profile.department,
        role: profile.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile. Please try again.');
      }

      set({ isLoading: false });
    } catch (error) {
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