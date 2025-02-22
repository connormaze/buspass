import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
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
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const INCIDENT_TYPES = {
  BEHAVIORAL: 'Behavioral Issue',
  SAFETY: 'Safety Concern',
  MEDICAL: 'Medical Emergency',
  BULLYING: 'Bullying',
  OTHER: 'Other',
};

const INCIDENT_SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export default function IncidentReporting({ students }) {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    severity: '',
    description: '',
    involvedStudents: [],
    status: 'OPEN',
    location: '',
    actionTaken: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (students.length > 0) {
      fetchIncidents();
    }
  }, [students]);

  const fetchIncidents = async () => {
    try {
      const incidentsQuery = query(
        collection(db, 'incidents'),
        where('teacherUid', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
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
        involvedStudents: incident.involvedStudents || [],
        status: incident.status,
        location: incident.location || '',
        actionTaken: incident.actionTaken || '',
      });
    } else {
      setEditingIncident(null);
      setFormData({
        type: '',
        severity: '',
        description: '',
        involvedStudents: [],
        status: 'OPEN',
        location: '',
        actionTaken: '',
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
      severity: '',
      description: '',
      involvedStudents: [],
      status: 'OPEN',
      location: '',
      actionTaken: '',
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.type || !formData.severity || !formData.description) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.involvedStudents.length === 0) {
      setError('Please select at least one involved student');
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
        teacherUid: currentUser.uid,
        timestamp: serverTimestamp(),
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
      } catch (error) {
        console.error('Error deleting incident:', error);
        setError('Failed to delete incident');
      }
    }
  };

  const getStudentNames = (studentIds) => {
    return studentIds
      .map(id => {
        const student = students.find(s => s.id === id);
        return student ? `${student.firstName} ${student.lastName}` : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
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

      <Grid container spacing={3}>
        {incidents.map((incident) => (
          <Grid item xs={12} key={incident.id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon
                  color={getSeverityColor(incident.severity)}
                  sx={{ mr: 1 }}
                />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {INCIDENT_TYPES[incident.type]}
                </Typography>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(incident)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteIncident(incident.id)}
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
                    Involved Students: {getStudentNames(incident.involvedStudents)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Location: {incident.location}
                  </Typography>
                </Grid>
                {incident.actionTaken && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Action Taken: {incident.actionTaken}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Chip
                  label={INCIDENT_SEVERITY[incident.severity]}
                  color={getSeverityColor(incident.severity)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={incident.status}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="caption" color="textSecondary">
                  Reported: {formatTimestamp(incident.timestamp)}
                </Typography>
              </Box>
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
                <FormControl fullWidth required>
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
                        {value}
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
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Involved Students</InputLabel>
                  <Select
                    multiple
                    value={formData.involvedStudents}
                    onChange={(e) =>
                      setFormData({ ...formData, involvedStudents: e.target.value })
                    }
                    label="Involved Students"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((studentId) => {
                          const student = students.find(s => s.id === studentId);
                          return (
                            <Chip
                              key={studentId}
                              label={`${student?.firstName} ${student?.lastName}`}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                  label="Action Taken"
                  multiline
                  rows={2}
                  value={formData.actionTaken}
                  onChange={(e) =>
                    setFormData({ ...formData, actionTaken: e.target.value })
                  }
                />
              </Grid>
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
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingIncident ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 