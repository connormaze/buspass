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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function BusDriverMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { currentUser } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markConversationAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('lastMessageTime', 'desc')
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversationsData = await Promise.all(
        conversationsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const otherParticipantId = data.participants.find(id => id !== currentUser.uid);
          
          // Get other participant's details
          const userDoc = await getDocs(query(
            collection(db, 'users'),
            where('uid', '==', otherParticipantId)
          ));
          
          const otherParticipant = userDoc.docs[0]?.data() || {};
          
          return {
            id: doc.id,
            ...data,
            otherParticipant,
          };
        })
      );
      setConversations(conversationsData);
      setError('');
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesData = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
      setError('');
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      const unreadMessagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('recipientId', '==', currentUser.uid),
        where('read', '==', false)
      );
      const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
      
      const updatePromises = unreadMessagesSnapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );
      await Promise.all(updatePromises);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setLoading(true);
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: currentUser.uid,
        recipientId: selectedConversation.participants.find(id => id !== currentUser.uid),
        content: newMessage,
        timestamp: Timestamp.now(),
        read: false,
      };

      // Add new message
      await addDoc(collection(db, 'messages'), messageData);

      // Update conversation's last message
      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: newMessage,
        lastMessageTime: Timestamp.now(),
      });

      setNewMessage('');
      await fetchMessages(selectedConversation.id);
      await fetchConversations();
      setError('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchConversations();
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  };

  if (loading && !conversations.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Messages
        </Typography>
        <IconButton color="primary" onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Conversations</Typography>
            </Box>
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {conversations.map((conversation) => (
                <ListItem
                  key={conversation.id}
                  button
                  divider
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <ListItemAvatar>
                    <Badge
                      color="error"
                      variant="dot"
                      invisible={!conversation.unreadCount}
                    >
                      <Avatar>
                        {conversation.otherParticipant.role === 'SCHOOLADMIN' ? 
                          <SchoolIcon /> : <PersonIcon />}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.otherParticipant.name || 'Unknown User'}
                    secondary={conversation.lastMessage}
                    secondaryTypographyProps={{
                      noWrap: true,
                      style: { maxWidth: '200px' }
                    }}
                  />
                  {conversation.lastMessageTime && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(conversation.lastMessageTime.seconds * 1000).toLocaleTimeString()}
                    </Typography>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                {selectedConversation ? 
                  `Chat with ${selectedConversation.otherParticipant.name}` : 
                  'Select a conversation'}
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.senderId === currentUser.uid ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.senderId === currentUser.uid ? 'primary.main' : 'grey.100',
                      color: message.senderId === currentUser.uid ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="body1">{message.content}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {new Date(message.timestamp.seconds * 1000).toLocaleTimeString()}
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
                placeholder={selectedConversation ? "Type your message..." : "Select a conversation to start messaging"}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!selectedConversation || loading}
                size="small"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!selectedConversation || !newMessage.trim() || loading}
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