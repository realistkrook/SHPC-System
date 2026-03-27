
import React, { createContext, useState, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    let mounted = true;

    // Function to handle session and profile fetching
    const initializeAuth = async () => {
      try {
        // 1. Get initial session
        const session = await supabase.getSession();

        // Since our custom service returns Session | null directly and handles errors internally (mostly),
        // we check if session is null.
        if (!session && !loading) {
          // If we are not loading, we might be done. But here we are initializing.
        }

        if (session?.user) {
          // App-Level Domain Restriction
          const email = session.user.email || '';
          if (!email.endsWith('@aotea.school.nz')) {
            console.warn(`Unauthorized domain: ${email}. Signing out.`);
            await supabase.signOut();
            if (mounted) {
              setUser(null);
              setProfile(null);
              setLoading(false);
            }
            return;
          }

          if (mounted) {
            setUser({ id: session.user.id, email: session.user.email || '' });
          }

          // Fetch profile
          const userProfile = await supabase.getProfile(session.user.id);

          if (mounted) {
            if (userProfile) {
              setProfile(userProfile);
            } else {
              console.warn('Profile missing during init. Signing out.');
              await supabase.signOut();
              setUser(null);
              setProfile(null);
            }
            setLoading(false);
          }
        } else {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. Listen for changes
    const authListener = supabase.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event);

      if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      if (session?.user) {
        // App-Level Domain Restriction
        const email = session.user.email || '';
        if (!email.endsWith('@aotea.school.nz')) {
          console.warn(`Unauthorized domain: ${email}. Signing out.`);
          await supabase.signOut();
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser({ id: session.user.id, email: session.user.email || '' });
        }

        // Only re-fetch profile on SIGNED_IN (initial login / OAuth callback).
        // TOKEN_REFRESHED fires periodically — keep the existing profile to avoid
        // transient getProfile() failures from wiping the session.
        if (event === 'SIGNED_IN') {
          const userProfile = await supabase.getProfile(session.user.id);

          if (mounted) {
            if (userProfile) {
              setProfile(userProfile);
            } else {
              // Profile missing on login — leave as null, ProtectedRoute will redirect.
              setProfile(null);
            }
          }
        }
        // For TOKEN_REFRESHED / other events, we intentionally do NOT re-fetch the profile.
        // The existing profile state is preserved.

        if (mounted) {
          setLoading(false);
        }
      } else if (!session && mounted) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener?.unsubscribe();
    };
  }, []);

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
