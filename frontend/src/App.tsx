import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MentalBoxPage } from '@/pages/MentalBoxPage';
import { MoodTrackerPage } from '@/pages/MoodTrackerPage';
import { GroundingPage } from '@/pages/GroundingPage';
import '@/i18n';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mental-box"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MentalBoxPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mood-tracker"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MoodTrackerPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/grounding"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GroundingPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
