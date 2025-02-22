import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Communication = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Communication Guide</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Overview</SectionTitle>
            <Text>
              The Buspass communication system enables seamless interaction between schools, parents, and bus drivers. This guide explains all communication features and best practices.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. In-App Messaging</SectionTitle>
            <SubSection>
              <SubTitle>2.1 Direct Messages</SubTitle>
              <List>
                <ListItem>Send messages to drivers or school staff</ListItem>
                <ListItem>Attach photos or documents</ListItem>
                <ListItem>View message status and read receipts</ListItem>
                <ListItem>Set message priority levels</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.2 Group Communications</SubTitle>
              <List>
                <ListItem>Create and manage communication groups</ListItem>
                <ListItem>Send announcements to multiple recipients</ListItem>
                <ListItem>Organize route-specific discussions</ListItem>
                <ListItem>Share updates with all stakeholders</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>3. Notifications</SectionTitle>
            <SubSection>
              <SubTitle>3.1 Alert Types</SubTitle>
              <List>
                <ListItem>Route delay notifications</ListItem>
                <ListItem>Schedule change alerts</ListItem>
                <ListItem>Emergency broadcasts</ListItem>
                <ListItem>Weather-related updates</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.2 Notification Settings</SubTitle>
              <List>
                <ListItem>Customize notification preferences</ListItem>
                <ListItem>Set quiet hours</ListItem>
                <ListItem>Choose delivery methods (push, email, SMS)</ListItem>
                <ListItem>Manage alert priorities</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>4. Emergency Communication</SectionTitle>
            <List>
              <ListItem>Access emergency contact information</ListItem>
              <ListItem>Send urgent alerts to all stakeholders</ListItem>
              <ListItem>Follow emergency communication protocols</ListItem>
              <ListItem>Document and track incident communications</ListItem>
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

export default Communication; 