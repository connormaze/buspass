import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  DragIndicator as DragIcon,
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
import { GoogleMap, LoadScript, Marker, Polyline, Geocoder } from '@react-google-maps/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { captureTransportEvent } from '../../services/AnalyticsService';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

export default function RouteManagement() {
  const { currentUser } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startLocation: '',
    endLocation: '',
    busId: '',
    driverId: '',
    stops: [],
    isActive: true,
  });
  const [newStop, setNewStop] = useState({
    name: '',
    address: '',
    time: '',
    lat: null,
    lng: null,
    students: [],
  });
  const [newStopDialog, setNewStopDialog] = useState(false);
  const [geocoder, setGeocoder] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    fetchRoutes();
    fetchBuses();
    fetchStudents();
    fetchAvailableDrivers();
  }, []);

  const fetchRoutes = async () => {
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      const routesQuery = query(
        collection(db, 'routes'),
        where('schoolId', '==', schoolId)
      );
      const routesSnapshot = await getDocs(routesQuery);
      const routesList = routesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoutes(routesList);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchBuses = async () => {
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

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

  const fetchStudents = async () => {
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      const studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('role', '==', 'STUDENT')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      const driversQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('role', '==', 'BUSDRIVER'),
        where('status', '==', 'approved')
      );
      const driversSnapshot = await getDocs(driversQuery);
      const driversList = driversSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableDrivers(driversList);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleOpenDialog = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        name: route.name,
        description: route.description,
        startLocation: route.startLocation || '',
        endLocation: route.endLocation || '',
        busId: route.busId || '',
        driverId: route.driverId || '',
        stops: route.stops || [],
        isActive: route.isActive,
      });
    } else {
      setEditingRoute(null);
      setFormData({
        name: '',
        description: '',
        startLocation: '',
        endLocation: '',
        busId: '',
        driverId: '',
        stops: [],
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRoute(null);
    setFormData({
      name: '',
      description: '',
      startLocation: '',
      endLocation: '',
      busId: '',
      driverId: '',
      stops: [],
      isActive: true,
    });
    setNewStop({
      name: '',
      address: '',
      time: '',
      lat: null,
      lng: null,
      students: [],
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.busId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      const selectedBus = buses.find(b => b.id === formData.busId);
      const selectedDriver = availableDrivers.find(d => d.id === formData.driverId);

      const routeData = {
        ...formData,
        schoolId,
        busNumber: selectedBus?.busNumber,
        driverName: selectedDriver ? `${selectedDriver.firstName} ${selectedDriver.lastName}` : '',
        driverPhone: selectedDriver?.phone || '',
        updatedAt: serverTimestamp(),
      };

      if (editingRoute) {
        const routeRef = doc(db, 'routes', editingRoute.id);
        await updateDoc(routeRef, routeData);

        if (selectedBus) {
          const busRef = doc(db, 'buses', formData.busId);
          await updateDoc(busRef, {
            routeId: editingRoute.id,
            driverUid: formData.driverId,
            driverName: routeData.driverName,
            driverPhone: routeData.driverPhone,
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        const routeDoc = await addDoc(collection(db, 'routes'), routeData);
        
        if (selectedBus) {
          const busRef = doc(db, 'buses', formData.busId);
          await updateDoc(busRef, {
            routeId: routeDoc.id,
            driverUid: formData.driverId,
            driverName: routeData.driverName,
            driverPhone: routeData.driverPhone,
            updatedAt: serverTimestamp(),
          });
        }
      }

      fetchRoutes();
      fetchBuses();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Error saving route: ' + error.message);
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteDoc(doc(db, 'routes', routeId));
        fetchRoutes();
      } catch (error) {
        console.error('Error deleting route:', error);
      }
    }
  };

  const handleAddStop = () => {
    setNewStopDialog(true);
    setNewStop({
      name: '',
      address: '',
      time: '',
      lat: null,
      lng: null,
      students: [],
    });
  };

  const handleNewStopSubmit = async () => {
    if (!newStop.name || !newStop.address || !newStop.time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Geocode the address to get coordinates
      if (geocoder) {
        const response = await geocoder.geocode({ address: newStop.address });
        if (response.results && response.results[0]) {
          const location = response.results[0].geometry.location;
          const stop = {
            ...newStop,
            lat: location.lat(),
            lng: location.lng(),
          };

          setFormData({
            ...formData,
            stops: [...formData.stops, stop],
          });

          setNewStop({
            name: '',
            address: '',
            time: '',
            lat: null,
            lng: null,
            students: [],
          });
          setNewStopDialog(false);
        } else {
          alert('Could not find coordinates for this address');
        }
      } else {
        // Fallback to default coordinates if geocoder is not available
        const stop = {
          ...newStop,
          lat: defaultCenter.lat,
          lng: defaultCenter.lng,
        };

        setFormData({
          ...formData,
          stops: [...formData.stops, stop],
        });

        setNewStop({
          name: '',
          address: '',
          time: '',
          lat: null,
          lng: null,
          students: [],
        });
        setNewStopDialog(false);
      }
    } catch (error) {
      console.error('Error adding stop:', error);
      alert('Error adding stop: ' + error.message);
    }
  };

  const handleRemoveStop = (index) => {
    const newStops = formData.stops.filter((_, i) => i !== index);
    setFormData({ ...formData, stops: newStops });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const stops = Array.from(formData.stops);
    const [reorderedStop] = stops.splice(result.source.index, 1);
    stops.splice(result.destination.index, 0, reorderedStop);

    setFormData({ ...formData, stops: stops });
  };

  const handleStopChange = (stopIndex, field, value) => {
    const newStops = [...formData.stops];
    if (field === 'students') {
      newStops[stopIndex] = {
        ...newStops[stopIndex],
        students: value.map(student => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          notifyParents: true
        }))
      };
    } else {
      newStops[stopIndex][field] = value;
    }
    setFormData({ ...formData, stops: newStops });
  };

  const renderStopFields = (stop, index) => (
    <Draggable key={index} draggableId={`stop-${index}`} index={index}>
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{ mb: 2 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle1">Stop #{index + 1}</Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleRemoveStop(index)}
                  sx={{ ml: 'auto' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stop Name"
                value={stop.name}
                onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Address"
                value={stop.address}
                onChange={(e) => handleStopChange(index, 'address', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={stop.time}
                onChange={(e) => handleStopChange(index, 'time', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={students}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                value={students.filter(student => 
                  stop.students?.some(s => s.id === student.id)
                )}
                onChange={(e, newValue) => handleStopChange(index, 'students', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assigned Students"
                    placeholder="Select students for this stop"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={`${option.firstName} ${option.lastName}`}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Draggable>
  );

  const renderRouteListItem = (route) => (
    <ListItem key={route.id}>
      <ListItemText
        primary={route.name}
        secondary={
          <>
            {route.description}
            <br />
            Bus: {buses.find(b => b.id === route.busId)?.busNumber || 'Not Assigned'}
            <br />
            Driver: {route.driverName || 'Not Assigned'}
            <br />
            Stops: {route.stops.length}
            <br />
            Total Students: {route.stops.reduce((total, stop) => total + (stop.students?.length || 0), 0)}
            <br />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={route.isActive}
                  onChange={async () => {
                    const routeRef = doc(db, 'routes', route.id);
                    await updateDoc(routeRef, {
                      isActive: !route.isActive,
                    });
                    fetchRoutes();
                  }}
                />
              }
              label={route.isActive ? 'Active' : 'Inactive'}
            />
          </>
        }
      />
      <ListItemSecondaryAction>
        <IconButton onClick={() => handleOpenDialog(route)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleDeleteRoute(route.id)}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );

  const onMapLoad = (map) => {
    setMapInstance(map);
    setGeocoder(new window.google.maps.Geocoder());
  };

  const captureRouteAnalytics = async (routeData, busData, studentsCount) => {
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      await captureTransportEvent(schoolId, {
        routeId: routeData.id,
        busId: busData.id,
        studentsTransported: studentsCount,
        delay: Math.floor(Math.random() * 10), // This should be replaced with actual delay data
        status: routeData.isActive ? 'COMPLETED' : 'CANCELLED',
        type: 'ROUTE_COMPLETION'
      });
    } catch (error) {
      console.error('Error capturing route analytics:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Route Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Route
        </Button>
      </Box>

      <List>
        {routes.map(renderRouteListItem)}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRoute ? 'Edit Route' : 'Add New Route'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Route Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Location"
                  value={formData.startLocation}
                  onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Location"
                  value={formData.endLocation}
                  onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Assigned Bus</InputLabel>
                  <Select
                    value={formData.busId}
                    onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                    label="Assigned Bus"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {buses.map((bus) => (
                      <MenuItem key={bus.id} value={bus.id}>
                        Bus #{bus.busNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned Driver</InputLabel>
                  <Select
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    label="Assigned Driver"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {availableDrivers.map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.firstName} {driver.lastName} ({driver.phone || 'No phone'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Add Bus Stop
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Stop Name"
                      value={newStop.name}
                      onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Stop Address"
                      value={newStop.address}
                      onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Pickup Time"
                      type="time"
                      value={newStop.time}
                      onChange={(e) => setNewStop({ ...newStop, time: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Button
                      variant="contained"
                      onClick={handleNewStopSubmit}
                      sx={{ height: '100%', width: '100%' }}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Bus Stops & Student Assignments
                </Typography>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="stops">
                    {(provided) => (
                      <Box {...provided.droppableProps} ref={provided.innerRef}>
                        {formData.stops.map((stop, index) => renderStopFields(stop, index))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </DragDropContext>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add Route
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={newStopDialog} onClose={() => setNewStopDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Stop</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Stop Name"
                  value={newStop.name}
                  onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={newStop.address}
                  onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  value={newStop.time}
                  onChange={(e) => setNewStop({ ...newStop, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={students}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                  value={students.filter(student => 
                    newStop.students?.some(s => s.id === student.id)
                  )}
                  onChange={(e, newValue) => setNewStop({
                    ...newStop,
                    students: newValue.map(student => ({
                      id: student.id,
                      name: `${student.firstName} ${student.lastName}`,
                      notifyParents: true
                    }))
                  })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assigned Students"
                      placeholder="Select students for this stop"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={`${option.firstName} ${option.lastName}`}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewStopDialog(false)}>Cancel</Button>
          <Button onClick={handleNewStopSubmit} variant="contained">
            Add Stop
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 