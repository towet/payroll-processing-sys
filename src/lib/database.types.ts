export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone_number: string;
          department: string;
          role: 'admin' | 'employee';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone_number: string;
          department: string;
          role?: 'admin' | 'employee';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone_number?: string;
          department?: string;
          role?: 'admin' | 'employee';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
