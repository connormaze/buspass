import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ParentGuide = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Parent Guide</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Overview</SectionTitle>
            <Text>
              The Buspass parent portal gives you real-time visibility into your child's school transportation. This guide covers all the features available to parents and how to use them effectively.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. Managing Your Children</SectionTitle>
            <SubSection>
              <SubTitle>2.1 Adding Children</SubTitle>
              <List>
                <ListItem>Navigate to "My Children" in your dashboard</ListItem>
                <ListItem>Click "Add Child" and enter required information</ListItem>
                <ListItem>Upload a recent photo for identification</ListItem>
                <ListItem>Add any special transportation needs or medical conditions</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.2 Transportation Preferences</SubTitle>
              <List>
                <ListItem>Set regular pickup and drop-off locations</ListItem>
                <ListItem>Specify alternate addresses if needed</ListItem>
                <ListItem>Configure different schedules for different days</ListItem>
                <ListItem>Set temporary changes for specific dates</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>3. Real-time Tracking</SectionTitle>
            <SubSection>
              <SubTitle>3.1 Bus Location</SubTitle>
              <Text>
                Track your child's bus in real-time:
              </Text>
              <List>
                <ListItem>View current bus location on the map</ListItem>
                <ListItem>See estimated arrival time at your stop</ListItem>
                <ListItem>Track multiple buses if you have children on different routes</ListItem>
                <ListItem>View route progress and completed stops</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.2 Student Check-in/out</SubTitle>
              <List>
                <ListItem>Receive notifications when your child boards the bus</ListItem>
                <ListItem>Get alerts when your child reaches school/home</ListItem>
                <ListItem>View historical transportation records</ListItem>
                <ListItem>Track attendance and bus usage patterns</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>4. Notifications</SectionTitle>
            <SubSection>
              <SubTitle>4.1 Types of Notifications</SubTitle>
              <List>
                <ListItem>Bus arrival alerts (5-10 minutes before arrival)</ListItem>
                <ListItem>Delay notifications</ListItem>
                <ListItem>Route changes or cancellations</ListItem>
                <ListItem>Emergency alerts</ListItem>
                <ListItem>School announcements</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>4.2 Customizing Notifications</SubTitle>
              <List>
                <ListItem>Choose notification methods (push, email, SMS)</ListItem>
                <ListItem>Set notification preferences for each child</ListItem>
                <ListItem>Configure quiet hours</ListItem>
                <ListItem>Manage emergency contact preferences</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>5. Communication</SectionTitle>
            <SubSection>
              <SubTitle>5.1 Messaging System</SubTitle>
              <Text>
                Stay in touch with transportation staff:
              </Text>
              <List>
                <ListItem>Direct messaging with bus drivers</ListItem>
                <ListItem>Communication with school transportation office</ListItem>
                <ListItem>Group announcements and updates</ListItem>
                <ListItem>Emergency contact options</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>5.2 Absence Reporting</SubTitle>
              <List>
                <ListItem>Report planned absences in advance</ListItem>
                <ListItem>Submit last-minute transportation changes</ListItem>
                <ListItem>Specify duration of absence</ListItem>
                <ListItem>Receive confirmation of submitted changes</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>6. Safety Features</SectionTitle>
            <List>
              <ListItem>Set up authorized pickup persons</ListItem>
              <ListItem>Configure emergency contacts</ListItem>
              <ListItem>View driver credentials and certifications</ListItem>
              <ListItem>Access safety guidelines and procedures</ListItem>
              <ListItem>Report safety concerns</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. Additional Features</SectionTitle>
            <List>
              <ListItem>View transportation schedule calendar</ListItem>
              <ListItem>Access route maps and stop information</ListItem>
              <ListItem>Download transportation reports</ListItem>
              <ListItem>Set vacation dates and special arrangements</ListItem>
            </List>
          </Section>

          <HelpfulLinks>
            <SectionTitle>Related Resources</SectionTitle>
            <LinkGrid>
              <LinkCard to="/help/mobile-app">
                Mobile App Guide
              </LinkCard>
              <LinkCard to="/help/safety-features">
                Safety Features
              </LinkCard>
              <LinkCard to="/help/troubleshooting">
                Troubleshooting
              </LinkCard>
              <LinkCard to="/help/getting-started">
                Getting Started
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

export default ParentGuide; 