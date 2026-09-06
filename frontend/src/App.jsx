import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterCandidatePage } from './pages/RegisterCandidatePage';
import { RegisterRecruiterPage } from './pages/RegisterRecruiterPage';
import { RegisterInterviewerPage } from './pages/RegisterInterviewerPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

import { CandidateDashboard } from './pages/CandidateDashboard';
import { CandidateJobsPage } from './pages/CandidateJobsPage';
import { CandidateResumePage } from './pages/CandidateResumePage';
import { CandidateApplicationsPage } from './pages/CandidateApplicationsPage';
import { CandidateInterviewsPage } from './pages/CandidateInterviewsPage';
import { AICareerAssistantPage } from './pages/AICareerAssistantPage';

import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { RecruiterJobsPage } from './pages/RecruiterJobsPage';
import { RecruiterApplicationsPage } from './pages/RecruiterApplicationsPage';
import { RecruiterInterviewsPage } from './pages/RecruiterInterviewsPage';
import { RecruiterDocumentsPage } from './pages/RecruiterDocumentsPage';
import { RecruiterAIMatchingPage } from './pages/RecruiterAIMatchingPage';

import { InterviewerDashboard } from './pages/InterviewerDashboard';
import { ProfilePage } from './pages/ProfilePage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-purple-400">
        <svg className="animate-spin h-8 w-8 text-current" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'recruiter' || user.role === 'admin') {
    return <RecruiterDashboard />;
  }
  if (user.role === 'interviewer') {
    return <InterviewerDashboard />;
  }
  return <CandidateDashboard />;
};

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname.startsWith('/register') ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isAuthenticated && !isAuthPage ? (
          <div className="flex gap-8">
            <Sidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterCandidatePage />} />
            <Route path="/register/recruiter" element={<RegisterRecruiterPage />} />
            <Route path="/register/interviewer" element={<RegisterInterviewerPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/jobs" element={<CandidateJobsPage />} />

            {/* Common Authenticated */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <AICareerAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Candidate Specific */}
            <Route
              path="/resume"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateResumePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interviews"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateInterviewsPage />
                </ProtectedRoute>
              }
            />

            {/* Recruiter / Admin Specific */}
            <Route
              path="/recruiter/jobs"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/applications"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/interviews"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterInterviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/documents"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterDocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/matching"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterAIMatchingPage />
                </ProtectedRoute>
              }
            />

            {/* Interviewer Specific */}
            <Route
              path="/interviewer/interviews"
              element={
                <ProtectedRoute allowedRoles={['interviewer']}>
                  <InterviewerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
