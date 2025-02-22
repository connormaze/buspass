import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

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
      <Title>Unauthorized Access</Title>
      <Message>You do not have permission to access this page.</Message>
      <LogoutButton onClick={handleForceLogout}>
        FORCE LOGOUT
      </LogoutButton>
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
  background: white;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #000;
  margin-bottom: 16px;
  text-align: center;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #000;
  margin-bottom: 24px;
  text-align: center;
`;

const LogoutButton = styled.button`
  background: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #1976d2;
  }
`; 