import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  DirectionsBus as BusIcon,
  QrCode as QrCodeIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import QRCode from 'qrcode.react';

export default function GuestPickup() {
  const { delegateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [delegate, setDelegate] = useState(null);
  const [students, setStudents] = useState([]);
  const [token, setToken] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [qrTimestamp, setQrTimestamp] = useState(Date.now());
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!delegateId) {
      setError('Invalid delegate ID');
      setLoading(false);
      return;
    }
    fetchDelegateAccess();
  }, [delegateId]);

  // Add QR refresh timer and countdown
  useEffect(() => {
    if (showQR) {
      // Set initial countdown
      const updateCountdown = () => {
        const timeLeft = 30 - (Math.floor(Date.now() / 1000) % 30);
        setCountdown(timeLeft);
      };
      
      // Update countdown immediately
      updateCountdown();
      
      // Create timers
      const countdownTimer = setInterval(updateCountdown, 1000); // Update countdown every second
      const qrTimer = setInterval(() => {
        setQrTimestamp(Date.now());
        setCountdown(30); // Reset countdown when QR refreshes
      }, 30000);

      return () => {
        clearInterval(countdownTimer);
        clearInterval(qrTimer);
      };
    }
  }, [showQR]);

  const createNewToken = async (delegateData) => {
    try {
      // Create a new token that expires in 24 hours
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);

      // Ensure authorizedStudents is an array
      const authorizedStudents = Array.isArray(delegateData.authorizedStudents) 
        ? [...delegateData.authorizedStudents] 
        : [];

      const tokenData = {
        delegateId,
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expirationDate),
        authorizedStudents
      };

      console.log('Creating new token with data:', tokenData);
      const tokenRef = await addDoc(collection(db, 'tempAccessTokens'), tokenData);
      return { id: tokenRef.id, ...tokenData };
    } catch (error) {
      console.error('Error creating new token:', error);
      throw new Error('Failed to create access token');
    }
  };

  const fetchDelegateAccess = async () => {
    try {
      setLoading(true);
      console.log('Fetching delegate access for ID:', delegateId);
      
      // Get delegate information
      const delegateRef = doc(db, 'delegates', delegateId);
      console.log('Delegate reference:', delegateRef.path);
      
      const delegateDoc = await getDoc(delegateRef);
      if (!delegateDoc.exists()) {
        throw new Error('Delegate not found');
      }
      
      const delegateData = { id: delegateDoc.id, ...delegateDoc.data() };
      console.log('Delegate data:', delegateData);
      setDelegate(delegateData);

      // Get active token
      const tokenQuery = query(
        collection(db, 'tempAccessTokens'),
        where('delegateId', '==', delegateId),
        where('status', '==', 'ACTIVE')
      );
      
      console.log('Token query path:', tokenQuery);
      const tokenSnapshot = await getDocs(tokenQuery);
      console.log('Token snapshot size:', tokenSnapshot.size);
      
      let tokenData;
      const now = new Date();

      if (tokenSnapshot.empty) {
        console.log('No active token found, creating new one');
        tokenData = await createNewToken(delegateData);
      } else {
        // Find the first non-expired token or create a new one
        const validToken = tokenSnapshot.docs.find(doc => {
          const data = doc.data();
          const expiresAt = data.expiresAt?.toDate?.() || data.expiresAt;
          return expiresAt && expiresAt > now;
        });

        if (!validToken) {
          console.log('No valid token found, creating new one');
          tokenData = await createNewToken(delegateData);
        } else {
          tokenData = { id: validToken.id, ...validToken.data() };
        }
      }

      console.log('Valid token found:', tokenData.id);
      setToken(tokenData);

      // Fetch authorized students
      if (!delegateData.authorizedStudents || !Array.isArray(delegateData.authorizedStudents)) {
        console.log('No authorized students found or invalid format');
        setStudents([]);
        return;
      }

      const authorizedStudents = delegateData.authorizedStudents;
      console.log('Authorized students:', authorizedStudents);
      
      const studentsPromises = authorizedStudents.map(studentId => {
        if (!studentId) {
          console.log('Invalid student ID found');
          return Promise.resolve(null);
        }
        return getDoc(doc(db, 'users', studentId));
      });

      const studentsSnapshots = await Promise.all(studentsPromises);
      const studentsData = studentsSnapshots
        .filter(doc => doc && doc.exists())
        .map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log('Fetched students count:', studentsData.length);
      setStudents(studentsData);

    } catch (error) {
      console.error('Error in fetchDelegateAccess:', error);
      console.error('Error stack:', error.stack);
      setError(error.message || 'An error occurred while fetching delegate access');
    } finally {
      setLoading(false);
    }
  };

  const generatePickupQR = (student) => {
    const qrData = {
      type: 'delegate_pickup',
      delegateId,
      studentId: student.id,
      timestamp: qrTimestamp,
      tokenId: token.id
    };
    return JSON.stringify(qrData);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5">
              Welcome, {delegate.firstName} {delegate.lastName}
            </Typography>
            <Typography color="textSecondary">
              {delegate.relationship} - Authorized Pickup Person
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Authorized Students
      </Typography>

      <Grid container spacing={3}>
        {students.map((student) => (
          <Grid item xs={12} md={6} key={student.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2 }}>
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {student.firstName} {student.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Grade {student.grade}
                    </Typography>
                  </Box>
                </Box>

                {student.transportInfo && (
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<BusIcon />}
                      label={student.transportInfo.method}
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={student.transportInfo.schedule?.dismissal || 'N/A'}
                      variant="outlined"
                    />
                  </Box>
                )}

                <Button
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                  fullWidth
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowQR(true);
                  }}
                >
                  Show Pickup QR Code
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={showQR}
        onClose={() => {
          setShowQR(false);
          setQrTimestamp(Date.now());
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Pickup QR Code - {selectedStudent?.firstName} {selectedStudent?.lastName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            {selectedStudent && (
              <>
                <QRCode
                  value={generatePickupQR(selectedStudent)}
                  size={256}
                  level="H"
                />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Show this QR code to the teacher for pickup verification
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  QR code refreshes every 30 seconds for security
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <CircularProgress
                    size={20}
                    variant="determinate"
                    value={(countdown / 30) * 100}
                  />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Refreshing in {countdown}s
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowQR(false);
            setQrTimestamp(Date.now());
          }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 