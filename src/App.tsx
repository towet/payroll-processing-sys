import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { AdminDashboard } from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated, userProfile } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={userProfile?.role === 'admin' ? '/admin' : '/employee'} replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            isAuthenticated ? (
              <Navigate to={userProfile?.role === 'admin' ? '/admin' : '/employee'} replace />
            ) : (
              <SignUpPage />
            )
          } 
        />
        <Route
          path="/admin/*"
          element={
            isAuthenticated && userProfile?.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/*"
          element={
            isAuthenticated ? (
              <Navigate to={userProfile?.role === 'admin' ? '/admin' : '/employee'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/employee/*"
          element={
            isAuthenticated && userProfile?.role === 'employee' ? (
              <EmployeeDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;