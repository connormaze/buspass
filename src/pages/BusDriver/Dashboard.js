import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Badge,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import {
  DirectionsBus as RouteIcon,
  PersonAdd as CheckInIcon,
  Report as IncidentIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
  Speed as SpeedIcon,
  Timeline as PerformanceIcon,
  WbSunny as WeatherIcon,
  Warning as AlertIcon,
  QrCodeScanner,
  SwapHoriz,
  ContactPhone as EmergencyIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DriverAnalyticsService } from '../../services/DriverAnalyticsService';
import { DriverManagementService } from '../../services/DriverManagementService';

// Import components
import RouteNavigation from './RouteNavigation';
import StudentCheckIn from './StudentCheckIn';
import IncidentReporting from './IncidentReporting';
import Communication from './Communication';
import WeatherAlert from '../../components/WeatherAlert';
import EmergencyContacts from '../../components/EmergencyContacts';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`driver-tabpanel-${index}`}
      aria-labelledby={`driver-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function BusDriverDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [assignedBus, setAssignedBus] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [safetyAlerts, setSafetyAlerts] = useState([]);
  const [schoolAssignments, setSchoolAssignments] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const analyticsService = new DriverAnalyticsService();
  const driverService = new DriverManagementService();

  useEffect(() => {
    if (currentUser?.uid) {
      fetchDriverDetails();
      fetchAnalytics();
      fetchWeatherAlerts();
      fetchUnreadMessages();
      fetchSchoolAssignments();
    }
  }, [currentUser]);

  const fetchSchoolAssignments = async () => {
    try {
      const schools = await driverService.getDriverSchools(currentUser.uid);
      setSchoolAssignments(schools);
      
      // If no school is selected, select the first one
      if (!selectedSchool && schools.length > 0) {
        setSelectedSchool(schools[0].schoolId);
      }
    } catch (error) {
      console.error('Error fetching school assignments:', error);
    }
  };

  const fetchDriverDetails = async () => {
    try {
      setLoading(true);
      if (!selectedSchool) return;

      // Get driver's assigned bus for the selected school
      const busQuery = query(
        collection(db, 'buses'),
        where('driverUid', '==', currentUser.uid),
        where('schoolId', '==', selectedSchool)
      );
      const busSnapshot = await getDocs(busQuery);
      
      if (!busSnapshot.empty) {
        const busData = {
          id: busSnapshot.docs[0].id,
          ...busSnapshot.docs[0].data()
        };
        setAssignedBus(busData);

        // Get current active route for this bus
        const routeQuery = query(
          collection(db, 'routes'),
          where('busId', '==', busData.id),
          where('isActive', '==', true)
        );
        const routeSnapshot = await getDocs(routeQuery);
        
        if (!routeSnapshot.empty) {
          setCurrentRoute({
            id: routeSnapshot.docs[0].id,
            ...routeSnapshot.docs[0].data()
          });
        } else {
          setCurrentRoute(null);
        }
      } else {
        setAssignedBus(null);
        setCurrentRoute(null);
      }
    } catch (error) {
      console.error('Error fetching driver details:', error);
      setError('Failed to load driver information');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      if (!selectedSchool) return;
      const performance = await analyticsService.getDriverPerformance(currentUser.uid, selectedSchool);
      setAnalytics(performance);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchWeatherAlerts = async () => {
    try {
      // Only fetch weather alerts if we have an active route
      if (!currentRoute?.id) {
        setWeatherAlerts([]);
        return;
      }

      const alertsQuery = query(
        collection(db, 'weatherAlerts'),
        where('active', '==', true),
        where('routeId', '==', currentRoute.id)
      );
      const snapshot = await getDocs(alertsQuery);
      setWeatherAlerts(snapshot.docs.map(doc => doc.data()));
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      setWeatherAlerts([]); // Set empty array on error
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientUid', '==', currentUser.uid),
        where('read', '==', false)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      setUnreadMessages(messagesSnapshot.size);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const handleSchoolChange = (schoolId) => {
    setSelectedSchool(schoolId);
    // Refetch data for the new selected school
    fetchDriverDetails();
    fetchAnalytics();
    fetchWeatherAlerts();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header Section with School Selection */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h4" gutterBottom>Driver Dashboard</Typography>
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  School Assignments
                </Typography>
                {loading ? (
                  <CircularProgress size={24} />
                ) : error ? (
                  <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
                ) : schoolAssignments.length > 0 ? (
                  <>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {schoolAssignments.map((school) => (
                        <Chip
                          key={school.schoolId}
                          label={school.schoolId}
                          onClick={() => handleSchoolChange(school.schoolId)}
                          color={selectedSchool === school.schoolId ? 'primary' : 'default'}
                          variant={selectedSchool === school.schoolId ? 'filled' : 'outlined'}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                    {schoolAssignments.length > 1 && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                        Click on a school to switch context
                      </Typography>
                    )}
                  </>
                ) : (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    No schools assigned. Please contact your administrator.
                  </Alert>
                )}
              </Paper>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Grid>

        {/* Current School Information */}
        {selectedSchool && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Current School: {selectedSchool}</Typography>
              <Alert severity="info" sx={{ mt: 1 }}>
                All information below is specific to {selectedSchool}
              </Alert>
            </Paper>
          </Grid>
        )}

        {/* Assigned Bus and Route Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Assigned Bus Information</Typography>
                {loading ? (
                  <CircularProgress size={20} />
                ) : assignedBus ? (
                  <>
                    <Typography variant="body1">
                      Bus Number: <strong>{assignedBus.busNumber}</strong>
                    </Typography>
                    <Typography variant="body1">
                      License Plate: <strong>{assignedBus.licensePlate}</strong>
                    </Typography>
                    <Typography variant="body1">
                      Status: <Chip 
                        label={currentRoute ? 'On Route' : 'Available'} 
                        color={currentRoute ? 'success' : 'primary'} 
                        size="small" 
                      />
                    </Typography>
                  </>
                ) : (
                  <Alert severity="info">No bus assigned</Alert>
                )}
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {assignedBus && !currentRoute && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RouteIcon />}
                    onClick={() => navigate('/busdriver/route')}
                    size="large"
                  >
                    Start Route
                  </Button>
                )}
                {currentRoute && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
                    <Typography variant="body1" gutterBottom>
                      Current Route: <strong>{currentRoute.name}</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<QrCodeScanner />}
                        onClick={() => setCurrentTab(1)}
                      >
                        Scan QR
                      </Button>
                      <Button
                        variant="contained"
                        color="info"
                        startIcon={<SwapHoriz />}
                        onClick={() => setCurrentTab(1)}
                      >
                        Buddy Pass
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/busdriver/route')}
                      >
                        View Route
                      </Button>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Performance Overview */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          </Grid>
        )}
        {loading ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Paper>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Performance Overview</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Overall Score
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PerformanceIcon sx={{ mr: 1 }} />
                        <Typography variant="h4" component="div">
                          {analytics?.score || 100}%
                        </Typography>
                      </Box>
                      <Chip
                        label={analytics?.score >= 90 ? 'Excellent' : analytics?.score >= 70 ? 'Good' : 'Needs Improvement'}
                        color={getPerformanceColor(analytics?.score || 100)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Route Efficiency
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RouteIcon sx={{ mr: 1 }} />
                        <Typography variant="h4" component="div">
                          {analytics?.routeData?.routeEfficiency || 100}%
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        On-time: {analytics?.routeData?.onTimePercentage || 100}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Safety Score
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SpeedIcon sx={{ mr: 1 }} />
                        <Typography variant="h4" component="div">
                          {100 - ((analytics?.safetyData?.totalViolations || 0) * 10)}%
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        Violations: {analytics?.safetyData?.totalViolations || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Weather Impact
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WeatherIcon sx={{ mr: 1 }} />
                          <Typography variant="h6" component="div">
                            {analytics?.weatherData?.currentTemp || '--'}°F
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Condition: {analytics?.weatherData?.currentCondition || 'Clear'}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="error"
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              mt: 1,
                              fontWeight: weatherAlerts?.length > 0 ? 'bold' : 'normal'
                            }}
                          >
                            <AlertIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                            {weatherAlerts?.length || 'No'} Active Alert{weatherAlerts?.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Active Alerts */}
        {(weatherAlerts.length > 0 || analytics?.recommendations?.length > 0) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Active Alerts & Recommendations
              </Typography>
              <List>
                {weatherAlerts.map((alert, index) => (
                  <ListItem key={`weather-${index}`}>
                    <ListItemIcon>
                      <WeatherIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.condition}
                      secondary={alert.recommendation}
                    />
                  </ListItem>
                ))}
                {analytics?.recommendations?.map((rec, index) => (
                  <ListItem key={`rec-${index}`}>
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
            </Paper>
          </Grid>
        )}

        {/* Main Navigation Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<RouteIcon />} label="Navigation" />
              <Tab icon={<CheckInIcon />} label="Check-In" />
              <Tab icon={<IncidentIcon />} label="Incidents" />
              <Tab icon={<EmergencyIcon />} label="Emergency Contacts" />
              <Tab
                icon={
                  <Badge badgeContent={unreadMessages} color="error">
                    <MessageIcon />
                  </Badge>
                }
                label="Messages"
              />
            </Tabs>
          </Paper>

          <TabPanel value={currentTab} index={0}>
            <RouteNavigation
              bus={assignedBus}
              route={currentRoute}
              weatherAlerts={weatherAlerts}
              onRouteComplete={fetchDriverDetails}
            />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <StudentCheckIn
              bus={assignedBus}
              route={currentRoute}
              onCheckInComplete={fetchDriverDetails}
            />
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <IncidentReporting
              bus={assignedBus}
              route={currentRoute}
              onIncidentReported={fetchDriverDetails}
            />
          </TabPanel>
          <TabPanel value={currentTab} index={3}>
            {currentRoute?.students ? (
              <Grid container spacing={3}>
                {currentRoute.students.map((student) => (
                  <Grid item xs={12} md={6} key={student.id}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {student.firstName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {student.firstName} {student.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Stop: {student.stopName}
                          </Typography>
                        </Box>
                      </Box>
                      <EmergencyContacts 
                        studentId={student.id}
                        schoolId={currentUser.schoolId}
                        readOnly={true}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                No active route or students assigned. Start a route to view student emergency contacts.
              </Alert>
            )}
          </TabPanel>
          <TabPanel value={currentTab} index={4}>
            <Communication
              onMessageRead={fetchUnreadMessages}
            />
          </TabPanel>
        </Grid>
      </Grid>
    </Box>
  );
} 