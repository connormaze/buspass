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
  Tab,
  Tabs,
} from '@mui/material';
import {
  Message as MessageIcon,
  Send as SendIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { collection, query, where, orderBy, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ mt: 2 }}>{children}</Box>;
}

export default function Communication() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [parents, setParents] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchParents();
  }, [currentUser.uid]);

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

  const fetchParents = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'PARENT')
      );
      const querySnapshot = await getDocs(q);
      const parentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setParents(parentsList);
    } catch (error) {
      console.error('Error fetching parents:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedParent) return;

    try {
      await addDoc(collection(db, 'messages'), {
        content: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        recipientId: selectedParent.id,
        recipientName: `${selectedParent.firstName} ${selectedParent.lastName}`,
        participants: [currentUser.uid, selectedParent.id],
        readBy: [currentUser.uid],
        createdAt: new Date(),
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Communication
        </Typography>

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Messages" />
          <Tab label="Parents" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="New Message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                multiline
                rows={2}
                disabled={!selectedParent}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!newMessage.trim() || !selectedParent}
                sx={{ minWidth: 100 }}
              >
                <SendIcon />
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
                      <MessageIcon />
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
                      {message.senderName} •{' '}
                      {new Date(message.createdAt.toDate()).toLocaleString()}
                    </Typography>
                  }
                  secondary={message.content}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {parents.map((parent) => (
              <ListItem
                key={parent.id}
                button
                selected={selectedParent?.id === parent.id}
                onClick={() => setSelectedParent(parent)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${parent.firstName} ${parent.lastName}`}
                  secondary={parent.email}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>
    </Container>
  );
} 