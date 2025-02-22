import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Terms = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Terms of Service</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>1. Agreement to Terms</SectionTitle>
            <Text>
              By accessing or using the Buspass application ("Service") provided by StarDetect ("we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not access or use the Service.
            </Text>
          </Section>

          <Section>
            <SectionTitle>2. Service Description and Scope</SectionTitle>
            <Text>
              Buspass is an educational technology platform that provides:
            </Text>
            <List>
              <ListItem>Real-time school bus tracking and monitoring systems</ListItem>
              <ListItem>Student transportation management tools</ListItem>
              <ListItem>Communication infrastructure between schools, parents, and bus drivers</ListItem>
              <ListItem>Route optimization and attendance management</ListItem>
              <ListItem>Safety and emergency notification systems</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>3. User Registration and Account Security</SectionTitle>
            <SubSection>
              <SubTitle>3.1 Account Creation</SubTitle>
              <Text>
                You must register for an account to access the Service. You agree to:
              </Text>
              <List>
                <ListItem>Provide accurate and complete registration information</ListItem>
                <ListItem>Maintain the security of your account credentials</ListItem>
                <ListItem>Promptly update any changes to your information</ListItem>
                <ListItem>Accept responsibility for all activities under your account</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>3.2 Account Types and Authorization</SubTitle>
              <Text>
                Access levels and permissions are based on user roles:
              </Text>
              <List>
                <ListItem>School Administrators: Full access to school-specific data and management tools</ListItem>
                <ListItem>Teachers: Access to classroom and student transportation information</ListItem>
                <ListItem>Bus Drivers: Access to route information and real-time tracking tools</ListItem>
                <ListItem>Parents/Guardians: Access to their children's transportation information</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>4. Data Collection and Privacy</SectionTitle>
            <Text>
              4.1. We collect and process data, including information about students under 13, in accordance with:
            </Text>
            <List>
              <ListItem>The Family Educational Rights and Privacy Act (FERPA)</ListItem>
              <ListItem>The Children's Online Privacy Protection Act (COPPA)</ListItem>
              <ListItem>State and federal education privacy laws</ListItem>
              <ListItem>Our Privacy Policy</ListItem>
            </List>
            <Text>
              4.2. Schools may provide consent for data collection on behalf of parents for educational purposes.
            </Text>
          </Section>

          <Section>
            <SectionTitle>5. User Responsibilities and Obligations</SectionTitle>
            <SubSection>
              <SubTitle>5.1 School Administrators must:</SubTitle>
              <List>
                <ListItem>Verify the identity and authorization of all users</ListItem>
                <ListItem>Maintain accurate student and transportation records</ListItem>
                <ListItem>Implement appropriate data access controls</ListItem>
                <ListItem>Ensure compliance with educational regulations</ListItem>
                <ListItem>Provide necessary training to staff members</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>5.2 Bus Drivers must:</SubTitle>
              <List>
                <ListItem>Maintain required licenses and certifications</ListItem>
                <ListItem>Use the Service only when safely parked</ListItem>
                <ListItem>Follow designated routes and schedules</ListItem>
                <ListItem>Report safety concerns immediately</ListItem>
                <ListItem>Maintain student confidentiality</ListItem>
              </List>
            </SubSection>

            <SubSection>
              <SubTitle>5.3 Parents/Guardians must:</SubTitle>
              <List>
                <ListItem>Provide accurate student and contact information</ListItem>
                <ListItem>Update pickup/drop-off preferences promptly</ListItem>
                <ListItem>Notify schools of changes in transportation needs</ListItem>
                <ListItem>Maintain confidentiality of access credentials</ListItem>
              </List>
            </SubSection>
          </Section>

          <Section>
            <SectionTitle>6. Safety and Security Requirements</SectionTitle>
            <Text>
              All users must adhere to these safety protocols:
            </Text>
            <List>
              <ListItem>Never share account credentials</ListItem>
              <ListItem>Report suspicious activities immediately</ListItem>
              <ListItem>Follow established safety procedures</ListItem>
              <ListItem>Maintain student data confidentiality</ListItem>
              <ListItem>Use secure networks for accessing the Service</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. Prohibited Activities</SectionTitle>
            <Text>
              Users are strictly prohibited from:
            </Text>
            <List>
              <ListItem>Sharing access with unauthorized users</ListItem>
              <ListItem>Attempting to breach system security</ListItem>
              <ListItem>Uploading malicious content</ListItem>
              <ListItem>Interfering with Service operations</ListItem>
              <ListItem>Using the Service for non-educational purposes</ListItem>
              <ListItem>Violating any applicable laws or regulations</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>8. Intellectual Property Rights</SectionTitle>
            <Text>
              8.1. The Service and all content, features, and functionality are owned by StarDetect and are protected by:
            </Text>
            <List>
              <ListItem>International copyright laws</ListItem>
              <ListItem>Trademark laws</ListItem>
              <ListItem>Patent laws</ListItem>
              <ListItem>Trade secret laws</ListItem>
            </List>
            <Text>
              8.2. Users may not copy, modify, distribute, or create derivative works without our explicit permission.
            </Text>
          </Section>

          <Section>
            <SectionTitle>9. Service Availability and Support</SectionTitle>
            <Text>
              9.1. While we strive for maximum uptime:
            </Text>
            <List>
              <ListItem>We do not guarantee 100% Service availability</ListItem>
              <ListItem>Maintenance windows may affect accessibility</ListItem>
              <ListItem>Force majeure events may impact service delivery</ListItem>
            </List>
            <Text>
              9.2. Technical support is available during business hours through designated channels.
            </Text>
          </Section>

          <Section>
            <SectionTitle>10. Liability and Indemnification</SectionTitle>
            <Text>
              10.1. Limitation of Liability:
            </Text>
            <List>
              <ListItem>We are not liable for indirect or consequential damages</ListItem>
              <ListItem>Real-time tracking accuracy cannot be guaranteed</ListItem>
              <ListItem>Service interruptions may occur</ListItem>
              <ListItem>User-provided information accuracy is not guaranteed</ListItem>
            </List>
            <Text>
              10.2. Users agree to indemnify and hold StarDetect harmless from claims arising from:
            </Text>
            <List>
              <ListItem>Violation of these Terms</ListItem>
              <ListItem>Misuse of the Service</ListItem>
              <ListItem>Violation of third-party rights</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>11. Term and Termination</SectionTitle>
            <Text>
              11.1. We reserve the right to:
            </Text>
            <List>
              <ListItem>Suspend or terminate accounts for violations</ListItem>
              <ListItem>Modify or discontinue the Service with notice</ListItem>
              <ListItem>Remove content that violates these Terms</ListItem>
            </List>
            <Text>
              11.2. Upon termination:
            </Text>
            <List>
              <ListItem>Access rights cease immediately</ListItem>
              <ListItem>Data retention policies continue to apply</ListItem>
              <ListItem>Certain Terms survive termination</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>12. Changes to Terms</SectionTitle>
            <Text>
              We may modify these Terms at any time. Users will be notified of significant changes through:
            </Text>
            <List>
              <ListItem>Email notifications</ListItem>
              <ListItem>In-app announcements</ListItem>
              <ListItem>Website updates</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>13. Governing Law</SectionTitle>
            <Text>
              These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles.
            </Text>
          </Section>

          <Section>
            <SectionTitle>14. Contact Information</SectionTitle>
            <Text>
              For questions about these Terms, please contact us at:
            </Text>
            <ContactInfo>
              <div>Email: legal@stardetect.us</div>
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

export default Terms; 