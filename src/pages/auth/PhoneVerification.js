import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';

export default function PhoneVerification() {
  const { currentUser, sendVerificationCode, verifyCode } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If no user, redirect to login
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // If user is already phone verified, redirect to dashboard
    if (currentUser.phoneVerified) {
      const role = currentUser.role?.toLowerCase();
      if (role) {
        navigate(`/${role}/dashboard`, { replace: true });
      }
    }

    // Pre-fill phone number if available
    if (currentUser.phoneNumber && !phoneNumber) {
      setPhoneNumber(currentUser.phoneNumber);
    }
  }, [currentUser, navigate, phoneNumber]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await sendVerificationCode(phoneNumber);
      setCodeSent(true);
      setSuccess('Verification code sent successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const verifiedUser = await verifyCode(verificationCode);
      setSuccess('Phone number verified successfully!');
      
      // Redirect to appropriate dashboard
      const role = verifiedUser.role?.toLowerCase();
      if (role) {
        navigate(`/${role}/dashboard`, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          Phone Verification
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {!codeSent ? (
          <form onSubmit={handleSendCode}>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              margin="normal"
              required
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              margin="normal"
              required
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Code'}
            </Button>
          </form>
        )}

        {codeSent && (
          <Button
            fullWidth
            variant="text"
            onClick={() => setCodeSent(false)}
            sx={{ mt: 1 }}
          >
            Change Phone Number
          </Button>
        )}

        <Button
          color="inherit"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Back to Login
        </Button>

        <div id="recaptcha-container" />
      </Paper>
    </Box>
  );
} 