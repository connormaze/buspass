import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Divider,
  IconButton,
  Badge,
  Grid,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  DirectionsBus as BusIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function ParentMessages() {
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);

  // Fetch teachers assigned to the parent's students
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        console.log('Fetching teachers for parent:', currentUser.uid);
        
        // First get all students for this parent
        const studentsQuery = query(
          collection(db, 'users'),
          where('parentUid', '==', currentUser.uid),
          where('role', '==', 'STUDENT')
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const students = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('Found students:', students);

        // Then get all teachers assigned to these students
        const teacherIds = new Set();
        students.forEach(student => {
          if (student.teacherIds) {
            student.teacherIds.forEach(id => teacherIds.add(id));
          }
          // Also check assignedTeachers array
          if (student.assignedTeachers) {
            student.assignedTeachers.forEach(id => teacherIds.add(id));
          }
        });

        console.log('Teacher IDs found:', Array.from(teacherIds));

        if (teacherIds.size > 0) {
          const teachersData = await Promise.all(
            Array.from(teacherIds).map(async (teacherId) => {
              const teacherRef = doc(db, 'users', teacherId);
              const teacherDoc = await getDoc(teacherRef);
              
              if (teacherDoc.exists()) {
                const data = teacherDoc.data();
                return {
                  id: teacherId,
                  name: `${data.firstName} ${data.lastName}`,
                  role: 'TEACHER',
                  ...data
                };
              }
              return null;
            })
          );

          const validTeachers = teachersData.filter(t => t !== null);
          console.log('Found teachers:', validTeachers);
          setTeachers(validTeachers);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Failed to load teachers');
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [currentUser]);

  // Fetch messages for the selected contact
  useEffect(() => {
    if (!selectedContact) return;

    console.log('Fetching messages for contact:', selectedContact.id);

    const messagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUser.uid),
      where('recipientUid', 'in', [currentUser.uid, selectedContact.id])
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toLocaleTimeString() || new Date().toLocaleTimeString()
        }))
        .filter(msg => 
          (msg.senderUid === currentUser.uid && msg.recipientUid === selectedContact.id) ||
          (msg.senderUid === selectedContact.id && msg.recipientUid === currentUser.uid)
        )
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      console.log('Filtered messages:', messagesList);
      setThreadMessages(messagesList);
    });

    return () => unsubscribe();
  }, [selectedContact, currentUser]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      await addDoc(collection(db, 'messages'), {
        content: newMessage,
        senderUid: currentUser.uid,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        recipientUid: selectedContact.id,
        recipientName: selectedContact.name,
        timestamp: serverTimestamp(),
        read: false,
        participants: [currentUser.uid, selectedContact.id]
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const getAvatarIcon = (role) => {
    switch (role) {
      case 'BUSDRIVER':
        return <BusIcon />;
      case 'SCHOOLADMIN':
        return <SchoolIcon />;
      case 'TEACHER':
        return <PersonIcon />;
      default:
        return <PersonIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Messages
        </Typography>
        <IconButton color="primary" onClick={() => window.location.reload()}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Contacts</Typography>
            </Box>
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {teachers.map((teacher) => (
                <ListItem 
                  key={teacher.id} 
                  button 
                  divider
                  selected={selectedContact?.id === teacher.id}
                  onClick={() => setSelectedContact(teacher)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {getAvatarIcon(teacher.role)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={teacher.name}
                    secondary={`Teacher`}
                  />
                </ListItem>
              ))}
              {teachers.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No teachers found"
                    secondary="No teachers are currently assigned to your students"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                {selectedContact ? `Chat with ${selectedContact.name}` : 'Select a contact to start messaging'}
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {threadMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.senderUid === currentUser.uid ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      backgroundColor: message.senderUid === currentUser.uid ? 'primary.light' : 'grey.100',
                      maxWidth: '70%',
                    }}
                  >
                    <Typography variant="body1">{message.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {message.timestamp}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>

            <Divider />
            
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={selectedContact ? "Type your message..." : "Select a contact to start messaging"}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!selectedContact}
                size="small"
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!selectedContact || !newMessage.trim()}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 