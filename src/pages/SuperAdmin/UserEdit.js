import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const UserEdit = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    schoolId: '',
    status: '',
    role: '',
  });
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchUser();
      fetchSchools();
    } else {
      setLoading(false);
      setError('No user ID provided');
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      console.log('Fetching user with ID:', id);
      const userRef = doc(db, 'users', id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data:', userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          schoolId: userData.schoolId || '',
          status: userData.status || 'pending',
          role: userData.role || 'SCHOOLADMIN',
        });
        setError('');
      } else {
        console.error('User document not found');
        setError('User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const schoolsQuery = query(collection(db, 'schools'));
      const schoolsSnapshot = await getDocs(schoolsQuery);
      const schoolsList = schoolsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchools(schoolsList);
    } catch (error) {
      console.error('Error fetching schools:', error);
      setError('Failed to load schools: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.schoolId || !formData.status) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setSaving(true);

      // Get the school details for the selected school
      const schoolDoc = await getDoc(doc(db, 'schools', formData.schoolId));
      if (!schoolDoc.exists()) {
        throw new Error('Selected school not found');
      }
      const schoolData = schoolDoc.data();

      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        schoolId: formData.schoolId,
        schoolName: schoolData.name,
        status: formData.status,
        role: formData.role,
        updatedBy: currentUser.uid,
        updatedAt: new Date(),
      };

      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, userData);
      setSuccess('User updated successfully');
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/superadmin/users');
      }, 1500);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !formData.email) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate('/superadmin/users')}>
            Back to Users
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit School Admin
        </Typography>

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

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Assigned School</InputLabel>
                <Select
                  name="schoolId"
                  value={formData.schoolId}
                  onChange={handleChange}
                  label="Assigned School"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {schools.map((school) => (
                    <MenuItem key={school.id} value={school.id}>
                      {school.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/superadmin/users')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserEdit; 