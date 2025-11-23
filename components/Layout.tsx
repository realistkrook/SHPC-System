
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AoteaLogo from './icons/AoteaLogo';
import { UserRole } from '../types';
import { clsx } from 'clsx';

const Layout: React.FC = () => {
  const { profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-aotea-teal"></div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
      isActive
        ? "bg-aotea-teal text-white shadow-glow"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    );

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 cursor-default transition-transform hover:scale-105" onClick={(e) => {
                if (e.detail === 3) {
                  window.dispatchEvent(new Event('toggle-debug-overlay'));
                }
              }}>
                <AoteaLogo className="h-12 w-auto text-aotea-teal drop-shadow-lg" />
              </div>
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-2">
                  <NavLink to="/" className={navLinkClass}>Leaderboard</NavLink>
                  {profile?.role && [UserRole.Teacher, UserRole.WhanauLeader, UserRole.Admin].includes(profile.role) && (
                    <NavLink to="/screen" className={navLinkClass}>TV Screen</NavLink>
                  )}
                  {profile?.role && [UserRole.Teacher, UserRole.WhanauLeader, UserRole.Admin].includes(profile.role) && (
                    <NavLink to="/dashboard" className={navLinkClass}>Submit</NavLink>
                  )}
                  {profile?.role && [UserRole.WhanauLeader, UserRole.Admin].includes(profile.role) && (
                    <NavLink to="/leader" className={navLinkClass}>Approve</NavLink>
                  )}
                  {profile?.role === UserRole.Admin && (
                    <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                {profile ? (
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm">Kia ora, <span className="text-white font-medium">{profile.full_name}</span></span>
                    <button
                      onClick={handleSignOut}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-500/20 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-aotea-teal text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-aotea-teal/20 hover:bg-aotea-dark hover:shadow-aotea-teal/40 transition-all transform hover:-translate-y-0.5"
                  >
                    Staff Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
