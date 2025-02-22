import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { currentUser, loading } = useAuth();

  // Add detailed logging
  console.log('PrivateRoute Check:', {
    currentUser,
    requiredRole,
    userRole: currentUser?.role,
    isAuthenticated: !!currentUser,
    isAuthorized: currentUser?.role?.toUpperCase() === requiredRole?.toUpperCase(),
    status: currentUser?.status,
    emailVerified: currentUser?.emailVerified,
    uid: currentUser?.uid
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    console.log('PrivateRoute: No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  // For student accounts, check email verification
  if (currentUser.role === 'STUDENT' && !currentUser.emailVerified) {
    console.log('PrivateRoute: Student email not verified, redirecting to verify-email');
    return <Navigate to="/verify-email" />;
  }

  // Check role first (case-insensitive comparison)
  if (requiredRole && currentUser.role?.toUpperCase() !== requiredRole?.toUpperCase()) {
    console.log('PrivateRoute: Unauthorized access attempt:', {
      userRole: currentUser.role,
      requiredRole: requiredRole,
      comparison: `${currentUser.role?.toUpperCase()} !== ${requiredRole?.toUpperCase()}`
    });
    return <Navigate to="/unauthorized" />;
  }

  // Check if user is approved
  if (currentUser.status?.toUpperCase() !== 'APPROVED') {
    console.log('PrivateRoute: User not approved, showing pending approval message');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>Account Pending Approval</h2>
        <p>Your account is waiting for administrator approval.</p>
        <p>Please check back later or contact support if this persists.</p>
      </div>
    );
  }

  console.log('PrivateRoute: Access granted for role:', currentUser.role);
  return children;
};

export default PrivateRoute; 