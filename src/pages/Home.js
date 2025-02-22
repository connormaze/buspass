import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <>
      <Header />
      <Container>
        <HeroSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HeroContent>
              <LogoText>Buspass</LogoText>
              <CompanyText>School TMS</CompanyText>
              <MainTitle>Smart School Dismissal Management</MainTitle>
              <HeroDescription>
                Revolutionize your school's dismissal process with real-time tracking,
                enhanced safety protocols, and seamless parent-school communication.
                The future of student dismissal is here.
              </HeroDescription>
              <ButtonGroup>
                <PrimaryButton as={Link} to="/register-school">
                  Get Started
                </PrimaryButton>
                <SecondaryButton as={Link} to="/login">
                  Sign In
                </SecondaryButton>
              </ButtonGroup>
            </HeroContent>
          </motion.div>
        </HeroSection>

        <FeatureSection dark>
          <FeatureContent
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <FeatureIcon>🚌</FeatureIcon>
            <FeatureTitle>Smart Dismissal Management</FeatureTitle>
            <FeatureDescription>
              Streamline your dismissal process with automated student tracking,
              real-time bus assignments, and efficient parent pickup coordination.
            </FeatureDescription>
          </FeatureContent>
        </FeatureSection>

        <FeatureSection>
          <FeatureContent
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <FeatureIcon>🛡️</FeatureIcon>
            <FeatureTitle>Enhanced Safety & Security</FeatureTitle>
            <FeatureDescription>
              Ensure student safety with digital ID verification, authorized pickup lists,
              and instant alerts for any changes in dismissal plans.
            </FeatureDescription>
          </FeatureContent>
        </FeatureSection>

        <FeatureSection dark>
          <FeatureContent
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <FeatureIcon>📱</FeatureIcon>
            <FeatureTitle>Parent-School Connection</FeatureTitle>
            <FeatureDescription>
              Keep parents informed with real-time updates, easy dismissal changes,
              and instant communication through our mobile app.
            </FeatureDescription>
          </FeatureContent>
        </FeatureSection>

        <CompatibilitySection>
          <CompatibilityContent
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <SectionTitle>Compatible With StarDetect Ecosystem</SectionTitle>
            <CompatibilityGrid>
              <CompatibilityCard
                as={motion.div}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CompatibilityIcon>🏫</CompatibilityIcon>
                <CompatibilityTitle>StarDetect Schools</CompatibilityTitle>
                <CompatibilityDescription>
                  Seamlessly integrates with StarDetect Schools, our comprehensive school safety management system. 
                  Combine dismissal management with visitor screening, emergency protocols, and staff management.
                </CompatibilityDescription>
                <LearnMoreLink as={Link} to="https://stardetect.us/schools">Learn More →</LearnMoreLink>
              </CompatibilityCard>

              <CompatibilityCard
                as={motion.div}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CompatibilityIcon>🛡️</CompatibilityIcon>
                <CompatibilityTitle>StarTracker</CompatibilityTitle>
                <CompatibilityDescription>
                  Works alongside StarTracker weapon detection system for enhanced school security. 
                  Combine smart dismissal with AI-powered threat detection for complete campus safety.
                </CompatibilityDescription>
                <LearnMoreLink as={Link} to="https://stardetect.us/tracker">Learn More →</LearnMoreLink>
              </CompatibilityCard>
            </CompatibilityGrid>
          </CompatibilityContent>
        </CompatibilitySection>

        <CTASection>
          <CTAContent
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <CTATitle>Ready to Transform Your School's Dismissal Process?</CTATitle>
            <CTADescription>
              Join schools nationwide in creating a safer, more efficient dismissal experience with Buspass.
            </CTADescription>
            <PrimaryButton as={Link} to="/register-school" large>
              Register Your School
            </PrimaryButton>
          </CTAContent>
        </CTASection>
      </Container>
      <Footer />
    </>
  );
};

const Container = styled.div`
  width: 100%;
  overflow-x: hidden;
`;

const HeroSection = styled.section`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: white;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.2));
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  text-align: center;
  padding: 0 20px;
`;

const LogoText = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 1rem;
  letter-spacing: 2px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const MainTitle = styled.h1`
  font-size: 4.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: linear-gradient(120deg, #3498db, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const HeroDescription = styled.p`
  font-size: 1.4rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 2rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Button = styled.button`
  padding: ${props => props.large ? '18px 48px' : '15px 40px'};
  font-size: ${props => props.large ? '1.2rem' : '1.1rem'};
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(120deg, #3498db, #2ecc71);
  color: white;
  border: none;
  
  &:hover {
    background: linear-gradient(120deg, #2980b9, #27ae60);
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
  }
`;

const FeatureSection = styled.section`
  min-height: 80vh;
  background-color: ${props => props.dark ? '#1a1a1a' : '#ffffff'};
  color: ${props => props.dark ? '#ffffff' : '#1a1a1a'};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  position: relative;
`;

const FeatureContent = styled.div`
  max-width: 800px;
  text-align: center;
  padding: 0 20px;
`;

const FeatureIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;
`;

const FeatureTitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const FeatureDescription = styled.p`
  font-size: 1.3rem;
  line-height: 1.7;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CTASection = styled.section`
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  color: white;
  padding: 100px 20px;
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.4rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  opacity: 0.9;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CompanyText = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  letter-spacing: 1px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CompatibilitySection = styled.section`
  background: #f8f9fa;
  padding: 100px 20px;
`;

const CompatibilityContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #1a1a1a;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const CompatibilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  padding: 20px;
`;

const CompatibilityCard = styled(motion.div)`
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
`;

const CompatibilityIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
`;

const CompatibilityTitle = styled.h3`
  font-size: 1.8rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CompatibilityDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #666;
  margin-bottom: 1.5rem;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const LearnMoreLink = styled(motion.a)`
  color: #3498db;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
  display: inline-block;
  
  &:hover {
    color: #2980b9;
  }
`;

export default HomePage; 