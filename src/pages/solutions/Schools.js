import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Schools = () => {
  return (
    <>
      <Header />
      <Container>
        <HeroSection>
          <HeroContent>
            <Title>Buspass for Schools</Title>
            <Subtitle>Transform your school's dismissal process with smart technology</Subtitle>
            <HeroButtons>
              <PrimaryButton as={Link} to="/register-school">Get Started</PrimaryButton>
              <SecondaryButton as={Link} to="/contact">Contact Sales</SecondaryButton>
            </HeroButtons>
          </HeroContent>
        </HeroSection>

        <Section>
          <ContentWrapper>
            <BenefitsGrid>
              <BenefitCard>
                <BenefitIcon>⚡</BenefitIcon>
                <BenefitTitle>Streamlined Dismissal</BenefitTitle>
                <BenefitDescription>
                  Reduce dismissal time by up to 50% with our efficient digital system.
                  Coordinate student pickup seamlessly across all transportation modes.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>🔒</BenefitIcon>
                <BenefitTitle>Enhanced Safety</BenefitTitle>
                <BenefitDescription>
                  Ensure student safety with digital ID verification, authorized pickup lists,
                  and real-time notifications for changes in dismissal plans.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>📱</BenefitIcon>
                <BenefitTitle>Mobile Management</BenefitTitle>
                <BenefitDescription>
                  Manage dismissal from anywhere with our mobile app. Track buses,
                  communicate with parents, and handle changes in real-time.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>📊</BenefitIcon>
                <BenefitTitle>Data Insights</BenefitTitle>
                <BenefitDescription>
                  Access detailed analytics on dismissal patterns, transportation usage,
                  and parent communication to optimize your processes.
                </BenefitDescription>
              </BenefitCard>
            </BenefitsGrid>
          </ContentWrapper>
        </Section>

        <Section dark>
          <ContentWrapper>
            <FeatureSection>
              <FeatureContent>
                <FeatureTitle>Smart Dismissal Management</FeatureTitle>
                <FeatureDescription>
                  Our digital platform streamlines the entire dismissal process:
                </FeatureDescription>
                <FeatureList>
                  <FeatureItem>Real-time student tracking and status updates</FeatureItem>
                  <FeatureItem>Automated parent notifications and alerts</FeatureItem>
                  <FeatureItem>Digital carline management system</FeatureItem>
                  <FeatureItem>Bus route optimization and tracking</FeatureItem>
                  <FeatureItem>Emergency contact management</FeatureItem>
                </FeatureList>
              </FeatureContent>
            </FeatureSection>
          </ContentWrapper>
        </Section>

        <Section dark>
          <ContentWrapper>
            <CTASection>
              <CTATitle>Ready to Transform Your School's Dismissal?</CTATitle>
              <CTAText>
                Join hundreds of schools already using Buspass to make dismissal safer and more efficient.
              </CTAText>
              <CTAButtons>
                <PrimaryButton as={Link} to="/register-school">Start Free Trial</PrimaryButton>
                <SecondaryButton as={Link} to="/contact">Schedule Demo</SecondaryButton>
              </CTAButtons>
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
  margin-bottom: 2rem;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
`;

const Button = styled(Link)`
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(120deg, #3498db, #2ecc71);
  color: white;
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: white;
  border: 2px solid white;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
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

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 60px;
`;

const BenefitCard = styled.div`
  padding: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const BenefitIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const BenefitTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const BenefitDescription = styled.p`
  color: #4a5568;
  line-height: 1.6;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FeatureSection = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const FeatureContent = styled.div``;

const FeatureTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FeatureDescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
`;

const FeatureItem = styled.li`
  margin-bottom: 15px;
  padding-left: 30px;
  position: relative;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #2ecc71;
  }
`;

const CTASection = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CTAText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
`;

export default Schools; 