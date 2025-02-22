import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Notifications as NotificationIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { BusNotificationService } from '../../services/BusNotificationService';
import { ETAService } from '../../services/ETAService';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

export default function BusTracking() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [error, setError] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [busNotificationService] = useState(() => new BusNotificationService());
  const [etaService] = useState(() => new ETAService());
  const [notificationZone, setNotificationZone] = useState(10); // minutes
  const [customZoneDialog, setCustomZoneDialog] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState('clear');
  const [etaDetails, setEtaDetails] = useState(null);

  useEffect(() => {
    fetchStudents();
    return () => {
      busNotificationService.unsubscribeAll();
    };
  }, [currentUser]);

  const fetchStudents = async () => {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        where('parentIds', 'array-contains', currentUser.uid)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    }
  };

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    if (student.routeId) {
      // Subscribe to bus updates for this student's route
      busNotificationService.subscribeToBusUpdates(
        student.routeId,
        student.id,
        student.stopLocation,
        handleBusUpdate
      );
    }
  };

  const handleBusUpdate = async (update) => {
    setBusLocation(update.location);
    
    if (selectedStudent?.stopLocation) {
      const etaPrediction = await etaService.calculatePredictiveETA(
        selectedStudent.routeId,
        update.location,
        selectedStudent.stopLocation,
        weatherCondition
      );

      if (etaPrediction) {
        setEtaDetails(etaPrediction);
        setEta(Math.round(etaPrediction.eta / 60)); // Convert seconds to minutes

        // Check notification zone
        if (notificationsEnabled && (etaPrediction.eta / 60) <= notificationZone) {
          new Notification('Bus Approaching', {
            body: `Bus will arrive at ${selectedStudent.stopName} in approximately ${Math.round(etaPrediction.eta / 60)} minutes`,
            icon: '/bus-icon.png'
          });
        }
      }
    }
  };

  const toggleNotifications = (event) => {
    setNotificationsEnabled(event.target.checked);
    // You could also store this preference in the user's settings
  };

  const formatTime = (minutes) => {
    if (minutes < 1) return 'Arriving now';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  const handleNotificationZoneChange = (event, newValue) => {
    setNotificationZone(newValue);
  };

  const formatConfidence = (confidence) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Bus Tracking</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={notificationsEnabled}
                onChange={toggleNotifications}
                color="primary"
              />
            }
            label="ETA Notifications"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ mr: 2 }}>Notify me when bus is</Typography>
          <Slider
            value={notificationZone}
            onChange={handleNotificationZoneChange}
            min={1}
            max={30}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value} min`}
            sx={{ width: 200, mr: 2 }}
            disabled={!notificationsEnabled}
          />
          <Typography>minutes away</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Your Students
            </Typography>
            <List>
              {students.map((student) => (
                <ListItem
                  key={student.id}
                  button
                  onClick={() => handleStudentSelect(student)}
                  selected={selectedStudent?.id === student.id}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <BusIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${student.firstName} ${student.lastName}`}
                    secondary={`Route: ${student.routeName || 'Not assigned'}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={8}>
            {selectedStudent && (
              <>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Bus Status
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ScheduleIcon sx={{ mr: 1 }} />
                          <Box>
                            <Typography>
                              ETA: {eta ? formatTime(eta) : 'Calculating...'}
                            </Typography>
                            {etaDetails && (
                              <Typography variant="caption" color="text.secondary">
                                Confidence: {formatConfidence(etaDetails.confidence)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ mr: 1 }} />
                          <Typography>
                            Stop: {selectedStudent.stopName || 'Loading...'}
                          </Typography>
                        </Box>
                      </Grid>
                      {etaDetails && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Factors affecting ETA:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Chip
                              label={`Traffic: ${Math.round(etaDetails.factors.timeOfDay * 100)}%`}
                              color={etaDetails.factors.timeOfDay > 1 ? 'warning' : 'success'}
                              size="small"
                            />
                            <Chip
                              label={`Weather: ${Math.round(etaDetails.factors.weather * 100)}%`}
                              color={etaDetails.factors.weather > 1 ? 'warning' : 'success'}
                              size="small"
                            />
                            <Chip
                              label={`Historical: ${Math.round(etaDetails.factors.historical * 100)}%`}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={busLocation || defaultCenter}
                    zoom={12}
                  >
                    {busLocation && (
                      <Marker
                        position={busLocation}
                        icon={{
                          url: '/bus-icon.png',
                          scaledSize: new window.google.maps.Size(32, 32),
                        }}
                      />
                    )}
                    {selectedStudent.stopLocation && (
                      <Marker
                        position={selectedStudent.stopLocation}
                        icon={{
                          url: '/bus-stop-icon.png',
                          scaledSize: new window.google.maps.Size(32, 32),
                        }}
                      />
                    )}
                  </GoogleMap>
                </LoadScript>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Custom Notification Zone Dialog */}
      <Dialog open={customZoneDialog} onClose={() => setCustomZoneDialog(false)}>
        <DialogTitle>Custom Notification Zone</DialogTitle>
        <DialogContent>
          <TextField
            label="Minutes before arrival"
            type="number"
            value={notificationZone}
            onChange={(e) => setNotificationZone(Number(e.target.value))}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomZoneDialog(false)}>Cancel</Button>
          <Button onClick={() => setCustomZoneDialog(false)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 