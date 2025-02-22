import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const DriverGuide = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Bus Driver Guide</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Overview</SectionTitle>
            <Text>
              The Buspass driver app is designed to help you manage your routes efficiently and safely. This guide covers all the features and tools available to bus drivers, along with best practices for daily operations.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. Getting Started</SectionTitle>
            <SubSection>
              <SubTitle>2.1 Driver App Setup</SubTitle>
              <List>
                <ListItem>Download the Buspass Driver App</ListItem>
                <ListItem>Log in with your provided credentials</ListItem>
                <ListItem>Enable required permissions (location, notifications)</ListItem>
                <ListItem>Complete initial setup wizard</ListItem>
                <ListItem>Review safety protocols and guidelines</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.2 Daily Preparation</SubTitle>
              <List>
                <ListItem>Review assigned routes before starting</ListItem>
                <ListItem>Check student roster and special instructions</ListItem>
                <ListItem>Verify emergency contact information</ListItem>
                <ListItem>Ensure mobile device is fully charged</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>3. Route Navigation</SectionTitle>
            <SubSection>
              <SubTitle>3.1 Using the Navigation System</SubTitle>
              <List>
                <ListItem>Access your assigned route details</ListItem>
                <ListItem>View turn-by-turn directions</ListItem>
                <ListItem>See estimated arrival times for each stop</ListItem>
                <ListItem>Track route progress in real-time</ListItem>
                <ListItem>Handle route deviations when necessary</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.2 Stop Management</SubTitle>
              <List>
                <ListItem>View student information for each stop</ListItem>
                <ListItem>Mark stops as completed</ListItem>
                <ListItem>Record student attendance</ListItem>
                <ListItem>Handle missed stops or changes</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>4. Student Management</SectionTitle>
            <SubSection>
              <SubTitle>4.1 Student Check-in/out</SubTitle>
              <List>
                <ListItem>Verify student identity during boarding</ListItem>
                <ListItem>Mark students present or absent</ListItem>
                <ListItem>Handle unauthorized pickup situations</ListItem>
                <ListItem>Manage special transportation needs</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>4.2 Special Situations</SubTitle>
              <List>
                <ListItem>Handle late students</ListItem>
                <ListItem>Manage unexpected schedule changes</ListItem>
                <ListItem>Deal with behavioral issues</ListItem>
                <ListItem>Address parent concerns at stops</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>5. Communication Tools</SectionTitle>
            <SubSection>
              <SubTitle>5.1 Real-time Updates</SubTitle>
              <List>
                <ListItem>Report delays or incidents</ListItem>
                <ListItem>Send status updates to school</ListItem>
                <ListItem>Notify about route changes</ListItem>
                <ListItem>Communicate with dispatch</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>5.2 Emergency Communications</SubTitle>
              <List>
                <ListItem>Access emergency contact numbers</ListItem>
                <ListItem>Use emergency alert system</ListItem>
                <ListItem>Report safety concerns</ListItem>
                <ListItem>Request immediate assistance</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>6. Safety Procedures</SectionTitle>
            <List>
              <ListItem>Follow pre-trip inspection checklist</ListItem>
              <ListItem>Maintain proper student behavior</ListItem>
              <ListItem>Handle emergency situations</ListItem>
              <ListItem>Report safety incidents</ListItem>
              <ListItem>Document accidents or near-misses</ListItem>
              <ListItem>Follow weather-related protocols</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. End of Route Procedures</SectionTitle>
            <List>
              <ListItem>Complete final student checks</ListItem>
              <ListItem>Submit route completion report</ListItem>
              <ListItem>Report any maintenance issues</ListItem>
              <ListItem>Update mileage and fuel logs</ListItem>
              <ListItem>Prepare for next day's route</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>8. Troubleshooting</SectionTitle>
            <SubSection>
              <SubTitle>8.1 App Issues</SubTitle>
              <List>
                <ListItem>Handle GPS signal problems</ListItem>
                <ListItem>Resolve login issues</ListItem>
                <ListItem>Deal with app crashes</ListItem>
                <ListItem>Manage offline operations</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>8.2 Common Scenarios</SubTitle>
              <List>
                <ListItem>Student not at designated stop</ListItem>
                <ListItem>Parent not present for pickup/drop-off</ListItem>
                <ListItem>Route blocked or detoured</ListItem>
                <ListItem>Vehicle mechanical issues</ListItem>
              </List>
            </SubSection>
          </Section>

          <HelpfulLinks>
            <SectionTitle>Related Resources</SectionTitle>
            <LinkGrid>
              <LinkCard to="/help/safety-features">
                Safety Features
              </LinkCard>
              <LinkCard to="/help/mobile-app">
                Mobile App Guide
              </LinkCard>
              <LinkCard to="/help/route-management">
                Route Management
              </LinkCard>
              <LinkCard to="/help/troubleshooting">
                Troubleshooting
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

export default DriverGuide; 