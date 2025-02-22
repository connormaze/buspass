import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();
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

  const handleDeleteSchool = async (schoolId) => {
    if (window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'schools', schoolId));
        setSuccess('School deleted successfully');
        setSchools(prevSchools => prevSchools.filter(school => school.id !== schoolId));
      } catch (error) {
        console.error('Error deleting school:', error);
        setError('Failed to delete school');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          School Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/superadmin/schools/add')}
        >
          Add School
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
          {schools.map((school) => (
            <ListItem key={school.id}>
              <ListItemText
                primary={school.name}
                secondary={`Address: ${school.address || 'N/A'}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => navigate(`/superadmin/schools/edit/${school.id}`)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteSchool(school.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default SchoolManagement; 