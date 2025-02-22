import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Tooltip,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
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
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function PickupDelegation({ students }) {
  const { currentUser } = useAuth();
  const [delegates, setDelegates] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDelegate, setEditingDelegate] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    relationship: '',
    authorizedStudents: [],
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (students.length > 0) {
      fetchDelegates();
    }
  }, [students]);

  const fetchDelegates = async () => {
    try {
      const delegatesQuery = query(
        collection(db, 'delegates'),
        where('parentUid', '==', currentUser.uid)
      );
      const delegatesSnapshot = await getDocs(delegatesQuery);
      const delegatesList = delegatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDelegates(delegatesList);
    } catch (error) {
      console.error('Error fetching delegates:', error);
      setError('Failed to load authorized pickup persons');
    }
  };

  const handleOpenDialog = (delegate = null) => {
    if (delegate) {
      setEditingDelegate(delegate);
      setFormData({
        firstName: delegate.firstName,
        lastName: delegate.lastName,
        phone: delegate.phone,
        email: delegate.email,
        relationship: delegate.relationship,
        authorizedStudents: delegate.authorizedStudents || [],
        startDate: delegate.startDate || '',
        endDate: delegate.endDate || '',
      });
    } else {
      setEditingDelegate(null);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        relationship: '',
        authorizedStudents: [],
        startDate: '',
        endDate: '',
      });
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDelegate(null);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      relationship: '',
      authorizedStudents: [],
      startDate: '',
      endDate: '',
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('First and last name are required');
      return false;
    }
    if (!formData.phone) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.relationship) {
      setError('Relationship is required');
      return false;
    }
    if (formData.authorizedStudents.length === 0) {
      setError('Please select at least one student');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const delegateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        relationship: formData.relationship,
        authorizedStudents: formData.authorizedStudents,
        startDate: formData.startDate,
        endDate: formData.endDate,
        parentUid: currentUser.uid,
        schoolId: currentUser.schoolId,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      let delegateId;
      if (editingDelegate) {
        delegateId = editingDelegate.id;
        await updateDoc(doc(db, 'delegates', delegateId), {
          ...delegateData,
          updatedAt: new Date()
        });
      } else {
        const docRef = await addDoc(collection(db, 'delegates'), delegateData);
        delegateId = docRef.id;
      }

      // Generate temporary access token
      const tokenData = {
        delegateId,
        parentUid: currentUser.uid,
        schoolId: currentUser.schoolId,
        createdAt: new Date(),
        expiresAt: formData.endDate ? new Date(formData.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days if no end date
        status: 'ACTIVE',
        authorizedStudents: formData.authorizedStudents,
      };

      const tokenRef = await addDoc(collection(db, 'tempAccessTokens'), tokenData);
      
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        relationship: '',
        authorizedStudents: [],
        startDate: '',
        endDate: '',
      });
      fetchDelegates();
      handleCloseDialog();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message);
    }

    setLoading(false);
  };

  const handleDeleteDelegate = async (delegateId) => {
    if (window.confirm('Are you sure you want to remove this authorized person?')) {
      try {
        await deleteDoc(doc(db, 'delegates', delegateId));
        fetchDelegates();
      } catch (error) {
        console.error('Error deleting delegate:', error);
        setError('Failed to remove authorized person');
      }
    }
  };

  const getStudentNames = (studentIds) => {
    return studentIds
      .map(id => {
        const student = students.find(s => s.id === id);
        return student ? `${student.firstName} ${student.lastName}` : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  const generateAccessLink = (delegate) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/guest-pickup/${delegate.id}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a temporary success message here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!students.length) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6">No students registered</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Authorized Pickup Persons</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Person
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {delegates.map((delegate) => (
          <Grid item xs={12} md={6} key={delegate.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  {delegate.firstName} {delegate.lastName}
                </Typography>
                <Box>
                  <Tooltip title="Copy Access Link">
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(generateAccessLink(delegate))}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(delegate)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteDelegate(delegate.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography color="textSecondary" gutterBottom>
                {delegate.relationship}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Phone: {delegate.phone}
              </Typography>
              {delegate.email && (
                <Typography variant="body2" gutterBottom>
                  Email: {delegate.email}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                Authorized Students: {getStudentNames(delegate.authorizedStudents)}
              </Typography>
              {delegate.startDate && delegate.endDate && (
                <Typography variant="body2" color="textSecondary">
                  Valid: {new Date(delegate.startDate).toLocaleDateString()} - {new Date(delegate.endDate).toLocaleDateString()}
                </Typography>
              )}
              <Box sx={{ mt: 2 }}>
                <Link
                  href={generateAccessLink(delegate)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LinkIcon fontSize="small" />
                  Access Dashboard
                </Link>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDelegate ? 'Edit Authorized Person' : 'Add Authorized Person'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={formData.relationship}
                  onChange={(e) =>
                    setFormData({ ...formData, relationship: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Authorized Students</InputLabel>
                  <Select
                    multiple
                    value={formData.authorizedStudents}
                    onChange={(e) =>
                      setFormData({ ...formData, authorizedStudents: e.target.value })
                    }
                    label="Authorized Students"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((studentId) => {
                          const student = students.find(s => s.id === studentId);
                          return (
                            <Chip
                              key={studentId}
                              label={`${student?.firstName} ${student?.lastName}`}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDelegate ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 