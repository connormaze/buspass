import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  DirectionsWalk as WalkIcon,
  QrCode as QrCodeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import QRScanner from './QRScanner';

const WALKING_STATUS = {
  REGISTERED: { label: 'Registered', color: 'info' },
  CHECKED_IN: { label: 'Checked In', color: 'success' },
  CHECKED_OUT: { label: 'Checked Out', color: 'warning' },
  ABSENT: { label: 'Absent', color: 'error' },
};

const WALKING_DIRECTIONS = {
  HOME: 'Home',
  SCHOOL: 'School',
  BOTH: 'Both',
};

export default function WalkingStudentTracker({ schoolId }) {
  const { currentUser } = useAuth();
  const [walkingStudents, setWalkingStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    direction: 'BOTH',
    approvedGuardians: [],
    walkingRoute: '',
    checkInTime: '',
    checkOutTime: '',
    notes: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (schoolId) {
      fetchWalkingStudents();
    }
  }, [schoolId]);

  const fetchWalkingStudents = async () => {
    try {
      const walkingQuery = query(
        collection(db, 'walkingStudents'),
        where('schoolId', '==', schoolId),
        orderBy('createdAt', 'desc')
      );
      const walkingSnapshot = await getDocs(walkingQuery);
      const walkingList = walkingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWalkingStudents(walkingList);
    } catch (error) {
      console.error('Error fetching walking students:', error);
      setError('Failed to load walking students');
    }
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        studentId: student.studentId,
        direction: student.direction,
        approvedGuardians: student.approvedGuardians || [],
        walkingRoute: student.walkingRoute,
        checkInTime: student.checkInTime || '',
        checkOutTime: student.checkOutTime || '',
        notes: student.notes || '',
      });
    } else {
      setEditingStudent(null);
      setFormData({
        studentId: '',
        direction: 'BOTH',
        approvedGuardians: [],
        walkingRoute: '',
        checkInTime: '',
        checkOutTime: '',
        notes: '',
      });
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
    setFormData({
      studentId: '',
      direction: 'BOTH',
      approvedGuardians: [],
      walkingRoute: '',
      checkInTime: '',
      checkOutTime: '',
      notes: '',
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.studentId || !formData.direction || !formData.walkingRoute) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const walkingData = {
        ...formData,
        schoolId,
        status: 'REGISTERED',
        updatedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
      };

      if (editingStudent) {
        const walkingRef = doc(db, 'walkingStudents', editingStudent.id);
        await updateDoc(walkingRef, walkingData);
      } else {
        walkingData.createdBy = currentUser.uid;
        walkingData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'walkingStudents'), walkingData);
      }

      handleCloseDialog();
      fetchWalkingStudents();
      setSuccess(`Walking student ${editingStudent ? 'updated' : 'registered'} successfully`);
    } catch (error) {
      console.error('Error saving walking student:', error);
      setError('Failed to save walking student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this walking student?')) {
      try {
        await deleteDoc(doc(db, 'walkingStudents', studentId));
        fetchWalkingStudents();
        setSuccess('Walking student deleted successfully');
      } catch (error) {
        console.error('Error deleting walking student:', error);
        setError('Failed to delete walking student');
      }
    }
  };

  const handleScanSuccess = async (data) => {
    try {
      const studentData = JSON.parse(data);
      const walkingRef = doc(db, 'walkingStudents', studentData.studentId);
      
      // Update check-in/out status
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      if (studentData.type === 'CHECK_IN') {
        await updateDoc(walkingRef, {
          status: 'CHECKED_IN',
          checkInTime: currentTime,
          lastChecked: serverTimestamp(),
        });
      } else {
        await updateDoc(walkingRef, {
          status: 'CHECKED_OUT',
          checkOutTime: currentTime,
          lastChecked: serverTimestamp(),
        });
      }

      fetchWalkingStudents();
      setSuccess('Student check-in/out recorded successfully');
      setOpenScanner(false);
    } catch (error) {
      console.error('Error processing QR code:', error);
      setError('Failed to process QR code');
    }
  };

  const formatTime = (time) => {
    if (!time) return 'Not recorded';
    return time;
  };

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Walking Students</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<QrCodeIcon />}
              onClick={() => setOpenScanner(true)}
              sx={{ mr: 1 }}
            >
              Scan QR Code
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Register Student
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <List>
          {walkingStudents.map((student) => (
            <ListItem key={student.id}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <WalkIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {student.studentName}
                    </Typography>
                    <Chip
                      label={WALKING_STATUS[student.status].label}
                      color={WALKING_STATUS[student.status].color}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Direction: {WALKING_DIRECTIONS[student.direction]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Route: {student.walkingRoute}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check-in: {formatTime(student.checkInTime)} | 
                      Check-out: {formatTime(student.checkOutTime)}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(student)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteStudent(student.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Registration Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStudent ? 'Edit Walking Student' : 'Register Walking Student'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Walking Direction</InputLabel>
                  <Select
                    value={formData.direction}
                    onChange={(e) =>
                      setFormData({ ...formData, direction: e.target.value })
                    }
                    label="Walking Direction"
                  >
                    {Object.entries(WALKING_DIRECTIONS).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Walking Route"
                  multiline
                  rows={2}
                  value={formData.walkingRoute}
                  onChange={(e) =>
                    setFormData({ ...formData, walkingRoute: e.target.value })
                  }
                  required
                  helperText="Describe the student's walking route"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStudent ? 'Update' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan Student QR Code</DialogTitle>
        <DialogContent>
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={(error) => setError('Failed to scan QR code')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScanner(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 