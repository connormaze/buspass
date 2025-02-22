import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckInIcon,
  Cancel as CheckOutIcon,
  PhotoCamera as CameraIcon,
  Fingerprint as PinIcon
} from '@mui/icons-material';
import { SecurityService } from '../services/SecurityService';
import QRScanner from './QRScanner';
import SignaturePad from './SignaturePad';
import PhotoCapture from './PhotoCapture';

export default function StudentCheckInOut({ bus, route }) {
  const [students, setStudents] = useState([]);
  const [checkedInStudents, setCheckedInStudents] = useState([]);
  const [openScanner, setOpenScanner] = useState(false);
  const [openPinDialog, setOpenPinDialog] = useState(false);
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [securityService] = useState(() => new SecurityService());

  useEffect(() => {
    fetchStudents();
    fetchCheckedInStudents();
  }, [bus, route]);

  const fetchStudents = async () => {
    // Implementation of fetching students
  };

  const fetchCheckedInStudents = async () => {
    // Implementation of fetching checked-in students
  };

  const handleQRScan = async (data) => {
    try {
      const studentId = data;
      const student = students.find(s => s.id === studentId);
      if (student) {
        setSelectedStudent(student);
        setOpenScanner(false);
        setOpenPinDialog(true);
      } else {
        setError('Student not found');
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      setError('Failed to process QR code');
    }
  };

  const handlePinVerification = async () => {
    try {
      const verified = await securityService.verifyPickupPin(selectedStudent.id, pin);
      if (verified) {
        setOpenPinDialog(false);
        setOpenPhotoDialog(true);
      } else {
        setError('Invalid PIN');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Failed to verify PIN');
    }
  };

  const handlePhotoVerification = async (photo) => {
    try {
      const verified = await securityService.verifyPhotoId(selectedStudent.id, photo);
      if (verified) {
        setOpenPhotoDialog(false);
        setOpenSignatureDialog(true);
      } else {
        setError('Photo verification failed');
      }
    } catch (error) {
      console.error('Error verifying photo:', error);
      setError('Failed to verify photo');
    }
  };

  const handleSignatureCapture = async (signatureData) => {
    try {
      const pickupId = `${selectedStudent.id}_${Date.now()}`;
      await securityService.recordPickupSignature(pickupId, signatureData);
      setOpenSignatureDialog(false);
      handleStudentCheckInOut(selectedStudent, true);
    } catch (error) {
      console.error('Error recording signature:', error);
      setError('Failed to record signature');
    }
  };

  const handleStudentCheckInOut = async (student, isCheckIn) => {
    // Implementation of check-in/out logic
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Student Check-In/Out</Typography>
        <Button
          variant="contained"
          startIcon={<CameraIcon />}
          onClick={() => setOpenScanner(true)}
        >
          Scan QR Code
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper>
            <List>
              {students.map((student) => {
                const isCheckedIn = checkedInStudents.some(
                  (c) => c.studentId === student.id && !c.checkOutTime
                );
                return (
                  <ListItem key={student.id}>
                    <ListItemText
                      primary={`${student.firstName} ${student.lastName}`}
                      secondary={student.grade ? `Grade ${student.grade}` : ''}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={isCheckedIn ? 'Checked In' : 'Not Checked In'}
                        color={isCheckedIn ? 'success' : 'default'}
                        sx={{ mr: 1 }}
                      />
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setSelectedStudent(student);
                          setOpenPinDialog(true);
                        }}
                        color={isCheckedIn ? 'error' : 'success'}
                      >
                        {isCheckedIn ? <CheckOutIcon /> : <CheckInIcon />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Check-In Statistics
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Total Students: {students.length}
              </Typography>
              <Typography variant="body1">
                Checked In: {checkedInStudents.filter(c => !c.checkOutTime).length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* QR Scanner Dialog */}
      <Dialog
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan Student QR Code</DialogTitle>
        <DialogContent>
          <QRScanner onScan={handleQRScan} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScanner(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* PIN Verification Dialog */}
      <Dialog
        open={openPinDialog}
        onClose={() => setOpenPinDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Enter Verification PIN</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="PIN"
            type="password"
            fullWidth
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPinDialog(false)}>Cancel</Button>
          <Button onClick={handlePinVerification} variant="contained">
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Verification Dialog */}
      <Dialog
        open={openPhotoDialog}
        onClose={() => setOpenPhotoDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Photo ID Verification</DialogTitle>
        <DialogContent>
          <PhotoCapture onCapture={handlePhotoVerification} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPhotoDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Signature Capture Dialog */}
      <Dialog
        open={openSignatureDialog}
        onClose={() => setOpenSignatureDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Capture Signature</DialogTitle>
        <DialogContent>
          <SignaturePad onCapture={handleSignatureCapture} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSignatureDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 