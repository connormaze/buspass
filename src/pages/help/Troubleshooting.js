import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Troubleshooting = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Troubleshooting Guide</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Overview</SectionTitle>
            <Text>
              This guide provides solutions to common issues you may encounter while using the StarDetect Buspass application. If you can't find a solution to your specific problem, please contact our support team at support@stardetect.us.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. Account Issues</SectionTitle>
            <SubSection>
              <SubTitle>2.1 Login Problems</SubTitle>
              <List>
                <ListItem>
                  <Strong>Forgot Password:</Strong> Use the "Forgot Password" link on the login screen to reset your password via email
                </ListItem>
                <ListItem>
                  <Strong>Account Locked:</Strong> Contact your school administrator or our support team to unlock your account
                </ListItem>
                <ListItem>
                  <Strong>Invalid Credentials:</Strong> Double-check your email and password, ensure caps lock is off
                </ListItem>
                <ListItem>
                  <Strong>Can't Access Account:</Strong> Verify your email address and contact support if issues persist
                </ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.2 Profile Issues</SubTitle>
              <List>
                <ListItem>
                  <Strong>Can't Update Information:</Strong> Clear browser cache and try again, or use the mobile app
                </ListItem>
                <ListItem>
                  <Strong>Missing Permissions:</Strong> Contact your school administrator to verify your role and permissions
                </ListItem>
                <ListItem>
                  <Strong>Profile Not Syncing:</Strong> Check your internet connection and try refreshing the page
                </ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>3. Mobile App Issues</SectionTitle>
            <SubSection>
              <SubTitle>3.1 Installation Problems</SubTitle>
              <List>
                <ListItem>
                  <Strong>App Won't Install:</Strong> Check device compatibility and available storage space
                </ListItem>
                <ListItem>
                  <Strong>Update Failed:</Strong> Uninstall and reinstall the app, ensure stable internet connection
                </ListItem>
                <ListItem>
                  <Strong>App Crashes:</Strong> Update to the latest version, clear app cache and data
                </ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.2 Performance Issues</SubTitle>
              <List>
                <ListItem>
                  <Strong>Slow Performance:</Strong> Close background apps, clear app cache, ensure sufficient storage
                </ListItem>
                <ListItem>
                  <Strong>Battery Drain:</Strong> Check location settings, update app to latest version
                </ListItem>
                <ListItem>
                  <Strong>App Freezing:</Strong> Force stop the app, clear cache, and restart your device
                </ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>4. Tracking Issues</SectionTitle>
            <SubSection>
              <SubTitle>4.1 GPS Problems</SubTitle>
              <List>
                <ListItem>
                  <Strong>No Location Data:</Strong> Enable location services, check GPS signal strength
                </ListItem>
                <ListItem>
                  <Strong>Inaccurate Location:</Strong> Ensure clear view of sky, wait for better GPS signal
                </ListItem>
                <ListItem>
                  <Strong>Location Not Updating:</Strong> Check internet connection, restart GPS service
                </ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>4.2 Route Tracking</SubTitle>
              <List>
                <ListItem>
                  <Strong>Route Not Displaying:</Strong> Refresh the app, check internet connection
                </ListItem>
                <ListItem>
                  <Strong>Wrong Route Shown:</Strong> Verify assigned route with school administrator
                </ListItem>
                <ListItem>
                  <Strong>Missing Stops:</Strong> Sync route data, contact support if persists
                </ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>5. Communication Issues</SectionTitle>
            <SubSection>
              <SubTitle>5.1 Notification Problems</SubTitle>
              <List>
                <ListItem>
                  <Strong>No Notifications:</Strong> Check app notification settings and device permissions
                </ListItem>
                <ListItem>
                  <Strong>Delayed Notifications:</Strong> Verify internet connection and background app refresh settings
                </ListItem>
                <ListItem>
                  <Strong>Wrong Notifications:</Strong> Update notification preferences in app settings
                </ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>5.2 Messaging Issues</SubTitle>
              <List>
                <ListItem>
                  <Strong>Can't Send Messages:</Strong> Check internet connection and message permissions
                </ListItem>
                <ListItem>
                  <Strong>Messages Not Delivered:</Strong> Verify recipient information and try resending
                </ListItem>
                <ListItem>
                  <Strong>Missing Messages:</Strong> Refresh message inbox, check spam filters
                </ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>6. Data Sync Issues</SectionTitle>
            <List>
              <ListItem>
                <Strong>Data Not Syncing:</Strong> Check internet connection, force sync in app settings
              </ListItem>
              <ListItem>
                <Strong>Missing Information:</Strong> Refresh app data, verify data permissions
              </ListItem>
              <ListItem>
                <Strong>Sync Errors:</Strong> Clear app cache, log out and back in
              </ListItem>
              <ListItem>
                <Strong>Duplicate Data:</Strong> Report to support for database cleanup
              </ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. Browser Issues</SectionTitle>
            <List>
              <ListItem>
                <Strong>Page Won't Load:</Strong> Clear browser cache, try different browser
              </ListItem>
              <ListItem>
                <Strong>Features Not Working:</Strong> Enable JavaScript, update browser
              </ListItem>
              <ListItem>
                <Strong>Display Problems:</Strong> Check browser compatibility, zoom settings
              </ListItem>
              <ListItem>
                <Strong>Session Timeouts:</Strong> Check internet connection, browser settings
              </ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>8. Emergency Support</SectionTitle>
            <Text>
              For urgent issues affecting student safety or transportation:
            </Text>
            <List>
              <ListItem>Contact your school's transportation office immediately</ListItem>
              <ListItem>Use the emergency support feature in the app</ListItem>
              <ListItem>Email urgent@stardetect.us for priority support</ListItem>
              <ListItem>Call our emergency support line for immediate assistance</ListItem>
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
              <LinkCard to="/help/route-management">
                Route Management
              </LinkCard>
              <LinkCard to="/help/faq">
                FAQ
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
  margin-bottom: 12px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Strong = styled.strong`
  color: #1a1a1a;
  font-weight: 600;
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

export default Troubleshooting; 