import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 37.7749, // Default to San Francisco
  lng: -122.4194,
};

const BUS_STATUS = {
  ON_ROUTE: { label: 'On Route', color: 'success' },
  DELAYED: { label: 'Delayed', color: 'warning' },
  STOPPED: { label: 'Stopped', color: 'error' },
  COMPLETED: { label: 'Completed', color: 'default' },
};

export default function BusLocationTracker({ schoolId, routeId }) {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoutes = useCallback(async () => {
    if (!schoolId) return;
    
    try {
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
      setError('Failed to load routes');
    }
  }, [schoolId]);

  const subscribeToLocations = useCallback(() => {
    if (!schoolId) return () => {};
    
    try {
      const busLocationsQuery = query(
        collection(db, 'busLocations'),
        where('schoolId', '==', schoolId)
      );

      return onSnapshot(busLocationsQuery, (snapshot) => {
        const busLocations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBuses(busLocations);
        setLoading(false);

        // Update map center to first active bus location
        const activeBus = busLocations.find(bus => bus.status === 'ON_ROUTE');
        if (activeBus && activeBus.location) {
          setCenter({
            lat: activeBus.location.lat,
            lng: activeBus.location.lng,
          });
        }
      }, (error) => {
        console.error('Error subscribing to bus locations:', error);
        setError('Failed to get real-time updates');
        setLoading(false);
      });
    } catch (error) {
      console.error('Error setting up location subscription:', error);
      setError('Failed to initialize tracking');
      setLoading(false);
      return () => {};
    }
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) {
      fetchRoutes();
      const unsubscribe = subscribeToLocations();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [schoolId, fetchRoutes, subscribeToLocations]);

  const getRouteName = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const calculateEstimatedArrival = (bus) => {
    if (!bus.location || !bus.route || !bus.route.stops) return 'N/A';

    // In a real application, you would:
    // 1. Use a routing service to calculate actual route distance
    // 2. Consider traffic conditions
    // 3. Use historical data for more accurate predictions
    // For now, we'll return a simulated time
    return '10-15 minutes';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Live Bus Tracking
            </Typography>
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={12}
              >
                {buses.map((bus) => (
                  <Marker
                    key={bus.id}
                    position={{
                      lat: bus.location?.lat || defaultCenter.lat,
                      lng: bus.location?.lng || defaultCenter.lng,
                    }}
                    onClick={() => setSelectedBus(bus)}
                    icon={{
                      url: '/bus-icon.png', // Add a custom bus icon
                      scaledSize: new window.google.maps.Size(32, 32),
                    }}
                  />
                ))}

                {selectedBus && (
                  <InfoWindow
                    position={{
                      lat: selectedBus.location?.lat || defaultCenter.lat,
                      lng: selectedBus.location?.lng || defaultCenter.lng,
                    }}
                    onCloseClick={() => setSelectedBus(null)}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        Bus #{selectedBus.busNumber}
                      </Typography>
                      <Typography variant="body2">
                        Route: {getRouteName(selectedBus.routeId)}
                      </Typography>
                      <Typography variant="body2">
                        Status: {BUS_STATUS[selectedBus.status].label}
                      </Typography>
                      <Typography variant="body2">
                        Speed: {selectedBus.speed || 0} mph
                      </Typography>
                    </Box>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Buses
            </Typography>
            <List>
              {buses.map((bus) => (
                <ListItem
                  key={bus.id}
                  button
                  onClick={() => {
                    setSelectedBus(bus);
                    if (bus.location) {
                      setCenter({
                        lat: bus.location.lat,
                        lng: bus.location.lng,
                      });
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <BusIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          Bus #{bus.busNumber}
                        </Typography>
                        <Chip
                          label={BUS_STATUS[bus.status].label}
                          color={BUS_STATUS[bus.status].color}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2">
                          Route: {getRouteName(bus.routeId)}
                        </Typography>
                        <Typography variant="body2">
                          Next Stop: {bus.nextStop || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          ETA: {calculateEstimatedArrival(bus)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Route Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Buses
                  </Typography>
                  <Typography variant="h4">
                    {buses.filter(b => b.status === 'ON_ROUTE').length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Routes
                  </Typography>
                  <Typography variant="h4">
                    {routes.length}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 