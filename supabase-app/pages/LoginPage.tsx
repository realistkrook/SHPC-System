import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseService';
import AoteaLogo from '../components/icons/AoteaLogo';
import MicrosoftLogo from '../components/icons/MicrosoftLogo';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      navigate('/');
    }
  }, [profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Fix: The custom supabase.signIn method returns a flat object. Destructure `profile` directly and use it to check for the user's role.
      const { profile, error: authError } = await supabase.signIn(email, password);
      if (authError) throw new Error(authError);
      if (profile?.role) {
        navigate('/');
      } else {
        throw new Error("Could not retrieve user profile.");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setLoading(true);
    setError(null);
    try {
      const redirectTo = window.location.origin + '/';
      const { data, error: oauthError } = await supabase.signInWithProvider(provider, redirectTo);
      if (oauthError) throw new Error(oauthError.message || String(oauthError));
      // Supabase usually returns a `url` to redirect the browser to.
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'OAuth sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="inline-block cursor-default transition-transform hover:scale-105" onClick={(e) => {
            if (e.detail === 3) {
              window.dispatchEvent(new Event('toggle-debug-overlay'));
            }
          }}>
            <AoteaLogo className="w-24 h-24 mx-auto text-aotea-teal drop-shadow-lg" />
          </div>
          <h2 className="mt-6 text-3xl font-black text-white tracking-tight">
            Staff Login
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-medium uppercase tracking-wide">Aotea College House Points</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-700 bg-slate-950/50 text-slate-200 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-aotea-teal focus:border-transparent sm:text-sm transition-all"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-700 bg-slate-950/50 text-slate-200 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-aotea-teal focus:border-transparent sm:text-sm transition-all"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-aotea-teal hover:bg-aotea-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aotea-teal focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-aotea-teal/20 transition-all transform hover:-translate-y-0.5"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>


        <div className="mt-4 space-y-4">
          <button
            onClick={() => handleOAuthSignIn('azure')}
            className="group relative w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-700 text-sm font-bold rounded-xl text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 transition-all transform hover:-translate-y-0.5"
          >
            <MicrosoftLogo className="w-5 h-5" />
            Sign in with Microsoft
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors"
          >
            &larr; Back to Leaderboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;