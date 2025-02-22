import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Autocomplete,
  Chip,
  Alert,
  Grid,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const AddRoute = ({ open, onClose, onRouteAdded, schoolId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [newStop, setNewStop] = useState({
    name: '',
    address: '',
    time: '',
  });
  const [routeData, setRouteData] = useState({
    name: '',
    description: '',
    startLocation: '',
    endLocation: '',
    busId: '',
    driverId: '',
    stops: [],
  });

  // Add state for buses and drivers
  const [buses, setBuses] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    if (open) {
      fetchStudents();
      fetchBuses();
      fetchDrivers();
    } else {
      // Reset form when dialog closes
      setRouteData({
        name: '',
        description: '',
        startLocation: '',
        endLocation: '',
        busId: '',
        driverId: '',
        stops: [],
      });
      setError('');
    }
  }, [open]);

  useEffect(() => {
    // Update available students whenever stops change
    const assignedStudentIds = new Set(
      routeData.stops.flatMap(stop => stop.students.map(s => s.id))
    );
    setAvailableStudents(
      students.filter(student => !assignedStudentIds.has(student.id))
    );
  }, [routeData.stops, students]);

  const fetchStudents = async () => {
    try {
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'STUDENT'),
        where('isActive', '==', true),
        where('schoolId', '==', schoolId)
      );
      const snapshot = await getDocs(studentsQuery);
      const studentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fullName: `${doc.data().firstName} ${doc.data().lastName}`
      }));
      setStudents(studentsList);
      setAvailableStudents(studentsList);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
    }
  };

  const fetchBuses = async () => {
    try {
      const busesQuery = query(
        collection(db, 'buses'),
        where('schoolId', '==', schoolId)
      );
      const snapshot = await getDocs(busesQuery);
      const busesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBuses(busesList);
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError('Failed to fetch buses');
    }
  };

  const fetchDrivers = async () => {
    try {
      console.log('Fetching drivers for schoolId:', schoolId);
      
      const driversQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('role', '==', 'BUSDRIVER')
        // Removed status check temporarily to see all drivers
      );
      
      const snapshot = await getDocs(driversQuery);
      console.log('Drivers snapshot:', snapshot.docs.map(doc => doc.data()));
      
      const driversList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fullName: `${doc.data().firstName} ${doc.data().lastName}`
      }));
      
      console.log('Processed drivers list:', driversList);
      setAvailableDrivers(driversList);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to fetch drivers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRouteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewStopChange = (e) => {
    const { name, value } = e.target;
    setNewStop(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStop = () => {
    if (newStop.name.trim() && newStop.address.trim() && newStop.time) {
      const stopIndex = routeData.stops.length;
      setRouteData(prev => ({
        ...prev,
        stops: [...prev.stops, {
          ...newStop,
          order: stopIndex,
          students: []
        }]
      }));
      setNewStop({
        name: '',
        address: '',
        time: '',
      });
    }
  };

  const handleRemoveStop = (index) => {
    setRouteData(prev => {
      const newStops = [...prev.stops];
      // Get students from the removed stop
      const removedStudents = newStops[index].students;
      newStops.splice(index, 1);
      // Update orders
      newStops.forEach((stop, i) => {
        stop.order = i;
      });
      return { ...prev, stops: newStops };
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(routeData.stops);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update stop orders
    const reorderedStops = items.map((stop, index) => ({
      ...stop,
      order: index
    }));

    setRouteData(prev => ({
      ...prev,
      stops: reorderedStops
    }));
  };

  const handleAssignStudents = (stopIndex, selectedStudents) => {
    setRouteData(prev => {
      const newStops = [...prev.stops];
      
      // Update the students for this stop
      newStops[stopIndex] = {
        ...newStops[stopIndex],
        students: selectedStudents.map(student => ({
          id: student.id,
          name: student.fullName,
          grade: student.grade || '',
          pickupTime: newStops[stopIndex].time // Add pickup time from stop
        }))
      };
      
      return { ...prev, stops: newStops };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validation
      if (!routeData.name || !routeData.startLocation || !routeData.endLocation || !routeData.busId) {
        setError('Please fill in all required fields');
        return;
      }

      if (routeData.stops.length < 2) {
        setError('Please add at least two stops');
        return;
      }

      // Check if any students are assigned
      const totalAssignedStudents = routeData.stops.reduce(
        (total, stop) => total + stop.students.length,
        0
      );
      if (totalAssignedStudents === 0) {
        setError('Please assign at least one student to a stop');
        return;
      }

      // Get the selected bus and driver details
      const selectedBus = buses.find(b => b.id === routeData.busId);
      const selectedDriver = availableDrivers.find(d => d.id === routeData.driverId);

      // Prepare stops with assigned students
      const stopsWithStudents = routeData.stops.map(stop => ({
        ...stop,
        students: stop.students.map(student => ({
          id: student.id,
          name: student.fullName,
          grade: student.grade
        }))
      }));

      const routeWithDetails = {
        ...routeData,
        stops: stopsWithStudents,
        schoolId,
        createdAt: new Date().toISOString(),
        isActive: true,
        busNumber: selectedBus?.busNumber,
        driverName: selectedDriver ? `${selectedDriver.firstName} ${selectedDriver.lastName}` : '',
        driverPhone: selectedDriver?.phone || ''
      };

      // Save the route
      await onRouteAdded(routeWithDetails);

      // If a bus is selected, update the bus with route and driver info
      if (selectedBus) {
        const busRef = doc(db, 'buses', routeData.busId);
        await updateDoc(busRef, {
          routeId: routeWithDetails.id,
          driverUid: routeData.driverId,
          driverName: routeWithDetails.driverName,
          driverPhone: routeWithDetails.driverPhone,
          updatedAt: new Date().toISOString()
        });
      }

      onClose();
    } catch (err) {
      console.error('Error adding route:', err);
      setError('Failed to add route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Route</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Route Name"
              value={routeData.name}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              value={routeData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="startLocation"
              label="Start Location"
              value={routeData.startLocation}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="endLocation"
              label="End Location"
              value={routeData.endLocation}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required margin="normal">
              <InputLabel>Assigned Bus</InputLabel>
              <Select
                name="busId"
                value={routeData.busId}
                onChange={handleInputChange}
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Assigned Driver</InputLabel>
              <Select
                name="driverId"
                value={routeData.driverId}
                onChange={handleInputChange}
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
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>Add Bus Stop</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="name"
                    label="Stop Name"
                    value={newStop.name}
                    onChange={handleNewStopChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="address"
                    label="Stop Address"
                    value={newStop.address}
                    onChange={handleNewStopChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    name="time"
                    label="Pickup Time"
                    type="time"
                    value={newStop.time}
                    onChange={handleNewStopChange}
                    fullWidth
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Button
                    variant="contained"
                    onClick={handleAddStop}
                    fullWidth
                    sx={{ height: '100%' }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Bus Stops & Student Assignments
              {routeData.stops.length > 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Drag stops to reorder. Assign students to each stop using the student selector below each stop.
                </Typography>
              )}
            </Typography>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="stops">
                {(provided) => (
                  <List {...provided.droppableProps} ref={provided.innerRef}>
                    {routeData.stops.map((stop, index) => (
                      <Draggable key={index} draggableId={`stop-${index}`} index={index}>
                        {(provided) => (
                          <Paper sx={{ mb: 2 }} elevation={2}>
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <DragHandleIcon sx={{ mr: 2 }} />
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1">
                                    {`${index + 1}. ${stop.name}`}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2">
                                      {`Address: ${stop.address}`}
                                    </Typography>
                                    <Typography variant="body2">
                                      {`Pickup Time: ${stop.time}`}
                                    </Typography>
                                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                                      {`${stop.students.length} students assigned`}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                  color="primary"
                                  onClick={() => {
                                    const element = document.getElementById(`student-select-${index}`);
                                    if (element) {
                                      element.focus();
                                    }
                                  }}
                                  title="Assign Students"
                                >
                                  <PersonAddIcon />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  onClick={() => handleRemoveStop(index)}
                                  color="error"
                                  title="Remove Stop"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </ListItem>
                            <Divider />
                            <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                              <Typography variant="subtitle2" gutterBottom color="primary">
                                Assign Students to this Stop
                              </Typography>
                              <Autocomplete
                                id={`student-select-${index}`}
                                multiple
                                options={availableStudents.concat(stop.students)}
                                value={stop.students}
                                onChange={(_, newValue) => handleAssignStudents(index, newValue)}
                                getOptionLabel={(option) => `${option.fullName}${option.grade ? ` (Grade ${option.grade})` : ''}`}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Select Students for this Stop"
                                    placeholder={stop.students.length === 0 ? "Click to assign students to this stop" : ""}
                                    size="small"
                                  />
                                )}
                                renderTags={(value, getTagProps) =>
                                  value.map((option, index) => (
                                    <Chip
                                      label={`${option.fullName}${option.grade ? ` (${option.grade})` : ''}`}
                                      {...getTagProps({ index })}
                                      size="small"
                                      color="primary"
                                    />
                                  ))
                                }
                              />
                              {stop.students.length > 0 && (
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                  Students will be picked up at {stop.time}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
            {routeData.stops.length === 0 && (
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                <Typography color="textSecondary">
                  Add bus stops above to start assigning students
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Route'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRoute; 