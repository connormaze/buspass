import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { EmergencyContactService } from '../services/EmergencyContactService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const emergencyContactService = new EmergencyContactService();

export default function TeacherStudentContacts() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentContacts, setStudentContacts] = useState({});

  useEffect(() => {
    loadAssignedStudents();
  }, [currentUser]);

  const loadAssignedStudents = async () => {
    try {
      setLoading(true);
      // Query students where the current teacher is assigned
      const studentsQuery = query(
        collection(db, 'users'),
        where('teacherIds', 'array-contains', currentUser.uid),
        where('type', '==', 'student')
      );
      
      const snapshot = await getDocs(studentsQuery);
      const studentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStudents(studentsList);
      
      // Load emergency contacts for each student
      const contactsPromises = studentsList.map(async student => {
        const contacts = await emergencyContactService.getStudentEmergencyContacts(student.id);
        return { studentId: student.id, contacts };
      });

      const contactsResults = await Promise.all(contactsPromises);
      const contactsMap = {};
      contactsResults.forEach(result => {
        contactsMap[result.studentId] = result.contacts;
      });

      setStudentContacts(contactsMap);
      setError(null);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load student information');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.studentId?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        My Students' Emergency Contacts
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search students..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {filteredStudents.map(student => (
        <Accordion key={student.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              {student.firstName} {student.lastName} - {student.studentId || 'No ID'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {studentContacts[student.id]?.length > 0 ? (
              studentContacts[student.id].map(contact => (
                <Card key={contact.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {contact.name} - {contact.relationship}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {contact.phone}
                    </Typography>
                    {contact.email && (
                      <Typography variant="body2" color="text.secondary">
                        Email: {contact.email}
                      </Typography>
                    )}
                    {contact.address && (
                      <Typography variant="body2" color="text.secondary">
                        Address: {contact.address}
                      </Typography>
                    )}
                    {contact.notes && (
                      <Typography variant="body2" color="text.secondary">
                        Notes: {contact.notes}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography color="text.secondary">
                No emergency contacts found for this student
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {filteredStudents.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
          No students found
        </Typography>
      )}
    </Box>
  );
} 