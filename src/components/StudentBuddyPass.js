import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import EmergencyContactManager from './EmergencyContactManager';

const PASS_STATUS = {
  PENDING: { label: 'Pending Parent Approval', color: 'warning' },
  APPROVED: { label: 'Approved', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
};

export default function StudentBuddyPass({ student }) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [buddyPasses, setBuddyPasses] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [indexBuilding, setIndexBuilding] = useState(false);

  useEffect(() => {
    if (student?.schoolId) {
      fetchAvailableStudents();
      const unsubscribe = setupBuddyPassListener();
      return () => unsubscribe();
    }
  }, [student?.schoolId]);

  const fetchAvailableStudents = async () => {
    try {
      // First get all students in the same grade and school
      const studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', student.schoolId),
        where('grade', '==', student.grade), // Add grade filter
        where('type', '==', 'student') // Change 'role' to 'type' and 'STUDENT' to 'student'
      );
      
      const snapshot = await getDocs(studentsQuery);
      console.log('Found students:', snapshot.docs.length); // Debug log
      
      const studentsList = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fullName: `${data.firstName} ${data.lastName} - ${data.studentId || 'No ID'}`
          };
        })
        .filter(s => s.id !== student.id && s.transportInfo?.method === 'BUS'); // Only show bus riders
      
      console.log('Filtered students:', studentsList); // Debug log
      setAvailableStudents(studentsList);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load available students');
    }
  };

  const setupBuddyPassListener = () => {
    const passesQuery = query(
      collection(db, 'buddyPasses'),
      where('studentId', '==', student.id),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(passesQuery, (snapshot) => {
      const passes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBuddyPasses(passes);
      setIndexBuilding(false);
      setError(null);
    }, (err) => {
      console.error('Error setting up buddy pass listener:', err);
      if (err.code === 'failed-precondition') {
        setIndexBuilding(true);
        setError('System is being optimized. Please wait a moment and try again.');
      } else {
        setError('Failed to load buddy passes');
      }
    });
  };

  const handleSubmit = async () => {
    if (!selectedBuddy || !date) {
      setError('Please select a buddy and date');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create buddy pass request
      await addDoc(collection(db, 'buddyPasses'), {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        buddyId: selectedBuddy.id,
        buddyName: selectedBuddy.fullName,
        date,
        reason,
        status: 'PENDING',
        requestedBy: currentUser.uid,
        createdAt: serverTimestamp(),
        schoolId: student.schoolId,
        grade: student.grade,
        // Add route information if available
        routeInfo: student.transportInfo?.routeInfo || null,
      });

      setOpen(false);
      setSelectedBuddy(null);
      setDate('');
      setReason('');
    } catch (err) {
      console.error('Error creating buddy pass request:', err);
      setError('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">My Buddy Passes</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            disabled={indexBuilding}
          >
            Request Buddy Pass
          </Button>
        </Box>

        {error && (
          <Alert 
            severity={indexBuilding ? "info" : "error"} 
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {indexBuilding ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Setting up buddy pass system...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This may take a few minutes
            </Typography>
          </Box>
        ) : (
          <List>
            {buddyPasses.map((pass) => (
              <Card key={pass.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">
                      Buddy: {pass.buddyName}
                    </Typography>
                    <Chip
                      label={PASS_STATUS[pass.status].label}
                      color={PASS_STATUS[pass.status].color}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Date: {formatDate(pass.date)}
                  </Typography>
                  {pass.reason && (
                    <Typography variant="body2" color="text.secondary">
                      Reason: {pass.reason}
                    </Typography>
                  )}
                  {pass.status === 'PENDING' && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Waiting for parent approval
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
            {buddyPasses.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No buddy passes requested yet
              </Typography>
            )}
          </List>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <EmergencyContactManager 
          student={student} 
          readOnly={currentUser.type !== 'parent' && currentUser.type !== 'student'} 
        />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Buddy Pass</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Autocomplete
              options={availableStudents}
              getOptionLabel={(option) => option.fullName}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <PersonIcon sx={{ mr: 1 }} />
                  {option.fullName}
                </Box>
              )}
              value={selectedBuddy}
              onChange={(_, newValue) => setSelectedBuddy(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Buddy"
                  required
                  fullWidth
                />
              )}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !selectedBuddy || !date}
          >
            {loading ? 'Requesting...' : 'Request Pass'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 