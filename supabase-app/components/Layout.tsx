
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AoteaLogo from './icons/AoteaLogo';
import { UserRole } from '../types';
import { clsx } from 'clsx';

const Layout: React.FC = () => {
  const { profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
    setIsMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
      isActive
        ? "bg-aotea-teal text-white shadow-glow"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    );

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "block px-3 py-2 rounded-md text-base font-medium transition-colors",
      isActive
        ? "bg-aotea-teal text-white"
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

            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/5">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to="/" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Leaderboard</NavLink>
              {profile?.role && [UserRole.Teacher, UserRole.WhanauLeader, UserRole.Admin].includes(profile.role) && (
                <NavLink to="/screen" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>TV Screen</NavLink>
              )}
              {profile?.role && [UserRole.Teacher, UserRole.WhanauLeader, UserRole.Admin].includes(profile.role) && (
                <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Submit</NavLink>
              )}
              {profile?.role && [UserRole.WhanauLeader, UserRole.Admin].includes(profile.role) && (
                <NavLink to="/leader" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Approve</NavLink>
              )}
              {profile?.role === UserRole.Admin && (
                <NavLink to="/admin" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Admin</NavLink>
              )}
            </div>
            <div className="pt-4 pb-4 border-t border-slate-700">
              {profile ? (
                <div className="px-5 space-y-3">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">{profile.full_name}</div>
                      <div className="text-sm font-medium leading-none text-slate-400 mt-1">{profile.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-white hover:bg-red-900/20"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="px-5">
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-5 py-3 rounded-xl font-bold text-white bg-aotea-teal hover:bg-aotea-dark shadow-lg shadow-aotea-teal/20"
                  >
                    Staff Login
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
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
