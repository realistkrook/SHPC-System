
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AoteaLogo from './icons/AoteaLogo';
import { UserRole } from '../types';

const Layout: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#007971] text-white'
        : 'text-gray-300 hover:bg-teal-800 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <nav className="bg-gray-800 dark:bg-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AoteaLogo className="h-10 w-auto text-[#007971]" />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink to="/" className={navLinkClass}>Leaderboard</NavLink>
                  <NavLink to="/screen" className={navLinkClass}>TV Screen</NavLink>
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
                  <>
                    <span className="text-gray-300 mr-4">Kia ora, {profile.full_name}</span>
                    <button
                      onClick={handleSignOut}
                      className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-[#007971] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-800"
                  >
                    Staff Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
