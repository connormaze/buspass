import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolName: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.message.trim()) return 'Message is required';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'contactInquiries'), {
        ...formData,
        timestamp: new Date(),
        status: 'new'
      });
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        schoolName: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Container>
        <HeroSection>
          <HeroContent>
            <Title>Contact Us</Title>
            <Subtitle>Get in touch with our team</Subtitle>
          </HeroContent>
        </HeroSection>

        <Section>
          <ContentWrapper>
            <ContactGrid>
              <ContactInfo>
                <InfoTitle>Let's Talk</InfoTitle>
                <InfoText>
                  Have questions about Buspass? We're here to help! Fill out the form
                  and we'll get back to you as soon as possible.
                </InfoText>

                <ContactDetails>
                  <ContactItem>
                    <ContactIcon>✉️</ContactIcon>
                    <div>
                      <ContactLabel>Email</ContactLabel>
                      <ContactValue>buspass@stardetect.us</ContactValue>
                    </div>
                  </ContactItem>
                </ContactDetails>
              </ContactInfo>

              <ContactForm onSubmit={handleSubmit}>
                {submitSuccess ? (
                  <SuccessMessage>
                    Thank you for contacting us! We'll get back to you soon.
                  </SuccessMessage>
                ) : (
                  <>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <FormGroup>
                      <Label>Name *</Label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Optional"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>School Name</Label>
                      <Input
                        type="text"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        placeholder="Optional"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Message *</Label>
                      <TextArea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="5"
                      />
                    </FormGroup>

                    <SubmitButton
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </SubmitButton>
                  </>
                )}
              </ContactForm>
            </ContactGrid>
          </ContentWrapper>
        </Section>
      </Container>
      <Footer />
    </>
  );
};

const Container = styled.div`
  width: 100%;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  color: white;
  padding: 120px 20px 80px;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Section = styled.section`
  padding: 80px 20px;
  background-color: #ffffff;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 60px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ContactInfo = styled.div`
  padding: 40px;
  background: #1a1a1a;
  border-radius: 15px;
  color: white;
`;

const InfoTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const InfoText = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 40px;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ContactDetails = styled.div`
  margin-bottom: 40px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
`;

const ContactIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 15px;
  margin-top: 5px;
`;

const ContactLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ContactValue = styled.div`
  font-size: 1.1rem;
  color: white;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ContactForm = styled.form`
  padding: 40px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 15px;
  background: linear-gradient(120deg, #3498db, #2ecc71);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #2ecc71;
  font-weight: 500;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background-color: #fdeaea;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

export default Contact; 