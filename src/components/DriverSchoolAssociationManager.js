import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { DriverManagementService } from '../services/DriverManagementService';

export default function DriverSchoolAssociationManager({ 
  driverId, 
  currentSchools = [], 
  onUpdate 
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const driverService = new DriverManagementService();

  useEffect(() => {
    if (open) {
      fetchAvailableSchools();
    }
  }, [open]);

  const fetchAvailableSchools = async () => {
    try {
      setLoading(true);
      const schoolsQuery = query(collection(db, 'schools'));
      const snapshot = await getDocs(schoolsQuery);
      const schoolsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error fetching schools:', error);
      setError('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssociation = async (schoolId) => {
    try {
      setLoading(true);
      await driverService.addDriverToSchool(driverId, schoolId);
      onUpdate();
      setOpen(false);
    } catch (error) {
      console.error('Error adding school association:', error);
      setError('Failed to add school association');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssociation = async (schoolId) => {
    try {
      setLoading(true);
      await driverService.removeDriverFromSchool(driverId, schoolId);
      onUpdate();
    } catch (error) {
      console.error('Error removing school association:', error);
      setError('Failed to remove school association');
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(school => 
    !currentSchools.includes(school.id) &&
    (school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     school.district?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Associated Schools</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Add School
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <List>
          {currentSchools.map((schoolId) => {
            const school = schools.find(s => s.id === schoolId);
            return (
              <ListItem key={schoolId}>
                <ListItemText
                  primary={school?.name || schoolId}
                  secondary={school?.district || 'No district'}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="remove"
                    onClick={() => handleRemoveAssociation(schoolId)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add School Association</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Search Schools"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {filteredSchools.map((school) => (
                <ListItem
                  key={school.id}
                  button
                  onClick={() => handleAddAssociation(school.id)}
                >
                  <ListItemText
                    primary={school.name}
                    secondary={school.district}
                  />
                  <Chip
                    icon={<SchoolIcon />}
                    label="Add"
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </ListItem>
              ))}
              {filteredSchools.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No schools found"
                    secondary={searchTerm ? "Try a different search term" : "No schools available"}
                  />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 