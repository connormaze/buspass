import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'PARENT',
    schoolId: '',
    phone: '',
    licenseNumber: '', // For drivers
    grade: '', // For students
    department: '', // For teachers
    // Parent information for students
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
  });

  const [schoolIdVerified, setSchoolIdVerified] = useState(false);
  const [verifyingSchoolId, setVerifyingSchoolId] = useState(false);

  const verifySchoolId = async () => {
    try {
      setVerifyingSchoolId(true);
      // Get the school document directly by ID
      const schoolDoc = doc(db, 'schools', formData.schoolId);
      const schoolSnapshot = await getDoc(schoolDoc);

      if (!schoolSnapshot.exists()) {
        setError('Invalid School ID. Please check with your school administrator.');
        setSchoolIdVerified(false);
      } else {
        setSchoolIdVerified(true);
        setError('');
      }
    } catch (err) {
      console.error('Error verifying school ID:', err);
      setError('Failed to verify school ID');
      setSchoolIdVerified(false);
    } finally {
      setVerifyingSchoolId(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!schoolIdVerified) {
      return setError('Please verify your school ID first');
    }

    try {
      setError('');
      setLoading(true);

      // Create auth account
      const user = await signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.role,
        formData.schoolId,
        formData.phone
      );

      // Create user document
      const userData = {
        uid: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        schoolId: formData.schoolId,
        phone: formData.phone,
        createdAt: new Date(),
        status: 'PENDING'
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      // Create a notification for school admin
      await addDoc(collection(db, 'notifications'), {
        type: 'NEW_USER',
        schoolId: formData.schoolId,
        userId: user.uid,
        createdAt: serverTimestamp(),
        read: false,
        status: 'PENDING',
        userData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          phone: formData.phone
        }
      });

      // Navigate to success page
      navigate('/signup-success');

      // Create role-specific documents
      if (formData.role === 'DRIVER') {
        const driverData = {
          uid: user.uid,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          licenseNumber: formData.licenseNumber,
          schoolId: formData.schoolId,
          isActive: true,
          status: 'AVAILABLE',
          createdAt: new Date(),
          totalTrips: 0,
          rating: 0,
          performanceScore: 100
        };

        await addDoc(collection(db, 'drivers'), driverData);
      } else if (formData.role === 'STUDENT') {
        const studentData = {
          uid: user.uid,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          schoolId: formData.schoolId,
          grade: formData.grade,
          assignedRoute: null,
          attendanceRecord: [],
          createdAt: new Date(),
          status: 'ACTIVE',
          parent: {
            firstName: formData.parentFirstName,
            lastName: formData.parentLastName,
            email: formData.parentEmail,
            phone: formData.parentPhone
          }
        };

        await addDoc(collection(db, 'students'), studentData);
      } else if (formData.role === 'TEACHER') {
        const teacherData = {
          uid: user.uid,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          schoolId: formData.schoolId,
          department: formData.department,
          createdAt: new Date(),
          status: 'ACTIVE'
        };

        await addDoc(collection(db, 'teachers'), teacherData);
      }

      navigate('/verify-email');
    } catch (err) {
      console.error('Error signing up:', err);
      setError('Failed to create account');
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

        <Title>Create Account</Title>
        <Subtitle>Join our transportation platform</Subtitle>

        {error && (
          <ErrorAlert>
            {error}
          </ErrorAlert>
        )}

        <Form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>Account Information</SectionTitle>
            
            <InputGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="Enter your email"
              />
            </InputGroup>

            <InputGroup>
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter your password"
              />
            </InputGroup>

            <InputGroup>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Confirm your password"
              />
            </InputGroup>
          </Section>

          <Section>
            <SectionTitle>Personal Information</SectionTitle>
            
            <Row>
              <InputGroup>
                <Label>First Name</Label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  placeholder="Enter first name"
                />
              </InputGroup>

              <InputGroup>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  placeholder="Enter last name"
                />
              </InputGroup>
            </Row>

            <InputGroup>
              <Label>Role</Label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="PARENT">Parent</option>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="DRIVER">Bus Driver</option>
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required={formData.role !== 'STUDENT'}
                placeholder={formData.role === 'STUDENT' ? "Enter phone number (optional)" : "Enter phone number"}
              />
            </InputGroup>

            <InputGroup>
              <Label>School ID</Label>
              <Row>
                <Input
                  type="text"
                  value={formData.schoolId}
                  onChange={(e) => {
                    setFormData({ ...formData, schoolId: e.target.value });
                    setSchoolIdVerified(false);
                  }}
                  required
                  placeholder="Enter school ID"
                  style={{ flex: 1 }}
                />
                <VerifyButton
                  type="button"
                  onClick={verifySchoolId}
                  disabled={!formData.schoolId || verifyingSchoolId}
                >
                  {verifyingSchoolId ? 'Verifying...' : 'Verify ID'}
                </VerifyButton>
              </Row>
              {schoolIdVerified && (
                <VerifiedBadge>✓ School ID Verified</VerifiedBadge>
              )}
            </InputGroup>

            {formData.role === 'DRIVER' && (
              <InputGroup>
                <Label>Driver's License Number</Label>
                <Input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  required
                  placeholder="Enter license number"
                />
              </InputGroup>
            )}

            {formData.role === 'STUDENT' && (
              <>
                <InputGroup>
                  <Label>Grade</Label>
                  <Select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="K">Kindergarten</option>
                    <option value="1">1st Grade</option>
                    <option value="2">2nd Grade</option>
                    <option value="3">3rd Grade</option>
                    <option value="4">4th Grade</option>
                    <option value="5">5th Grade</option>
                    <option value="6">6th Grade</option>
                    <option value="7">7th Grade</option>
                    <option value="8">8th Grade</option>
                    <option value="9">9th Grade</option>
                    <option value="10">10th Grade</option>
                    <option value="11">11th Grade</option>
                    <option value="12">12th Grade</option>
                  </Select>
                </InputGroup>

                <Section>
                  <SectionTitle>Parent Information</SectionTitle>
                  <Row>
                    <InputGroup>
                      <Label>Parent First Name</Label>
                      <Input
                        type="text"
                        value={formData.parentFirstName}
                        onChange={(e) => setFormData({ ...formData, parentFirstName: e.target.value })}
                        required
                        placeholder="Enter parent's first name"
                      />
                    </InputGroup>

                    <InputGroup>
                      <Label>Parent Last Name</Label>
                      <Input
                        type="text"
                        value={formData.parentLastName}
                        onChange={(e) => setFormData({ ...formData, parentLastName: e.target.value })}
                        required
                        placeholder="Enter parent's last name"
                      />
                    </InputGroup>
                  </Row>

                  <InputGroup>
                    <Label>Parent Email</Label>
                    <Input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      required
                      placeholder="Enter parent's email"
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label>Parent Phone Number</Label>
                    <Input
                      type="tel"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      required
                      placeholder="Enter parent's phone number"
                    />
                  </InputGroup>
                </Section>
              </>
            )}

            {formData.role === 'TEACHER' && (
              <InputGroup>
                <Label>Department</Label>
                <Input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                  placeholder="Enter department (e.g., Math, Science)"
                />
              </InputGroup>
            )}
          </Section>

          <SubmitButton
            type="submit"
            disabled={loading}
            as={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </SubmitButton>
        </Form>

        <Footer>
          <Text>Already have an account?</Text>
          <StyledLink to="/login">Sign in</StyledLink>
        </Footer>
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
  max-width: 600px;
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

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e1e1e1;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: white;

  &:focus {
    outline: none;
    border-color: #3498db;
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

const Footer = styled.div`
  margin-top: 30px;
  text-align: center;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Text = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const StyledLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  margin-left: 5px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const VerifyButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #2980b9;
  }
`;

const VerifiedBadge = styled.div`
  color: #2ecc71;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
`; 