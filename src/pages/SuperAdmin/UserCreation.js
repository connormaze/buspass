import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, addDoc, getDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const UserCreation = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolId: '',
    phone: '',
  });
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchools();
  }, []);

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
      setError('Failed to load schools');
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
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.schoolId || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Store current admin's auth state
      const adminUser = auth.currentUser;

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Get the school details
      const schoolDoc = await getDoc(doc(db, 'schools', formData.schoolId));
      if (!schoolDoc.exists()) {
        throw new Error('Selected school not found');
      }
      const schoolData = schoolDoc.data();

      // Create user document in Firestore
      const userData = {
        uid: userCredential.user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: 'SCHOOLADMIN',
        schoolId: formData.schoolId,
        schoolName: schoolData.name,
        status: 'approved',
        createdBy: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: currentUser.uid
      };

      // Log the data being saved for verification
      console.log('Creating user document with data:', userData);

      try {
        // Create the user document
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        
        // Verify the document was created
        const verifyDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (!verifyDoc.exists()) {
          throw new Error('Failed to create user document');
        }

        console.log('Verification - saved user data:', verifyDoc.data());

        // Sign out the newly created user
        await signOut(auth);
        console.log('Successfully signed out new user');

        // Add a longer delay to ensure auth state is updated
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Re-authenticate as the admin
        const adminDoc = await getDoc(doc(db, 'users', adminUser.uid));
        if (adminDoc.exists()) {
          const adminData = adminDoc.data();
          console.log('Re-authenticating as admin:', adminData);
          setCurrentUser({
            ...adminUser,
            ...adminData,
            uid: adminUser.uid
          });
        }

        navigate('/superadmin/users');
      } catch (error) {
        console.error('Error in user document creation:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user: ' + error.message);
      
      // Try to clean up if there was an error
      try {
        if (auth.currentUser && auth.currentUser.email === formData.email) {
          await signOut(auth);
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add School Admin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
                helperText="Required for account verification"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
                required
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
                  {schools.map((school) => (
                    <MenuItem key={school.id} value={school.id}>
                      {school.name}
                    </MenuItem>
                  ))}
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
                  disabled={loading}
                >
                  Create School Admin
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserCreation; 