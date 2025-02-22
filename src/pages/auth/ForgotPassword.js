import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const checkNetworkConnection = () => {
    return navigator.onLine;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset states
    setMessage('');
    setError('');

    // Validate email
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check network connection
    if (!checkNetworkConnection()) {
      setError('No internet connection. Please check your network and try again.');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to send password reset email to:', email);
      
      await resetPassword(email);
      
      console.log('Password reset email sent successfully');
      setMessage('Check your inbox for further instructions');
      setEmail(''); // Clear email field after success
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/user-not-found') {
        setError('No account exists with this email address');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later');
      } else if (error.message.includes('timeout')) {
        setError('Request timed out. Please check your internet connection and try again');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection');
      } else {
        setError('Failed to send password reset email. Please try again');
      }
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

        <Title>Password Reset</Title>
        <Subtitle>Enter your email to reset your password</Subtitle>

        {error && (
          <ErrorAlert>
            {error}
          </ErrorAlert>
        )}

        {message && (
          <SuccessAlert>
            {message}
          </SuccessAlert>
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
              disabled={loading}
            />
          </InputGroup>

          <SubmitButton
            type="submit"
            disabled={loading}
            as={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Sending...' : 'Reset Password'}
          </SubmitButton>
        </Form>

        <Footer>
          <Text>Remember your password?</Text>
          <StyledLink to="/login">Sign in instead</StyledLink>
        </Footer>

        <Footer>
          <Text>Don't have an account?</Text>
          <StyledLink to="/signup">Create one now</StyledLink>
        </Footer>
      </AuthCard>
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

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
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

const SuccessAlert = styled.div`
  background: #dcfce7;
  color: #16a34a;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Footer = styled.div`
  margin-top: 20px;
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