import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, updateDoc, onSnapshot, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function BuddyPassRequest({ student }) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [requests, setRequests] = useState([]);

  // Fetch available students for buddy pass
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'STUDENT'),
          where('schoolId', '==', student.schoolId)
        );
        const snapshot = await getDocs(studentsQuery);
        const studentsList = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            fullName: `${doc.data().firstName} ${doc.data().lastName}`
          }))
          .filter(s => s.id !== student.id); // Exclude current student
        setStudents(studentsList);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students');
      }
    };
    fetchStudents();
  }, [student]);

  // Listen for buddy pass requests
  useEffect(() => {
    const requestsQuery = query(
      collection(db, 'buddyPassRequests'),
      where('studentId', '==', student.id)
    );

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requestsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestsList);
    });

    return () => unsubscribe();
  }, [student]);

  const handleSubmit = async () => {
    if (!selectedStudent || !date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create buddy pass request
      await addDoc(collection(db, 'buddyPassRequests'), {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        buddyId: selectedStudent.id,
        buddyName: selectedStudent.fullName,
        date: date,
        note: note,
        status: 'PENDING',
        requestingParentId: currentUser.uid,
        requestingParentName: `${currentUser.firstName} ${currentUser.lastName}`,
        createdAt: serverTimestamp(),
        approvals: {
          [currentUser.uid]: true // Requesting parent automatically approves
        },
        schoolId: student.schoolId
      });

      setOpen(false);
      setSelectedStudent(null);
      setDate('');
      setNote('');
    } catch (err) {
      console.error('Error creating buddy pass request:', err);
      setError('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    try {
      const approvals = {
        ...request.approvals,
        [currentUser.uid]: true
      };

      // Check if both parents have approved
      const allApproved = Object.values(approvals).every(v => v);

      await updateDoc(doc(db, 'buddyPassRequests', request.id), {
        approvals,
        status: allApproved ? 'APPROVED' : 'PENDING',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request');
    }
  };

  const handleDeny = async (request) => {
    try {
      await updateDoc(doc(db, 'buddyPassRequests', request.id), {
        status: 'DENIED',
        deniedBy: currentUser.uid,
        deniedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error denying request:', err);
      setError('Failed to deny request');
    }
  };

  const getStatusChip = (request) => {
    switch (request.status) {
      case 'APPROVED':
        return <Chip label="Approved" color="success" size="small" />;
      case 'DENIED':
        return <Chip label="Denied" color="error" size="small" />;
      default:
        return <Chip label="Pending" color="warning" size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Buddy Pass Requests</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          New Request
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {requests.map((request) => (
          <ListItem key={request.id}>
            <ListItemText
              primary={`Ride with ${request.buddyName}`}
              secondary={
                <>
                  <Typography variant="body2">
                    Date: {new Date(request.date).toLocaleDateString()}
                  </Typography>
                  {request.note && (
                    <Typography variant="body2">
                      Note: {request.note}
                    </Typography>
                  )}
                </>
              }
            />
            <ListItemSecondaryAction>
              {getStatusChip(request)}
              {request.status === 'PENDING' && !request.approvals[currentUser.uid] && (
                <>
                  <IconButton
                    edge="end"
                    onClick={() => handleApprove(request)}
                    sx={{ ml: 1 }}
                  >
                    <CheckIcon color="success" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeny(request)}
                    sx={{ ml: 1 }}
                  >
                    <CloseIcon color="error" />
                  </IconButton>
                </>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Buddy Pass Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Autocomplete
              options={students}
              getOptionLabel={(option) => option.fullName}
              value={selectedStudent}
              onChange={(e, newValue) => setSelectedStudent(newValue)}
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
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
            disabled={loading}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 