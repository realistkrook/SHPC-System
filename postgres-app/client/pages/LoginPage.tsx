
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/apiService';
import { Profile } from '../types';
import AoteaLogo from '../components/icons/AoteaLogo';

/**
 * LoginPage — PostgreSQL version.
 * Instead of email/password or OAuth, users select a profile from a dropdown.
 * This is a simplified auth approach suitable for assessment/demo.
 */
const LoginPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfiles, setFetchingProfiles] = useState(true);
  const navigate = useNavigate();
  const { profile, selectProfile } = useAuth();

  useEffect(() => {
    if (profile) {
      navigate('/');
    }
  }, [profile, navigate]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await api.getProfiles();
        setProfiles(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (err: any) {
        setError('Failed to load profiles. Is the server running?');
      } finally {
        setFetchingProfiles(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select a profile');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await selectProfile(selectedId);
      navigate('/');
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
          <p className="mt-2 text-sm text-slate-400 font-medium uppercase tracking-wide">Aotea College House Points</p>
          <p className="mt-1 text-xs text-slate-500">(PostgreSQL Version — Demo Mode)</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label htmlFor="profile-select" className="block text-sm font-medium text-slate-300 mb-2">
                Select your profile
              </label>
              {fetchingProfiles ? (
                <div className="text-slate-400 text-sm py-3">Loading profiles...</div>
              ) : (
                <select
                  id="profile-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-slate-700 bg-slate-950/50 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-aotea-teal focus:border-transparent sm:text-sm transition-all"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} — {p.role}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading || fetchingProfiles || profiles.length === 0}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-aotea-teal hover:bg-aotea-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aotea-teal focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-aotea-teal/20 transition-all transform hover:-translate-y-0.5"
            >
              {loading ? 'Signing In...' : 'Sign In as Selected User'}
            </button>
          </div>
        </form>

        <div className="mt-4">
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