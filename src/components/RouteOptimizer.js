import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
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
  MenuItem,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { RouteManagementService } from '../services/RouteManagementService';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import AddRoute from './AddRoute';

const eventTypes = [
  { value: 'SPORTS_EVENT', label: 'Sports Event' },
  { value: 'ASSEMBLY', label: 'Assembly' },
  { value: 'EARLY_DISMISSAL', label: 'Early Dismissal' },
  { value: 'WEATHER_DELAY', label: 'Weather Delay' }
];

export default function RouteOptimizer({ schoolId }) {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [routeService] = useState(() => new RouteManagementService());
  const [error, setError] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [eventForm, setEventForm] = useState({
    type: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedRoutes = await routeService.getActiveRoutes(schoolId);
      setRoutes(fetchedRoutes);
      setError(null);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, [schoolId, routeService]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleOptimizeRoute = async (route) => {
    try {
      setLoading(true);
      const optimizedRouteId = await routeService.optimizeRoute({
        ...route,
        schoolId
      });
      await fetchRoutes();
      setError(null);
    } catch (err) {
      console.error('Error optimizing route:', err);
      setError('Failed to optimize route');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpecialEvent = async () => {
    try {
      if (!selectedRoute) return;
      setLoading(true);

      await routeService.createSpecialEventRoute({
        event: eventForm,
        baseRouteId: selectedRoute.id
      });

      setOpenEventDialog(false);
      setEventForm({
        type: '',
        startTime: '',
        endTime: '',
        description: ''
      });
      await fetchRoutes();
      setError(null);
    } catch (err) {
      console.error('Error creating special event route:', err);
      setError('Failed to create special event route');
    } finally {
      setLoading(false);
    }
  };

  const calculateAndDisplayRoute = async (route) => {
    if (!route?.stops?.length) return;

    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = route.stops.map(stop => ({
      location: new window.google.maps.LatLng(
        stop.location.latitude,
        stop.location.longitude
      ),
      stopover: true
    }));

    try {
      const result = await directionsService.route({
        origin: route.startLocation,
        destination: route.endLocation,
        waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING
      });

      setDirections(result);
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Failed to display route');
    }
  };

  const handleAddRoute = () => {
    setShowAddRoute(true);
  };

  const handleRouteAdded = async () => {
    await fetchRoutes();
    setShowAddRoute(false);
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Route Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRoute}
        >
          Add Route
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper>
            <List>
              {routes.map((route) => (
                <ListItem
                  key={route.id}
                  button
                  onClick={() => {
                    setSelectedRoute(route);
                    calculateAndDisplayRoute(route);
                  }}
                  selected={selectedRoute?.id === route.id}
                >
                  <ListItemText
                    primary={route.name}
                    secondary={
                      <>
                        {route.isSpecialEvent && (
                          <Chip
                            label="Special Event"
                            color="secondary"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        )}
                        {`${route.stops?.length || 0} stops`}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptimizeRoute(route);
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoute(route);
                        setOpenEventDialog(true);
                      }}
                    >
                      <EventIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '500px' }}>
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={selectedRoute?.startLocation || { lat: 0, lng: 0 }}
                zoom={12}
              >
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#1976d2',
                        strokeWeight: 5
                      }
                    }}
                  />
                )}
                {selectedRoute?.stops?.map((stop, index) => (
                  <Marker
                    key={index}
                    position={{
                      lat: stop.location.latitude,
                      lng: stop.location.longitude
                    }}
                    label={`${index + 1}`}
                  />
                ))}
              </GoogleMap>
            </LoadScript>
          </Paper>
        </Grid>
      </Grid>

      {/* Special Event Dialog */}
      <Dialog
        open={openEventDialog}
        onClose={() => setOpenEventDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Special Event Route</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Event Type"
                value={eventForm.type}
                onChange={(e) =>
                  setEventForm({ ...eventForm, type: e.target.value })
                }
              >
                {eventTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                value={eventForm.startTime}
                onChange={(e) =>
                  setEventForm({ ...eventForm, startTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="datetime-local"
                value={eventForm.endTime}
                onChange={(e) =>
                  setEventForm({ ...eventForm, endTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm({ ...eventForm, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateSpecialEvent} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Route Dialog */}
      <AddRoute
        open={showAddRoute}
        onClose={() => setShowAddRoute(false)}
        onRouteAdded={handleRouteAdded}
        schoolId={schoolId}
      />
    </Box>
  );
} 