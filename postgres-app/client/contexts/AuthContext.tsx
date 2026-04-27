
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/apiService';
import { Profile } from '../types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  selectProfile: (profileId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Simplified AuthProvider for the PostgreSQL version.
 * Instead of Supabase OAuth/JWT, users "sign in" by selecting a profile from a list.
 * The selected profile ID is stored in localStorage.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if a profile is already selected
  useEffect(() => {
    const initAuth = async () => {
      const savedProfileId = api.getCurrentProfileId();
      if (savedProfileId) {
        try {
          const savedProfile = await api.getProfile(savedProfileId);
          if (savedProfile) {
            setProfile(savedProfile);
            setUser({ id: savedProfile.id, email: savedProfile.email || '' });
          } else {
            // Profile no longer exists, clear it
            api.clearCurrentProfile();
          }
        } catch {
          api.clearCurrentProfile();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const selectProfile = async (profileId: string) => {
    setLoading(true);
    try {
      const selectedProfile = await api.getProfile(profileId);
      if (selectedProfile) {
        api.setCurrentProfile(profileId);
        setProfile(selectedProfile);
        setUser({ id: selectedProfile.id, email: selectedProfile.email || '' });
      }
    } catch (err) {
      console.error('Failed to select profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    api.clearCurrentProfile();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
    selectProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
