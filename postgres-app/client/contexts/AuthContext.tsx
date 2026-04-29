import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '../services/apiService';
import { Profile } from '../types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Profile>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncAuthState = (nextProfile: Profile | null) => {
    setProfile(nextProfile);
    if (nextProfile?.email) {
      setUser({ id: nextProfile.id, email: nextProfile.email });
    } else if (nextProfile) {
      setUser({ id: nextProfile.id, email: '' });
    } else {
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const currentProfile = await api.getSessionProfile();
      syncAuthState(currentProfile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const currentProfile = await api.login(email, password);
      syncAuthState(currentProfile);
      return currentProfile;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await api.logout();
      syncAuthState(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
