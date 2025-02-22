import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function VerifyEmail() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(() => {
    const savedEndTime = localStorage.getItem('verificationEndTime');
    if (savedEndTime) {
      const remainingTime = Math.ceil((parseInt(savedEndTime) - Date.now()) / 1000);
      return remainingTime > 0 ? remainingTime : 0;
    }
    return 0;
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no user, redirect to login
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // If user is verified and approved, redirect to dashboard
    if (currentUser.emailVerified && currentUser.status?.toUpperCase() === 'APPROVED') {
      const role = currentUser.role?.toLowerCase();
      if (role) {
        navigate(`/${role}/dashboard`, { replace: true });
      }
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(c => Math.max(0, c - 1));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.removeItem('verificationEndTime');
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    if (countdown > 0) return;

    try {
      setLoading(true);
      setError('');
      setMessage('');

      if (!auth.currentUser) {
        throw new Error('No user found. Please try logging in again.');
      }

      await sendEmailVerification(auth.currentUser);
      
      setMessage('Verification email sent! Please check your inbox and spam folder.');
      const newCountdown = 60;
      const endTime = Date.now() + (newCountdown * 1000);
      localStorage.setItem('verificationEndTime', endTime.toString());
      setCountdown(newCountdown);

      // Force reload the user to get latest verification status
      await auth.currentUser.reload();
    } catch (error) {
      console.error('Error sending verification:', error);
      if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a while before trying again.');
        setCountdown(300);
      } else {
        setError('Failed to send verification email. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds) => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  // Don't render anything if no user or if user is already verified and approved
  if (!currentUser || (currentUser.emailVerified && currentUser.status?.toUpperCase() === 'APPROVED')) {
    return null;
  }

  // Show pending approval message if verified but not approved
  if (currentUser.emailVerified && currentUser.status?.toUpperCase() !== 'APPROVED') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          py: 3,
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            Account Pending Approval
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your email has been verified, but your account is waiting for administrator approval.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please check back later or contact support if this persists.
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 3,
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Verify Your Email
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          We've sent a verification email to:
          <br />
          <strong>{currentUser?.email}</strong>
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          Please click the verification link in the email to continue.
          If you don't see the email, check your spam folder.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleResendVerification}
          disabled={loading || countdown > 0}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : countdown > 0 ? (
            `Resend in ${formatCountdown(countdown)}`
          ) : (
            'Resend Verification Email'
          )}
        </Button>

        <Button
          color="inherit"
          onClick={() => navigate('/login')}
          sx={{ mt: 2, ml: 2 }}
        >
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
} 