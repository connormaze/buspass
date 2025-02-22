import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Not logged in
    return <Navigate to="/login" />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    // Doesn't have required role
    return <Navigate to="/unauthorized" />;
  }

  if (!currentUser.emailVerified && currentUser.role !== 'SUPERADMIN') {
    // Email not verified (except for SuperAdmin)
    return <Navigate to="/verify-email" />;
  }

  return children;
} 