
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PublicLeaderboardPage from './pages/PublicLeaderboardPage';
import TvScreenPage from './pages/TvScreenPage';
import TeacherDashboardPage from './pages/teacher/DashboardPage';
import LeaderDashboardPage from './pages/leader/LeaderDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import DebugOverlay from './components/DebugOverlay';
import { UserRole } from './types';

function App() {
  return (
    <AuthProvider>
      <DebugOverlay />
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
