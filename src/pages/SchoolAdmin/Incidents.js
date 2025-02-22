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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  School as TeacherIcon,
  DirectionsBus as BusIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  addDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const INCIDENT_TYPES = {
  // Bus-related incidents
  BEHAVIORAL: 'Behavioral Issue',
  SAFETY: 'Safety Concern',
  MEDICAL: 'Medical Emergency',
  MECHANICAL: 'Vehicle Issue',
  BULLYING: 'Bullying',
  OTHER: 'Other',
};

const INCIDENT_SEVERITY = {
  LOW: { label: 'Low', color: 'success' },
  MEDIUM: { label: 'Medium', color: 'warning' },
  HIGH: { label: 'High', color: 'error' },
  CRITICAL: { label: 'Critical', color: 'error' },
};

export default function SchoolAdminIncidents() {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filters, setFilters] = useState({
    type: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    source: 'ALL',
  });
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    adminNotes: '',
    assignedTo: '',
    status: '',
    followUpActions: '',
  });

  useEffect(() => {
    fetchIncidents();
    fetchUsers();
  }, []);

  const fetchIncidents = async () => {
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      // Fetch both bus driver and teacher incidents
      const [busIncidents, teacherIncidents] = await Promise.all([
        getDocs(
          query(
            collection(db, 'incidents'),
            where('schoolId', '==', schoolId),
            where('source', '==', 'BUS'),
            orderBy('createdAt', 'desc')
          )
        ),
        getDocs(
          query(
            collection(db, 'incidents'),
            where('schoolId', '==', schoolId),
            where('source', '==', 'TEACHER'),
            orderBy('createdAt', 'desc')
          )
        ),
      ]);

      const allIncidents = [
        ...busIncidents.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          source: 'BUS',
        })),
        ...teacherIncidents.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          source: 'TEACHER',
        })),
      ].sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());

      setIncidents(allIncidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setError('Failed to load incidents');
    }
  };

  const fetchUsers = async () => {
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      const usersQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('role', 'in', ['TEACHER', 'BUS_DRIVER', 'SCHOOL_ADMIN'])
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const handleOpenDialog = (incident) => {
    setEditingIncident(incident);
    setFormData({
      adminNotes: incident.adminNotes || '',
      assignedTo: incident.assignedTo || '',
      status: incident.status || 'OPEN',
      followUpActions: incident.followUpActions || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIncident(null);
    setFormData({
      adminNotes: '',
      assignedTo: '',
      status: '',
      followUpActions: '',
    });
  };

  const handleUpdateIncident = async () => {
    try {
      const incidentRef = doc(db, 'incidents', editingIncident.id);
      await updateDoc(incidentRef, {
        ...formData,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      });

      // Add notification for assigned user
      if (formData.assignedTo) {
        await addDoc(collection(db, 'notifications'), {
          type: 'INCIDENT_ASSIGNED',
          incidentId: editingIncident.id,
          assignedTo: formData.assignedTo,
          message: `You have been assigned to incident #${editingIncident.id}`,
          createdAt: serverTimestamp(),
          status: 'UNREAD',
        });
      }

      handleCloseDialog();
      fetchIncidents();
    } catch (error) {
      console.error('Error updating incident:', error);
      setError('Failed to update incident');
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await deleteDoc(doc(db, 'incidents', incidentId));
        fetchIncidents();
      } catch (error) {
        console.error('Error deleting incident:', error);
        setError('Failed to delete incident');
      }
    }
  };

  const getReporterName = (incident) => {
    const reporter = users.find(u => 
      u.uid === (incident.source === 'BUS' ? incident.driverUid : incident.teacherUid)
    );
    return reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Unknown';
  };

  const getAssignedName = (userId) => {
    const user = users.find(u => u.uid === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp.toMillis()).toLocaleString();
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filters.type !== 'ALL' && incident.type !== filters.type) return false;
    if (filters.severity !== 'ALL' && incident.severity !== filters.severity) return false;
    if (filters.status !== 'ALL' && incident.status !== filters.status) return false;
    if (filters.source !== 'ALL' && incident.source !== filters.source) return false;
    return true;
  });

  const getSourceIcon = (source) => {
    return source === 'BUS' ? (
      <BusIcon color="primary" />
    ) : (
      <TeacherIcon color="primary" />
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Incident Reports</Typography>
        <Box>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="All Incidents" />
          <Tab label="Bus Incidents" />
          <Tab label="Teacher Incidents" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {filteredIncidents
          .filter(incident => {
            if (selectedTab === 1) return incident.source === 'BUS';
            if (selectedTab === 2) return incident.source === 'TEACHER';
            return true;
          })
          .map((incident) => (
            <Grid item xs={12} key={incident.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    {getSourceIcon(incident.source)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {INCIDENT_TYPES[incident.type]}
                    </Typography>
                    <Chip
                      label={INCIDENT_SEVERITY[incident.severity].label}
                      color={INCIDENT_SEVERITY[incident.severity].color}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                    <Chip
                      label={incident.status}
                      variant="outlined"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => handleOpenDialog(incident)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteIncident(incident.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body1" paragraph>
                  {incident.description}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Reported by: {getReporterName(incident)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Assigned to: {getAssignedName(incident.assignedTo)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Location: {incident.location}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Reported: {formatDate(incident.createdAt)}
                    </Typography>
                  </Grid>
                  {incident.adminNotes && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        Admin Notes: {incident.adminNotes}
                      </Typography>
                    </Grid>
                  )}
                  {incident.followUpActions && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Follow-up Actions: {incident.followUpActions}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Update Incident Report
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    label="Status"
                  >
                    <MenuItem value="OPEN">Open</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Assign To</InputLabel>
                  <Select
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    label="Assign To"
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.uid} value={user.uid}>
                        {`${user.firstName} ${user.lastName} (${user.role})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Admin Notes"
                  multiline
                  rows={3}
                  value={formData.adminNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, adminNotes: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Follow-up Actions"
                  multiline
                  rows={3}
                  value={formData.followUpActions}
                  onChange={(e) =>
                    setFormData({ ...formData, followUpActions: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateIncident} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 