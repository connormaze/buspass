import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
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
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const INCIDENT_TYPES = {
  BEHAVIORAL: 'Behavioral Issue',
  SAFETY: 'Safety Concern',
  MEDICAL: 'Medical Emergency',
  MECHANICAL: 'Vehicle Issue',
  OTHER: 'Other',
};

const INCIDENT_SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export default function IncidentReporting({ bus, route }) {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    severity: '',
    description: '',
    location: '',
    involvedStudents: [],
    status: 'OPEN',
  });
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    if (bus) {
      fetchIncidents();
      fetchStudents();
    }
  }, [bus]);

  const fetchIncidents = async () => {
    try {
      const incidentsQuery = query(
        collection(db, 'incidents'),
        where('busId', '==', bus.id)
      );
      const incidentsSnapshot = await getDocs(incidentsQuery);
      const incidentsList = incidentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIncidents(incidentsList);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      const studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('role', '==', 'student')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
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
        involvedStudents: incident.involvedStudents || [],
        status: incident.status,
      });
      setSelectedStudents(incident.involvedStudents || []);
    } else {
      setEditingIncident(null);
      setFormData({
        type: '',
        severity: '',
        description: '',
        location: '',
        involvedStudents: [],
        status: 'OPEN',
      });
      setSelectedStudents([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIncident(null);
    setFormData({
      type: '',
      severity: '',
      description: '',
      location: '',
      involvedStudents: [],
      status: 'OPEN',
    });
    setSelectedStudents([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const incidentData = {
        ...formData,
        busId: bus.id,
        routeId: route?.id,
        driverUid: currentUser.uid,
        involvedStudents: selectedStudents,
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
          updatedAt: serverTimestamp(),
        });
      }

      handleCloseDialog();
      fetchIncidents();
    } catch (error) {
      console.error('Error saving incident:', error);
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await deleteDoc(doc(db, 'incidents', incidentId));
        fetchIncidents();
      } catch (error) {
        console.error('Error deleting incident:', error);
      }
    }
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Incident Reports</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Report Incident
        </Button>
      </Box>

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
              <Typography color="textSecondary" gutterBottom>
                {incident.description}
              </Typography>
              <Box sx={{ mt: 1 }}>
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
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIncident ? 'Edit Incident Report' : 'New Incident Report'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Involved Students</InputLabel>
                  <Select
                    multiple
                    value={selectedStudents}
                    onChange={(e) => setSelectedStudents(e.target.value)}
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
                        {`${student.firstName} ${student.lastName}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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