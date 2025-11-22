import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import AoteaLogo from '../components/icons/AoteaLogo';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Fix: The custom supabase.signIn method returns a flat object. Destructure `profile` directly and use it to check for the user's role.
      const { profile, error: authError } = await supabase.signIn(email, password);
      if (authError) throw new Error(authError);
      if(profile?.role) {
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
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center">
          <AoteaLogo className="w-24 h-24 mx-auto text-[#007971]" />
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Aotea College Staff Login
          </h2>
          <p className="mt-2 text-sm text-gray-400">House Points System</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="p-3 bg-red-500/20 text-red-300 rounded-md">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-gray-200 rounded-t-md focus:outline-none focus:ring-[#007971] focus:border-[#007971] focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-gray-200 rounded-b-md focus:outline-none focus:ring-[#007971] focus:border-[#007971] focus:z-10 sm:text-sm"
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
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#007971] hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-gray-800 disabled:bg-teal-900 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
        <div className="mt-4">
          <button
            onClick={() => handleOAuthSignIn('microsoft')}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in with Microsoft
          </button>
        </div>
        <p className="text-xs text-center text-gray-500">
            For demonstration, use: teacher@aotea.school.nz, leader@aotea.school.nz, or admin@aotea.school.nz. Password: password123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;