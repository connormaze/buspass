import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const SafetyFeatures = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Safety Features Guide</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Overview</SectionTitle>
            <Text>
              StarDetect's Buspass application prioritizes student safety above all else. This guide outlines the comprehensive safety features and protocols implemented throughout the system to ensure secure and reliable student transportation.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. Student Safety Features</SectionTitle>
            <SubSection>
              <SubTitle>2.1 Student Verification</SubTitle>
              <List>
                <ListItem>Secure student identification system</ListItem>
                <ListItem>Digital attendance tracking</ListItem>
                <ListItem>Authorized pickup verification</ListItem>
                <ListItem>Special needs accommodations tracking</ListItem>
                <ListItem>Emergency contact management</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.2 Real-time Monitoring</SubTitle>
              <List>
                <ListItem>Live GPS tracking of all buses</ListItem>
                <ListItem>Student boarding/departure confirmation</ListItem>
                <ListItem>Route progress monitoring</ListItem>
                <ListItem>Instant alerts for schedule deviations</ListItem>
                <ListItem>Real-time incident reporting</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>3. Driver Safety Tools</SectionTitle>
            <SubSection>
              <SubTitle>3.1 Driver Authentication</SubTitle>
              <List>
                <ListItem>Secure driver login system</ListItem>
                <ListItem>Credential verification</ListItem>
                <ListItem>Training compliance tracking</ListItem>
                <ListItem>Background check monitoring</ListItem>
                <ListItem>License and certification tracking</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.2 Safety Protocols</SubTitle>
              <List>
                <ListItem>Pre-trip inspection checklist</ListItem>
                <ListItem>Emergency procedure guides</ListItem>
                <ListItem>Weather condition alerts</ListItem>
                <ListItem>Road hazard reporting</ListItem>
                <ListItem>Vehicle maintenance tracking</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>4. Communication Safety</SectionTitle>
            <SubSection>
              <SubTitle>4.1 Emergency Communications</SubTitle>
              <List>
                <ListItem>One-touch emergency alerts</ListItem>
                <ListItem>Direct line to emergency services</ListItem>
                <ListItem>Instant school notification system</ListItem>
                <ListItem>Parent alert system</ListItem>
                <ListItem>Emergency broadcast capabilities</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>4.2 Secure Messaging</SubTitle>
              <List>
                <ListItem>Encrypted communication channels</ListItem>
                <ListItem>Authorized contact verification</ListItem>
                <ListItem>Audit trail of all communications</ListItem>
                <ListItem>Privacy-compliant messaging system</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>5. Route Safety Features</SectionTitle>
            <SubSection>
              <SubTitle>5.1 Route Planning Safety</SubTitle>
              <List>
                <ListItem>Safe stop location verification</ListItem>
                <ListItem>Traffic pattern analysis</ListItem>
                <ListItem>School zone compliance</ListItem>
                <ListItem>Walking distance optimization</ListItem>
                <ListItem>Hazard zone avoidance</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>5.2 Real-time Adjustments</SubTitle>
              <List>
                <ListItem>Dynamic route updates</ListItem>
                <ListItem>Weather-based route modifications</ListItem>
                <ListItem>Construction zone avoidance</ListItem>
                <ListItem>Emergency route alternatives</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>6. Data Security</SectionTitle>
            <List>
              <ListItem>End-to-end data encryption</ListItem>
              <ListItem>Secure student information storage</ListItem>
              <ListItem>FERPA compliance measures</ListItem>
              <ListItem>Regular security audits</ListItem>
              <ListItem>Access control management</ListItem>
              <ListItem>Data backup and recovery</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. Compliance and Reporting</SectionTitle>
            <SubSection>
              <SubTitle>7.1 Safety Compliance</SubTitle>
              <List>
                <ListItem>Regular safety assessments</ListItem>
                <ListItem>Compliance monitoring tools</ListItem>
                <ListItem>Safety protocol enforcement</ListItem>
                <ListItem>Regulatory requirement tracking</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>7.2 Incident Reporting</SubTitle>
              <List>
                <ListItem>Detailed incident documentation</ListItem>
                <ListItem>Automated report generation</ListItem>
                <ListItem>Investigation tracking</ListItem>
                <ListItem>Resolution documentation</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>8. Parent Safety Tools</SectionTitle>
            <List>
              <ListItem>Real-time bus tracking</ListItem>
              <ListItem>Arrival notifications</ListItem>
              <ListItem>Student safety alerts</ListItem>
              <ListItem>Secure communication channel</ListItem>
              <ListItem>Emergency contact updates</ListItem>
              <ListItem>Transportation preference management</ListItem>
            </List>
          </Section>

          <HelpfulLinks>
            <SectionTitle>Related Resources</SectionTitle>
            <LinkGrid>
              <LinkCard to="/help/school-guide">
                School Administrator Guide
              </LinkCard>
              <LinkCard to="/help/driver-guide">
                Bus Driver Guide
              </LinkCard>
              <LinkCard to="/help/route-management">
                Route Management
              </LinkCard>
              <LinkCard to="/help/emergency">
                Emergency Procedures
              </LinkCard>
            </LinkGrid>
          </HelpfulLinks>
        </Content>
      </Container>
      <Footer />
    </>
  );
};

const Container = styled.div`
  padding: 80px 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1a1a1a;
  margin-bottom: 10px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const LastUpdated = styled.p`
  color: #666;
  margin-bottom: 40px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 20px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const SubSection = styled.div`
  margin-bottom: 20px;
`;

const SubTitle = styled.h3`
  font-size: 1.2rem;
  color: #1a1a1a;
  margin-bottom: 15px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Text = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 15px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const List = styled.ul`
  margin-bottom: 15px;
  padding-left: 20px;
`;

const ListItem = styled.li`
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 8px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const HelpfulLinks = styled.div`
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #eee;
`;

const LinkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const LinkCard = styled(Link)`
  display: block;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #1a1a1a;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }
`;

export default SafetyFeatures; 