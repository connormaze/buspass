import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsBus as BusIcon,
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
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { DriverManagementService } from '../../services/DriverManagementService';

export default function BusManagement() {
  const { currentUser } = useAuth();
  const [buses, setBuses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    busNumber: '',
    capacity: '',
    driverUid: '',
    licensePlate: '',
    isActive: true,
    notes: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
  }, []);

  const fetchBuses = async () => {
    try {
      // Get the school ID of the current admin
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      // Fetch buses for this school
      const busesQuery = query(
        collection(db, 'buses'),
        where('schoolId', '==', schoolId)
      );
      const busesSnapshot = await getDocs(busesQuery);
      const busesList = busesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBuses(busesList);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  const fetchDrivers = useCallback(async () => {
    try {
      const driverService = new DriverManagementService();
      const driversData = await driverService.getSchoolDrivers(currentUser?.schoolId);
      setDrivers(driversData);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Failed to load drivers');
    }
  }, [currentUser?.schoolId]);

  // Add a debug log for the drivers state
  useEffect(() => {
    console.log('Current drivers state:', drivers);
  }, [drivers]);

  // Add debug log in the render
  console.log('Rendering drivers in select:', drivers);

  const handleOpenDialog = (bus = null) => {
    if (bus) {
      setEditingBus(bus);
      setFormData({
        busNumber: bus.busNumber,
        capacity: bus.capacity,
        driverUid: bus.driverUid || '',
        licensePlate: bus.licensePlate,
        isActive: bus.isActive,
        notes: bus.notes || '',
      });
    } else {
      setEditingBus(null);
      setFormData({
        busNumber: '',
        capacity: '',
        driverUid: '',
        licensePlate: '',
        isActive: true,
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBus(null);
    setFormData({
      busNumber: '',
      capacity: '',
      driverUid: '',
      licensePlate: '',
      isActive: true,
      notes: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      // Get the selected driver's details
      const selectedDriver = drivers.find(d => d.id === formData.driverUid);
      
      const busData = {
        busNumber: formData.busNumber,
        capacity: formData.capacity,
        licensePlate: formData.licensePlate,
        isActive: formData.isActive,
        notes: formData.notes || '',
        schoolId,
        // Only include driver fields if a driver is selected
        ...(formData.driverUid ? {
          driverUid: formData.driverUid,
          driverName: selectedDriver ? `${selectedDriver.firstName || ''} ${selectedDriver.lastName || ''}`.trim() : '',
          driverPhone: selectedDriver?.phone || ''
        } : {
          driverUid: '',
          driverName: '',
          driverPhone: ''
        }),
        lastLocation: null,
        lastUpdated: null,
      };

      if (editingBus) {
        const busRef = doc(db, 'buses', editingBus.id);
        await updateDoc(busRef, busData);
      } else {
        await addDoc(collection(db, 'buses'), busData);
      }
      handleCloseDialog();
      fetchBuses();
    } catch (error) {
      console.error('Error saving bus:', error);
    }
  };

  const handleDeleteBus = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await deleteDoc(doc(db, 'buses', busId));
        fetchBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Bus Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Bus
        </Button>
      </Box>

      <Grid container spacing={3}>
        {buses.map((bus) => (
          <Grid item xs={12} md={6} lg={4} key={bus.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Bus #{bus.busNumber}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(bus)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteBus(bus.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography color="textSecondary">
                  License Plate: {bus.licensePlate}
                </Typography>
                <Typography color="textSecondary">
                  Driver: {bus.driverName}
                </Typography>
                <Typography color="textSecondary">
                  Capacity: {bus.capacity} students
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={bus.isActive}
                      onChange={async () => {
                        const busRef = doc(db, 'buses', bus.id);
                        await updateDoc(busRef, {
                          isActive: !bus.isActive,
                        });
                        fetchBuses();
                      }}
                    />
                  }
                  label={bus.isActive ? 'Active' : 'Inactive'}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBus ? 'Edit Bus' : 'Add New Bus'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Bus Number"
                  value={formData.busNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, busNumber: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="License Plate"
                  value={formData.licensePlate}
                  onChange={(e) =>
                    setFormData({ ...formData, licensePlate: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Assigned Driver</InputLabel>
                  <Select
                    value={formData.driverUid}
                    onChange={(e) => {
                      console.log('Selected driver:', e.target.value);
                      setFormData({ ...formData, driverUid: e.target.value });
                    }}
                    label="Assigned Driver"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {drivers && drivers.length > 0 ? (
                      drivers.map((driver) => (
                        <MenuItem 
                          key={driver.id} 
                          value={driver.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2">
                              {driver.firstName || ''} {driver.lastName || ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {driver.phone || 'No phone'} • License: {driver.licenseNumber || 'N/A'}
                            </Typography>
                          </Box>
                          {driver.schools?.length > 1 && (
                            <Chip 
                              size="small" 
                              label={`${driver.schools.length} schools`} 
                              color="info" 
                              variant="outlined" 
                            />
                          )}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No drivers available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBus ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 