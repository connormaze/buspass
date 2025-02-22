import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, TextField, Box, Typography, Alert } from '@mui/material';

export default function PhoneVerification() {
  const { sendVerificationCode, verifyCode } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

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
      await verifyCode(verificationCode);
      setSuccess('Phone number verified successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Phone Verification
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
            Send Verification Code
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
            Verify Code
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

      <div id="recaptcha-container" />
    </Box>
  );
} 