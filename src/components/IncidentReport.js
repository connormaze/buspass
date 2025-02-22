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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
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

const INCIDENT_TYPES = {
  BEHAVIORAL: 'Behavioral',
  SAFETY: 'Safety',
  MEDICAL: 'Medical',
  MECHANICAL: 'Mechanical',
  OTHER: 'Other',
};

const INCIDENT_SEVERITY = {
  LOW: { label: 'Low', color: 'info' },
  MEDIUM: { label: 'Medium', color: 'warning' },
  HIGH: { label: 'High', color: 'error' },
};

export default function IncidentReport({ busId, routeId }) {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    severity: 'LOW',
    description: '',
    location: '',
    studentsInvolved: '',
    immediateActions: '',
    requiresFollowUp: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (busId) {
      fetchIncidents();
    }
  }, [busId]);

  const fetchIncidents = async () => {
    try {
      const incidentsQuery = query(
        collection(db, 'incidents'),
        where('busId', '==', busId),
        orderBy('createdAt', 'desc')
      );
      const incidentsSnapshot = await getDocs(incidentsQuery);
      const incidentsList = incidentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIncidents(incidentsList);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setError('Failed to load incidents');
    }
  };

  const handleOpenDialog = (incident = null) => {
    if (incident) {
      setEditingIncident(incident);
      setFormData({
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        location: incident.location,
        studentsInvolved: incident.studentsInvolved,
        immediateActions: incident.immediateActions,
        requiresFollowUp: incident.requiresFollowUp,
      });
    } else {
      setEditingIncident(null);
      setFormData({
        type: '',
        severity: 'LOW',
        description: '',
        location: '',
        studentsInvolved: '',
        immediateActions: '',
        requiresFollowUp: false,
      });
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIncident(null);
    setFormData({
      type: '',
      severity: 'LOW',
      description: '',
      location: '',
      studentsInvolved: '',
      immediateActions: '',
      requiresFollowUp: false,
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.type || !formData.description) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const incidentData = {
        ...formData,
        busId,
        routeId,
        reportedBy: currentUser.uid,
        status: 'OPEN',
      };

      if (editingIncident) {
        const incidentRef = doc(db, 'incidents', editingIncident.id);
        await updateDoc(incidentRef, {
          ...incidentData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'incidents'), {
          ...incidentData,
          createdAt: serverTimestamp(),
        });
      }

      handleCloseDialog();
      fetchIncidents();
      setSuccess(`Incident ${editingIncident ? 'updated' : 'reported'} successfully`);

      // Send notifications to relevant staff
      await addDoc(collection(db, 'notifications'), {
        type: 'INCIDENT',
        severity: formData.severity,
        busId,
        routeId,
        message: `New incident reported on bus ${busId}: ${formData.type}`,
        createdAt: serverTimestamp(),
        status: 'UNREAD',
      });
    } catch (error) {
      console.error('Error saving incident:', error);
      setError('Failed to save incident');
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await deleteDoc(doc(db, 'incidents', incidentId));
        fetchIncidents();
        setSuccess('Incident deleted successfully');
      } catch (error) {
        console.error('Error deleting incident:', error);
        setError('Failed to delete incident');
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Incident Reports</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Report Incident
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
          {incidents.map((incident) => (
            <ListItem key={incident.id}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {INCIDENT_TYPES[incident.type]}
                    </Typography>
                    <Chip
                      label={INCIDENT_SEVERITY[incident.severity].label}
                      color={INCIDENT_SEVERITY[incident.severity].color}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {incident.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reported: {formatDate(incident.createdAt)}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(incident)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteIncident(incident.id)}
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
          {editingIncident ? 'Edit Incident Report' : 'New Incident Report'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Incident Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    label="Incident Type"
                  >
                    {Object.entries(INCIDENT_TYPES).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: e.target.value })
                    }
                    label="Severity"
                  >
                    {Object.entries(INCIDENT_SEVERITY).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Students Involved"
                  multiline
                  rows={2}
                  value={formData.studentsInvolved}
                  onChange={(e) =>
                    setFormData({ ...formData, studentsInvolved: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Immediate Actions Taken"
                  multiline
                  rows={2}
                  value={formData.immediateActions}
                  onChange={(e) =>
                    setFormData({ ...formData, immediateActions: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingIncident ? 'Update' : 'Submit'} Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 