import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { collection, query, where, onSnapshot, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import MapWrapper from './MapWrapper';
import { useMaps } from '../contexts/MapsContext';
import { getDistance } from 'geolib';

const ROUTE_DEVIATION_THRESHOLD = 500; // meters
const SPEED_LIMIT = 45; // mph

const checkRouteDeviation = (currentLocation, routePath) => {
  // Find the nearest point on the route
  const nearestPoint = routePath.reduce((nearest, point) => {
    const distance = getDistance(
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      { latitude: point.lat, longitude: point.lng }
    );
    return distance < nearest.distance ? { point, distance } : nearest;
  }, { point: null, distance: Infinity });

  return nearestPoint.distance > ROUTE_DEVIATION_THRESHOLD;
};

const checkSpeedLimit = (speed) => {
  return speed > SPEED_LIMIT;
};

export default function BusTracking({ students, onETAUpdate }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [busLocations, setBusLocations] = useState({});
  const [etaUpdates, setEtaUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { googleMaps } = useMaps();
  const distanceMatrixService = useRef(null);

  // Initialize map and services
  useEffect(() => {
    if (!mapRef.current || !googleMaps) return;

    const newMap = new googleMaps.maps.Map(mapRef.current, {
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    distanceMatrixService.current = new googleMaps.maps.DistanceMatrixService();
    setMap(newMap);
  }, [mapRef, googleMaps]);

  // Calculate ETA for each student's stop
  const calculateETA = useCallback(async () => {
    if (!distanceMatrixService.current) return;

    for (const student of students) {
      if (!student.transportInfo?.routeInfo?.stopLocation) continue;
      
      const busLocation = busLocations[student.transportInfo.routeInfo.routeId];
      if (!busLocation) continue;

      await calculateETAForStudent(busLocation, student);
    }
  }, [students, busLocations, calculateETAForStudent]);

  const calculateETAForStudent = useCallback(async (busLocation, student) => {
    if (!distanceMatrixService.current || !student.transportInfo?.routeInfo?.stopLocation) return;

    try {
      const result = await distanceMatrixService.current.getDistanceMatrix({
        origins: [{ lat: busLocation.latitude, lng: busLocation.longitude }],
        destinations: [{
          lat: student.transportInfo.routeInfo.stopLocation.latitude,
          lng: student.transportInfo.routeInfo.stopLocation.longitude
        }],
        travelMode: 'DRIVING',
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'bestGuess'
        }
      });

      if (result.rows[0]?.elements[0]?.duration_in_traffic) {
        const duration = result.rows[0].elements[0].duration_in_traffic.value;
        const eta = new Date(Date.now() + duration * 1000);
        
        setEtaUpdates(prev => {
          const newUpdates = {
            ...prev,
            [student.id]: {
              eta,
              duration: result.rows[0].elements[0].duration_in_traffic.text,
              durationSeconds: duration
            }
          };
          
          if (onETAUpdate) {
            onETAUpdate({
              eta,
              duration,
              stopName: student.transportInfo.routeInfo.stopName,
              routeName: student.transportInfo.routeInfo.name
            });
          }

          return newUpdates;
        });

        // Request permission for notifications if not granted
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }

        // Send notification for important time thresholds
        if (Notification.permission === 'granted') {
          const minutes = Math.round(duration / 60);
          if ([20, 10, 5].includes(minutes)) {
            new Notification('Bus Arrival Update', {
              body: `Your bus will arrive at ${student.transportInfo.routeInfo.stopName} in approximately ${minutes} minutes`,
              icon: '/bus-icon.png'
            });
          }
        }
      }
    } catch (err) {
      console.error('Error calculating ETA:', err);
    }
  }, [onETAUpdate]);

  // Set up bus location listeners and ETA calculations
  useEffect(() => {
    if (!students?.length) return;

    console.log('Setting up bus tracking for students:', students);

    const unsubscribes = [];
    const busRouteIds = students
      .filter(s => s.transportInfo?.method === 'BUS' && s.transportInfo?.routeInfo?.routeId)
      .map(s => s.transportInfo.routeInfo.routeId);

    console.log('Found bus route IDs:', busRouteIds);

    if (busRouteIds.length === 0) {
      setLoading(false);
      return;
    }

    // First, check if routes exist
    const checkRoutes = async () => {
      try {
        const routesQuery = query(
          collection(db, 'routes'),
          where('isActive', '==', true)
        );
        const routesSnapshot = await getDocs(routesQuery);
        console.log('Active routes:', routesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error checking routes:', err);
      }
    };
    checkRoutes();

    busRouteIds.forEach(routeId => {
      console.log('Setting up listener for route:', routeId);
      
      const unsubscribe = onSnapshot(
        doc(db, 'busLocations', routeId),
        (doc) => {
          console.log(`Bus location update for route ${routeId}:`, doc.data());
          if (doc.exists()) {
            const locationData = doc.data();
            setBusLocations(prev => ({
              ...prev,
              [routeId]: locationData
            }));

            // Update weather data for the bus location
            updateWeatherData(routeId, locationData);

            // Calculate ETA for each student on this route
            students
              .filter(s => s.transportInfo?.routeInfo?.routeId === routeId)
              .forEach(student => calculateETA(locationData, student));
          }
        },
        (err) => {
          console.error(`Error tracking bus for route ${routeId}:`, err);
          setError('Failed to track bus location');
        }
      );
      unsubscribes.push(unsubscribe);
    });

    setLoading(false);
    return () => {
      console.log('Cleaning up bus tracking listeners');
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [students]);

  // Update markers when bus locations change
  useEffect(() => {
    if (!map || !googleMaps) return;
    
    console.log('Updating map markers with bus locations:', busLocations);

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = [];

    // Create new markers
    Object.entries(busLocations).forEach(([routeId, location]) => {
      if (!location.latitude || !location.longitude) {
        console.log(`Invalid location data for route ${routeId}:`, location);
        return;
      }

      // Check for route deviation
      if (location.routePath && checkRouteDeviation({ latitude: location.latitude, longitude: location.longitude }, location.routePath)) {
        console.warn(`Bus ${routeId} has deviated from its route`);
        // Send notification
        if (Notification.permission === 'granted') {
          new Notification('Route Deviation Alert', {
            body: `Bus on route ${routeId} has deviated from its designated path`,
            icon: '/warning-icon.png'
          });
        }
      }

      // Check speed limit
      if (checkSpeedLimit(location.speed)) {
        console.warn(`Bus ${routeId} exceeding speed limit`);
        // Send notification
        if (Notification.permission === 'granted') {
          new Notification('Speed Alert', {
            body: `Bus on route ${routeId} is exceeding the speed limit`,
            icon: '/warning-icon.png'
          });
        }
      }

      const marker = new googleMaps.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        icon: {
          path: googleMaps.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: checkRouteDeviation({ latitude: location.latitude, longitude: location.longitude }, location.routePath) ? '#ff0000' : '#1976d2',
          fillOpacity: 1,
          strokeWeight: 2,
          rotation: location.heading || 0
        },
        title: `Bus Route ${routeId}`
      });

      // Enhanced info window with safety metrics
      const infoWindow = new googleMaps.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3>Bus Route ${routeId}</h3>
            <p>Speed: ${Math.round(location.speed || 0)} mph</p>
            <p>Status: ${checkRouteDeviation({ latitude: location.latitude, longitude: location.longitude }, location.routePath) ? 'OFF ROUTE' : 'ON ROUTE'}</p>
            <p>Last Updated: ${new Date(location.timestamp).toLocaleTimeString()}</p>
            ${location.speed > SPEED_LIMIT ? '<p style="color: red;">⚠️ Exceeding Speed Limit</p>' : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
      
      // Center map on first marker
      if (newMarkers.length === 1) {
        map.setCenter({ lat: location.latitude, lng: location.longitude });
        map.setZoom(14);
      }
    });

    setMarkers(newMarkers);
  }, [map, busLocations, googleMaps, markers, checkRouteDeviation]);

  useEffect(() => {
    calculateETA();
  }, [calculateETA]);

  useEffect(() => {
    if (!map || !markers) return;
    markers.forEach(marker => {
      // Update marker properties
    });
  }, [map, markers]);

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Add this new function to update weather data
  const updateWeatherData = async (routeId, locationData) => {
    try {
      // Get weather data for the current location
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${locationData.latitude}&lon=${locationData.longitude}&units=imperial&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
      );
      const weatherData = await response.json();

      // Update the currentWeather document in Firestore
      await setDoc(doc(db, 'currentWeather', routeId), {
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude
        },
        timestamp: new Date(),
        routeId
      });
    } catch (error) {
      console.error('Error updating weather data:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Bus Tracking
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Bus Routes
            </Typography>
            <List>
              {students
                .filter(student => student.transportInfo?.method === 'BUS')
                .map((student) => (
                  <ListItem key={student.id}>
                    <ListItemIcon>
                      <BusIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={student.transportInfo.routeInfo.name}
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationIcon sx={{ mr: 1, fontSize: 'small' }} color="action" />
                            <Typography variant="body2">
                              Stop: {student.transportInfo.routeInfo.stopName}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ScheduleIcon sx={{ mr: 1, fontSize: 'small' }} color="action" />
                            <Typography variant="body2">
                              Scheduled: {formatTime(student.transportInfo.routeInfo.pickupTime)}
                            </Typography>
                          </Box>
                          {etaUpdates[student.id] && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TimerIcon sx={{ mr: 1, fontSize: 'small' }} color="action" />
                              <Typography variant="body2" color="primary">
                                ETA: {formatTime(etaUpdates[student.id].eta)} ({etaUpdates[student.id].duration})
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    {busLocations[student.transportInfo.routeInfo.routeId] && (
                      <Chip
                        label="Live"
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </ListItem>
                ))}
              {!students.some(s => s.transportInfo?.method === 'BUS') && (
                <ListItem>
                  <ListItemText primary="No bus routes found" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: 400, position: 'relative' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box ref={mapRef} sx={{ height: '100%' }} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 