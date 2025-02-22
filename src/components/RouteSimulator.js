import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  PlayArrow as SimulateIcon,
  Person as DriverIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { RouteManagementService } from '../services/RouteManagementService';
import AddRoute from './AddRoute';

const weatherConditions = [
  { value: 'CLEAR', label: 'Clear' },
  { value: 'RAIN', label: 'Rain' },
  { value: 'SNOW', label: 'Snow' },
  { value: 'FOG', label: 'Fog' },
  { value: 'STORM', label: 'Storm' }
];

const trafficConditions = [
  { value: 'LIGHT', label: 'Light' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HEAVY', label: 'Heavy' },
  { value: 'SEVERE', label: 'Severe' }
];

const driverExperience = [
  { value: 'NOVICE', label: 'Novice' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'EXPERIENCED', label: 'Experienced' },
  { value: 'EXPERT', label: 'Expert' }
];

const busTypes = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'MINI', label: 'Mini' },
  { value: 'LARGE', label: 'Large' },
  { value: 'SPECIAL_NEEDS', label: 'Special Needs' }
];

const timeOfDay = [
  { value: 'EARLY_MORNING', label: 'Early Morning' },
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
  { value: 'EVENING', label: 'Evening' }
];

export default function RouteSimulator({ schoolId }) {
  const [routeService] = useState(() => new RouteManagementService());
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [simulationConditions, setSimulationConditions] = useState({
    weather: 'CLEAR',
    trafficConditions: 'NORMAL',
    driverExperience: 'EXPERIENCED',
    busType: 'STANDARD',
    timeOfDay: 'MORNING'
  });
  const [simulationResults, setSimulationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddRoute, setShowAddRoute] = useState(false);

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

  const handleSimulate = async () => {
    if (!selectedRoute) {
      setError('Please select a route to simulate');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await routeService.simulateRoute(selectedRoute.id, simulationConditions);
      setSimulationResults(results);
    } catch (error) {
      console.error('Error simulating route:', error);
      setError('Failed to simulate route');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = () => {
    setShowAddRoute(true);
  };

  const handleCloseAddRoute = () => {
    setShowAddRoute(false);
  };

  const handleRouteAdded = async (routeId) => {
    await fetchRoutes();
    const newRoute = routes.find(r => r.id === routeId);
    if (newRoute) {
      setSelectedRoute(newRoute);
    }
  };

  const handleConditionChange = (event) => {
    const { name, value } = event.target;
    setSimulationConditions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRouteSelect = (event) => {
    const routeId = event.target.value;
    const route = routes.find(r => r.id === routeId);
    setSelectedRoute(route);
    setSimulationResults(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Route Simulator</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRoute}
          >
            Add Route
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Route</InputLabel>
              <Select
                value={selectedRoute?.id || ''}
                onChange={handleRouteSelect}
                label="Select Route"
              >
                {routes.map((route) => (
                  <MenuItem key={route.id} value={route.id}>
                    {route.name || `Route ${route.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Weather</InputLabel>
              <Select
                name="weather"
                value={simulationConditions.weather}
                onChange={handleConditionChange}
                label="Weather"
              >
                {weatherConditions.map(condition => (
                  <MenuItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Traffic Conditions</InputLabel>
              <Select
                name="trafficConditions"
                value={simulationConditions.trafficConditions}
                onChange={handleConditionChange}
                label="Traffic Conditions"
              >
                {trafficConditions.map(condition => (
                  <MenuItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Driver Experience</InputLabel>
              <Select
                name="driverExperience"
                value={simulationConditions.driverExperience}
                onChange={handleConditionChange}
                label="Driver Experience"
              >
                {driverExperience.map(level => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Bus Type</InputLabel>
              <Select
                name="busType"
                value={simulationConditions.busType}
                onChange={handleConditionChange}
                label="Bus Type"
              >
                {busTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Time of Day</InputLabel>
              <Select
                name="timeOfDay"
                value={simulationConditions.timeOfDay}
                onChange={handleConditionChange}
                label="Time of Day"
              >
                {timeOfDay.map(time => (
                  <MenuItem key={time.value} value={time.value}>
                    {time.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SimulateIcon />}
              onClick={handleSimulate}
              disabled={!selectedRoute}
              fullWidth
            >
              Simulate Route
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {simulationResults && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Simulation Results
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Estimated Duration
                  </Typography>
                  <Typography variant="h5">
                    {Math.round(simulationResults.estimatedDuration)} minutes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Risk Level
                  </Typography>
                  <Chip
                    label={simulationResults.riskLevel}
                    color={
                      simulationResults.riskLevel === 'LOW' ? 'success' :
                      simulationResults.riskLevel === 'MEDIUM' ? 'warning' : 'error'
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Reliability Score
                  </Typography>
                  <Typography variant="h5">
                    {Math.round(simulationResults.reliabilityScore)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Impact Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Weather Impact
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={simulationResults.weatherImpact}
                          size={40}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="h6">
                          {simulationResults.weatherImpact}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Traffic Impact
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={simulationResults.trafficImpact}
                          size={40}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="h6">
                          {simulationResults.trafficImpact}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Driver Efficiency
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={simulationResults.driverEfficiency}
                          size={40}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="h6">
                          {simulationResults.driverEfficiency}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Time Impact
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={simulationResults.timeImpact}
                          size={40}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="h6">
                          {simulationResults.timeImpact}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Load Impact
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={simulationResults.loadImpact}
                          size={40}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="h6">
                          {simulationResults.loadImpact}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {simulationResults.recommendations && simulationResults.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Recommendations
                </Typography>
                <List>
                  {simulationResults.recommendations.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      <AddRoute
        open={showAddRoute}
        onClose={handleCloseAddRoute}
        schoolId={schoolId}
        onRouteAdded={handleRouteAdded}
      />
    </Box>
  );
} 