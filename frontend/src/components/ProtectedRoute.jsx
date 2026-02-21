import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if user is logged in by checking localStorage
  // Note: Auth token is stored in httpOnly cookie (not accessible via JS)
  // so we rely on localStorage as the primary auth indicator
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    // If not logged in, ensure both storage locations are cleared
    if (!isLoggedIn) {
      // Clear any remaining session data
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    // Redirect to login if not logged in
    console.log('Access denied - user not authenticated. Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Show the component if logged in
  return children;
}
