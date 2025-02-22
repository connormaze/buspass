import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  DirectionsWalk as WalkIcon,
  DirectionsCar as CarIcon,
  Edit as EditIcon,
  QrCode2 as QrCodeIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function CarpoolManagement() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [transportData, setTransportData] = useState({
    carLine: [],
    walkers: []
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    student: null,
    data: {}
  });

  useEffect(() => {
    if (currentUser?.schoolId) {
      fetchTransportationData();
    }
  }, [currentUser]);

  const fetchTransportationData = async () => {
    try {
      setLoading(true);
      const studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', currentUser.schoolId),
        where('role', '==', 'STUDENT'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(studentsQuery);
      
      const students = await Promise.all(snapshot.docs.map(async doc => {
        const studentData = doc.data();
        const transportInfo = await getStudentTransportInfo(doc.id);
        return {
          id: doc.id,
          ...studentData,
          fullName: `${studentData.firstName} ${studentData.lastName}`,
          transportInfo
        };
      }));

      // Only get car line and walking students
      const organized = {
        carLine: students.filter(s => s.transportInfo?.method === 'CARPOOL'),
        walkers: students.filter(s => s.transportInfo?.method === 'WALKER')
      };

      setTransportData(organized);
      setError('');
    } catch (err) {
      console.error('Error fetching transportation data:', err);
      setError('Failed to load transportation data');
    } finally {
      setLoading(false);
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

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleEditClick = (student) => {
    setEditDialog({
      open: true,
      student,
      data: {
        ...student.transportInfo?.carpoolInfo,
        ...student.transportInfo?.walkerInfo
      }
    });
  };

  const handleEditClose = () => {
    setEditDialog({
      open: false,
      student: null,
      data: {}
    });
  };

  const handleEditSave = async () => {
    try {
      const { student, data } = editDialog;
      if (!student) return;

      const transportRef = doc(db, 'transportationInfo', student.id);
      const method = currentTab === 0 ? 'CARPOOL' : 'WALKER';
      
      const updateData = {
        method,
        ...(method === 'CARPOOL' ? {
          carpoolInfo: {
            pickupNumber: data.pickupNumber,
            parentName: data.parentName,
            parentPhone: data.parentPhone,
            vehicleInfo: data.vehicleInfo,
            alternatePickup: data.alternatePickup
          }
        } : {
          walkerInfo: {
            guardianName: data.guardianName,
            guardianPhone: data.guardianPhone,
            walkingDirection: data.walkingDirection,
            emergencyContact: data.emergencyContact
          }
        })
      };

      await updateDoc(transportRef, updateData);
      await fetchTransportationData();
      handleEditClose();
    } catch (err) {
      console.error('Error updating transport info:', err);
      setError('Failed to update transportation information');
    }
  };

  const renderStudentList = (students, method) => {
    return (
      <List>
        {students.map((student) => (
          <ListItem key={student.id}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {student.fullName}
                  </Typography>
                  {method === 'CARPOOL' && student.transportInfo?.carpoolInfo?.pickupNumber && (
                    <Chip
                      label={`#${student.transportInfo.carpoolInfo.pickupNumber}`}
                      color="primary"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Grade: {student.grade}
                  </Typography>
                  {method === 'CARPOOL' && student.transportInfo?.carpoolInfo && (
                    <>
                      <Typography variant="body2" color="textSecondary">
                        Parent: {student.transportInfo.carpoolInfo.parentName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Vehicle: {student.transportInfo.carpoolInfo.vehicleInfo}
                      </Typography>
                      {student.transportInfo.carpoolInfo.alternatePickup && (
                        <Typography variant="body2" color="textSecondary">
                          Alternate Pickup: {student.transportInfo.carpoolInfo.alternatePickup}
                        </Typography>
                      )}
                    </>
                  )}
                  {method === 'WALKER' && student.transportInfo?.walkerInfo && (
                    <>
                      <Typography variant="body2" color="textSecondary">
                        Guardian: {student.transportInfo.walkerInfo.guardianName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Direction: {student.transportInfo.walkerInfo.walkingDirection}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Emergency Contact: {student.transportInfo.walkerInfo.emergencyContact}
                      </Typography>
                    </>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleEditClick(student)}
                title="Edit Information"
              >
                <EditIcon />
              </IconButton>
              {method === 'CARPOOL' && (
                <IconButton
                  edge="end"
                  onClick={() => {/* TODO: Show QR code for pickup */}}
                  title="Show Pickup QR Code"
                  sx={{ ml: 1 }}
                >
                  <QrCodeIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {students.length === 0 && (
          <ListItem>
            <ListItemText
              primary={`No ${method === 'CARPOOL' ? 'car line' : 'walking'} students registered`}
              secondary="Students can be registered through the parent portal"
            />
          </ListItem>
        )}
      </List>
    );
  };

  const renderEditDialog = () => {
    const { student, data } = editDialog;
    const isCarLine = currentTab === 0;

    if (!student) return null;

    return (
      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit {isCarLine ? 'Car Line' : 'Walker'} Information
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {isCarLine ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="Pickup Number"
                    value={data.pickupNumber || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      data: { ...prev.data, pickupNumber: e.target.value }
                    }))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Parent Name"
                    value={data.parentName || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      data: { ...prev.data, parentName: e.target.value }
                    }))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Parent Phone"
                    value={data.parentPhone || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      data: { ...prev.data, parentPhone: e.target.value }
                    }))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Vehicle Information"
                    value={data.vehicleInfo || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      data: { ...prev.data, vehicleInfo: e.target.value }
                    }))}
                    fullWidth
                    required
                    placeholder="e.g., Red Toyota Camry - License: ABC123"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Alternate Pickup Information"
                    value={data.alternatePickup || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      data: { ...prev.data, alternatePickup: e.target.value }
                    }))}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Additional authorized pickup persons"
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Guardian Name"
                    value={data.guardianName || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      data: { ...prev.data, guardianName: e.target.value }
                    }))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Guardian Phone"
                    value={data.guardianPhone || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      data: { ...prev.data, guardianPhone: e.target.value }
                    }))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Walking Direction"
                    value={data.walkingDirection || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      data: { ...prev.data, walkingDirection: e.target.value }
                    }))}
                    fullWidth
                    required
                    placeholder="e.g., North on Main Street"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Emergency Contact"
                    value={data.emergencyContact || ''}
                    onChange={(e) => setEditDialog(prev => ({
                      ...prev,
                      data: { ...prev.data, emergencyContact: e.target.value }
                    }))}
                    fullWidth
                    required
                    multiline
                    rows={2}
                    placeholder="Name and phone number"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Car Line & Walking Students
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            icon={<CarIcon />} 
            label={`Car Line (${transportData.carLine.length})`}
            title="Students in car pickup/drop-off line"
          />
          <Tab 
            icon={<WalkIcon />} 
            label={`Walkers (${transportData.walkers.length})`}
            title="Students who walk to/from school"
          />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {currentTab === 0 && renderStudentList(transportData.carLine, 'CARPOOL')}
        {currentTab === 1 && renderStudentList(transportData.walkers, 'WALKER')}
      </Paper>

      {renderEditDialog()}
    </Box>
  );
} 