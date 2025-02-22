import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Privacy = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Privacy Policy</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Introduction</SectionTitle>
            <Text>
              StarDetect ("we," "our," or "us") operates the Buspass application (the "Service"). This Privacy Policy outlines our practices regarding the collection, use, storage, and protection of your information. We are committed to safeguarding the privacy of all users, with particular attention to protecting student data in compliance with all applicable laws and regulations.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. Information Collection</SectionTitle>
            <SubSection>
              <SubTitle>2.1 Student Information</SubTitle>
              <Text>
                We collect and process information about students, including those under 13 years of age, with explicit school and/or parental authorization in compliance with FERPA and COPPA regulations. This includes:
              </Text>
              <List>
                <ListItem>Full name and student ID</ListItem>
                <ListItem>Grade level and classroom assignment</ListItem>
                <ListItem>Transportation requirements and preferences</ListItem>
                <ListItem>Pick-up and drop-off location data</ListItem>
                <ListItem>Emergency contact information</ListItem>
                <ListItem>Special needs or requirements related to transportation</ListItem>
                <ListItem>Attendance and transportation history</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.2 Parent/Guardian Information</SubTitle>
              <List>
                <ListItem>Full name and contact information</ListItem>
                <ListItem>Relationship to student(s)</ListItem>
                <ListItem>Account credentials and authentication data</ListItem>
                <ListItem>Communication preferences and history</ListItem>
                <ListItem>Pick-up authorization details</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.3 School and Administrative Data</SubTitle>
              <List>
                <ListItem>School administrator and staff contact information</ListItem>
                <ListItem>Bus driver information including credentials and certifications</ListItem>
                <ListItem>Route planning and scheduling data</ListItem>
                <ListItem>School transportation policies and procedures</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>2.4 Technical and Usage Data</SubTitle>
              <List>
                <ListItem>Device identifiers and technical specifications</ListItem>
                <ListItem>IP addresses and network information</ListItem>
                <ListItem>GPS and location tracking data (for bus drivers only)</ListItem>
                <ListItem>App usage statistics and interaction data</ListItem>
                <ListItem>Performance metrics and error logs</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>3. Legal Basis for Processing</SectionTitle>
            <Text>
              We process personal data under the following legal bases:
            </Text>
            <List>
              <ListItem>Contractual necessity for providing our transportation management services</ListItem>
              <ListItem>Legal obligations under education and child protection laws</ListItem>
              <ListItem>Legitimate interests in improving and securing our services</ListItem>
              <ListItem>Consent, where specifically required by law</ListItem>
              <ListItem>Protection of vital interests, particularly regarding student safety</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>4. Data Processing of Minors</SectionTitle>
            <Text>
              We collect and process data from students under 13 years of age under the following conditions:
            </Text>
            <List>
              <ListItem>With explicit school authorization as an authorized educational institution service provider</ListItem>
              <ListItem>Under direct parental consent when required</ListItem>
              <ListItem>In compliance with COPPA requirements for educational technology providers</ListItem>
              <ListItem>Following FERPA guidelines for handling educational records</ListItem>
            </List>
            <Text>
              Schools may act as agents for parents in providing consent for the collection of students' personal information in the educational context.
            </Text>
          </Section>

          <Section>
            <SectionTitle>5. Data Usage and Processing</SectionTitle>
            <SubSection>
              <SubTitle>5.1 Core Service Functions</SubTitle>
              <List>
                <ListItem>Real-time bus tracking and route optimization</ListItem>
                <ListItem>Student attendance and transportation management</ListItem>
                <ListItem>Safety and emergency notification systems</ListItem>
                <ListItem>Communication between schools, parents, and drivers</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>5.2 Service Improvement</SubTitle>
              <List>
                <ListItem>Analysis of usage patterns and service performance</ListItem>
                <ListItem>Technical issue identification and resolution</ListItem>
                <ListItem>Feature development and optimization</ListItem>
                <ListItem>Safety and security enhancements</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>6. Data Protection Measures</SectionTitle>
            <Text>
              We implement comprehensive security measures including:
            </Text>
            <List>
              <ListItem>End-to-end encryption for data transmission</ListItem>
              <ListItem>Multi-factor authentication for account access</ListItem>
              <ListItem>Regular security audits and penetration testing</ListItem>
              <ListItem>Access controls and user permission management</ListItem>
              <ListItem>Data backup and disaster recovery protocols</ListItem>
              <ListItem>Employee training on data protection and privacy</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. Data Sharing and Third Parties</SectionTitle>
            <Text>
              We may share data with:
            </Text>
            <List>
              <ListItem>School districts and authorized educational institutions</ListItem>
              <ListItem>Emergency services when required for student safety</ListItem>
              <ListItem>Technology service providers under strict data protection agreements</ListItem>
              <ListItem>Legal authorities when required by law</ListItem>
            </List>
            <Text>
              All third-party service providers are contractually bound to protect data privacy and comply with relevant regulations.
            </Text>
          </Section>

          <Section>
            <SectionTitle>8. Data Retention and Deletion</SectionTitle>
            <Text>
              Our retention policies include:
            </Text>
            <List>
              <ListItem>Active student data maintained throughout school enrollment</ListItem>
              <ListItem>Transportation records kept according to state education requirements</ListItem>
              <ListItem>Inactive accounts archived for legal compliance periods</ListItem>
              <ListItem>Technical logs retained for security and performance monitoring</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>9. User Rights and Controls</SectionTitle>
            <Text>
              Users have the right to:
            </Text>
            <List>
              <ListItem>Access their personal data and request copies</ListItem>
              <ListItem>Correct inaccurate or incomplete information</ListItem>
              <ListItem>Request deletion of personal data (subject to legal requirements)</ListItem>
              <ListItem>Opt-out of certain data processing activities</ListItem>
              <ListItem>Receive data in a portable format</ListItem>
              <ListItem>Lodge complaints with relevant authorities</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>10. International Data Transfers</SectionTitle>
            <Text>
              When we transfer data internationally, we ensure:
            </Text>
            <List>
              <ListItem>Compliance with cross-border data transfer regulations</ListItem>
              <ListItem>Implementation of appropriate safeguards</ListItem>
              <ListItem>Data processing agreements with international partners</ListItem>
              <ListItem>Transparency about data storage locations</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>11. Changes to Privacy Policy</SectionTitle>
            <Text>
              We may update this Privacy Policy periodically. Users will be notified of significant changes through:
            </Text>
            <List>
              <ListItem>In-app notifications</ListItem>
              <ListItem>Email communications</ListItem>
              <ListItem>Website announcements</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>12. Contact Information</SectionTitle>
            <Text>
              For privacy-related inquiries, please contact us at:
            </Text>
            <ContactInfo>
              <div>Email: privacy@stardetect.us</div>
            </ContactInfo>
          </Section>
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

const ContactInfo = styled.div`
  margin-top: 15px;
  line-height: 1.6;
  color: #333;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

export default Privacy; 