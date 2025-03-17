import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = 'https://fcvvbxdoxyrwauzhbitn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdnZieGRveHlyd2F1emhiaXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMDI4ODMsImV4cCI6MjA1NzY3ODg4M30.HHpBY_xTCxulAr981kvM7H_3D2uXc0qxryYJGZjsZvQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
