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
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const SCHOOL_TYPES = {
  PUBLIC: 'Public School',
  PRIVATE: 'Private School',
  CHARTER: 'Charter School',
};

const GRADE_LEVELS = {
  ELEMENTARY: 'Elementary School',
  MIDDLE: 'Middle School',
  HIGH: 'High School',
  K12: 'K-12',
};

export default function SchoolManagement({ onUpdate }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [openClassDialog, setOpenClassDialog] = useState(false);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    gradeLevel: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (currentUser?.schoolId) {
      fetchSchoolData();
      fetchClasses();
    }
  }, [currentUser]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      const schoolDoc = await getDoc(doc(db, 'schools', currentUser.schoolId));
      
      if (schoolDoc.exists()) {
        const schoolData = schoolDoc.data();
        setFormData({
          name: schoolData.name || '',
          type: schoolData.type || '',
          gradeLevel: schoolData.gradeLevel || '',
          address: schoolData.address || '',
          city: schoolData.city || '',
          state: schoolData.state || '',
          zipCode: schoolData.zipCode || '',
          phone: schoolData.phone || '',
          email: schoolData.email || '',
          website: schoolData.website || '',
          principalName: schoolData.principalName || '',
          startTime: schoolData.startTime || '',
          endTime: schoolData.endTime || '',
        });
      }
      setError('');
    } catch (err) {
      console.error('Error fetching school data:', err);
      setError('Failed to load school data');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const classesQuery = query(
        collection(db, 'classes'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const snapshot = await getDocs(classesQuery);
      const classesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClasses(classesList);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const schoolRef = doc(db, 'schools', currentUser.schoolId);
      
      const formattedData = {
        ...formData,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(schoolRef, formattedData);

      setSuccess('School information updated successfully');
      setEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error updating school:', err);
      setError('Failed to update school information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (classData) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'classes'), {
        ...classData,
        schoolId: currentUser.schoolId,
        createdAt: serverTimestamp(),
      });
      setSuccess('Class added successfully');
      fetchClasses();
      setOpenClassDialog(false);
    } catch (err) {
      console.error('Error adding class:', err);
      setError('Failed to add class');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'classes', classId));
        setSuccess('Class deleted successfully');
        fetchClasses();
      } catch (err) {
        console.error('Error deleting class:', err);
        setError('Failed to delete class');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">School Information</Typography>
          <Button
            variant="contained"
            color={editing ? "primary" : "secondary"}
            startIcon={editing ? <SaveIcon /> : <EditIcon />}
            onClick={() => editing ? handleSave() : setEditing(true)}
          >
            {editing ? 'Save Changes' : 'Edit Information'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="School Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!editing}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!editing}>
              <InputLabel>School Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="School Type"
              >
                {Object.entries(SCHOOL_TYPES).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!editing}>
              <InputLabel>Grade Level</InputLabel>
              <Select
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleInputChange}
                label="Grade Level"
              >
                {Object.entries(GRADE_LEVELS).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Principal Name"
              name="principalName"
              value={formData.principalName}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="ZIP Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="School Start Time"
              name="startTime"
              type="time"
              value={formData.startTime || ''}
              onChange={handleInputChange}
              disabled={!editing}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min intervals
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="School End Time"
              name="endTime"
              type="time"
              value={formData.endTime || ''}
              onChange={handleInputChange}
              disabled={!editing}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min intervals
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Classes</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenClassDialog(true)}
          >
            Add Class
          </Button>
        </Box>

        <List>
          {classes.map((classItem) => (
            <ListItem key={classItem.id}>
              <ListItemText
                primary={classItem.name}
                secondary={`Grade ${classItem.grade} • Teacher: ${classItem.teacher} • Capacity: ${classItem.capacity}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteClass(classItem.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={openClassDialog} onClose={() => setOpenClassDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Class Name"
                name="name"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Grade"
                name="grade"
                type="number"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teacher"
                name="teacher"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClassDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            Add Class
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 