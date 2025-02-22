import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'SCHOOLADMIN')
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const usersWithoutSchoolName = usersList.filter(user => !user.schoolName && user.schoolId);
      if (usersWithoutSchoolName.length > 0) {
        const schoolsQuery = query(collection(db, 'schools'));
        const schoolsSnapshot = await getDocs(schoolsQuery);
        const schoolsMap = {};
        schoolsSnapshot.docs.forEach(doc => {
          schoolsMap[doc.id] = doc.data().name;
        });

        const updatedUsers = usersList.map(user => ({
          ...user,
          schoolName: user.schoolName || schoolsMap[user.schoolId] || 'Not assigned'
        }));

        setUsers(updatedUsers);
      } else {
        setUsers(usersList);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setSuccess('User deleted successfully');
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          School Admin Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/superadmin/users/add')}
        >
          Add School Admin
        </Button>
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

      <Paper sx={{ p: 2 }}>
        <List>
          {users.map((user) => (
            <ListItem key={user.id}>
              <ListItemText
                primary={`${user.firstName} ${user.lastName}`}
                secondary={
                  <React.Fragment>
                    {user.email}
                    <br />
                    School: {user.schoolName || 'Not assigned'}
                  </React.Fragment>
                }
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={user.status}
                  color={getStatusColor(user.status)}
                  size="small"
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => navigate(`/superadmin/users/edit/${user.id}`)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default UserManagement; 