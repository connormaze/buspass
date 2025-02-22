import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Alert,
  Container,
  Button,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Group as UsersIcon,
  DirectionsBus as BusIcon,
  Analytics as AnalyticsIcon,
  Message as MessageIcon,
  Map as MapIcon,
  Logout as LogoutIcon,
  CarRental as CarpoolIcon,
  Warning as IncidentIcon,
  Extension as IntegrationIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DriverManagementService } from '../../services/DriverManagementService';

// Import components (to be created)
import SchoolManagement from './SchoolManagement';
import UserManagement from './UserManagement';
import TransportManagement from './TransportManagement';
import Analytics from './Analytics';
import Communication from './Communication';
import BusLocationTracker from '../../components/BusLocationTracker';
import CarpoolManagement from './CarpoolManagement';
import Incidents from './Incidents';
import Integrations from './Integrations';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
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

export default function SchoolAdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schoolData, setSchoolData] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalBuses: 0,
    totalRoutes: 0,
    totalIncidents: 0,
    activeIncidents: 0,
  });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [multiSchoolDrivers, setMultiSchoolDrivers] = useState([]);
  const driverService = new DriverManagementService();

  useEffect(() => {
    if (currentUser?.schoolId) {
      fetchSchoolData();
      fetchStats();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchUnreadMessages();
    }
  }, [currentUser]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      const schoolDoc = await getDoc(doc(db, 'schools', currentUser.schoolId));
      if (schoolDoc.exists()) {
        setSchoolData({ id: schoolDoc.id, ...schoolDoc.data() });
      }
      setError('');
    } catch (err) {
      console.error('Error fetching school data:', err);
      setError('Failed to load school data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch students count
      const studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', currentUser.schoolId),
        where('role', '==', 'STUDENT')
      );
      const studentsSnapshot = await getDocs(studentsQuery);

      // Fetch teachers count
      const teachersQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', currentUser.schoolId),
        where('role', '==', 'TEACHER')
      );
      const teachersSnapshot = await getDocs(teachersQuery);

      // Fetch buses count
      const busesQuery = query(
        collection(db, 'buses'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const busesSnapshot = await getDocs(busesQuery);

      // Fetch routes count
      const routesQuery = query(
        collection(db, 'routes'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const routesSnapshot = await getDocs(routesQuery);

      // Fetch incidents count
      const incidentsQuery = query(
        collection(db, 'incidents'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const incidentsSnapshot = await getDocs(incidentsQuery);

      // Fetch active incidents count
      const activeIncidentsQuery = query(
        collection(db, 'incidents'),
        where('schoolId', '==', currentUser.schoolId),
        where('status', 'in', ['OPEN', 'IN_PROGRESS'])
      );
      const activeIncidentsSnapshot = await getDocs(activeIncidentsQuery);

      // Fetch drivers with multiple school associations
      const driversData = await driverService.getSchoolDrivers(currentUser.schoolId);
      const driversWithSchools = await Promise.all(
        driversData.map(async (driver) => {
          const schools = await driverService.getDriverSchools(driver.id);
          return {
            ...driver,
            schools: schools.map(s => s.schoolId)
          };
        })
      );
      const multiSchoolDriversList = driversWithSchools.filter(driver => driver.schools.length > 1);

      setStats({
        totalStudents: studentsSnapshot.size,
        totalTeachers: teachersSnapshot.size,
        totalBuses: busesSnapshot.size,
        totalRoutes: routesSnapshot.size,
        totalIncidents: incidentsSnapshot.size,
        activeIncidents: activeIncidentsSnapshot.size,
      });
      setMultiSchoolDrivers(multiSchoolDriversList);
      setError('');
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      if (!currentUser?.uid) return;
      
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
      setError('Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          School Admin Dashboard
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          School Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            {schoolData?.name || 'School Name Not Available'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Students
              </Typography>
              <Typography variant="h6">{stats.totalStudents}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Teachers
              </Typography>
              <Typography variant="h6">{stats.totalTeachers}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Buses
              </Typography>
              <Typography variant="h6">{stats.totalBuses}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Routes
              </Typography>
              <Typography variant="h6">{stats.totalRoutes}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Incidents
              </Typography>
              <Typography variant="h6">
                {stats.activeIncidents}/{stats.totalIncidents}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Multi-School Drivers
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : multiSchoolDrivers.length > 0 ? (
          <Grid container spacing={2}>
            {multiSchoolDrivers.map((driver) => (
              <Grid item xs={12} sm={6} md={4} key={driver.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {driver.firstName} {driver.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      License: {driver.licenseNumber}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {driver.schools.map((schoolId) => (
                        <Chip
                          key={schoolId}
                          label={schoolId === currentUser.schoolId ? 'Current School' : 'Other School'}
                          color={schoolId === currentUser.schoolId ? 'primary' : 'default'}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            No drivers are currently assigned to multiple schools. When drivers are assigned to multiple schools, they will appear here.
          </Alert>
        )}
      </Paper>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<SchoolIcon />} label="School" />
          <Tab icon={<UsersIcon />} label="Users" />
          <Tab icon={<BusIcon />} label="Transport" />
          <Tab 
            icon={
              <Badge badgeContent={unreadMessages} color="error">
                <MessageIcon />
              </Badge>
            } 
            label="Messages" 
          />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
          <Tab icon={<MapIcon />} label="Live Tracking" />
          <Tab icon={<CarpoolIcon />} label="Carpool" />
          <Tab icon={<IncidentIcon />} label="Incidents" />
          <Tab icon={<IntegrationIcon />} label="Integrations" />
        </Tabs>
      </Paper>

      <TabPanel value={currentTab} index={0}>
        <SchoolManagement 
          schoolData={schoolData} 
          onUpdate={fetchSchoolData}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <UserManagement 
          schoolId={schoolData?.id}
          onUpdate={fetchStats}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <TransportManagement 
          schoolId={schoolData?.id}
          onUpdate={fetchStats}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <Communication 
          schoolId={schoolData?.id}
          onMessageRead={fetchUnreadMessages}
          onMessageSent={fetchUnreadMessages}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={4}>
        <Analytics 
          schoolId={schoolData?.id}
          stats={stats}
          onUpdate={fetchStats}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={5}>
        <BusLocationTracker 
          schoolId={schoolData?.id}
          onUpdate={fetchStats}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={6}>
        <CarpoolManagement 
          schoolId={schoolData?.id}
          onUpdate={fetchStats}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={7}>
        <Incidents 
          schoolId={schoolData?.id}
          onUpdate={fetchStats}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={8}>
        <Integrations 
          schoolId={schoolData?.id}
          onUpdate={fetchStats}
        />
      </TabPanel>
    </Container>
  );
} 