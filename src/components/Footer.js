import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <BrandContainer>
            <LogoText>Buspass</LogoText>
            <CompanyText>School TMS</CompanyText>
          </BrandContainer>
          <CompanyDescription>
            Transforming school dismissal with cutting-edge technology.
            Making student pickup safer, smarter, and more efficient.
          </CompanyDescription>
        </FooterSection>

        <FooterLinksGrid>
          <FooterLinkSection>
            <FooterLinkTitle>Quick Links</FooterLinkTitle>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/help">Help Center</FooterLink>
          </FooterLinkSection>

          <FooterLinkSection>
            <FooterLinkTitle>Solutions</FooterLinkTitle>
            <FooterLink to="/solutions/schools">For Schools</FooterLink>
            <FooterLink to="/solutions/parents">For Parents</FooterLink>
            <FooterLink to="/solutions/bus-drivers">For Bus Drivers</FooterLink>
            <FooterLink to="/register-school">Register School</FooterLink>
          </FooterLinkSection>

          <FooterLinkSection>
            <FooterLinkTitle>Account</FooterLinkTitle>
            <FooterLink to="/login">Login</FooterLink>
            <FooterLink to="/signup">Sign Up</FooterLink>
            <FooterLink to="/forgot-password">Reset Password</FooterLink>
          </FooterLinkSection>
        </FooterLinksGrid>
      </FooterContent>

      <FooterBottom>
        <Copyright>
          © {currentYear} Buspass Technologies, Inc. All rights reserved.
        </Copyright>
        <BottomLinks>
          <BottomLink to="/privacy">Privacy Policy</BottomLink>
          <BottomLink to="/terms">Terms of Service</BottomLink>
        </BottomLinks>
      </FooterBottom>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background: #1a1a1a;
  color: white;
  padding: 80px 20px 20px;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const LogoText = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #3498db;
  letter-spacing: 1px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CompanyText = styled.span`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CompanyDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  max-width: 400px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FooterLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FooterLinkSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FooterLinkTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 10px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    color: #3498db;
    transform: translateX(5px);
  }
`;

const FooterBottom = styled.div`
  max-width: 1400px;
  margin: 60px auto 0;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const BottomLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const BottomLink = styled(Link)`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    color: #3498db;
  }
`;

export default Footer; 