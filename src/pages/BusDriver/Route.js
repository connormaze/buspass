import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  DirectionsBus as BusIcon,
  Schedule as TimeIcon,
  Navigation as NavigationIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useMaps } from '../../contexts/MapsContext';
import NavigationPanel from '../../components/NavigationPanel';

export default function BusDriverRoute() {
  const [selectedStop, setSelectedStop] = useState(0);
  const [completedStops, setCompletedStops] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busInfo, setBusInfo] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const { currentUser } = useAuth();
  const { 
    mapsLoaded, 
    googleMaps, 
    directionsRenderer,
    calculateRoute,
    resetNavigation
  } = useMaps();

  useEffect(() => {
    fetchRouteData();
  }, []);

  useEffect(() => {
    if (mapsLoaded && googleMaps && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new googleMaps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 15,
        mapTypeControl: false,
      });

      if (directionsRenderer) {
        directionsRenderer.setMap(mapInstanceRef.current);
      }
    }
  }, [mapsLoaded, googleMaps, directionsRenderer]);

  const fetchRouteData = async () => {
    try {
      setLoading(true);
      // First get the driver's assigned bus
      const busQuery = query(
        collection(db, 'buses'),
        where('driverUid', '==', currentUser.uid)
      );
      const busSnapshot = await getDocs(busQuery);
      
      if (busSnapshot.empty) {
        setError('No bus assigned to this driver');
        return;
      }

      const busData = {
        id: busSnapshot.docs[0].id,
        ...busSnapshot.docs[0].data()
      };
      setBusInfo(busData);

      // Then get the active route for this bus
      const routeQuery = query(
        collection(db, 'routes'),
        where('busId', '==', busData.id),
        where('isActive', '==', true)
      );
      const routeSnapshot = await getDocs(routeQuery);

      if (!routeSnapshot.empty) {
        const routeData = {
          id: routeSnapshot.docs[0].id,
          ...routeSnapshot.docs[0].data()
        };
        setRouteInfo(routeData);
        
        // Set completed stops from the route data
        if (routeData.completedStops) {
          setCompletedStops(routeData.completedStops);
        }
      }
      setError('');
    } catch (err) {
      console.error('Error fetching route data:', err);
      setError('Failed to load route data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStopComplete = async (stopId) => {
    if (!completedStops.includes(stopId)) {
      try {
        setLoading(true);
        const newCompletedStops = [...completedStops, stopId];
        
        // Update the route document with the new completed stop
        const routeRef = doc(db, 'routes', routeInfo.id);
        await updateDoc(routeRef, {
          completedStops: newCompletedStops,
          lastUpdated: new Date(),
        });

        setCompletedStops(newCompletedStops);
        setError('');
      } catch (err) {
        console.error('Error completing stop:', err);
        setError('Failed to mark stop as complete. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartRoute = async () => {
    try {
      setLoading(true);
      // Create a new active route for the bus
      const routeRef = doc(db, 'routes', routeInfo?.id);
      await updateDoc(routeRef, {
        isActive: true,
        startTime: new Date(),
        completedStops: [],
      });
      await fetchRouteData();
      setError('');
    } catch (err) {
      console.error('Error starting route:', err);
      setError('Failed to start route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndRoute = async () => {
    try {
      setLoading(true);
      const routeRef = doc(db, 'routes', routeInfo.id);
      await updateDoc(routeRef, {
        isActive: false,
        endTime: new Date(),
      });
      await fetchRouteData();
      setError('');
    } catch (err) {
      console.error('Error ending route:', err);
      setError('Failed to end route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startNavigation = async () => {
    if (!routeInfo?.stops || routeInfo.stops.length < 2) return;

    const stops = routeInfo.stops;
    const origin = stops[0].location;
    const destination = stops[stops.length - 1].location;
    const waypoints = stops.slice(1, -1).map(stop => ({
      location: stop.location,
      stopover: true
    }));

    const result = await calculateRoute(origin, destination, waypoints);
    if (result) {
      setIsNavigating(true);
    }
  };

  const stopNavigation = () => {
    resetNavigation();
    setIsNavigating(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusIcon sx={{ mr: 1 }} />
              <Typography variant="h5">
                {routeInfo?.name}
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              Bus Number: {busInfo?.number}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimeIcon sx={{ mr: 1 }} />
              <Typography color="text.secondary">
                Start Time: {routeInfo?.startTime ? new Date(routeInfo.startTime.seconds * 1000).toLocaleTimeString() : 'Not Started'} 
                {routeInfo?.estimatedDuration && ` • Duration: ${routeInfo.estimatedDuration}`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="contained" 
                color={routeInfo?.isActive ? 'error' : 'primary'}
                onClick={routeInfo?.isActive ? handleEndRoute : handleStartRoute}
              >
                {routeInfo?.isActive ? 'End Route' : 'Start Route'}
              </Button>
              {routeInfo?.isActive && (
                <Button
                  variant="contained"
                  color={isNavigating ? 'error' : 'primary'}
                  startIcon={<NavigationIcon />}
                  onClick={isNavigating ? stopNavigation : startNavigation}
                >
                  {isNavigating ? 'Stop Navigation' : 'Start Navigation'}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
        <Paper sx={{ flex: 1, p: 2, maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Stops ({completedStops.length}/{routeInfo?.stops?.length || 0})
          </Typography>
          <List>
            {routeInfo?.stops?.map((stop, index) => (
              <React.Fragment key={stop.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    bgcolor: selectedStop === index ? 'action.selected' : 'inherit',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemIcon>
                    {completedStops.includes(stop.id) ? (
                      <CompletedIcon color="success" />
                    ) : (
                      <PendingIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={stop.name}
                    secondary={`Scheduled: ${stop.time} • ${stop.students} students`}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={completedStops.includes(stop.id) ? 'Completed' : 'Pending'}
                      color={completedStops.includes(stop.id) ? 'success' : 'default'}
                      size="small"
                    />
                    {!completedStops.includes(stop.id) && routeInfo?.isActive && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleStopComplete(stop.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>

        <Paper sx={{ flex: 2, overflow: 'hidden' }}>
          <Box
            ref={mapRef}
            sx={{ width: '100%', height: '100%' }}
          />
        </Paper>
      </Box>

      {isNavigating && <NavigationPanel />}
    </Box>
  );
} 