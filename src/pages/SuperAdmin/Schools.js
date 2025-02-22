import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { collection, query, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function SuperAdminSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    status: 'active',
  });

  const { currentUser } = useAuth();

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const schoolsQuery = query(collection(db, 'schools'));
      const schoolsSnapshot = await getDocs(schoolsQuery);
      const schoolsData = schoolsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchools(schoolsData);
      setError('');
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to load schools. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchool = async () => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'schools'), {
        ...formData,
        createdAt: new Date(),
        createdBy: currentUser.uid,
      });
      setOpenDialog(false);
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        status: 'active',
      });
      await fetchSchools();
      setError('');
    } catch (err) {
      console.error('Error adding school:', err);
      setError('Failed to add school. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchool = async () => {
    try {
      setLoading(true);
      const schoolRef = doc(db, 'schools', selectedSchool.id);
      await updateDoc(schoolRef, {
        ...formData,
        updatedAt: new Date(),
        updatedBy: currentUser.uid,
      });
      setOpenDialog(false);
      setSelectedSchool(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        status: 'active',
      });
      await fetchSchools();
      setError('');
    } catch (err) {
      console.error('Error updating school:', err);
      setError('Failed to update school. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (window.confirm('Are you sure you want to delete this school? This will also affect all associated users and data.')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'schools', schoolId));
        await fetchSchools();
        setError('');
      } catch (err) {
        console.error('Error deleting school:', err);
        setError('Failed to delete school. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenDialog = (school = null) => {
    if (school) {
      setSelectedSchool(school);
      setFormData({
        name: school.name,
        address: school.address,
        phone: school.phone,
        email: school.email,
        status: school.status,
      });
    } else {
      setSelectedSchool(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          School Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New School
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>School ID</TableCell>
                <TableCell>School Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : schools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No schools found
                  </TableCell>
                </TableRow>
              ) : (
                schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>
                      {school.id}
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(school.id);
                          // You could add a toast notification here
                        }}
                        sx={{ ml: 1 }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>{school.name}</TableCell>
                    <TableCell>{school.email}</TableCell>
                    <TableCell>{school.phone}</TableCell>
                    <TableCell>{school.address}</TableCell>
                    <TableCell>
                      <Typography
                        color={school.status === 'active' ? 'success.main' : 'error.main'}
                      >
                        {school.status}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleOpenDialog(school)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => handleDeleteSchool(school.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedSchool ? 'Edit School' : 'Add New School'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="School Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={selectedSchool ? handleEditSchool : handleAddSchool}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : selectedSchool ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 