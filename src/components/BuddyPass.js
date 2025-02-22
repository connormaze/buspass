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
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
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

const PASS_STATUS = {
  PENDING: { label: 'Pending', color: 'warning' },
  APPROVED: { label: 'Approved', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
  COMPLETED: { label: 'Completed', color: 'default' },
};

export default function BuddyPass({ schoolId }) {
  const { currentUser } = useAuth();
  const [passes, setPasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPass, setEditingPass] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    buddyId: '',
    routeId: '',
    date: '',
    reason: '',
    parentNote: '',
    status: 'PENDING',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (schoolId) {
      fetchPasses();
      fetchStudents();
      fetchRoutes();
    }
  }, [schoolId]);

  const fetchPasses = async () => {
    try {
      const passesQuery = query(
        collection(db, 'buddyPasses'),
        where('schoolId', '==', schoolId),
        orderBy('createdAt', 'desc')
      );
      const passesSnapshot = await getDocs(passesQuery);
      const passesList = passesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPasses(passesList);
    } catch (error) {
      console.error('Error fetching buddy passes:', error);
      setError('Failed to load buddy passes');
    }
  };

  const fetchStudents = async () => {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        where('schoolId', '==', schoolId)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    }
  };

  const fetchRoutes = async () => {
    try {
      const routesQuery = query(
        collection(db, 'routes'),
        where('schoolId', '==', schoolId)
      );
      const routesSnapshot = await getDocs(routesQuery);
      const routesList = routesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoutes(routesList);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setError('Failed to load routes');
    }
  };

  const handleOpenDialog = (pass = null) => {
    if (pass) {
      setEditingPass(pass);
      setFormData({
        studentId: pass.studentId,
        buddyId: pass.buddyId,
        routeId: pass.routeId,
        date: pass.date,
        reason: pass.reason,
        parentNote: pass.parentNote,
        status: pass.status,
      });
    } else {
      setEditingPass(null);
      setFormData({
        studentId: '',
        buddyId: '',
        routeId: '',
        date: '',
        reason: '',
        parentNote: '',
        status: 'PENDING',
      });
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPass(null);
    setFormData({
      studentId: '',
      buddyId: '',
      routeId: '',
      date: '',
      reason: '',
      parentNote: '',
      status: 'PENDING',
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.studentId || !formData.buddyId || !formData.routeId || !formData.date) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const passData = {
        ...formData,
        schoolId,
        requestedBy: currentUser.uid,
      };

      if (editingPass) {
        const passRef = doc(db, 'buddyPasses', editingPass.id);
        await updateDoc(passRef, {
          ...passData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'buddyPasses'), {
          ...passData,
          createdAt: serverTimestamp(),
        });
      }

      handleCloseDialog();
      fetchPasses();
      setSuccess(`Buddy pass ${editingPass ? 'updated' : 'created'} successfully`);

      // Send notifications to relevant staff and parents
      await addDoc(collection(db, 'notifications'), {
        type: 'BUDDY_PASS',
        studentId: formData.studentId,
        buddyId: formData.buddyId,
        routeId: formData.routeId,
        date: formData.date,
        message: `New buddy pass request for ${getStudentName(formData.studentId)}`,
        createdAt: serverTimestamp(),
        status: 'UNREAD',
      });
    } catch (error) {
      console.error('Error saving buddy pass:', error);
      setError('Failed to save buddy pass');
    }
  };

  const handleUpdateStatus = async (passId, newStatus) => {
    try {
      const passRef = doc(db, 'buddyPasses', passId);
      await updateDoc(passRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      });
      fetchPasses();
      setSuccess(`Buddy pass ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating buddy pass status:', error);
      setError('Failed to update status');
    }
  };

  const handleDeletePass = async (passId) => {
    if (window.confirm('Are you sure you want to delete this buddy pass?')) {
      try {
        await deleteDoc(doc(db, 'buddyPasses', passId));
        fetchPasses();
        setSuccess('Buddy pass deleted successfully');
      } catch (error) {
        console.error('Error deleting buddy pass:', error);
        setError('Failed to delete buddy pass');
      }
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getRouteName = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Buddy Passes</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Request Buddy Pass
          </Button>
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
          {passes.map((pass) => (
            <ListItem key={pass.id}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {getStudentName(pass.studentId)} → {getStudentName(pass.buddyId)}
                    </Typography>
                    <Chip
                      label={PASS_STATUS[pass.status].label}
                      color={PASS_STATUS[pass.status].color}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Route: {getRouteName(pass.routeId)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {formatDate(pass.date)}
                    </Typography>
                    {pass.reason && (
                      <Typography variant="body2" color="text.secondary">
                        Reason: {pass.reason}
                      </Typography>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                {pass.status === 'PENDING' && (
                  <>
                    <IconButton
                      edge="end"
                      onClick={() => handleUpdateStatus(pass.id, 'APPROVED')}
                      sx={{ mr: 1 }}
                      color="success"
                    >
                      <ApproveIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleUpdateStatus(pass.id, 'REJECTED')}
                      sx={{ mr: 1 }}
                      color="error"
                    >
                      <RejectIcon />
                    </IconButton>
                  </>
                )}
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(pass)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeletePass(pass.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPass ? 'Edit Buddy Pass' : 'Request Buddy Pass'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Student</InputLabel>
                  <Select
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    label="Student"
                  >
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Buddy</InputLabel>
                  <Select
                    value={formData.buddyId}
                    onChange={(e) =>
                      setFormData({ ...formData, buddyId: e.target.value })
                    }
                    label="Buddy"
                  >
                    {students
                      .filter(s => s.id !== formData.studentId)
                      .map((student) => (
                        <MenuItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Route</InputLabel>
                  <Select
                    value={formData.routeId}
                    onChange={(e) =>
                      setFormData({ ...formData, routeId: e.target.value })
                    }
                    label="Route"
                  >
                    {routes.map((route) => (
                      <MenuItem key={route.id} value={route.id}>
                        {route.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  multiline
                  rows={2}
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Parent Note"
                  multiline
                  rows={2}
                  value={formData.parentNote}
                  onChange={(e) =>
                    setFormData({ ...formData, parentNote: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPass ? 'Update' : 'Submit'} Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 