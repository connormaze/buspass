import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Features = () => {
  const [activeRole, setActiveRole] = useState('School Administrators');

  const roleContent = {
    'School Administrators': [
      {
        title: 'Fleet Management',
        features: [
          'Complete fleet overview',
          'Driver assignment',
          'Maintenance scheduling',
          'Cost tracking'
        ]
      },
      {
        title: 'Student Management',
        features: [
          'Student database integration',
          'Attendance tracking',
          'Behavior monitoring',
          'Parent communication'
        ]
      },
      {
        title: 'Safety & Compliance',
        features: [
          'Driver certification tracking',
          'Incident reporting',
          'Safety analytics',
          'Compliance reporting'
        ]
      },
      {
        title: 'Analytics & Reporting',
        features: [
          'Custom report generation',
          'Performance metrics',
          'Cost analysis',
          'Trend identification'
        ]
      }
    ],
    'Bus Drivers': [
      {
        title: 'Route Management',
        features: [
          'Turn-by-turn navigation',
          'Real-time traffic updates',
          'Student pickup/dropoff tracking',
          'Route optimization'
        ]
      },
      {
        title: 'Student Management',
        features: [
          'Digital attendance',
          'Behavior reporting',
          'Emergency contacts',
          'Parent communication'
        ]
      },
      {
        title: 'Safety Tools',
        features: [
          'Pre-trip inspection',
          'Incident reporting',
          'Emergency protocols',
          'Weather alerts'
        ]
      },
      {
        title: 'Communication',
        features: [
          'School messaging',
          'Parent notifications',
          'Emergency broadcasts',
          'Status updates'
        ]
      }
    ],
    'Parents': [
      {
        title: 'Real-Time Tracking',
        features: [
          'Live bus location',
          'Estimated arrival times',
          'Route visualization',
          'Stop notifications'
        ]
      },
      {
        title: 'Student Safety',
        features: [
          'Check-in/out alerts',
          'Emergency notifications',
          'Behavior updates',
          'Route changes'
        ]
      },
      {
        title: 'Communication',
        features: [
          'Direct messaging',
          'Absence reporting',
          'Schedule changes',
          'Document sharing'
        ]
      },
      {
        title: 'Account Management',
        features: [
          'Multiple student profiles',
          'Preference settings',
          'Contact updates',
          'Payment management'
        ]
      }
    ],
    'Transportation Staff': [
      {
        title: 'Route Planning',
        features: [
          'AI route optimization',
          'Schedule management',
          'Driver assignment',
          'Resource allocation'
        ]
      },
      {
        title: 'Fleet Management',
        features: [
          'Vehicle maintenance',
          'Fuel monitoring',
          'GPS tracking',
          'Performance analytics'
        ]
      },
      {
        title: 'Staff Management',
        features: [
          'Driver scheduling',
          'Certification tracking',
          'Training management',
          'Performance reviews'
        ]
      },
      {
        title: 'System Administration',
        features: [
          'User management',
          'Access control',
          'System configuration',
          'Data backup'
        ]
      }
    ]
  };

  return (
    <>
      <Header />
      <Container>
        <HeroSection>
          <Title>Powerful Features for Modern School Transportation</Title>
          <Subtitle>Everything you need to manage your school's transportation safely and efficiently</Subtitle>
        </HeroSection>

        <MainFeatureSection>
          <FeatureGrid>
            <MainFeatureCard
              as={motion.div}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FeatureIcon>🚌</FeatureIcon>
              <MainFeatureTitle>Real-Time Bus Tracking</MainFeatureTitle>
              <FeatureList>
                <FeatureItem>Live GPS tracking with 30-second updates</FeatureItem>
                <FeatureItem>Accurate arrival time predictions</FeatureItem>
                <FeatureItem>Historical route playback</FeatureItem>
                <FeatureItem>Speed and safety monitoring</FeatureItem>
                <FeatureItem>Geofencing for school zones</FeatureItem>
              </FeatureList>
            </MainFeatureCard>

            <MainFeatureCard
              as={motion.div}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FeatureIcon>📱</FeatureIcon>
              <MainFeatureTitle>Parent Mobile App</MainFeatureTitle>
              <FeatureList>
                <FeatureItem>Real-time bus location viewing</FeatureItem>
                <FeatureItem>Push notifications for bus status</FeatureItem>
                <FeatureItem>Student check-in/out alerts</FeatureItem>
                <FeatureItem>Secure messaging with school</FeatureItem>
                <FeatureItem>Multiple student management</FeatureItem>
              </FeatureList>
            </MainFeatureCard>

            <MainFeatureCard
              as={motion.div}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FeatureIcon>🗺️</FeatureIcon>
              <MainFeatureTitle>Smart Route Planning</MainFeatureTitle>
              <FeatureList>
                <FeatureItem>AI-powered route optimization</FeatureItem>
                <FeatureItem>Real-time traffic integration</FeatureItem>
                <FeatureItem>Student density mapping</FeatureItem>
                <FeatureItem>Multiple route scenarios</FeatureItem>
                <FeatureItem>Fuel efficiency analysis</FeatureItem>
              </FeatureList>
            </MainFeatureCard>
          </FeatureGrid>
        </MainFeatureSection>

        <RoleBasedSection>
          <SectionTitle>Features by Role</SectionTitle>
          
          <RoleTabsContainer>
            <RoleTabs>
              {Object.keys(roleContent).map((role) => (
                <RoleTab
                  key={role}
                  active={activeRole === role}
                  onClick={() => setActiveRole(role)}
                  as={motion.button}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {role}
                </RoleTab>
              ))}
            </RoleTabs>

            <RoleContent>
              <RoleFeatureGrid
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                key={activeRole}
              >
                {roleContent[activeRole].map((section, index) => (
                  <RoleFeatureCard
                    key={index}
                    as={motion.div}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <RoleFeatureTitle>{section.title}</RoleFeatureTitle>
                    <RoleFeatureList>
                      {section.features.map((feature, featureIndex) => (
                        <RoleFeatureItem key={featureIndex}>{feature}</RoleFeatureItem>
                      ))}
                    </RoleFeatureList>
                  </RoleFeatureCard>
                ))}
              </RoleFeatureGrid>
            </RoleContent>
          </RoleTabsContainer>
        </RoleBasedSection>

        <SafetySection>
          <SectionTitle>Safety First</SectionTitle>
          <SafetyGrid>
            <SafetyCard
              as={motion.div}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <SafetyIcon>🛡️</SafetyIcon>
              <SafetyTitle>Student Safety</SafetyTitle>
              <SafetyDescription>
                Real-time tracking, secure check-in/out, and instant notifications keep students safe throughout their journey.
              </SafetyDescription>
            </SafetyCard>

            <SafetyCard
              as={motion.div}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <SafetyIcon>🔒</SafetyIcon>
              <SafetyTitle>Data Security</SafetyTitle>
              <SafetyDescription>
                Enterprise-grade encryption, secure authentication, and FERPA compliance protect sensitive information.
              </SafetyDescription>
            </SafetyCard>

            <SafetyCard
              as={motion.div}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <SafetyIcon>⚡</SafetyIcon>
              <SafetyTitle>Emergency Response</SafetyTitle>
              <SafetyDescription>
                Instant alerts, emergency protocols, and direct communication channels for rapid response.
              </SafetyDescription>
            </SafetyCard>
          </SafetyGrid>
        </SafetySection>

        <TechnologySection>
          <SectionTitle>Cutting-Edge Technology</SectionTitle>
          <TechGrid>
            <TechCard
              as={motion.div}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TechIcon>🤖</TechIcon>
              <TechTitle>AI & Machine Learning</TechTitle>
              <TechDescription>
                Predictive arrival times, smart route optimization, and automated incident detection.
              </TechDescription>
            </TechCard>

            <TechCard
              as={motion.div}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TechIcon>📡</TechIcon>
              <TechTitle>Real-Time Updates</TechTitle>
              <TechDescription>
                Live GPS tracking, instant notifications, and real-time communication.
              </TechDescription>
            </TechCard>

            <TechCard
              as={motion.div}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TechIcon>🔄</TechIcon>
              <TechTitle>Integration Ready</TechTitle>
              <TechDescription>
                Seamless integration with existing school systems and third-party applications.
              </TechDescription>
            </TechCard>
          </TechGrid>
        </TechnologySection>

        <CTASection>
          <CTATitle>Ready to Transform Your School Transportation?</CTATitle>
          <CTADescription>
            Join schools nationwide in providing safer, more efficient transportation for students.
          </CTADescription>
          <StyledLink to="/register-school">
            <CTAButton
              as={motion.div}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ y: 0, scale: 0.95 }}
            >
              Get Started Today
            </CTAButton>
          </StyledLink>
        </CTASection>
      </Container>
      <Footer />
    </>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding-top: 80px;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  color: white;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;
  margin: 0 auto;
