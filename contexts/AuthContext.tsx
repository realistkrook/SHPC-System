
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
      // console.log("Auth state change:", event, session?.user?.email);

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

        // We might already have the profile from initializeAuth, but let's be safe
        // If we are switching users, we definitely need it.
        const userProfile = await supabase.getProfile(session.user.id);

        if (mounted) {
          if (userProfile) {
            setProfile(userProfile);
          } else {
            // Only sign out if we really expected a profile (e.g. SIGNED_IN)
            // But be careful not to loop.
            if (event === 'SIGNED_IN') {
              console.warn('Profile missing on SIGNED_IN. Signing out.');
              // If profile is missing, it might be a new user or RLS issue.
              // Instead of signing out immediately which causes a loop, let's set profile to null
              // and let the UI handle "No Profile" state if needed, or redirect to a "Setup" page.
              // But for now, to break the loop, we WON'T sign out automatically here.
              // We'll just leave profile as null. ProtectedRoute will redirect to Login.
              // But if we are ON Login page, we need to show an error.
              setProfile(null);
            }
          }
          setLoading(false);
        }
      } else if (!session && mounted) {
        // Should be covered by SIGNED_OUT but just in case
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
