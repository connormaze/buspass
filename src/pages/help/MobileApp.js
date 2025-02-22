import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const MobileApp = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Mobile App Guide</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Overview</SectionTitle>
            <Text>
              The StarDetect Buspass mobile app provides real-time bus tracking, instant notifications, and secure communication features for parents, school staff, and bus drivers. This guide will help you get started and make the most of the mobile app's features.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. Getting Started</SectionTitle>
            <SubSection>
              <SubTitle>2.1 Installation</SubTitle>
              <List>
                <ListItem>Download from the App Store (iOS) or Google Play Store (Android)</ListItem>
                <ListItem>Create an account or sign in with existing credentials</ListItem>
                <ListItem>Complete profile setup and verification</ListItem>
                <ListItem>Enable necessary permissions (location, notifications)</ListItem>
                <ListItem>Link your account to your school</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.2 Initial Setup</SubTitle>
              <List>
                <ListItem>Configure notification preferences</ListItem>
                <ListItem>Set up student profiles and relationships</ListItem>
                <ListItem>Add emergency contacts</ListItem>
                <ListItem>Customize app settings</ListItem>
                <ListItem>Review safety features and protocols</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>3. Parent Features</SectionTitle>
            <SubSection>
              <SubTitle>3.1 Bus Tracking</SubTitle>
              <List>
                <ListItem>View real-time bus location</ListItem>
                <ListItem>Track estimated arrival times</ListItem>
                <ListItem>Receive delay notifications</ListItem>
                <ListItem>Monitor student check-in/out</ListItem>
                <ListItem>View route progress</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.2 Student Management</SubTitle>
              <List>
                <ListItem>Update student information</ListItem>
                <ListItem>Manage transportation schedules</ListItem>
                <ListItem>Set pickup/drop-off preferences</ListItem>
                <ListItem>Add authorized pickup contacts</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>4. Driver Features</SectionTitle>
            <SubSection>
              <SubTitle>4.1 Route Management</SubTitle>
              <List>
                <ListItem>Access assigned routes</ListItem>
                <ListItem>View student lists and stops</ListItem>
                <ListItem>Mark completed stops</ListItem>
                <ListItem>Report delays or issues</ListItem>
                <ListItem>Navigate with turn-by-turn directions</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>4.2 Student Check-in</SubTitle>
              <List>
                <ListItem>Record student attendance</ListItem>
                <ListItem>Verify authorized pickups</ListItem>
                <ListItem>Handle special instructions</ListItem>
                <ListItem>Document incidents or concerns</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>5. Communication Tools</SectionTitle>
            <SubSection>
              <SubTitle>5.1 Messaging</SubTitle>
              <List>
                <ListItem>Send and receive secure messages</ListItem>
                <ListItem>Communicate with school staff</ListItem>
                <ListItem>Contact transportation office</ListItem>
                <ListItem>Share updates with parents</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>5.2 Notifications</SubTitle>
              <List>
                <ListItem>Customize alert preferences</ListItem>
                <ListItem>Receive arrival notifications</ListItem>
                <ListItem>Get delay updates</ListItem>
                <ListItem>Emergency alerts</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>6. Safety Features</SectionTitle>
            <List>
              <ListItem>Emergency contact access</ListItem>
              <ListItem>One-touch emergency reporting</ListItem>
              <ListItem>Safety alert notifications</ListItem>
              <ListItem>Secure student verification</ListItem>
              <ListItem>Weather alerts and updates</ListItem>
              <ListItem>Incident reporting tools</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. Account Management</SectionTitle>
            <SubSection>
              <SubTitle>7.1 Profile Settings</SubTitle>
              <List>
                <ListItem>Update personal information</ListItem>
                <ListItem>Manage notification settings</ListItem>
                <ListItem>Change password and security</ListItem>
                <ListItem>Configure privacy preferences</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>7.2 Data Management</SubTitle>
              <List>
                <ListItem>View activity history</ListItem>
                <ListItem>Access transportation records</ListItem>
                <ListItem>Download reports</ListItem>
                <ListItem>Manage stored information</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>8. Troubleshooting</SectionTitle>
            <List>
              <ListItem>Connection issues resolution</ListItem>
              <ListItem>GPS tracking problems</ListItem>
              <ListItem>Notification troubleshooting</ListItem>
              <ListItem>Login and account issues</ListItem>
              <ListItem>App performance optimization</ListItem>
              <ListItem>Battery usage management</ListItem>
            </List>
          </Section>

          <HelpfulLinks>
            <SectionTitle>Related Resources</SectionTitle>
            <LinkGrid>
              <LinkCard to="/help/safety-features">
                Safety Features
              </LinkCard>
              <LinkCard to="/help/route-management">
                Route Management
              </LinkCard>
              <LinkCard to="/help/troubleshooting">
                Troubleshooting
              </LinkCard>
              <LinkCard to="/help/communication">
                Communication Guide
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

export default MobileApp; 