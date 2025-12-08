import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { User, UserPermissions } from '../types'; // Import your app's User type

interface SessionContextType {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  appUser: User | null; // Your app's custom user profile
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchAppUserProfile: (userId: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children?: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppUserProfile = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, pin, role, permissions')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching app user profile:', error);
      setAppUser(null);
    } else if (data) {
      setAppUser({
        id: data.id,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        avatarUrl: data.avatar_url || 'https://i.pravatar.cc/150',
        pin: data.pin || '', // PIN might be sensitive, handle with care
        role: data.role as 'admin' | 'employee',
        permissions: data.permissions as UserPermissions,
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user || null);
      if (session?.user) {
        fetchAppUserProfile(session.user.id);
      } else {
        setAppUser(null);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user || null);
      if (session?.user) {
        fetchAppUserProfile(session.user.id);
      } else {
        setAppUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAuthenticated = !!session && !!appUser;

  const value = {
    session,
    supabaseUser,
    appUser,
    isAuthenticated,
    isLoading,
    fetchAppUserProfile,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionContextProvider');
  }
  return context;
};