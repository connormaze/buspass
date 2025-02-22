import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function Communication({ bus, onMessageRead }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const messagesEndRef = useRef(null);
  const [unsubscribe, setUnsubscribe] = useState(null);

  useEffect(() => {
    fetchRecipients();
    setupMessageListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const setupMessageListener = () => {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeListener = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesList);
      markMessagesAsRead(messagesList);
      scrollToBottom();
    });

    setUnsubscribe(unsubscribeListener);
  };

  const fetchRecipients = async () => {
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      // Fetch school administrators
      const adminsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('role', 'in', ['SCHOOLADMIN', 'TEACHER', 'STAFF', 'SUPERVISOR'])
      );
      const adminsSnapshot = await getDocs(adminsQuery);
      const adminsList = adminsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecipients(adminsList);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const markMessagesAsRead = async (messagesList) => {
    try {
      const unreadMessages = messagesList.filter(
        msg => msg.recipientUid === currentUser.uid && !msg.read
      );

      for (const message of unreadMessages) {
        const messageRef = doc(db, 'messages', message.id);
        await updateDoc(messageRef, { read: true });
      }

      if (unreadMessages.length > 0 && onMessageRead) {
        onMessageRead();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRecipient) return;

    try {
      await addDoc(collection(db, 'messages'), {
        content: newMessage.trim(),
        senderUid: currentUser.uid,
        recipientUid: selectedRecipient,
        participants: [currentUser.uid, selectedRecipient],
        timestamp: serverTimestamp(),
        read: false,
      });

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getRecipientName = (uid) => {
    const recipient = recipients.find(r => r.id === uid);
    return recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Unknown User';
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Contacts
            </Typography>
            <List>
              {recipients.map((recipient) => (
                <ListItem
                  key={recipient.id}
                  button
                  selected={selectedRecipient === recipient.id}
                  onClick={() => setSelectedRecipient(recipient.id)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${recipient.firstName} ${recipient.lastName}`}
                    secondary={recipient.role}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
              <List>
                {messages
                  .filter(msg =>
                    msg.participants.includes(selectedRecipient)
                  )
                  .map((message, index) => (
                    <React.Fragment key={message.id}>
                      <ListItem
                        sx={{
                          flexDirection: 'column',
                          alignItems: message.senderUid === currentUser.uid ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            bgcolor: message.senderUid === currentUser.uid ? 'primary.main' : 'grey.200',
                            color: message.senderUid === currentUser.uid ? 'white' : 'text.primary',
                            borderRadius: 2,
                            p: 2,
                          }}
                        >
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 1,
                              color: message.senderUid === currentUser.uid ? 'grey.100' : 'text.secondary',
                            }}
                          >
                            {formatTimestamp(message.timestamp)}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < messages.length - 1 && <Divider variant="middle" />}
                    </React.Fragment>
                  ))}
                <div ref={messagesEndRef} />
              </List>
            </Box>

            <Box component="form" onSubmit={handleSendMessage}>
              <Grid container spacing={2}>
                <Grid item xs>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={!selectedRecipient}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    type="submit"
                    disabled={!selectedRecipient || !newMessage.trim()}
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 