`;

const MainFeatureSection = styled.section`
  padding: 80px 20px;
  background: white;
`;

const FeatureGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
`;

const MainFeatureCard = styled(motion.div)`
  background: #f8f9fa;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const MainFeatureTitle = styled.h2`
  font-size: 1.8rem;
  color: #1a1a1a;
  margin-bottom: 20px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  text-align: left;
`;

const FeatureItem = styled.li`
  margin-bottom: 10px;
  color: #666;
  font-size: 1.1rem;
  display: flex;
  align-items: center;

  &:before {
    content: "✓";
    color: #2ecc71;
    margin-right: 10px;
    font-weight: bold;
  }
`;

const RoleBasedSection = styled.section`
  padding: 80px 20px;
  background: #f8f9fa;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 50px;
  color: #1a1a1a;
`;

const RoleTabsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const RoleTabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const RoleTab = styled(motion.button)`
  padding: 15px 30px;
  margin: 0 10px 10px;
  border: none;
  background: ${props => props.active ? '#3498db' : '#fff'};
  color: ${props => props.active ? '#fff' : '#1a1a1a'};
  border-radius: 30px;
  cursor: pointer;
  font-size: 1.1rem;
  box-shadow: ${props => props.active ? '0 5px 15px rgba(52, 152, 219, 0.3)' : 'none'};
