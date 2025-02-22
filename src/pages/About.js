import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  return (
    <>
      <Header />
      <Container>
        <HeroSection>
          <HeroContent>
            <Title>About Buspass</Title>
            <Subtitle>Smart School Dismissal Management Platform</Subtitle>
          </HeroContent>
        </HeroSection>

        <Section>
          <ContentWrapper>
            <AppDescription>
              <SectionTitle>What is Buspass?</SectionTitle>
              <DescriptionText>
                Buspass is a comprehensive school dismissal management platform that streamlines 
                the entire dismissal process. Our platform connects schools, parents, and bus drivers 
                in real-time, ensuring safe and efficient student transportation.
              </DescriptionText>
            </AppDescription>

            <Stats>
              <StatItem>
                <StatNumber>Real-Time</StatNumber>
                <StatLabel>Live Bus Tracking</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>Secure</StatNumber>
                <StatLabel>Student Verification</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>Instant</StatNumber>
                <StatLabel>Communication</StatLabel>
              </StatItem>
            </Stats>
          </ContentWrapper>
        </Section>

        <Section dark>
          <ContentWrapper>
            <FeaturesSection>
              <SectionTitle light>Key Features</SectionTitle>
              <FeatureGrid>
                <FeatureCard>
                  <FeatureIcon>🚌</FeatureIcon>
                  <FeatureTitle>Live Tracking</FeatureTitle>
                  <FeatureDescription>
                    Track school buses in real-time with precise GPS technology and get instant updates.
                  </FeatureDescription>
                </FeatureCard>

                <FeatureCard>
                  <FeatureIcon>🔐</FeatureIcon>
                  <FeatureTitle>Secure Verification</FeatureTitle>
                  <FeatureDescription>
                    Digital ID verification system ensures only authorized pickups.
                  </FeatureDescription>
                </FeatureCard>

                <FeatureCard>
                  <FeatureIcon>📱</FeatureIcon>
                  <FeatureTitle>Mobile Access</FeatureTitle>
                  <FeatureDescription>
                    User-friendly mobile apps for parents, teachers, and administrators.
                  </FeatureDescription>
                </FeatureCard>

                <FeatureCard>
                  <FeatureIcon>💬</FeatureIcon>
                  <FeatureTitle>Instant Communication</FeatureTitle>
                  <FeatureDescription>
                    Direct messaging between parents, schools, and bus drivers.
                  </FeatureDescription>
                </FeatureCard>
              </FeatureGrid>
            </FeaturesSection>
          </ContentWrapper>
        </Section>

        <Section>
          <ContentWrapper>
            <BenefitsSection>
              <SectionTitle>Platform Benefits</SectionTitle>
              <BenefitsGrid>
                <BenefitCard>
                  <BenefitIcon>⚡</BenefitIcon>
                  <BenefitTitle>Efficiency</BenefitTitle>
                  <BenefitDescription>
                    Streamlined dismissal process saves time for schools and parents.
                  </BenefitDescription>
                </BenefitCard>

                <BenefitCard>
                  <BenefitIcon>🛡️</BenefitIcon>
                  <BenefitTitle>Safety</BenefitTitle>
                  <BenefitDescription>
                    Enhanced security measures protect students during dismissal.
                  </BenefitDescription>
                </BenefitCard>

                <BenefitCard>
                  <BenefitIcon>📊</BenefitIcon>
                  <BenefitTitle>Analytics</BenefitTitle>
                  <BenefitDescription>
                    Comprehensive reporting and analytics for school administrators.
                  </BenefitDescription>
                </BenefitCard>
              </BenefitsGrid>
            </BenefitsSection>
          </ContentWrapper>
        </Section>

        <Section dark>
          <ContentWrapper>
            <CTASection>
              <SectionTitle light>Get Started with Buspass</SectionTitle>
              <CTAText>
                Ready to transform your school's dismissal process?
              </CTAText>
              <CTAButton as={Link} to="/register-school">
                Register Your School
              </CTAButton>
            </CTASection>
          </ContentWrapper>
        </Section>
      </Container>
      <Footer />
    </>
  );
};

const Container = styled.div`
  width: 100%;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  color: white;
  padding: 120px 20px 80px;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Section = styled.section`
  padding: 80px 20px;
  background-color: ${props => props.dark ? '#1a1a1a' : '#ffffff'};
  color: ${props => props.dark ? '#ffffff' : '#1a1a1a'};
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
  color: ${props => props.light ? '#ffffff' : '#2c3e50'};
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const AppDescription = styled.div`
  max-width: 800px;
  margin: 0 auto 60px;
  text-align: center;
`;

const DescriptionText = styled.p`
  font-size: 1.2rem;
  line-height: 1.8;
  color: #4a5568;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
  margin-top: 60px;
`;

const StatItem = styled.div``;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 10px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  color: #4a5568;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${props => props.dark ? 'rgba(255, 255, 255, 0.8)' : '#4a5568'};
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
`;

const BenefitCard = styled.div`
  text-align: center;
  padding: 30px;
`;

const BenefitIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const BenefitTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #2c3e50;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const BenefitDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #4a5568;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FeaturesSection = styled.div`
  text-align: center;
`;

const BenefitsSection = styled.div`
  text-align: center;
`;

const CTASection = styled.div`
  text-align: center;
`;

const CTAText = styled.p`
  font-size: 1.3rem;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(120deg, #3498db, #2ecc71);
  color: white;
  padding: 15px 40px;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
  }
`;

export default About; 