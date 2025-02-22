import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const FAQ = () => {
  return (
    <>
      <Header />
      <Container>
        <Content>
          <Title>Frequently Asked Questions</Title>
          <LastUpdated>Last Updated: May 2024</LastUpdated>

          <Section>
            <SectionTitle>General Questions</SectionTitle>
            <FAQItem>
              <Question>What is Buspass?</Question>
              <Answer>
                Buspass is a comprehensive school transportation management system that helps schools, parents, and bus drivers coordinate student transportation safely and efficiently.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>How do I get started with Buspass?</Question>
              <Answer>
                To get started, create an account by selecting your role (school administrator, parent, or bus driver) and following the registration process. Visit our Getting Started guide for detailed instructions.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>Is Buspass available on mobile devices?</Question>
              <Answer>
                Yes, Buspass is available as a mobile app for both iOS and Android devices. You can download it from the App Store or Google Play Store.
              </Answer>
            </FAQItem>
          </Section>

          <Section>
            <SectionTitle>Parent Questions</SectionTitle>
            <FAQItem>
              <Question>How do I track my child's bus?</Question>
              <Answer>
                Once logged in to your parent account, you can view real-time bus location, estimated arrival times, and receive notifications about your child's transportation status.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>Can I set up multiple pickup/drop-off locations?</Question>
              <Answer>
                Yes, you can configure multiple addresses and create different schedules for different days of the week through your parent dashboard.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>How do I report my child's absence?</Question>
              <Answer>
                You can report absences through the mobile app or web dashboard by selecting the dates and providing a reason. The school and bus driver will be automatically notified.
              </Answer>
            </FAQItem>
          </Section>

          <Section>
            <SectionTitle>School Administrator Questions</SectionTitle>
            <FAQItem>
              <Question>How do I set up bus routes?</Question>
              <Answer>
                Use the route management tool in your administrator dashboard to create and optimize routes. You can import student addresses, set stop locations, and assign drivers.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>Can I generate transportation reports?</Question>
              <Answer>
                Yes, you can generate various reports including attendance, route efficiency, and safety incidents through the reporting section of your dashboard.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>How do I manage driver assignments?</Question>
              <Answer>
                The driver management section allows you to assign drivers to routes, track certifications, and manage substitute drivers when needed.
              </Answer>
            </FAQItem>
          </Section>

          <Section>
            <SectionTitle>Technical Questions</SectionTitle>
            <FAQItem>
              <Question>What happens if the app isn't working?</Question>
              <Answer>
                Check our troubleshooting guide for common issues and solutions. If problems persist, contact our support team at buspass@stardetect.us.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>Is my data secure?</Question>
              <Answer>
                Yes, we use industry-standard encryption and security measures to protect all user data. We are fully compliant with FERPA and other relevant regulations.
              </Answer>
            </FAQItem>

            <FAQItem>
              <Question>Can I export my data?</Question>
              <Answer>
                Yes, you can export various types of data including route information, student records, and reports in multiple formats (CSV, PDF, etc.).
              </Answer>
            </FAQItem>
          </Section>

          <HelpfulLinks>
            <SectionTitle>Related Resources</SectionTitle>
            <LinkGrid>
              <LinkCard to="/help/getting-started">
                Getting Started
              </LinkCard>
              <LinkCard to="/help/troubleshooting">
                Troubleshooting
              </LinkCard>
              <LinkCard to="/help/mobile-app">
                Mobile App Guide
              </LinkCard>
              <LinkCard to="/help/safety-features">
                Safety Features
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

const FAQItem = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const Question = styled.h3`
  font-size: 1.2rem;
  color: #1a1a1a;
  margin-bottom: 10px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Answer = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
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

export default FAQ; 