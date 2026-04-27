import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  // Fix: Changed type from JSX.Element to React.ReactNode to resolve namespace error.
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="text-xl font-bold">Loading...</div></div>;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;