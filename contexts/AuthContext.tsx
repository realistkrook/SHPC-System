
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../services/supabaseService';
import { User, Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    setLoading(true);
    const session = await supabase.getSession();
    if (session?.user) {
      // Fix: Map Supabase user to local User type to resolve type mismatch.
      setUser({ id: session.user.id, email: session.user.email || '' });
      const userProfile = await supabase.getProfile(session.user.id);
      setProfile(userProfile);
    } else {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    checkUser();
    
    // Fix: The custom `onAuthStateChange` method returns the subscription object directly.
    // The original destructuring `const { data: authListener } = ...` was incorrect.
    const authListener = supabase.onAuthStateChange(async (_event, session) => {
        const currentUser = session?.user ?? null;
        if (currentUser) {
            // Fix: Map Supabase user to local User type to resolve type mismatch.
            setUser({ id: currentUser.id, email: currentUser.email || '' });
            const userProfile = await supabase.getProfile(currentUser.id);
            setProfile(userProfile);
        } else {
            setUser(null);
            setProfile(null);
        }
        setLoading(false);
    });

    return () => {
        authListener?.unsubscribe();
    };
  }, [checkUser]);

  const signOut = async () => {
    await supabase.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
