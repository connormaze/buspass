import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Timeline as TrendIcon,
  Speed as SpeedIcon,
  Route as RouteIcon,
  Warning as AlertIcon,
  LocalGasStation as FuelIcon,
  AccessTime as TimeIcon,
  Person as DriverIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { DriverAnalyticsService } from '../services/DriverAnalyticsService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function TransportAnalytics({ schoolId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);
  const analyticsService = new DriverAnalyticsService();

  useEffect(() => {
    if (schoolId) {
      fetchAnalytics();
      fetchDrivers();
      fetchRoutes();
      fetchOptimizationSuggestions();
    }
  }, [schoolId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(
        collection(db, 'transportAnalytics'),
        where('schoolId', '==', schoolId)
      ));
      
      if (snapshot.docs.length > 0) {
        setAnalytics(snapshot.docs[0].data());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const driversQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('role', '==', 'DRIVER')
      );
      const snapshot = await getDocs(driversQuery);
      const driversData = await Promise.all(
        snapshot.docs.map(async doc => {
          const driverData = doc.data();
          const performance = await analyticsService.getDriverPerformance(doc.id);
          return {
            id: doc.id,
            ...driverData,
            performance
          };
        })
      );
      setDrivers(driversData);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchRoutes = useCallback(async () => {
    try {
      const routesQuery = query(
        collection(db, 'routes'),
        where('schoolId', '==', schoolId)
      );
      const snapshot = await getDocs(routesQuery);
      setRoutes(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  }, [schoolId]);

  const fetchOptimizationSuggestions = useCallback(async () => {
    try {
      const suggestions = [];

      // Analyze route efficiency
      routes.forEach(route => {
        if (route.averageDuration > route.expectedDuration * 1.2) {
          suggestions.push({
            type: 'ROUTE',
            priority: 'HIGH',
            message: `Route ${route.name} is taking 20% longer than expected. Consider route optimization.`
          });
        }
      });

      // Analyze driver performance
      drivers.forEach(driver => {
        if (driver.performance?.score < 70) {
          suggestions.push({
            type: 'DRIVER',
            priority: 'HIGH',
            message: `Driver ${driver.name} needs performance improvement. Schedule training session.`
          });
        }
      });

      setOptimizationSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating optimization suggestions:', error);
    }
  }, [routes, drivers]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    if (routes.length > 0 && drivers.length > 0) {
      fetchOptimizationSuggestions();
    }
  }, [routes, drivers, fetchOptimizationSuggestions]);

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Fleet Performance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon sx={{ mr: 1 }} />
                <Typography variant="h4">
                  {analytics?.fleetScore || 0}%
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Overall fleet efficiency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Route Optimization
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RouteIcon sx={{ mr: 1 }} />
                <Typography variant="h4">
                  {analytics?.routeEfficiency || 0}%
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Average route efficiency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Fuel Efficiency
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FuelIcon sx={{ mr: 1 }} />
                <Typography variant="h4">
                  {analytics?.fuelEfficiency || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Miles per gallon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                On-Time Performance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimeIcon sx={{ mr: 1 }} />
                <Typography variant="h4">
                  {analytics?.onTimePerformance || 0}%
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Buses arriving on schedule
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Driver Performance Table */}
      <Paper sx={{ mb: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Performance Score</TableCell>
                <TableCell>Safety Score</TableCell>
                <TableCell>On-Time %</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow
                  key={driver.id}
                  hover
                  onClick={() => setSelectedDriver(driver)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DriverIcon sx={{ mr: 1 }} />
                      {driver.name}
                    </Box>
                  </TableCell>
                  <TableCell>{driver.routeName || 'Not Assigned'}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${driver.performance?.score || 0}%`}
                      color={getPerformanceColor(driver.performance?.score)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {driver.performance?.safetyData?.totalViolations || 0} violations
                  </TableCell>
                  <TableCell>
                    {driver.performance?.routeData?.onTimePercentage || 0}%
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={driver.status || 'Inactive'}
                      color={driver.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Optimization Suggestions
          </Typography>
          <List>
            {optimizationSuggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {suggestion.type === 'ROUTE' ? <RouteIcon color="primary" /> : <DriverIcon color="primary" />}
                </ListItemIcon>
                <ListItemText
                  primary={suggestion.message}
                  secondary={`Priority: ${suggestion.priority}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Driver Detail Dialog */}
      <Dialog
        open={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Driver Performance Details
        </DialogTitle>
        <DialogContent>
          {selectedDriver && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  {selectedDriver.name}
                </Typography>
                <Typography color="textSecondary">
                  Route: {selectedDriver.routeName || 'Not Assigned'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Performance Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">
                          Overall Score
                        </Typography>
                        <Typography variant="h6">
                          {selectedDriver.performance?.score || 0}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">
                          Safety Score
                        </Typography>
                        <Typography variant="h6">
                          {100 - ((selectedDriver.performance?.safetyData?.totalViolations || 0) * 10)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">
                          On-Time
                        </Typography>
                        <Typography variant="h6">
                          {selectedDriver.performance?.routeData?.onTimePercentage || 0}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">
                          Route Efficiency
                        </Typography>
                        <Typography variant="h6">
                          {selectedDriver.performance?.routeData?.routeEfficiency || 0}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              {selectedDriver.performance?.recommendations?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recommendations
                  </Typography>
                  <List>
                    {selectedDriver.performance.recommendations.map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <AlertIcon color={rec.priority === 'HIGH' ? 'error' : 'warning'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={rec.message}
                          secondary={`Priority: ${rec.priority}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDriver(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 