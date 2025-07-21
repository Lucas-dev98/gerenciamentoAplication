import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalStyles from './styles/GlobalStyles';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProjectsPage,
  TeamsPage,
  MembersPage,
  ProfilePage,
  KPIsPage,
  TasksPage,
  GoalsPage,
  NotificationsPage,
  AlertsPage,
  CalendarPage,
} from './pages';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <GlobalStyles />
          <Router>
            <Routes>
              {/* Public Routes */}
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
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teams"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TeamsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/members"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MembersPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/kpis"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <KPIsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TasksPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <GoalsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <NotificationsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AlertsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CalendarPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
