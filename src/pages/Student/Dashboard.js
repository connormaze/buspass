import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  DirectionsWalk as WalkIcon,
  DirectionsCar as CarIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Timer as TimerIcon,
  Group as BuddyIcon,
  QrCode2 as QrCodeIcon,
  ContactPhone as EmergencyIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentBuddyPass from '../../components/StudentBuddyPass';
import BusTracking from '../../components/BusTracking';
import QRCode from 'qrcode.react';
import EmergencyContacts from '../../components/EmergencyContacts';

const TRANSPORT_METHODS = {
  BUS: 'Bus Rider',
  CARPOOL: 'Carpool',
  WALKER: 'Walker',
  PARENT: 'Parent Drop-off'
};

export default function StudentDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);
  const [transportInfo, setTransportInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [countdownActive, setCountdownActive] = useState(false);
  const [etaUpdate, setEtaUpdate] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchStudentInfo();
      fetchNotifications();
      
      // Set up real-time listener for transportation updates
      let unsubscribe;
      
      const setupTransportListener = async () => {
        try {
          // Get user document directly using auth UID
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const student = { id: userDoc.id, ...userDoc.data() };
            setStudentInfo(student);
            
            // Set up real-time listener for transportation info
            const transportRef = doc(db, 'transportationInfo', userDoc.id);
            unsubscribe = onSnapshot(transportRef, (doc) => {
              if (doc.exists()) {
                setTransportInfo(doc.data());
              } else {
                setTransportInfo(null);
              }
            }, (err) => {
              console.error('Error in transport listener:', err);
              setError('Failed to get real-time transportation updates');
            });
          }
        } catch (err) {
          console.error('Error setting up transport listener:', err);
          setError('Failed to initialize transportation updates');
        }
      };

      setupTransportListener();

      // Cleanup listener on unmount
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [currentUser]);

  const fetchStudentInfo = async () => {
    try {
      // Get user document directly using auth UID
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        const student = { id: userDoc.id, ...userDoc.data() };
        setStudentInfo(student);
        
        // Fetch school info if schoolId exists
        if (student.schoolId) {
          const schoolDoc = await getDoc(doc(db, 'schools', student.schoolId));
          if (schoolDoc.exists()) {
            setStudentInfo(prev => ({
              ...prev,
              schoolName: schoolDoc.data().name
            }));
          }
        }
        
        // Fetch transportation info
        const transportDoc = await getDoc(doc(db, 'transportationInfo', userDoc.id));
        if (transportDoc.exists()) {
          setTransportInfo(transportDoc.data());
        }
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const notificationsSnapshot = await getDocs(
        query(
          collection(db, 'notifications'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
      );
      const notificationsList = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
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
        return <BusIcon />;
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

  const generateQRCode = useCallback(() => {
    const timestamp = Date.now();
    const data = {
      studentId: studentInfo?.id,
      timestamp,
      type: 'student_verification'
    };
    setQRCodeData(JSON.stringify(data));
    setCountdown(30);
    setCountdownActive(true);
    setShowQRCode(true);
  }, [studentInfo]);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCountdownActive(false);
      setShowQRCode(false);
    }
    return () => clearInterval(timer);
  }, [countdown, countdownActive]);

  // Add ETA update handler
  const handleETAUpdate = useCallback((update) => {
    setEtaUpdate(update);
    // Create notification for significant ETA changes
    if (update && update.eta) {
      const etaMinutes = Math.round(update.duration / 60);
      if (etaMinutes <= 20) {
        const notification = {
          id: Date.now(),
          message: `Your bus will arrive in approximately ${etaMinutes} minutes`,
          createdAt: new Date(),
          type: 'ETA_UPDATE'
        };
        setNotifications(prev => [notification, ...prev]);
      }
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Student Dashboard
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
      
      <Grid container spacing={3}>
        {/* Student Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              }
              title={
                <Typography variant="h6">
                  {studentInfo?.firstName} {studentInfo?.lastName}
                </Typography>
              }
              subheader={`Grade ${studentInfo?.grade || 'N/A'}`}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  School
                </Typography>
                <Typography variant="body1">
                  {studentInfo?.schoolName || 'Not Set'}
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={getTransportIcon(transportInfo?.method)}
                  label={TRANSPORT_METHODS[transportInfo?.method] || 'Not Set'}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<QrCodeIcon />}
                  onClick={generateQRCode}
                >
                  Show QR Code
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Live ETA Updates Card - Show only for bus riders */}
          {transportInfo?.method === 'BUS' && (
            <Card sx={{ mt: 2, bgcolor: 'primary.light' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <TimerIcon />
                  </Avatar>
                }
                title="Live Bus ETA"
              />
              <CardContent>
                {etaUpdate ? (
                  <Box>
                    <Typography variant="h4" component="div" color="primary.contrastText" gutterBottom>
                      {Math.round(etaUpdate.duration / 60)} min
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                      Bus arriving at: {formatTime(etaUpdate.eta)}
                    </Typography>
                    <Typography variant="caption" color="primary.contrastText">
                      Stop: {transportInfo?.routeInfo?.stopName}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" color="primary.contrastText">
                    Waiting for bus location...
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transportation Details Card */}
          <Card sx={{ mt: 2 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getTransportIcon(transportInfo?.method)}
                </Avatar>
              }
              title="Transportation Details"
            />
            <CardContent>
              {transportInfo ? (
                <Grid container spacing={2}>
                  {transportInfo.method === 'BUS' && transportInfo.routeInfo && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Route Name
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {transportInfo.routeInfo.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Bus Stop
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {transportInfo.routeInfo.stopName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon color="action" sx={{ mr: 1 }} />
                          <Typography variant="body1">
                            {transportInfo.routeInfo.stopAddress}
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}
                  
                  {transportInfo.method === 'CARPOOL' && transportInfo.carpoolInfo && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Driver Name
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {transportInfo.carpoolInfo.driverName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Vehicle Info
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {transportInfo.carpoolInfo.vehicleInfo}
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {transportInfo.method === 'PARENT' && transportInfo.parentInfo && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Parent Name
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {transportInfo.parentInfo.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Contact
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {transportInfo.parentInfo.phone}
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {transportInfo.method === 'WALKER' && (
                    <Grid item xs={12}>
                      <Typography variant="body1" color="text.secondary">
                        Registered as a walker
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No transportation method assigned
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card sx={{ mt: 2 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <NotificationsIcon />
                </Avatar>
              }
              title="Recent Notifications"
            />
            <CardContent>
              <List>
                {notifications.map((notification) => (
                  <ListItem key={notification.id}>
                    <ListItemText
                      primary={notification.message}
                      secondary={formatDate(notification.createdAt)}
                    />
                  </ListItem>
                ))}
                {notifications.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No new notifications" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Bus Tracking and ETA Updates */}
        <Grid item xs={12} md={8}>
          {transportInfo?.method === 'BUS' && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <BusTracking 
                  students={[{ ...studentInfo, transportInfo }]}
                  onETAUpdate={handleETAUpdate}
                />
              </CardContent>
            </Card>
          )}

          {/* BuddyPass Section */}
          <Card>
            <CardContent>
              <StudentBuddyPass student={studentInfo} />
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Contacts Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <EmergencyIcon />
                </Avatar>
              }
              title="Emergency Contacts"
            />
            <CardContent>
              <EmergencyContacts
                studentId={currentUser.uid}
                schoolId={currentUser.schoolId}
                readOnly={true}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code Dialog */}
      <Dialog 
        open={showQRCode} 
        onClose={() => setShowQRCode(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          Your QR Code
          <Typography variant="subtitle1" color="text.secondary">
            Time remaining: {countdown}s
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', pb: 3 }}>
          {qrCodeData && (
            <QRCode
              value={qrCodeData}
              size={256}
              level="H"
              includeMargin
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 