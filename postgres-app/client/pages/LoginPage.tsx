import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AoteaLogo from '../components/icons/AoteaLogo';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

function getDestinationForRole(role: UserRole) {
  switch (role) {
    case UserRole.Admin:
      return '/admin';
    case UserRole.WhanauLeader:
      return '/leader';
    case UserRole.Teacher:
      return '/dashboard';
    default:
      return '/';
  }
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      navigate(getDestinationForRole(profile.role), { replace: true });
    }
  }, [navigate, profile]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const currentProfile = await signIn(email, password);
      navigate(getDestinationForRole(currentProfile.role), { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
        <div className="text-center">
          <AoteaLogo className="w-24 h-24 mx-auto text-aotea-teal drop-shadow-lg" />
          <h2 className="mt-6 text-3xl font-black text-white tracking-tight">
            Staff Login
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-medium uppercase tracking-wide">
            Aotea College House Points
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Staff accounts are created and managed by administrators.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                School email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-slate-700 bg-slate-950/50 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aotea-teal focus:border-transparent sm:text-sm transition-all"
                placeholder="name@aotea.school.nz"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-slate-700 bg-slate-950/50 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aotea-teal focus:border-transparent sm:text-sm transition-all"
                placeholder="Enter your password"
                required
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

        <div className="mt-4 space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors"
          >
            &larr; Back to Leaderboard
          </button>
          <p className="text-center text-xs text-slate-500">
            Need access? Ask an administrator to create or reset your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
