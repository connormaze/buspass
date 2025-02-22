import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const { login, sendVerificationCode, verifyCode, updatePhoneNumber } = useAuth();
  const navigate = useNavigate();

  // Check for SuperAdmin existence
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'SUPERADMIN'),
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // No SuperAdmin exists, redirect to setup
          navigate('/setup');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error checking SuperAdmin status:', err);
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, [navigate]);

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendVerification = async () => {
    try {
      if (!phoneNumber || !phoneNumber.trim()) {
        setError('Please enter a valid phone number');
        return;
      }

      setError('');
      setLoading(true);

      // Create a container for reCAPTCHA
      const container = document.createElement('div');
      container.id = 'recaptcha-container';
      document.body.appendChild(container);

      await sendVerificationCode(phoneNumber);
      setVerificationSent(true);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error sending verification code:', error);
      if (error.message.includes('not enabled')) {
        setError('Phone verification is currently unavailable. Please try again later or contact support.');
      } else if (error.message.includes('invalid-phone-number')) {
        setError('Please enter a valid phone number in the format: +1234567890');
      } else {
        setError(error.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
      // Clean up reCAPTCHA container
      try {
        const container = document.getElementById('recaptcha-container');
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up reCAPTCHA container:', cleanupError);
      }
    }
  };

  const handleVerifyCode = async () => {
    try {
      if (!verificationCode || verificationCode.trim().length === 0) {
        setError('Please enter the verification code');
        return;
      }

      setError('');
      setLoading(true);
      const user = await verifyCode(verificationCode);
      
      if (!user) {
        throw new Error('Verification failed. Please try again.');
      }

      if (showPhoneInput && phoneNumber) {
        await updatePhoneNumber(user.uid, phoneNumber);
      }
      
      setVerificationOpen(false);
      
      // Route based on verified user role
      const role = user.role?.toUpperCase();
      console.log('Login: Routing after verification:', { role, user });
      
      switch (role) {
        case 'SUPERADMIN':
          navigate('/superadmin/dashboard');
          break;
        case 'SCHOOLADMIN':
          navigate('/schooladmin/dashboard');
          break;
        case 'TEACHER':
          navigate('/teacher/dashboard');
          break;
        case 'BUSDRIVER':
          navigate('/busdriver/dashboard');
          break;
        case 'PARENT':
          navigate('/parent/dashboard');
          break;
        case 'STUDENT':
          navigate('/student/dashboard');
          break;
        default:
          console.error('Unknown role after verification:', role);
          navigate('/unauthorized');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setError(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      const result = await login(email, password);
      
      if (result.needsEmailVerification) {
        navigate('/verify-email');
        return;
      }
      
      if (result.needsPhoneVerification) {
        // Set phone number if available
        if (result.phoneNumber) {
          setPhoneNumber(result.phoneNumber);
          setShowPhoneInput(false);
        } else {
          setShowPhoneInput(true);
        }
        setVerificationOpen(true);
        return; // Stop here and wait for verification
      }

      // Only route if phone verification is not needed or already completed
      const role = result.user.role?.toUpperCase();
      console.log('Login: Routing after login:', { role, user: result.user });
      
      switch (role) {
        case 'SUPERADMIN':
          navigate('/superadmin/dashboard');
          break;
        case 'SCHOOLADMIN':
          navigate('/schooladmin/dashboard');
          break;
        case 'TEACHER':
          navigate('/teacher/dashboard');
          break;
        case 'BUSDRIVER':
          navigate('/busdriver/dashboard');
          break;
        case 'PARENT':
          navigate('/parent/dashboard');
          break;
        case 'STUDENT':
          navigate('/student/dashboard');
          break;
        default:
          console.error('Unknown role:', role);
          navigate('/unauthorized');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <AuthCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoSection>
          <LogoText>Buspass</LogoText>
          <CompanyText>School TMS</CompanyText>
        </LogoSection>

        <Title>Welcome Back</Title>
        <Subtitle>Sign in to your account</Subtitle>

        {error && (
          <ErrorAlert>
            {error}
          </ErrorAlert>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </InputGroup>

          <ForgotPassword to="/forgot-password">
            Forgot your password?
          </ForgotPassword>

          <SubmitButton
            type="submit"
            disabled={loading}
            as={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </SubmitButton>
        </Form>

        <Footer>
          <Text>Don't have an account?</Text>
          <StyledLink to="/signup">Create one now</StyledLink>
        </Footer>
      </AuthCard>

      {verificationOpen && (
        <VerificationDialog>
          <DialogContent>
            <Title>Verify Your Phone</Title>
            {showPhoneInput ? (
              <InputGroup>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="Enter your phone number"
                />
              </InputGroup>
            ) : (
              <Text>We'll send a verification code to {phoneNumber}</Text>
            )}
            
            {!verificationSent ? (
              <SubmitButton
                onClick={handleSendVerification}
                disabled={loading}
                as={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Code
              </SubmitButton>
            ) : (
              <>
                <InputGroup>
                  <Label>Verification Code</Label>
                  <Input
                    type="text"
                    value={verificationCode}
                    onChange={handleVerificationCodeChange}
                    placeholder="Enter verification code"
                  />
                </InputGroup>
                <SubmitButton
                  onClick={handleVerifyCode}
                  disabled={loading}
                  as={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Verify Code
                </SubmitButton>
              </>
            )}
          </DialogContent>
        </VerificationDialog>
      )}
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AuthCard = styled(motion.div)`
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const LogoText = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #3498db;
  margin: 0;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CompanyText = styled.div`
  font-size: 1rem;
  color: #666;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #1a1a1a;
  margin: 0 0 10px 0;
  text-align: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 30px 0;
  text-align: center;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #1a1a1a;
  font-weight: 500;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e1e1;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &::placeholder {
    color: #999;
  }
`;

const ForgotPassword = styled(Link)`
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
  text-align: right;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(120deg, #3498db, #2ecc71);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorAlert = styled.div`
  background: #fee2e2;
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Footer = styled.div`
  margin-top: 30px;
  text-align: center;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Text = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const StyledLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  margin-left: 5px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const VerificationDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`; 