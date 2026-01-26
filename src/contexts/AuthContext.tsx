import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth, CustomerProfile } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: CustomerProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ data?: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<CustomerProfile>) => Promise<{ error: any }>;
  refetchProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
