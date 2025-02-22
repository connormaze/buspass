import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Divider,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Message as MessageIcon,
  Send as SendIcon,
  DirectionsBus as BusIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { collection, query, where, orderBy, addDoc, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const RECIPIENT_TYPES = {
  SCHOOL_ADMIN: 'School Admin',
  BUS_DRIVER: 'Bus Driver',
  TEACHER: 'Teacher',
};

export default function Communication() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipientType, setSelectedRecipientType] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchStudents();
  }, [currentUser.uid]);

  useEffect(() => {
    if (selectedRecipientType) {
      fetchRecipients(selectedRecipientType);
    }
  }, [selectedRecipientType, students]);

  const fetchStudents = async () => {
    try {
      // First try by parentUid
      const studentsQueryByUid = query(
        collection(db, 'users'),
        where('parentUid', '==', currentUser.uid),
        where('role', '==', 'STUDENT')
      );

      // Then try by parent email
      const studentsQueryByEmail = query(
        collection(db, 'users'),
        where('parentEmail', '==', currentUser.email),
        where('role', '==', 'STUDENT')
      );

      const [snapshotByUid, snapshotByEmail] = await Promise.all([
        getDocs(studentsQueryByUid),
        getDocs(studentsQueryByEmail)
      ]);

      // Combine results, removing duplicates by student ID
      const studentDocs = new Map();
      [...snapshotByUid.docs, ...snapshotByEmail.docs].forEach(doc => {
        if (!studentDocs.has(doc.id)) {
          studentDocs.set(doc.id, doc);
        }
      });

      const studentsList = await Promise.all(
        Array.from(studentDocs.values()).map(async doc => {
          const student = { id: doc.id, ...doc.data() };
          const transportInfo = await getStudentTransportInfo(doc.id);
          
          // Fetch teacher information
          const teacherIds = new Set([
            ...(student.teacherIds || []),
            ...(student.assignedTeachers || [])
          ]);
          
          let teacherInfo = [];
          if (teacherIds.size > 0) {
            const teachersQuery = query(
              collection(db, 'users'),
              where('role', '==', 'TEACHER'),
              where('status', '==', 'approved'),
              where('id', 'in', Array.from(teacherIds))
            );
            const teachersSnapshot = await getDocs(teachersQuery);
            teacherInfo = teachersSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          }
          
          return { ...student, transportInfo, teacherInfo };
        })
      );

      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    }
  };

  const getStudentTransportInfo = async (studentId) => {
    try {
      const transportDoc = await getDoc(doc(db, 'transportationInfo', studentId));
      return transportDoc.exists() ? transportDoc.data() : null;
    } catch (err) {
      console.error('Error fetching transport info:', err);
      return null;
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const messagesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Mark messages as read
      const unreadMessages = messagesList.filter(
        msg => !msg.readBy?.includes(currentUser.uid)
      );
      
      await Promise.all(
        unreadMessages.map(msg =>
          updateDoc(doc(db, 'messages', msg.id), {
            readBy: [...(msg.readBy || []), currentUser.uid]
          })
        )
      );

      setMessages(messagesList);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async (recipientType) => {
    try {
      setRecipients([]);
      
      if (recipientType === 'SCHOOL_ADMIN') {
        // Fetch school admins for the current school
        const schoolAdminsQuery = query(
          collection(db, 'users'),
          where('schoolId', '==', currentUser.schoolId),
          where('role', '==', 'SCHOOLADMIN'),
          where('status', '==', 'approved')
        );
        const schoolAdminsSnapshot = await getDocs(schoolAdminsQuery);
        const adminsList = schoolAdminsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipients(adminsList);
        
      } else if (recipientType === 'BUS_DRIVER') {
        // First get all bus routes assigned to the parent's children
        const busStudents = students.filter(s => s.transportInfo?.method === 'BUS');
        const routeIds = busStudents
          .map(s => s.transportInfo?.routeInfo?.routeId)
          .filter(id => id); // Filter out undefined/null

        if (routeIds.length === 0) {
          setError('No bus routes assigned to your children yet');
          return;
        }

        // Fetch drivers assigned to these routes
        const driversQuery = query(
          collection(db, 'users'),
          where('role', '==', 'BUSDRIVER'),
          where('status', '==', 'approved'),
          where('assignedRoutes', 'array-contains-any', routeIds)
        );
        const driversSnapshot = await getDocs(driversQuery);
        const driversList = driversSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (driversList.length === 0) {
          setError('No bus drivers assigned to your routes yet');
        }
        setRecipients(driversList);
        
      } else if (recipientType === 'TEACHER') {
        // Get all teacher IDs from students
        const teacherIds = new Set();
        students.forEach(student => {
          if (student.teacherIds) {
            student.teacherIds.forEach(id => teacherIds.add(id));
          }
          // Also check legacy field
          if (student.assignedTeachers) {
            student.assignedTeachers.forEach(id => teacherIds.add(id));
          }
        });

        const uniqueTeacherIds = Array.from(teacherIds);

        if (uniqueTeacherIds.length === 0) {
          setError('No teachers assigned to your children yet');
          return;
        }

        // Fetch teachers' details
        const teachersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'TEACHER'),
          where('status', '==', 'approved'),
          where('id', 'in', uniqueTeacherIds)
        );
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersList = teachersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (teachersList.length === 0) {
          setError('No teachers found for your children');
        }
        setRecipients(teachersList);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
      setError('Failed to load recipients');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRecipient) {
      setError('Please select a recipient and enter a message');
      return;
    }

    try {
      const recipient = recipients.find(r => r.id === selectedRecipient);
      if (!recipient) {
        setError('Invalid recipient selected');
        return;
      }

      await addDoc(collection(db, 'messages'), {
        content: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        recipientId: recipient.id,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        recipientType: selectedRecipientType,
        participants: [currentUser.uid, recipient.id],
        readBy: [currentUser.uid],
        createdAt: new Date(),
      });
      
      setNewMessage('');
      setError('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const getAvatarIcon = (recipientType) => {
    if (recipientType === 'BUS_DRIVER') return <BusIcon />;
    if (recipientType === 'SCHOOL_ADMIN') return <SchoolIcon />;
    if (recipientType === 'TEACHER') return <PersonIcon />;
    return <MessageIcon />;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Messages
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Recipient Type</InputLabel>
              <Select
                value={selectedRecipientType}
                onChange={(e) => {
                  setSelectedRecipientType(e.target.value);
                  setSelectedRecipient('');
                }}
                label="Recipient Type"
              >
                {Object.entries(RECIPIENT_TYPES).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedRecipientType && (
              <FormControl fullWidth>
                <InputLabel>Select Recipient</InputLabel>
                <Select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  label="Select Recipient"
                >
                  {recipients.map((recipient) => (
                    <MenuItem key={recipient.id} value={recipient.id}>
                      {`${recipient.firstName} ${recipient.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              multiline
              rows={3}
              error={!!error}
              helperText={error}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={!selectedRecipient || !newMessage.trim()}
              sx={{ alignSelf: 'flex-end' }}
            >
              <SendIcon sx={{ mr: 1 }} />
              Send
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              alignItems="flex-start"
              sx={{
                bgcolor: message.senderId === currentUser.uid ? 'action.hover' : 'inherit',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemAvatar>
                <Badge
                  color="primary"
                  variant="dot"
                  invisible={message.readBy?.includes(currentUser.uid)}
                >
                  <Avatar>
                    {getAvatarIcon(message.recipientType)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    component="div"
                    variant="subtitle2"
                    color="text.secondary"
                  >
                    {message.senderId === currentUser.uid ? 
                      `To: ${message.recipientName}` : 
                      `From: ${message.senderName}`} •{' '}
                    {new Date(message.createdAt.toDate()).toLocaleString()}
                  </Typography>
                }
                secondary={message.content}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
} 