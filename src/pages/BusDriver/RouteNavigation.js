import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  CircularProgress,
  Grid,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  LocationOn,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  Navigation as NavigationIcon,
} from '@mui/icons-material';
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
  InfoWindow,
} from '@react-google-maps/api';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

const libraries = ['places', 'directions'];

export default function RouteNavigation({ bus, route }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [completedStops, setCompletedStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [nextStopIndex, setNextStopIndex] = useState(0);
  const [navigationActive, setNavigationActive] = useState(false);

  const updateBusLocation = useCallback(async (location) => {
    if (bus) {
      try {
        const busRef = doc(db, 'buses', bus.id);
        await updateDoc(busRef, {
          lastLocation: location,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error updating bus location:', error);
      }
    }
  }, [bus]);

  // Start location tracking
  useEffect(() => {
    if (route && route.isActive) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString(),
          };
          setCurrentLocation(location);
          updateBusLocation(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
      setWatchId(id);
      setLoading(false);

      return () => {
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    } else {
      setLoading(false);
    }
  }, [route, updateBusLocation, watchId]);

  const handleStopComplete = async (stopIndex) => {
    if (!completedStops.includes(stopIndex)) {
      try {
        const newCompletedStops = [...completedStops, stopIndex];
        setCompletedStops(newCompletedStops);

        // Update route progress in Firestore
        if (route) {
          const routeRef = doc(db, 'routes', route.id);
          await updateDoc(routeRef, {
            completedStops: newCompletedStops,
          });
        }
      } catch (error) {
        console.error('Error updating stop status:', error);
      }
    }
  };

  const calculateProgress = () => {
    if (!route || !route.stops) return 0;
    return (completedStops.length / route.stops.length) * 100;
  };

  const getNextUncompletedStop = () => {
    if (!route || !route.stops) return null;
    const nextIndex = route.stops.findIndex((_, index) => !completedStops.includes(index));
    return nextIndex >= 0 ? route.stops[nextIndex] : null;
  };

  const calculateRoute = useCallback(() => {
    if (!currentLocation || !navigationActive || !window.google) return;
    
    const nextStop = getNextUncompletedStop();
    if (!nextStop) {
      setDirections(null);
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: currentLocation,
        destination: { lat: nextStop.lat, lng: nextStop.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          // Update active step based on current location in route
          if (result.routes[0] && result.routes[0].legs[0]) {
            const steps = result.routes[0].legs[0].steps;
            setActiveStep(0); // Reset to start of new directions
          }
        } else {
          console.error('Error fetching directions:', status);
        }
      }
    );
  }, [currentLocation, navigationActive, route, completedStops]);

  useEffect(() => {
    if (navigationActive) {
      calculateRoute();
    }
  }, [calculateRoute, navigationActive, currentLocation]);

  const toggleNavigation = () => {
    setNavigationActive(!navigationActive);
    if (!navigationActive) {
      calculateRoute();
    } else {
      setDirections(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!route) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6">No active route</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Route Progress</Typography>
              <Button
                variant="contained"
                color={navigationActive ? "success" : "primary"}
                startIcon={<NavigationIcon />}
                onClick={toggleNavigation}
              >
                {navigationActive ? "Navigation Active" : "Start Navigation"}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CircularProgress
                variant="determinate"
                value={calculateProgress()}
                sx={{ mr: 2 }}
              />
              <Typography variant="body1">
                {`${Math.round(calculateProgress())}% Complete`}
              </Typography>
            </Box>
          </Paper>

          {navigationActive && directions && directions.routes[0] && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Navigation Steps
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {directions.routes[0].legs[0].steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel>
                      <Typography variant="body2" dangerouslySetInnerHTML={{ __html: step.instructions }} />
                      <Typography variant="caption" color="textSecondary">
                        {step.distance.text} • {step.duration.text}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          )}

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Stops
            </Typography>
            <List>
              {route.stops.map((stop, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: selectedStop === index ? 'action.selected' : 'inherit',
                  }}
                >
                  <ListItemIcon>
                    {completedStops.includes(index) ? (
                      <CompletedIcon color="success" />
                    ) : (
                      <PendingIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={stop.name}
                    secondary={`Scheduled: ${stop.time}`}
                  />
                  {!completedStops.includes(index) && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleStopComplete(index)}
                    >
                      Complete
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper>
            <LoadScript 
              googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
              libraries={libraries}
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={currentLocation || defaultCenter}
                zoom={13}
              >
                {currentLocation && !navigationActive && (
                  <Marker
                    position={currentLocation}
                    icon={{
                      path: 'M20 12c0-4.42-3.58-8-8-8s-8 3.58-8 8 3.58 8 8 8 8-3.58 8-8zM8.5 8C9.33 8 10 8.67 10 9.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zM12 18c-3.31 0-6-2.69-6-6h12c0 3.31-2.69 6-6 6zm3.5-9c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z',
                      fillColor: '#4285F4',
                      fillOpacity: 1,
                      strokeWeight: 1,
                      strokeColor: '#ffffff',
                      scale: 2,
                    }}
                  />
                )}

                {!navigationActive && route.stops.map((stop, index) => (
                  <Marker
                    key={index}
                    position={{ lat: stop.lat, lng: stop.lng }}
                    label={(index + 1).toString()}
                    onClick={() => setSelectedStop(index)}
                    icon={{
                      url: completedStops.includes(index)
                        ? '/completed-stop-icon.png'
                        : '/pending-stop-icon.png',
                    }}
                  >
                    {selectedStop === index && (
                      <InfoWindow onCloseClick={() => setSelectedStop(null)}>
                        <div>
                          <Typography variant="subtitle1">{stop.name}</Typography>
                          <Typography variant="body2">
                            Scheduled: {stop.time}
                          </Typography>
                          <Typography variant="body2">
                            Status: {completedStops.includes(index) ? 'Completed' : 'Pending'}
                          </Typography>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                ))}

                {navigationActive && directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: false,
                      polylineOptions: {
                        strokeColor: '#4285F4',
                        strokeWeight: 5,
                        strokeOpacity: 0.8,
                      },
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 