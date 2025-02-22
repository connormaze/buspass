import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { deleteUserComprehensively } from '../../utils/userManagement';

export default function ManageTeachers() {
  const { currentUser } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchTeachers();
  }, [currentUser?.schoolId]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'users'),
        where('schoolId', '==', currentUser.schoolId),
        where('role', '==', 'TEACHER')
      );
      const querySnapshot = await getDocs(q);
      const teachersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeachers(teachersList);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone || '',
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTeacher(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingTeacher) {
        // Update existing teacher
        await updateDoc(doc(db, 'users', editingTeacher.id), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        // Create new teacher account
        const tempPassword = Math.random().toString(36).slice(-8);
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, tempPassword);
        const user = userCredential.user;

        // Create user document
        await addDoc(collection(db, 'users'), {
          uid: user.uid,
          ...formData,
          role: 'TEACHER',
          schoolId: currentUser.schoolId, // Automatically assign school ID
          status: 'approved', // Teachers are automatically approved
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: currentUser.uid,
        });

        // Send password reset email
        await sendPasswordResetEmail(auth, formData.email);
      }

      handleCloseDialog();
      fetchTeachers();
      setError('');
    } catch (error) {
      console.error('Error saving teacher:', error);
      setError('Failed to save teacher: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone and will remove all associated data.')) {
      try {
        await deleteUserComprehensively(teacherId, currentUser.uid);
        setSuccess('Teacher deleted successfully');
        fetchTeachers(); // Refresh the teachers list
      } catch (error) {
        console.error('Error deleting teacher:', error);
        setError('Failed to delete teacher: ' + error.message);
      }
    }
  };

  if (loading && teachers.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Manage Teachers
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Teacher
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <List>
          {teachers.map((teacher) => (
            <ListItem
              key={teacher.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={`${teacher.firstName} ${teacher.lastName}`}
                secondary={
                  <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">{teacher.email}</Typography>
                    {teacher.phone && (
                      <Typography variant="body2">{teacher.phone}</Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(teacher)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(teacher.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
                disabled={!!editingTeacher}
              />
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {editingTeacher ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
} 