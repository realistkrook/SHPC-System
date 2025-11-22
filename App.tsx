
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PublicLeaderboardPage from './pages/PublicLeaderboardPage';
import TvScreenPage from './pages/TvScreenPage';
import TeacherDashboardPage from './pages/teacher/DashboardPage';
import LeaderDashboardPage from './pages/leader/LeaderDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<PublicLeaderboardPage />} />
            <Route path="/screen" element={<TvScreenPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.Teacher, UserRole.WhanauLeader, UserRole.Admin]}>
                  <TeacherDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leader" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.WhanauLeader, UserRole.Admin]}>
                  <LeaderDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
