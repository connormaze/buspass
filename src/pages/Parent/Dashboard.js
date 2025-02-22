import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  DirectionsBus as BusIcon,
  DirectionsWalk as WalkIcon,
  DirectionsCar as CarIcon,
  People as DelegateIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ContactPhone as EmergencyIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PickupNotificationService } from '../../services/PickupNotificationService';

// Import components
import StudentQR from './StudentQR';
import BusTracking from './BusTracking';
import PickupDelegation from './PickupDelegation';
import Communication from './Communication';
import BuddyPassRequest from '../../components/BuddyPassRequest';
import EmergencyContacts from '../../components/EmergencyContacts';

const TRANSPORT_METHODS = {
  BUS: 'Bus Rider',
  CARPOOL: 'Carpool',
  WALKER: 'Walker',
  PARENT: 'Parent Drop-off'
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`parent-tabpanel-${index}`}
      aria-labelledby={`parent-tab-${index}`}
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

// Add new component for pickup status
const PickupStatus = ({ student }) => {
  const [pickupStatus, setPickupStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) {
      console.log('No student provided to PickupStatus');
      return;
    }

    console.log('Setting up pickup status listener for student:', student.id);

    // Subscribe to pickup status updates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pickupsQuery = query(
      collection(db, 'pickups'),
      where('studentId', '==', student.id),
      where('timestamp', '>=', today)
    );

    console.log('Pickup query params:', {
      studentId: student.id,
      timestamp: today
    });

    const unsubscribe = onSnapshot(pickupsQuery, (snapshot) => {
      console.log('Pickup snapshot received:', snapshot.size, 'documents');
      if (!snapshot.empty) {
        const pickupData = snapshot.docs[0].data();
        console.log('Pickup data:', pickupData);
        setPickupStatus(pickupData);
      } else {
        console.log('No pickup data found for today');
        setPickupStatus(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error in pickup listener:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [student]);

  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (!pickupStatus) {
    console.log('Rendering awaiting pickup status');
    return (
      <Chip
        icon={<AccessTimeIcon />}
        label="Awaiting Pickup"
        color="warning"
        variant="outlined"
      />
    );
  }

  console.log('Rendering pickup completed status');
  return (
    <Chip
      icon={<CheckCircleIcon />}
      label={`Picked up at ${new Date(pickupStatus.timestamp.toDate()).toLocaleTimeString()}`}
      color="success"
      variant="outlined"
    />
  );
};

export default function ParentDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [transportDialogOpen, setTransportDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [transportForm, setTransportForm] = useState({
    method: '',
    routeId: '',
    stopId: '',
    carpoolInfo: {
      driverName: '',
      vehicleInfo: '',
      pickupTime: '',
      dropoffTime: '',
    },
    parentInfo: {
      name: '',
      phone: '',
      pickupTime: '',
      dropoffTime: '',
    }
  });
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [pickupNotificationService] = useState(() => new PickupNotificationService());

  useEffect(() => {
    fetchStudents();
    fetchUnreadMessages();

    // Cleanup notification subscriptions
    return () => {
      pickupNotificationService.unsubscribeAll();
    };
  }, []);

  useEffect(() => {
    // Subscribe to pickup updates for carpool and parent pickup students
    students.forEach(student => {
      if (student.transportInfo?.method === 'CARPOOL' || student.transportInfo?.method === 'PARENT') {
        pickupNotificationService.subscribeToPickupUpdates(student.id, (update) => {
          // Refresh students list to update UI
          fetchStudents();
        });
      }
    });
  }, [students]);

  useEffect(() => {
    if (transportForm.method === 'BUS') {
      fetchAvailableRoutes();
    }
  }, [transportForm.method]);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students for parent:', currentUser.uid, currentUser.email);
      
      // First try by parentUid
      const studentsQueryByUid = query(
        collection(db, 'users'),
        where('parentUid', '==', currentUser.uid),
        where('role', '==', 'STUDENT')
      );

      // Then try by parent email
      const studentsQueryByEmail = query(
        collection(db, 'users'),
        where('parentEmail', '==', currentUser.email),
        where('role', '==', 'STUDENT')
      );

      const [snapshotByUid, snapshotByEmail] = await Promise.all([
        getDocs(studentsQueryByUid),
        getDocs(studentsQueryByEmail)
      ]);

      // Combine results, removing duplicates by student ID
      const studentDocs = new Map();
      [...snapshotByUid.docs, ...snapshotByEmail.docs].forEach(doc => {
        if (!studentDocs.has(doc.id)) {
          studentDocs.set(doc.id, doc);
        }
      });

      console.log('Found students:', studentDocs.size);

      const studentsList = await Promise.all(
        Array.from(studentDocs.values()).map(async doc => {
          const student = { id: doc.id, ...doc.data() };
          const transportInfo = await getStudentTransportInfo(doc.id);
          return { ...student, transportInfo };
        })
      );

      console.log('Processed students:', studentsList);
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Current user:', currentUser);
    }
  };

  const getStudentTransportInfo = async (studentId) => {
    try {
      const transportDoc = await getDoc(doc(db, 'transportationInfo', studentId));
      return transportDoc.exists() ? transportDoc.data() : null;
    } catch (err) {
      console.error('Error fetching transport info:', err);
      return null;
    }
  };

  const fetchAvailableRoutes = async () => {
    try {
      const routesQuery = query(
        collection(db, 'routes'),
        where('schoolId', '==', currentUser.schoolId),
        where('isActive', '==', true)
      );
      const routesSnapshot = await getDocs(routesQuery);
      const routesList = routesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableRoutes(routesList);
    } catch (error) {
      console.error('Error fetching routes:', error);
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

  const handleTransportMethodChange = (event) => {
    const method = event.target.value;
    setTransportForm(prev => ({
      ...prev,
      method,
      routeId: '',
      stopId: '',
    }));
  };

  const handleRouteChange = async (event) => {
    const routeId = event.target.value;
    const route = availableRoutes.find(r => r.id === routeId);
    setSelectedRoute(route);
    setTransportForm(prev => ({
      ...prev,
      routeId,
      stopId: '',
    }));
  };

  const handleTransportDialogOpen = (student) => {
    setSelectedStudent(student);
    setTransportForm(prev => ({
      ...prev,
      method: student.transportInfo?.method || '',
      routeId: student.transportInfo?.routeInfo?.routeId || '',
      stopId: student.transportInfo?.routeInfo?.stopId || '',
      carpoolInfo: student.transportInfo?.carpoolInfo || {
        driverName: '',
        vehicleInfo: '',
        pickupTime: '',
        dropoffTime: '',
      },
      parentInfo: student.transportInfo?.parentInfo || {
        name: '',
        phone: '',
        pickupTime: '',
        dropoffTime: '',
      }
    }));
    setTransportDialogOpen(true);
  };

  const handleTransportDialogClose = () => {
    setTransportDialogOpen(false);
    setSelectedStudent(null);
    setSelectedRoute(null);
    setTransportForm({
      method: '',
      routeId: '',
      stopId: '',
      carpoolInfo: {
        driverName: '',
        vehicleInfo: '',
        pickupTime: '',
        dropoffTime: '',
      },
      parentInfo: {
        name: '',
        phone: '',
        pickupTime: '',
        dropoffTime: '',
      }
    });
  };

  const handleTransportSubmit = async () => {
    try {
      if (!selectedStudent) return;

      // Validate required fields based on method
      const validationErrors = [];
      
      // Initialize transportData first
      const transportData = {
        method: transportForm.method,
        updatedAt: new Date(),
        schoolId: currentUser.schoolId,
        studentId: selectedStudent.id,
        isActive: true,
      };
      
      switch (transportForm.method) {
        case 'BUS':
          transportData.routeInfo = {
            pendingRouteAssignment: true,
            updatedAt: new Date(),
            status: 'PENDING_ROUTE'
          };
          break;

        case 'CARPOOL':
          if (!transportForm.carpoolInfo.driverName) validationErrors.push('Driver name is required');
          if (!transportForm.carpoolInfo.vehicleInfo) validationErrors.push('Vehicle information is required');
          if (!transportForm.carpoolInfo.pickupTime) validationErrors.push('Pickup time is required');
          if (!transportForm.carpoolInfo.dropoffTime) validationErrors.push('Drop-off time is required');
          transportData.carpoolInfo = {
            ...transportForm.carpoolInfo,
            updatedAt: new Date(),
            status: 'ACTIVE'
          };
          break;

        case 'PARENT':
          if (!transportForm.parentInfo.name) validationErrors.push('Parent name is required');
          if (!transportForm.parentInfo.phone) validationErrors.push('Contact phone is required');
          if (!transportForm.parentInfo.pickupTime) validationErrors.push('Pickup time is required');
          if (!transportForm.parentInfo.dropoffTime) validationErrors.push('Drop-off time is required');
          transportData.parentInfo = {
            ...transportForm.parentInfo,
            updatedAt: new Date(),
            status: 'ACTIVE'
          };
          break;

        case 'WALKER':
          transportData.walkerInfo = {
            updatedAt: new Date(),
            status: 'ACTIVE',
            notes: 'Registered as walker'
          };
          break;

        default:
          validationErrors.push('Please select a transportation method');
          break;
      }

      if (validationErrors.length > 0) {
        alert(validationErrors.join('\n'));
        return;
      }

      // First update transportation info
      const transportRef = doc(db, 'transportationInfo', selectedStudent.id);
      await updateDoc(transportRef, transportData);

      // Then update user document
      const userRef = doc(db, 'users', selectedStudent.id);
      await updateDoc(userRef, {
        transportMethod: transportForm.method,
        lastTransportUpdate: new Date()
      });

      // Refresh students list
      await fetchStudents();
      handleTransportDialogClose();
      
      // Show success message
      alert('Transportation information updated successfully');
    } catch (error) {
      console.error('Error updating transportation info:', error);
      alert('Failed to update transportation information: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getTransportIcon = (method) => {
    switch (method) {
      case 'BUS':
        return <BusIcon />;
      case 'CARPOOL':
        return <CarIcon />;
      case 'WALKER':
        return <WalkIcon />;
      case 'PARENT':
        return <CarIcon />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h5">
              Welcome, {currentUser?.firstName} {currentUser?.lastName}
            </Typography>
            <Typography color="textSecondary">
              {students.length} {students.length === 1 ? 'Student' : 'Students'} Registered
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Transportation Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {students.map((student) => (
          <Grid item xs={12} md={6} key={student.id}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {student.firstName[0]}
                  </Avatar>
                }
                title={`${student.firstName} ${student.lastName}`}
                subheader={`Grade ${student.grade}`}
                action={
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleTransportDialogOpen(student)}
                  >
                    Update Transport
                  </Button>
                }
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    icon={getTransportIcon(student.transportInfo?.method)}
                    label={TRANSPORT_METHODS[student.transportInfo?.method] || 'Not Set'}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                {student.transportInfo?.method === 'BUS' && (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      {student.transportInfo.routeInfo?.name 
                        ? `Bus Route: ${student.transportInfo.routeInfo.name}`
                        : 'Route: Pending Assignment'}
                    </Typography>
                    {student.transportInfo.routeInfo?.name ? (
                      <Box>
                        <Typography variant="body2">
                          Stop: {student.transportInfo.routeInfo.stopName}
                        </Typography>
                        <Typography variant="body2">
                          Pickup Time: {student.transportInfo.routeInfo.pickupTime}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Route and stop will be assigned by school administration
                      </Typography>
                    )}
                  </Box>
                )}
                {student.transportInfo?.method === 'CARPOOL' && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Driver: {student.transportInfo.carpoolInfo.driverName}
                    </Typography>
                    <Typography variant="body2">
                      Vehicle: {student.transportInfo.carpoolInfo.vehicleInfo}
                    </Typography>
                    <Typography variant="body2">
                      Pickup Time: {student.transportInfo.carpoolInfo.pickupTime}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Today's Pickup Status:
                      </Typography>
                      <PickupStatus student={student} />
                    </Box>
                  </>
                )}
                {student.transportInfo?.method === 'PARENT' && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Parent: {student.transportInfo.parentInfo.name}
                    </Typography>
                    <Typography variant="body2">
                      Contact: {student.transportInfo.parentInfo.phone}
                    </Typography>
                    <Typography variant="body2">
                      Pickup Window: {student.transportInfo.parentInfo.pickupTime}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Today's Pickup Status:
                      </Typography>
                      <PickupStatus student={student} />
                    </Box>
                  </>
                )}
                {student.transportInfo?.method === 'BUS' && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ my: 2 }} />
                    <BuddyPassRequest student={student} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<QrCodeIcon />} label="Student QR" />
          <Tab icon={<BusIcon />} label="Bus Tracking" />
          <Tab icon={<DelegateIcon />} label="Pickup Delegation" />
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
        <StudentQR 
          students={students}
          onUpdate={fetchStudents}
        />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {students.some(s => s.transportInfo?.method === 'BUS') ? (
              <BusTracking 
                students={students}
                onUpdate={fetchStudents}
              />
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  No Active Bus Riders
                </Typography>
                <Typography color="textSecondary">
                  None of your children are currently registered for bus transportation.
                </Typography>
              </Paper>
            )}
          </Grid>
          {students.some(s => s.transportInfo?.method === 'BUS') && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Buddy Pass System
                </Typography>
                {students
                  .filter(s => s.transportInfo?.method === 'BUS')
                  .map(student => (
                    <Box key={student.id} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {student.firstName} {student.lastName}
                      </Typography>
                      <BuddyPassRequest student={student} />
                    </Box>
                  ))
                }
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <PickupDelegation 
          students={students}
          onUpdate={fetchStudents}
        />
      </TabPanel>
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          {students.map((student) => (
            <Grid item xs={12} key={student.id}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {student.firstName} {student.lastName}'s Emergency Contacts
                </Typography>
                <EmergencyContacts 
                  studentId={student.id}
                  schoolId={currentUser.schoolId}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      <TabPanel value={currentTab} index={4}>
        <Communication 
          onMessageRead={fetchUnreadMessages}
          onMessageSent={fetchUnreadMessages}
        />
      </TabPanel>

      {/* Transportation Method Dialog */}
      <Dialog open={transportDialogOpen} onClose={handleTransportDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Transportation Method
          {selectedStudent && ` - ${selectedStudent.firstName} ${selectedStudent.lastName}`}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Transportation Method</InputLabel>
            <Select
              value={transportForm.method}
              onChange={handleTransportMethodChange}
              label="Transportation Method"
            >
              <MenuItem value="BUS">Bus Rider</MenuItem>
              <MenuItem value="CARPOOL">Carpool</MenuItem>
              <MenuItem value="WALKER">Walker</MenuItem>
              <MenuItem value="PARENT">Parent Drop-off</MenuItem>
            </Select>
          </FormControl>

          {transportForm.method === 'CARPOOL' && (
            <>
              <TextField
                fullWidth
                label="Driver Name"
                value={transportForm.carpoolInfo.driverName}
                onChange={(e) => setTransportForm(prev => ({
                  ...prev,
                  carpoolInfo: {
                    ...prev.carpoolInfo,
                    driverName: e.target.value
                  }
                }))}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Vehicle Information"
                value={transportForm.carpoolInfo.vehicleInfo}
                onChange={(e) => setTransportForm(prev => ({
                  ...prev,
                  carpoolInfo: {
                    ...prev.carpoolInfo,
                    vehicleInfo: e.target.value
                  }
                }))}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Pickup Time"
                type="time"
                value={transportForm.carpoolInfo.pickupTime}
                onChange={(e) => setTransportForm(prev => ({
                  ...prev,
                  carpoolInfo: {
                    ...prev.carpoolInfo,
                    pickupTime: e.target.value
                  }
                }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Drop-off Time"
                type="time"
                value={transportForm.carpoolInfo.dropoffTime}
                onChange={(e) => setTransportForm(prev => ({
                  ...prev,
                  carpoolInfo: {
                    ...prev.carpoolInfo,
                    dropoffTime: e.target.value
                  }
                }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
            </>
          )}

          {transportForm.method === 'PARENT' && (
            <>
              <TextField
                fullWidth
                label="Parent Name"
                value={transportForm.parentInfo.name}
                onChange={(e) => setTransportForm(prev => ({
                  ...prev,
                  parentInfo: {
                    ...prev.parentInfo,
                    name: e.target.value
                  }
                }))}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Contact Phone"
                value={transportForm.parentInfo.phone}
                onChange={(e) => setTransportForm(prev => ({
                  ...prev,
                  parentInfo: {
                    ...prev.parentInfo,
                    phone: e.target.value
                  }
                }))}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Drop-off Time"
                type="time"
                value={transportForm.parentInfo.dropoffTime}
                onChange={(e) => setTransportForm(prev => ({
                  ...prev,
                  parentInfo: {
                    ...prev.parentInfo,
                    dropoffTime: e.target.value
                  }
                }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Pickup Time"
                type="time"
                value={transportForm.parentInfo.pickupTime}
                onChange={(e) => setTransportForm(prev => ({
                  ...prev,
                  parentInfo: {
                    ...prev.parentInfo,
                    pickupTime: e.target.value
                  }
                }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTransportDialogClose}>Cancel</Button>
          <Button onClick={handleTransportSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 