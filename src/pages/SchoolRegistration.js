import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function SchoolRegistration() {
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    district: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    studentCount: '',
    busCount: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create school document
      const schoolData = {
        ...formData,
        status: 'pending',
        createdAt: new Date(),
        createdBy: currentUser ? currentUser.uid : null,
      };

      await addDoc(collection(db, 'schools'), schoolData);
      navigate('/registration-success');
    } catch (err) {
      setError('Failed to register school. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <AuthCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoSection>
          <LogoText>Buspass</LogoText>
          <CompanyText>School TMS</CompanyText>
        </LogoSection>

        <Title>Register Your School</Title>
        <Subtitle>Join our school transportation platform</Subtitle>

        {error && (
          <ErrorAlert>
            {error}
          </ErrorAlert>
        )}

        <Form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>School Information</SectionTitle>
            
            <InputGroup>
              <Label>School Name</Label>
              <Input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                required
                placeholder="Enter school name"
              />
            </InputGroup>

            <InputGroup>
              <Label>Address</Label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter school address"
              />
            </InputGroup>

            <Row>
              <InputGroup>
                <Label>City</Label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Enter city"
                />
              </InputGroup>

              <InputGroup>
                <Label>State</Label>
                <Input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="Enter state"
                />
              </InputGroup>

              <InputGroup>
                <Label>ZIP Code</Label>
                <Input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  placeholder="Enter ZIP code"
                />
              </InputGroup>
            </Row>

            <InputGroup>
              <Label>School District</Label>
              <Input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                placeholder="Enter school district"
              />
            </InputGroup>
          </Section>

          <Section>
            <SectionTitle>Administrator Information</SectionTitle>
            
            <Row>
              <InputGroup>
                <Label>First Name</Label>
                <Input
                  type="text"
                  name="adminFirstName"
                  value={formData.adminFirstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                />
              </InputGroup>

              <InputGroup>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  name="adminLastName"
                  value={formData.adminLastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                />
              </InputGroup>
            </Row>

            <Row>
              <InputGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  placeholder="Enter email"
                />
              </InputGroup>

              <InputGroup>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </InputGroup>
            </Row>
          </Section>

          <Section>
            <SectionTitle>School Details</SectionTitle>
            
            <Row>
              <InputGroup>
                <Label>Number of Students</Label>
                <Input
                  type="number"
                  name="studentCount"
                  value={formData.studentCount}
                  onChange={handleChange}
                  required
                  placeholder="Enter student count"
                />
              </InputGroup>

              <InputGroup>
                <Label>Number of Buses</Label>
                <Input
                  type="number"
                  name="busCount"
                  value={formData.busCount}
                  onChange={handleChange}
                  required
                  placeholder="Enter bus count"
                />
              </InputGroup>
            </Row>
          </Section>

          <SubmitButton
            type="submit"
            disabled={loading}
            as={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Submitting...' : 'Register School'}
          </SubmitButton>
        </Form>
      </AuthCard>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AuthCard = styled(motion.div)`
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const LogoText = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #3498db;
  margin: 0;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CompanyText = styled.div`
  font-size: 1rem;
  color: #666;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #1a1a1a;
  margin: 0 0 10px 0;
  text-align: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 30px 0;
  text-align: center;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 600;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #1a1a1a;
  font-weight: 500;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e1e1;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &::placeholder {
    color: #999;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(120deg, #3498db, #2ecc71);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
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

const ErrorAlert = styled.div`
  background: #fee2e2;
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`; 