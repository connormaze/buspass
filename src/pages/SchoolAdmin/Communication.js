import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Chip,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const MESSAGE_TYPES = {
  ANNOUNCEMENT: 'Announcement',
  ALERT: 'Alert',
  GENERAL: 'General',
};

const RECIPIENT_TYPES = {
  ALL: 'All',
  TEACHERS: 'Teachers',
  DRIVERS: 'Drivers',
  PARENTS: 'Parents',
  INDIVIDUAL: 'Individual',
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`communication-tabpanel-${index}`}
      aria-labelledby={`communication-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Communication({ onMessageRead }) {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [messageFormData, setMessageFormData] = useState({
    subject: '',
    content: '',
    type: 'GENERAL',
    recipientType: 'ALL',
    recipientId: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      // Sort in memory until the index is created
      const messagesList = messagesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB - dateA;
        })
        .slice(0, 50);  // Limit to 50 messages

      setMessages(messagesList);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        setError(
          <span>
            System optimization required. Please{' '}
            <a 
              href="https://console.firebase.google.com/v1/r/project/starcadence-a6850/firestore/indexes?create_composite=ClJwcm9qZWN0cy9zdGFyY2FkZW5jZS1hNjg1MC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbWVzc2FnZXMvaW5kZXhlcy9fEAEaDAoIc2Nob29sSWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              click here
            </a>
            {' '}to complete the setup, then refresh the page.
          </span>
        );
      } else {
        setError('Failed to load messages');
      }
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const fetchNotifications = async () => {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      
      // Sort in memory until the index is created
      const notificationsList = notificationsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: doc.data().type || 'GENERAL'  // Ensure type is set
        }))
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB - dateA;
        })
        .slice(0, 50);  // Limit to 50 notifications

      console.log('Fetched notifications:', notificationsList);
      setNotifications(notificationsList);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        setError(
          <span>
            System optimization required. Please{' '}
            <a 
              href="https://console.firebase.google.com/v1/r/project/starcadence-a6850/firestore/indexes?create_composite=Cldwcm9qZWN0cy9zdGFyY2FkZW5jZS1hNjg1MC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbm90aWZpY2F0aW9ucy9pbmRleGVzL18QARoMCghzY2hvb2xJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              click here
            </a>
            {' '}to complete the setup, then refresh the page.
          </span>
        );
      } else {
        setError('Failed to load notifications');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const handleOpenMessageDialog = () => {
    setMessageFormData({
      subject: '',
      content: '',
      type: 'GENERAL',
      recipientType: 'ALL',
      recipientId: '',
    });
    setOpenMessageDialog(true);
    setError(null);
  };

  const handleCloseMessageDialog = () => {
    setOpenMessageDialog(false);
    setMessageFormData({
      subject: '',
      content: '',
      type: 'GENERAL',
      recipientType: 'ALL',
      recipientId: '',
    });
    setError(null);
  };

  const validateMessageForm = () => {
    if (!messageFormData.subject || !messageFormData.content) {
      setError('Please fill in all required fields');
      return false;
    }
    if (messageFormData.recipientType === 'INDIVIDUAL' && !messageFormData.recipientId) {
      setError('Please select a recipient');
      return false;
    }
    return true;
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!validateMessageForm()) return;

    try {
      const messageData = {
        ...messageFormData,
        schoolId: currentUser.schoolId,
        senderId: currentUser.uid,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        createdAt: serverTimestamp(),
        status: 'SENT',
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Create notifications for recipients
      const notificationData = {
        schoolId: currentUser.schoolId,
        type: messageFormData.type,
        title: messageFormData.subject,
        content: messageFormData.content,
        createdAt: serverTimestamp(),
        read: false,
        senderId: currentUser.uid,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      };

      if (messageFormData.recipientType === 'INDIVIDUAL') {
        await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          userId: messageFormData.recipientId,
        });
      } else {
        const recipientRole = messageFormData.recipientType === 'ALL' 
          ? null 
          : messageFormData.recipientType.slice(0, -1).toUpperCase();
        
        const recipientsQuery = recipientRole 
          ? query(
              collection(db, 'users'),
              where('schoolId', '==', currentUser.schoolId),
              where('role', '==', recipientRole)
            )
          : query(
              collection(db, 'users'),
              where('schoolId', '==', currentUser.schoolId)
            );

        const recipientsSnapshot = await getDocs(recipientsQuery);
        
        const notificationPromises = recipientsSnapshot.docs.map(recipientDoc => 
          addDoc(collection(db, 'notifications'), {
            ...notificationData,
            userId: recipientDoc.id,
          })
        );

        await Promise.all(notificationPromises);
      }

      handleCloseMessageDialog();
      fetchMessages();
      fetchNotifications();
      setSuccess('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteDoc(doc(db, 'messages', messageId));
        fetchMessages();
        setSuccess('Message deleted successfully');
      } catch (error) {
        console.error('Error deleting message:', error);
        setError('Failed to delete message');
      }
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
      fetchNotifications();
      if (onMessageRead) onMessageRead();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSearchQuery('');
  };

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotifications = notifications.filter(notification => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (notification.title?.toLowerCase().includes(searchLower) || false) ||
      (notification.content?.toLowerCase().includes(searchLower) || false) ||
      (notification.type?.toLowerCase().includes(searchLower) || false)
    );
  });

  const getRecipientTypeIcon = (type) => {
    switch (type) {
      case 'ALL':
        return <GroupIcon />;
      case 'INDIVIDUAL':
        return <PersonIcon />;
      default:
        return <GroupIcon />;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleApprove = async (notification) => {
    try {
      // Update the notification
      const notificationRef = doc(db, 'notifications', notification.id);
      await updateDoc(notificationRef, {
        status: 'APPROVED',
        read: true,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      });

      // If this is a new user notification, approve the user
      if (notification.type === 'NEW_USER' && notification.userId) {
        const userRef = doc(db, 'users', notification.userId);
        await updateDoc(userRef, {
          status: 'APPROVED',
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid
        });

        // Also update any role-specific documents
        const userData = await getDoc(userRef);
        if (userData.exists()) {
          const user = userData.data();
          const role = user.role;

          if (role === 'DRIVER') {
            const driversQuery = query(
              collection(db, 'drivers'),
              where('uid', '==', notification.userId)
            );
            const driverDocs = await getDocs(driversQuery);
            if (!driverDocs.empty) {
              await updateDoc(doc(db, 'drivers', driverDocs.docs[0].id), {
                status: 'APPROVED',
                updatedAt: serverTimestamp()
              });
            }
          } else if (role === 'STUDENT') {
            const studentsQuery = query(
              collection(db, 'students'),
              where('uid', '==', notification.userId)
            );
            const studentDocs = await getDocs(studentsQuery);
            if (!studentDocs.empty) {
              await updateDoc(doc(db, 'students', studentDocs.docs[0].id), {
                status: 'APPROVED',
                updatedAt: serverTimestamp()
              });
            }
          } else if (role === 'TEACHER') {
            const teachersQuery = query(
              collection(db, 'teachers'),
              where('uid', '==', notification.userId)
            );
            const teacherDocs = await getDocs(teachersQuery);
            if (!teacherDocs.empty) {
              await updateDoc(doc(db, 'teachers', teacherDocs.docs[0].id), {
                status: 'APPROVED',
                updatedAt: serverTimestamp()
              });
            }
          }
        }
      }

      fetchNotifications();
      setSuccess('User approved successfully');
    } catch (error) {
      console.error('Error approving user:', error);
      setError('Failed to approve user');
    }
  };

  const handleReject = async (notification) => {
    try {
      // Update the notification
      const notificationRef = doc(db, 'notifications', notification.id);
      await updateDoc(notificationRef, {
        status: 'REJECTED',
        read: true,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      });

      // If this is a new user notification, reject the user
      if (notification.type === 'NEW_USER' && notification.userId) {
        const userRef = doc(db, 'users', notification.userId);
        await updateDoc(userRef, {
          status: 'REJECTED',
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid
        });

        // Also update any role-specific documents
        const userData = await getDoc(userRef);
        if (userData.exists()) {
          const user = userData.data();
          const role = user.role;

          if (role === 'DRIVER') {
            const driversQuery = query(
              collection(db, 'drivers'),
              where('uid', '==', notification.userId)
            );
            const driverDocs = await getDocs(driversQuery);
            if (!driverDocs.empty) {
              await updateDoc(doc(db, 'drivers', driverDocs.docs[0].id), {
                status: 'REJECTED',
                updatedAt: serverTimestamp()
              });
            }
          } else if (role === 'STUDENT') {
            const studentsQuery = query(
              collection(db, 'students'),
              where('uid', '==', notification.userId)
            );
            const studentDocs = await getDocs(studentsQuery);
            if (!studentDocs.empty) {
              await updateDoc(doc(db, 'students', studentDocs.docs[0].id), {
                status: 'REJECTED',
                updatedAt: serverTimestamp()
              });
            }
          } else if (role === 'TEACHER') {
            const teachersQuery = query(
              collection(db, 'teachers'),
              where('uid', '==', notification.userId)
            );
            const teacherDocs = await getDocs(teachersQuery);
            if (!teacherDocs.empty) {
              await updateDoc(doc(db, 'teachers', teacherDocs.docs[0].id), {
                status: 'REJECTED',
                updatedAt: serverTimestamp()
              });
            }
          }
        }
      }

      fetchNotifications();
      setSuccess('User rejected successfully');
    } catch (error) {
      console.error('Error rejecting user:', error);
      setError('Failed to reject user');
    }
  };

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<EmailIcon />} label="Messages" />
          <Tab
            icon={
              <Badge
                badgeContent={notifications.filter(n => !n.read).length}
                color="error"
              >
                <NotificationsIcon />
              </Badge>
            }
            label="Notifications"
          />
        </Tabs>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
        />
        {currentTab === 0 && (
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleOpenMessageDialog}
          >
            New Message
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TabPanel value={currentTab} index={0}>
        <List>
          {filteredMessages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    {getRecipientTypeIcon(message.recipientType)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="span">
                        {message.subject}
                      </Typography>
                      <Chip
                        label={MESSAGE_TYPES[message.type]}
                        size="small"
                        sx={{ ml: 1 }}
                        color={message.type === 'ALERT' ? 'error' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box component="div">
                      <Box component="div" sx={{ mb: 1 }}>
                        {message.content}
                      </Box>
                      <Box component="div" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                        Sent by {message.senderName} • {formatDate(message.createdAt)}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <List>
          {filteredNotifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  display: 'block',
                  py: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <ListItemAvatar>
                    <Avatar>
                      <NotificationsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="subtitle1" component="span">
                          {notification.type === 'NEW_USER' ? 'New User Registration' : 
                           notification.title || notification.subject || 'New Notification'}
                        </Typography>
                        {notification.type && (
                          <Chip
                            label={notification.type}
                            size="small"
                            color={notification.type === 'ALERT' ? 'error' : 
                                  notification.type === 'NEW_USER' ? 'warning' : 'default'}
                          />
                        )}
                        {notification.status && (
                          <Chip
                            label={notification.status}
                            size="small"
                            color={
                              notification.status === 'APPROVED' ? 'success' :
                              notification.status === 'REJECTED' ? 'error' :
                              'warning'
                            }
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box component="div">
                        {notification.type === 'NEW_USER' ? (
                          <Box component="div" sx={{ mt: 1 }}>
                            <Box component="div" sx={{ mb: 1 }}>
                              <strong>Name:</strong> {notification.userData?.firstName} {notification.userData?.lastName}
                            </Box>
                            <Box component="div" sx={{ mb: 1 }}>
                              <strong>Email:</strong> {notification.userData?.email}
                            </Box>
                            <Box component="div" sx={{ mb: 1 }}>
                              <strong>Role:</strong> {notification.userData?.role}
                            </Box>
                            {notification.userData?.phone && (
                              <Box component="div" sx={{ mb: 1 }}>
                                <strong>Phone:</strong> {notification.userData?.phone}
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Box component="div">
                            <Box component="div" sx={{ mb: 1 }}>
                              {(notification.content || notification.message || 'No content').slice(0, 100) +
                              ((notification.content || notification.message || '').length > 100 ? '...' : '')}
                            </Box>
                            <Box component="div" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                              {formatDate(notification.createdAt)}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  {console.log('Notification:', notification)}
                  {!notification.read && (
                    <Button
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      startIcon={<CheckIcon />}
                    >
                      Mark as Read
                    </Button>
                  )}
                  {notification.type === 'NEW_USER' && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleReject(notification)}
                        startIcon={<ThumbDownIcon />}
                      >
                        Reject
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleApprove(notification)}
                        startIcon={<ThumbUpIcon />}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedNotification(notification);
                      setOpenNotificationDialog(true);
                    }}
                  >
                    View More
                  </Button>
                </Box>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </TabPanel>

      <Dialog
        open={openMessageDialog}
        onClose={handleCloseMessageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Message Type</InputLabel>
                  <Select
                    value={messageFormData.type}
                    onChange={(e) =>
                      setMessageFormData({ ...messageFormData, type: e.target.value })
                    }
                    label="Message Type"
                  >
                    {Object.entries(MESSAGE_TYPES).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Recipient Type</InputLabel>
                  <Select
                    value={messageFormData.recipientType}
                    onChange={(e) =>
                      setMessageFormData({
                        ...messageFormData,
                        recipientType: e.target.value,
                        recipientId: '',
                      })
                    }
                    label="Recipient Type"
                  >
                    {Object.entries(RECIPIENT_TYPES).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {messageFormData.recipientType === 'INDIVIDUAL' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Recipient</InputLabel>
                    <Select
                      value={messageFormData.recipientId}
                      onChange={(e) =>
                        setMessageFormData({
                          ...messageFormData,
                          recipientId: e.target.value,
                        })
                      }
                      label="Recipient"
                    >
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {`${user.firstName} ${user.lastName} (${user.role})`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={messageFormData.subject}
                  onChange={(e) =>
                    setMessageFormData({ ...messageFormData, subject: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={messageFormData.content}
                  onChange={(e) =>
                    setMessageFormData({ ...messageFormData, content: e.target.value })
                  }
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitMessage}
            variant="contained"
            startIcon={<SendIcon />}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openNotificationDialog}
        onClose={() => setOpenNotificationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedNotification?.title || selectedNotification?.subject || 'Notification Details'}
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
              {selectedNotification?.type && (
                <Chip
                  label={selectedNotification.type}
                  size="small"
                  color={selectedNotification?.type === 'ALERT' ? 'error' : 
                         selectedNotification?.type === 'NEW_USER' ? 'warning' : 'default'}
                />
              )}
              {selectedNotification?.status && (
                <Chip
                  label={selectedNotification.status}
                  size="small"
                  color={
                    selectedNotification.status === 'APPROVED' ? 'success' :
                    selectedNotification.status === 'REJECTED' ? 'error' :
                    'default'
                  }
                />
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <>
              {selectedNotification.type === 'NEW_USER' ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    User Registration Request
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Name:</strong> {selectedNotification.userData?.firstName} {selectedNotification.userData?.lastName}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Email:</strong> {selectedNotification.userData?.email}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Role:</strong> {selectedNotification.userData?.role}
                    </Typography>
                    {selectedNotification.userData?.phone && (
                      <Typography variant="body1" gutterBottom>
                        <strong>Phone:</strong> {selectedNotification.userData?.phone}
                      </Typography>
                    )}
                    <Typography variant="body1" gutterBottom>
                      <strong>Status:</strong>{' '}
                      <Chip
                        label={selectedNotification.status || 'PENDING'}
                        size="small"
                        color={
                          selectedNotification.status === 'APPROVED' ? 'success' :
                          selectedNotification.status === 'REJECTED' ? 'error' :
                          'warning'
                        }
                      />
                    </Typography>
                  </Paper>
                  {selectedNotification.type === 'NEW_USER' && (
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<ThumbDownIcon />}
                        onClick={() => {
                          handleReject(selectedNotification);
                          setOpenNotificationDialog(false);
                        }}
                      >
                        Reject User
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<ThumbUpIcon />}
                        onClick={() => {
                          handleApprove(selectedNotification);
                          setOpenNotificationDialog(false);
                        }}
                      >
                        Approve User
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body1" paragraph>
                  {selectedNotification.content || selectedNotification.message || 'No content'}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Notification Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {formatDate(selectedNotification.createdAt)}
                  {selectedNotification.updatedAt && (
                    <><br />Last Updated: {formatDate(selectedNotification.updatedAt)}</>
                  )}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setOpenNotificationDialog(false)}>
                Close
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedNotification?.type === 'NEW_USER' && (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<ThumbDownIcon />}
                    onClick={() => {
                      handleReject(selectedNotification);
                      setOpenNotificationDialog(false);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ThumbUpIcon />}
                    onClick={() => {
                      handleApprove(selectedNotification);
                      setOpenNotificationDialog(false);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 