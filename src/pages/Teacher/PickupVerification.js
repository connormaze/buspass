import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  TextField,
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  CheckCircle as VerifiedIcon,
  Cancel as UnverifiedIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import StudentProfilePicture from '../../components/StudentProfilePicture';

// Mock QR code scanner component (replace with actual scanner implementation)
const QRScanner = ({ onScan }) => (
  <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.100' }}>
    <Typography variant="body2" gutterBottom>
      Scanning for QR codes...
    </Typography>
    {/* Add actual QR scanner implementation here */}
  </Box>
);

export default function PickupVerification({ students }) {
  const { currentUser } = useAuth();
  const [openScanner, setOpenScanner] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [recentPickups, setRecentPickups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentPickups();
  }, []);

  const fetchRecentPickups = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pickupsQuery = query(
        collection(db, 'pickups'),
        where('teacherUid', '==', currentUser.uid),
        where('timestamp', '>=', today)
      );
      const pickupsSnapshot = await getDocs(pickupsQuery);
      const pickupsList = pickupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentPickups(pickupsList);
    } catch (error) {
      console.error('Error fetching recent pickups:', error);
      setError('Failed to load recent pickups');
    }
  };

  const handleQRScan = async (qrData) => {
    try {
      const data = JSON.parse(qrData);
      
      if (data.type === 'delegate_pickup') {
        // Verify delegate pickup
        const tokenDoc = await getDoc(doc(db, 'tempAccessTokens', data.tokenId));
        if (!tokenDoc.exists()) {
          setVerificationResult({
            success: false,
            message: 'Invalid access token',
          });
          return;
        }

        const tokenData = tokenDoc.data();
        if (tokenData.status !== 'ACTIVE' || tokenData.expiresAt.toDate() < new Date()) {
          setVerificationResult({
            success: false,
            message: 'Access token has expired',
          });
          return;
        }

        // Verify delegate
        const delegateDoc = await getDoc(doc(db, 'delegates', data.delegateId));
        if (!delegateDoc.exists()) {
          setVerificationResult({
            success: false,
            message: 'Delegate not found',
          });
          return;
        }

        const delegateData = delegateDoc.data();
        if (!delegateData.authorizedStudents.includes(data.studentId)) {
          setVerificationResult({
            success: false,
            message: 'Delegate not authorized for this student',
          });
          return;
        }

        const student = students.find(s => s.id === data.studentId);
        if (!student) {
          setVerificationResult({
            success: false,
            message: 'Student not found in your class',
          });
          return;
        }

        // Check if there's already a pickup record for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingPickupQuery = query(
          collection(db, 'pickups'),
          where('studentId', '==', student.id),
          where('timestamp', '>=', today)
        );
        const existingPickupSnapshot = await getDocs(existingPickupQuery);

        if (!existingPickupSnapshot.empty) {
          setVerificationResult({
            success: false,
            message: 'Student has already been picked up today',
          });
          return;
        }

        // Record the delegate pickup
        await addDoc(collection(db, 'pickups'), {
          studentId: student.id,
          teacherUid: currentUser.uid,
          delegateId: data.delegateId,
          tokenId: data.tokenId,
          timestamp: serverTimestamp(),
          type: 'DELEGATE_PICKUP',
          qrData: data,
        });

        setVerificationResult({
          success: true,
          message: 'Delegate pickup verified successfully',
          student: student,
          delegate: delegateData,
        });
        fetchRecentPickups();
        return;
      }

      // Handle regular student QR codes
      const student = students.find(s => s.id === data.id);
      if (!student) {
        setVerificationResult({
          success: false,
          message: 'Student not found in your class',
        });
        return;
      }

      // Update student object with profile picture if present in QR data
      if (data.profilePicture) {
        student.profilePicture = data.profilePicture;
      }

      // Verify if the QR code is not expired (e.g., within 24 hours)
      const qrTimestamp = new Date(data.timestamp);
      const now = new Date();
      const hoursDiff = (now - qrTimestamp) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        setVerificationResult({
          success: false,
          message: 'QR code has expired',
        });
        return;
      }

      // Check if there's already a pickup record for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingPickupQuery = query(
        collection(db, 'pickups'),
        where('studentId', '==', student.id),
        where('timestamp', '>=', today)
      );
      const existingPickupSnapshot = await getDocs(existingPickupQuery);

      if (!existingPickupSnapshot.empty) {
        setVerificationResult({
          success: false,
          message: 'Student has already been picked up today',
        });
        return;
      }

      // Record the pickup
      await addDoc(collection(db, 'pickups'), {
        studentId: student.id,
        teacherUid: currentUser.uid,
        timestamp: serverTimestamp(),
        type: 'STUDENT_PICKUP',
        qrData: data,
      });

      setVerificationResult({
        success: true,
        message: 'Pickup verified successfully',
        student: student,
      });
      fetchRecentPickups();

    } catch (error) {
      console.error('Error processing QR code:', error);
      setVerificationResult({
        success: false,
        message: 'Invalid QR code',
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const filteredPickups = recentPickups.filter(pickup => {
    const studentName = getStudentName(pickup.studentId).toLowerCase();
    return studentName.includes(searchQuery.toLowerCase());
  });

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Student Pickup Verification
              </Typography>
              <Button
                variant="contained"
                startIcon={<ScannerIcon />}
                onClick={() => setOpenScanner(true)}
              >
                Scan QR Code
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Search Pickups"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" />,
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <List>
              {filteredPickups.map((pickup) => (
                <ListItem key={pickup.id}>
                  <ListItemText
                    primary={getStudentName(pickup.studentId)}
                    secondary={`Picked up at ${formatTimestamp(pickup.timestamp)}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      icon={<VerifiedIcon />}
                      label="Verified"
                      color="success"
                      variant="outlined"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openScanner}
        onClose={() => {
          setOpenScanner(false);
          setVerificationResult(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan Student QR Code</DialogTitle>
        <DialogContent>
          {verificationResult ? (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              {verificationResult.success ? (
                <>
                  <VerifiedIcon
                    color="success"
                    sx={{ fontSize: 60, mb: 2 }}
                  />
                  {verificationResult.student.profilePicture && (
                    <Box sx={{ mb: 2 }}>
                      <StudentProfilePicture
                        student={verificationResult.student}
                        readOnly={true}
                      />
                    </Box>
                  )}
                  <Typography variant="h6" gutterBottom>
                    {verificationResult.student.firstName} {verificationResult.student.lastName}
                  </Typography>
                </>
              ) : (
                <>
                  <UnverifiedIcon
                    color="error"
                    sx={{ fontSize: 60, mb: 2 }}
                  />
                  <Typography color="error" gutterBottom>
                    {verificationResult.message}
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            <QRScanner onScan={handleQRScan} />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenScanner(false);
              setVerificationResult(null);
            }}
          >
            Close
          </Button>
          {verificationResult && verificationResult.success && (
            <Button
              variant="contained"
              onClick={() => {
                setOpenScanner(false);
                setVerificationResult(null);
              }}
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
} 