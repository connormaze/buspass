import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FiAlertTriangle } from 'react-icons/fi';

export default function Unauthorized() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleForceLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LogoSection>
          <LogoText>Buspass</LogoText>
          <CompanyText>School TMS</CompanyText>
        </LogoSection>
        
        <IconWrapper>
          <FiAlertTriangle size={40} />
        </IconWrapper>
        <Title>Unauthorized Access</Title>
        <Message>You do not have permission to access this page.</Message>
        <LogoutButton 
          onClick={handleForceLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          FORCE LOGOUT
        </LogoutButton>
      </Card>
      <BackgroundGradient />
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  position: relative;
  overflow: hidden;
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

const BackgroundGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(52, 152, 219, 0.1) 0%, transparent 60%),
              radial-gradient(circle at bottom left, rgba(46, 204, 113, 0.1) 0%, transparent 60%);
  z-index: 1;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
`;

const IconWrapper = styled.div`
  color: #ef4444;
  margin-bottom: 20px;
  background: rgba(239, 68, 68, 0.1);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1a1a1a;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 700;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 32px;
  text-align: center;
  line-height: 1.5;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const LogoutButton = styled(motion.button)`
  background: linear-gradient(120deg, #3498db, #2ecc71);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`; 