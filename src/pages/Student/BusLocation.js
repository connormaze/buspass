import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function BusLocation() {
  const { currentUser } = useAuth();
  const [busLocation, setBusLocation] = useState(null);
  const [busRoute, setBusRoute] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estimatedArrival, setEstimatedArrival] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchStudentInfo();
    }
  }, [currentUser]);

  useEffect(() => {
    if (studentInfo?.routeId) {
      fetchBusRoute();
    }
  }, [studentInfo]);

  useEffect(() => {
    let unsubscribe;
    if (busRoute?.busId) {
      // Subscribe to real-time bus location updates
      unsubscribe = onSnapshot(
        doc(db, 'busLocations', busRoute.busId),
        (doc) => {
          if (doc.exists()) {
            const locationData = doc.data();
            setBusLocation(locationData);
            calculateEstimatedArrival(locationData);
          }
        },
        (error) => {
          console.error('Error listening to bus location:', error);
        }
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [busRoute]);

  const fetchStudentInfo = async () => {
    try {
      const studentDoc = await getDocs(
        query(
          collection(db, 'students'),
          where('userId', '==', currentUser.uid)
        )
      );
      if (!studentDoc.empty) {
        setStudentInfo({ id: studentDoc.docs[0].id, ...studentDoc.docs[0].data() });
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
    }
  };

  const fetchBusRoute = async () => {
    try {
      const routeDoc = await getDocs(
        query(
          collection(db, 'routes'),
          where('id', '==', studentInfo.routeId)
        )
      );
      if (!routeDoc.empty) {
        setBusRoute({ id: routeDoc.docs[0].id, ...routeDoc.docs[0].data() });
      }
    } catch (error) {
      console.error('Error fetching bus route:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedArrival = (location) => {
    if (!location || !studentInfo?.stopLocation) return;

    // In a real application, you would:
    // 1. Use a mapping service API to calculate the route
    // 2. Consider traffic conditions
    // 3. Use the bus's current speed and distance to stop
    // For now, we'll simulate an estimation
    const simulatedMinutes = Math.floor(Math.random() * 15) + 1;
    const arrivalTime = new Date();
    arrivalTime.setMinutes(arrivalTime.getMinutes() + simulatedMinutes);
    setEstimatedArrival(arrivalTime);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Bus Status Card */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <BusIcon />
                </Avatar>
              }
              title={`Bus ${busRoute?.busNumber || 'Not Assigned'}`}
              subheader={busRoute?.name}
              action={
                <Chip
                  label={busLocation?.status || 'Status Unknown'}
                  color={busLocation?.status === 'ON_ROUTE' ? 'success' : 'default'}
                  size="small"
                />
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Location
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {busLocation?.address || 'Location not available'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Your Stop
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {studentInfo?.stopLocation || 'Stop not assigned'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ScheduleIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Estimated Arrival
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {estimatedArrival ? formatTime(estimatedArrival) : 'Not available'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Map Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* In a real application, integrate with a mapping service like Google Maps */}
                <Typography variant="body1" color="text.secondary">
                  Map view will be integrated here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 