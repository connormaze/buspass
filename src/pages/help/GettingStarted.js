import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const GettingStarted = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Getting Started with Buspass</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Welcome to Buspass</SectionTitle>
            <Text>
              Buspass is a comprehensive school transportation management platform that helps schools, parents, and bus drivers coordinate student transportation safely and efficiently. This guide will help you get started with the basic features and setup process.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. Creating Your Account</SectionTitle>
            <SubSection>
              <SubTitle>2.1 Account Types</SubTitle>
              <Text>
                Buspass offers different account types based on your role:
              </Text>
              <List>
                <ListItem>School Administrator: Manages transportation for entire school</ListItem>
                <ListItem>Teacher: Manages classroom dismissal</ListItem>
                <ListItem>Bus Driver: Manages routes and student check-ins</ListItem>
                <ListItem>Parent/Guardian: Tracks child's transportation</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.2 Registration Process</SubTitle>
              <List>
                <ListItem>Visit the signup page and select your role</ListItem>
                <ListItem>Enter your email and create a secure password</ListItem>
                <ListItem>Verify your email address</ListItem>
                <ListItem>Complete your profile with required information</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>3. Initial Setup</SectionTitle>
            <SubSection>
              <SubTitle>3.1 For Parents</SubTitle>
              <List>
                <ListItem>Add your children's information</ListItem>
                <ListItem>Select their school and transportation preferences</ListItem>
                <ListItem>Set up emergency contacts</ListItem>
                <ListItem>Configure notification preferences</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.2 For School Staff</SubTitle>
              <List>
                <ListItem>Verify your school credentials</ListItem>
                <ListItem>Import or add student records</ListItem>
                <ListItem>Set up bus routes and schedules</ListItem>
                <ListItem>Configure school dismissal procedures</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.3 For Bus Drivers</SubTitle>
              <List>
                <ListItem>Complete required certifications</ListItem>
                <ListItem>Set up route preferences</ListItem>
                <ListItem>Configure mobile app settings</ListItem>
                <ListItem>Review safety protocols</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>4. Basic Features</SectionTitle>
            <SubSection>
              <SubTitle>4.1 Real-time Tracking</SubTitle>
              <Text>
                Track bus locations in real-time through the mobile app or web interface. Features include:
              </Text>
              <List>
                <ListItem>Live GPS tracking of buses</ListItem>
                <ListItem>Estimated arrival times</ListItem>
                <ListItem>Route progress updates</ListItem>
                <ListItem>Delay notifications</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>4.2 Communication Tools</SubTitle>
              <Text>
                Stay connected with all stakeholders through:
              </Text>
              <List>
                <ListItem>In-app messaging system</ListItem>
                <ListItem>Push notifications</ListItem>
                <ListItem>Email alerts</ListItem>
                <ListItem>Emergency broadcasts</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>5. Mobile App Installation</SectionTitle>
            <List>
              <ListItem>Download the Buspass app from the App Store or Google Play</ListItem>
              <ListItem>Log in with your account credentials</ListItem>
              <ListItem>Enable necessary permissions (location, notifications)</ListItem>
              <ListItem>Complete the app setup wizard</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>6. Safety and Security</SectionTitle>
            <List>
              <ListItem>Use strong, unique passwords</ListItem>
              <ListItem>Enable two-factor authentication</ListItem>
              <ListItem>Keep your contact information updated</ListItem>
              <ListItem>Review and understand privacy settings</ListItem>
              <ListItem>Familiarize yourself with emergency procedures</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. Next Steps</SectionTitle>
            <Text>
              After completing the initial setup:
            </Text>
            <List>
              <ListItem>Review role-specific guides for detailed information</ListItem>
              <ListItem>Explore advanced features in your dashboard</ListItem>
              <ListItem>Set up additional preferences and customizations</ListItem>
              <ListItem>Contact support if you need assistance</ListItem>
            </List>
          </Section>

          <HelpfulLinks>
            <SectionTitle>Helpful Resources</SectionTitle>
            <LinkGrid>
              <LinkCard to="/help/parent-guide">
                Parent Guide
              </LinkCard>
              <LinkCard to="/help/school-guide">
                School Administrator Guide
              </LinkCard>
              <LinkCard to="/help/driver-guide">
                Bus Driver Guide
              </LinkCard>
              <LinkCard to="/help/mobile-app">
                Mobile App Guide
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

export default GettingStarted; 