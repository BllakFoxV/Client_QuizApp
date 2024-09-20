import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import QuizPage from './components/Quiz';
import LoadingSpinner from './components/Loading';
import NotFound from './components/404';

function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuthToken();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/quiz" element={
          <PrivateRoute>
            <QuizPage />
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
