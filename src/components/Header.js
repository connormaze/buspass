import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <HeaderContainer scrolled={isScrolled}>
        <HeaderContent>
          <LogoLink to="/">
            <LogoText>Buspass</LogoText>
            <CompanyText>School TMS</CompanyText>
          </LogoLink>

          <NavLinks>
            <NavLink to="/features">Features</NavLink>
            <NavLink to="/pricing">Pricing</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </NavLinks>

          <AuthButtons>
            <LoginButton to="/login">Sign In</LoginButton>
            <RegisterButton to="/register-school">Get Started</RegisterButton>
          </AuthButtons>

          <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <MenuIcon open={isMobileMenuOpen}>
              <span></span>
              <span></span>
              <span></span>
            </MenuIcon>
          </MobileMenuButton>
        </HeaderContent>
      </HeaderContainer>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <MobileNavLink to="/features" onClick={() => setIsMobileMenuOpen(false)}>
              Features
            </MobileNavLink>
            <MobileNavLink to="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
              Pricing
            </MobileNavLink>
            <MobileNavLink to="/about" onClick={() => setIsMobileMenuOpen(false)}>
              About
            </MobileNavLink>
            <MobileNavLink to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
              Contact
            </MobileNavLink>
            <MobileNavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              Sign In
            </MobileNavLink>
            <MobileNavLink to="/register-school" onClick={() => setIsMobileMenuOpen(false)}>
              Get Started
            </MobileNavLink>
          </MobileMenu>
        )}
      </AnimatePresence>
    </>
  );
};

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: ${props => props.scrolled ? 'rgba(26, 26, 26, 0.98)' : 'transparent'};
  backdrop-filter: ${props => props.scrolled ? 'blur(10px)' : 'none'};
  transition: all 0.3s ease;
  z-index: 1000;
  padding: 0 20px;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoLink = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const LogoText = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #3498db;
  letter-spacing: 1px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CompanyText = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 40px;

  @media (max-width: 968px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    color: #3498db;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  @media (max-width: 968px) {
    display: none;
  }
`;

const LoginButton = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    color: #3498db;
  }
`;

const RegisterButton = styled(Link)`
  background: linear-gradient(120deg, #3498db, #2ecc71);
  color: white;
  text-decoration: none;
  padding: 10px 24px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;

  @media (max-width: 968px) {
    display: block;
  }
`;

const MenuIcon = styled.div`
  width: 24px;
  height: 20px;
  position: relative;
  
  span {
    display: block;
    position: absolute;
    height: 2px;
    width: 100%;
    background: white;
    border-radius: 2px;
    transition: all 0.3s ease;

    &:first-child {
      top: ${props => props.open ? '9px' : '0'};
      transform: ${props => props.open ? 'rotate(45deg)' : 'none'};
    }

    &:nth-child(2) {
      top: 9px;
      opacity: ${props => props.open ? '0' : '1'};
    }

    &:last-child {
      top: ${props => props.open ? '9px' : '18px'};
      transform: ${props => props.open ? 'rotate(-45deg)' : 'none'};
    }
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background: rgba(26, 26, 26, 0.98);
  backdrop-filter: blur(10px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 999;
`;

const MobileNavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 10px;
  text-align: center;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    background: rgba(52, 152, 219, 0.1);
    color: #3498db;
  }
`;

export default Header; 