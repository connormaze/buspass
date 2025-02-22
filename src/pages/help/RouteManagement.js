import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const RouteManagement = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Route Management Guide</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Overview</SectionTitle>
            <Text>
              The Buspass route management system provides powerful tools for creating, optimizing, and managing bus routes. This guide covers all aspects of route planning and management to ensure efficient and safe student transportation.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. Route Planning</SectionTitle>
            <SubSection>
              <SubTitle>2.1 Creating New Routes</SubTitle>
              <List>
                <ListItem>Access the route planning interface</ListItem>
                <ListItem>Define route boundaries and service areas</ListItem>
                <ListItem>Set route start and end points</ListItem>
                <ListItem>Add intermediate stops and waypoints</ListItem>
                <ListItem>Specify time schedules for each stop</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.2 Route Optimization</SubTitle>
              <List>
                <ListItem>Use automated route optimization tools</ListItem>
                <ListItem>Consider traffic patterns and road conditions</ListItem>
                <ListItem>Balance student load across routes</ListItem>
                <ListItem>Minimize travel time and distance</ListItem>
                <ListItem>Account for special needs accommodations</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>3. Stop Management</SectionTitle>
            <SubSection>
              <SubTitle>3.1 Adding Bus Stops</SubTitle>
              <List>
                <ListItem>Select safe stop locations</ListItem>
                <ListItem>Set pickup and drop-off times</ListItem>
                <ListItem>Assign students to stops</ListItem>
                <ListItem>Configure stop notifications</ListItem>
                <ListItem>Add special instructions for drivers</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.2 Stop Safety Guidelines</SubTitle>
              <List>
                <ListItem>Ensure adequate visibility and lighting</ListItem>
                <ListItem>Verify safe walking paths to stops</ListItem>
                <ListItem>Consider traffic patterns and road safety</ListItem>
                <ListItem>Maintain proper distance between stops</ListItem>
                <ListItem>Account for weather conditions</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>4. Schedule Management</SectionTitle>
            <SubSection>
              <SubTitle>4.1 Regular Schedules</SubTitle>
              <List>
                <ListItem>Set up daily route schedules</ListItem>
                <ListItem>Configure pickup and drop-off windows</ListItem>
                <ListItem>Adjust for different school start/end times</ListItem>
                <ListItem>Account for traffic variations</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>4.2 Special Schedules</SubTitle>
              <List>
                <ListItem>Create early dismissal routes</ListItem>
                <ListItem>Plan for delayed openings</ListItem>
                <ListItem>Handle half-day schedules</ListItem>
                <ListItem>Manage event transportation</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>5. Student Assignment</SectionTitle>
            <SubSection>
              <SubTitle>5.1 Assigning Students</SubTitle>
              <List>
                <ListItem>Match students to appropriate routes</ListItem>
                <ListItem>Consider grade levels and schools</ListItem>
                <ListItem>Handle multiple pickup/drop-off locations</ListItem>
                <ListItem>Manage special transportation needs</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>5.2 Managing Changes</SubTitle>
              <List>
                <ListItem>Process student transfer requests</ListItem>
                <ListItem>Handle temporary route changes</ListItem>
                <ListItem>Update for address changes</ListItem>
                <ListItem>Manage alternative arrangements</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>6. Driver Assignment</SectionTitle>
            <List>
              <ListItem>Match drivers to appropriate routes</ListItem>
              <ListItem>Consider driver qualifications and experience</ListItem>
              <ListItem>Manage driver schedules and availability</ListItem>
              <ListItem>Handle substitute driver assignments</ListItem>
              <ListItem>Track driver certifications and training</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. Route Monitoring</SectionTitle>
            <SubSection>
              <SubTitle>7.1 Real-time Tracking</SubTitle>
              <List>
                <ListItem>Monitor active routes in real-time</ListItem>
                <ListItem>Track arrival and departure times</ListItem>
                <ListItem>Identify delays and issues</ListItem>
                <ListItem>View student boarding status</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>7.2 Performance Analysis</SubTitle>
              <List>
                <ListItem>Review route efficiency metrics</ListItem>
                <ListItem>Analyze on-time performance</ListItem>
                <ListItem>Monitor fuel consumption</ListItem>
                <ListItem>Track maintenance needs</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>8. Emergency Procedures</SectionTitle>
            <List>
              <ListItem>Handle route disruptions</ListItem>
              <ListItem>Implement weather-related changes</ListItem>
              <ListItem>Manage vehicle breakdowns</ListItem>
              <ListItem>Coordinate emergency response</ListItem>
              <ListItem>Communicate with stakeholders</ListItem>
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
              <LinkCard to="/help/safety-features">
                Safety Features
              </LinkCard>
              <LinkCard to="/help/reporting">
                Reporting Guide
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

export default RouteManagement; 