`;

const RoleContent = styled.div``;

const RoleFeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
`;

const RoleFeatureCard = styled(motion.div)`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  cursor: pointer;
`;

const RoleFeatureTitle = styled.h3`
  font-size: 1.4rem;
  color: #1a1a1a;
  margin-bottom: 20px;
`;

const RoleFeatureList = styled.ul`
  list-style: none;
  padding: 0;
`;

const RoleFeatureItem = styled.li`
  margin-bottom: 10px;
  color: #666;
  display: flex;
  align-items: center;

  &:before {
    content: "•";
    color: #3498db;
    margin-right: 10px;
    font-weight: bold;
  }
`;

const SafetySection = styled.section`
  padding: 80px 20px;
  background: white;
`;

const SafetyGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
`;

const SafetyCard = styled(motion.div)`
  text-align: center;
  padding: 40px;
  cursor: pointer;
`;

const SafetyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const SafetyTitle = styled.h3`
  font-size: 1.6rem;
  color: #1a1a1a;
  margin-bottom: 15px;
`;

const SafetyDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const TechnologySection = styled.section`
  padding: 80px 20px;
  background: #f8f9fa;
`;

const TechGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
`;

const TechCard = styled(motion.div)`
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  cursor: pointer;
`;

const TechIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const TechTitle = styled.h3`
  font-size: 1.6rem;
  color: #1a1a1a;
  margin-bottom: 15px;
`;

const TechDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const CTASection = styled.section`
  padding: 100px 20px;
  text-align: center;
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  color: white;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const CTADescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(motion.div)`
  padding: 15px 40px;
  font-size: 1.2rem;
  background: white;
  color: #3498db;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  display: inline-block;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export default Features; 