import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const SchoolGuide = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>School Administrator Guide</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Overview</SectionTitle>
            <Text>
              The Buspass school administrator portal provides comprehensive tools for managing your school's transportation system. This guide covers all aspects of the platform, from initial setup to daily operations and emergency procedures.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. Getting Started</SectionTitle>
            <SubSection>
              <SubTitle>2.1 Initial Setup</SubTitle>
              <List>
                <ListItem>Access your administrator account</ListItem>
                <ListItem>Configure school profile and settings</ListItem>
                <ListItem>Set up academic calendar and schedules</ListItem>
                <ListItem>Define transportation zones and boundaries</ListItem>
                <ListItem>Establish safety protocols and policies</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.2 Staff Management</SubTitle>
              <List>
                <ListItem>Add and manage transportation staff accounts</ListItem>
                <ListItem>Assign roles and permissions</ListItem>
                <ListItem>Set up driver credentials and certifications</ListItem>
                <ListItem>Manage staff schedules and availability</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>3. Student Management</SectionTitle>
            <SubSection>
              <SubTitle>3.1 Student Records</SubTitle>
              <List>
                <ListItem>Import student data from school system</ListItem>
                <ListItem>Manage student profiles and information</ListItem>
                <ListItem>Set up transportation requirements</ListItem>
                <ListItem>Handle special needs accommodations</ListItem>
                <ListItem>Manage parent/guardian authorizations</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.2 Transportation Assignment</SubTitle>
              <List>
                <ListItem>Assign students to routes and stops</ListItem>
                <ListItem>Handle schedule changes and exceptions</ListItem>
                <ListItem>Manage temporary transportation changes</ListItem>
                <ListItem>Process transportation requests</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>4. Route Management</SectionTitle>
            <SubSection>
              <SubTitle>4.1 Route Planning</SubTitle>
              <List>
                <ListItem>Create and optimize bus routes</ListItem>
                <ListItem>Set up pickup/drop-off locations</ListItem>
                <ListItem>Establish route schedules and timing</ListItem>
                <ListItem>Handle route modifications and adjustments</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>4.2 Driver Assignment</SubTitle>
              <List>
                <ListItem>Assign drivers to routes</ListItem>
                <ListItem>Manage substitute drivers</ListItem>
                <ListItem>Handle schedule conflicts</ListItem>
                <ListItem>Monitor driver performance and compliance</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>5. Communication Tools</SectionTitle>
            <SubSection>
              <SubTitle>5.1 Parent Communication</SubTitle>
              <List>
                <ListItem>Send announcements and updates</ListItem>
                <ListItem>Manage parent notifications</ListItem>
                <ListItem>Handle transportation inquiries</ListItem>
                <ListItem>Process feedback and concerns</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>5.2 Staff Communication</SubTitle>
              <List>
                <ListItem>Coordinate with drivers and staff</ListItem>
                <ListItem>Send operational updates</ListItem>
                <ListItem>Manage emergency communications</ListItem>
                <ListItem>Share important announcements</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>6. Safety and Compliance</SectionTitle>
            <List>
              <ListItem>Monitor real-time vehicle tracking</ListItem>
              <ListItem>Review safety incident reports</ListItem>
              <ListItem>Ensure compliance with regulations</ListItem>
              <ListItem>Manage emergency procedures</ListItem>
              <ListItem>Conduct safety audits and reviews</ListItem>
              <ListItem>Maintain required documentation</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. Reporting and Analytics</SectionTitle>
            <SubSection>
              <SubTitle>7.1 Performance Metrics</SubTitle>
              <List>
                <ListItem>Track on-time performance</ListItem>
                <ListItem>Monitor route efficiency</ListItem>
                <ListItem>Review driver performance</ListItem>
                <ListItem>Analyze transportation costs</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>7.2 Compliance Reports</SubTitle>
              <List>
                <ListItem>Generate attendance reports</ListItem>
                <ListItem>Track safety incidents</ListItem>
                <ListItem>Monitor vehicle maintenance</ListItem>
                <ListItem>Review system usage statistics</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>8. System Maintenance</SectionTitle>
            <List>
              <ListItem>Update school information</ListItem>
              <ListItem>Manage system settings</ListItem>
              <ListItem>Perform data backups</ListItem>
              <ListItem>Monitor system performance</ListItem>
              <ListItem>Handle technical issues</ListItem>
            </List>
          </Section>

          <HelpfulLinks>
            <SectionTitle>Related Resources</SectionTitle>
            <LinkGrid>
              <LinkCard to="/help/route-management">
                Route Management
              </LinkCard>
              <LinkCard to="/help/safety-features">
                Safety Features
              </LinkCard>
              <LinkCard to="/help/communication">
                Communication Tools
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

export default SchoolGuide; 