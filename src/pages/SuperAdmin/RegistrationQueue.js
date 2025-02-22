import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const RegistrationQueue = () => {
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'schoolRegistrationQueue'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const registrationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistrations(registrationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (registrationId, newStatus) => {
    try {
      await updateDoc(doc(db, 'schoolRegistrationQueue', registrationId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f1c40f';
      case 'approved':
        return '#2ecc71';
      case 'rejected':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading registrations...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>School Registration Queue</Title>
      
      <QueueContainer>
        <RegistrationList>
          {registrations.map(registration => (
            <RegistrationCard
              key={registration.id}
              onClick={() => setSelectedRegistration(registration)}
              selected={selectedRegistration?.id === registration.id}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <SchoolName>{registration.schoolName}</SchoolName>
              <RegistrationInfo>
                <span>Submitted: {new Date(registration.submittedAt).toLocaleDateString()}</span>
                <StatusBadge color={getStatusColor(registration.status)}>
                  {registration.status.toUpperCase()}
                </StatusBadge>
              </RegistrationInfo>
            </RegistrationCard>
          ))}
        </RegistrationList>

        <AnimatePresence>
          {selectedRegistration && (
            <DetailsPanel
              as={motion.div}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <DetailHeader>
                <h2>{selectedRegistration.schoolName}</h2>
                <CloseButton onClick={() => setSelectedRegistration(null)}>×</CloseButton>
              </DetailHeader>

              <DetailSection>
                <h3>School Information</h3>
                <DetailItem>
                  <strong>Address:</strong> {selectedRegistration.address}
                </DetailItem>
                <DetailItem>
                  <strong>Location:</strong> {selectedRegistration.city}, {selectedRegistration.state} {selectedRegistration.zipCode}
                </DetailItem>
              </DetailSection>

              <DetailSection>
                <h3>Administrator Information</h3>
                <DetailItem>
                  <strong>Name:</strong> {selectedRegistration.adminName}
                </DetailItem>
                <DetailItem>
                  <strong>Email:</strong> {selectedRegistration.adminEmail}
                </DetailItem>
                <DetailItem>
                  <strong>Phone:</strong> {selectedRegistration.adminPhone}
                </DetailItem>
              </DetailSection>

              <DetailSection>
                <h3>Transportation Details</h3>
                <DetailItem>
                  <strong>Expected Students:</strong> {selectedRegistration.expectedStudents}
                </DetailItem>
                <DetailItem>
                  <strong>Number of Buses:</strong> {selectedRegistration.busCount}
                </DetailItem>
              </DetailSection>

              {selectedRegistration.additionalInfo && (
                <DetailSection>
                  <h3>Additional Information</h3>
                  <DetailItem>{selectedRegistration.additionalInfo}</DetailItem>
                </DetailSection>
              )}

              <ActionButtons>
                <ActionButton
                  color="#2ecc71"
                  onClick={() => handleStatusUpdate(selectedRegistration.id, 'approved')}
                  disabled={selectedRegistration.status === 'approved'}
                >
                  Approve
                </ActionButton>
                <ActionButton
                  color="#e74c3c"
                  onClick={() => handleStatusUpdate(selectedRegistration.id, 'rejected')}
                  disabled={selectedRegistration.status === 'rejected'}
                >
                  Reject
                </ActionButton>
              </ActionButtons>
            </DetailsPanel>
          )}
        </AnimatePresence>
      </QueueContainer>
    </Container>
  );
};

const Container = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 40px;
  color: #2c3e50;
`;

const QueueContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  min-height: 600px;
`;

const RegistrationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RegistrationCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#3498db' : 'transparent'};
`;

const SchoolName = styled.h3`
  margin: 0 0 10px 0;
  color: #2c3e50;
`;

const RegistrationInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #7f8c8d;
  font-size: 14px;
`;

const StatusBadge = styled.span`
  background-color: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
`;

const DetailsPanel = styled.div`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 40px;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h2 {
    margin: 0;
    color: #2c3e50;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
  padding: 0;
  
  &:hover {
    color: #7f8c8d;
  }
`;

const DetailSection = styled.div`
  margin-bottom: 25px;

  h3 {
    color: #34495e;
    margin-bottom: 15px;
  }
`;

const DetailItem = styled.p`
  margin: 10px 0;
  color: #7f8c8d;

  strong {
    color: #34495e;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: ${props => props.color};
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.9;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 18px;
  margin-top: 40px;
`;

export default RegistrationQueue; 