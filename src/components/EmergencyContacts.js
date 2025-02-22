import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
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
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocalHospital as MedicalIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
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
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const CONTACT_TYPES = {
  PRIMARY: { label: 'Primary', color: 'primary' },
  SECONDARY: { label: 'Secondary', color: 'secondary' },
  MEDICAL: { label: 'Medical', color: 'error' },
  OTHER: { label: 'Other', color: 'default' },
};

const RELATIONSHIP_TYPES = [
  'Parent',
  'Guardian',
  'Grandparent',
  'Sibling',
  'Aunt/Uncle',
  'Doctor',
  'Other',
];

export default function EmergencyContacts({ studentId, schoolId, readOnly = false }) {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMedicalDialog, setOpenMedicalDialog] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    alternatePhone: '',
    email: '',
    type: 'PRIMARY',
    notes: '',
  });
  const [medicalFormData, setMedicalFormData] = useState({
    conditions: '',
    allergies: '',
    medications: '',
    bloodType: '',
    insuranceProvider: '',
    insuranceNumber: '',
    doctorName: '',
    doctorPhone: '',
    hospitalPreference: '',
    notes: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchContacts();
      fetchMedicalInfo();
    }
  }, [studentId]);

  const fetchContacts = async () => {
    try {
      const contactsQuery = query(
        collection(db, 'emergencyContacts'),
        where('studentId', '==', studentId)
      );
      const contactsSnapshot = await getDocs(contactsQuery);
      const contactsList = contactsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsList);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      setError('Failed to load emergency contacts');
    }
  };

  const fetchMedicalInfo = async () => {
    try {
      const medicalQuery = query(
        collection(db, 'medicalInfo'),
        where('studentId', '==', studentId)
      );
      const medicalSnapshot = await getDocs(medicalQuery);
      if (!medicalSnapshot.empty) {
        setMedicalInfo({
          id: medicalSnapshot.docs[0].id,
          ...medicalSnapshot.docs[0].data()
        });
        setMedicalFormData({
          conditions: medicalSnapshot.docs[0].data().conditions || '',
          allergies: medicalSnapshot.docs[0].data().allergies || '',
          medications: medicalSnapshot.docs[0].data().medications || '',
          bloodType: medicalSnapshot.docs[0].data().bloodType || '',
          insuranceProvider: medicalSnapshot.docs[0].data().insuranceProvider || '',
          insuranceNumber: medicalSnapshot.docs[0].data().insuranceNumber || '',
          doctorName: medicalSnapshot.docs[0].data().doctorName || '',
          doctorPhone: medicalSnapshot.docs[0].data().doctorPhone || '',
          hospitalPreference: medicalSnapshot.docs[0].data().hospitalPreference || '',
          notes: medicalSnapshot.docs[0].data().notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching medical information:', error);
      setError('Failed to load medical information');
    }
  };

  const handleOpenDialog = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        alternatePhone: contact.alternatePhone || '',
        email: contact.email || '',
        type: contact.type,
        notes: contact.notes || '',
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        relationship: '',
        phone: '',
        alternatePhone: '',
        email: '',
        type: 'PRIMARY',
        notes: '',
      });
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    try {
      const contactData = {
        ...formData,
        studentId,
        schoolId,
        updatedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
      };

      if (editingContact) {
        const contactRef = doc(db, 'emergencyContacts', editingContact.id);
        await updateDoc(contactRef, contactData);
      } else {
        contactData.createdBy = currentUser.uid;
        contactData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'emergencyContacts'), contactData);
      }

      setOpenDialog(false);
      fetchContacts();
      setSuccess('Emergency contact saved successfully');
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      setError('Failed to save emergency contact');
    }
  };

  const handleSubmitMedical = async (e) => {
    e.preventDefault();
    try {
      const medicalData = {
        ...medicalFormData,
        studentId,
        schoolId,
        updatedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
      };

      if (medicalInfo) {
        const medicalRef = doc(db, 'medicalInfo', medicalInfo.id);
        await updateDoc(medicalRef, medicalData);
      } else {
        medicalData.createdBy = currentUser.uid;
        medicalData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'medicalInfo'), medicalData);
      }

      setOpenMedicalDialog(false);
      fetchMedicalInfo();
      setSuccess('Medical information saved successfully');
    } catch (error) {
      console.error('Error saving medical information:', error);
      setError('Failed to save medical information');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this emergency contact?')) {
      try {
        await deleteDoc(doc(db, 'emergencyContacts', contactId));
        fetchContacts();
        setSuccess('Emergency contact deleted successfully');
      } catch (error) {
        console.error('Error deleting emergency contact:', error);
        setError('Failed to delete emergency contact');
      }
    }
  };

  return (
    <Box>
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

      <Grid container spacing={3}>
        {/* Emergency Contacts Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Emergency Contacts</Typography>
              {!readOnly && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Contact
                </Button>
              )}
            </Box>
            <List>
              {contacts.map((contact) => (
                <ListItem key={contact.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {contact.name}
                        </Typography>
                        <Chip
                          label={CONTACT_TYPES[contact.type].label}
                          color={CONTACT_TYPES[contact.type].color}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2">
                          {contact.relationship}
                        </Typography>
                        <Typography variant="body2">
                          <PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {contact.phone}
                        </Typography>
                        {contact.email && (
                          <Typography variant="body2">
                            Email: {contact.email}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  {!readOnly && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenDialog(contact)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Medical Information Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Medical Information</Typography>
              {!readOnly && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenMedicalDialog(true)}
                >
                  {medicalInfo ? 'Edit' : 'Add'} Medical Info
                </Button>
              )}
            </Box>
            {medicalInfo ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Medical Conditions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {medicalInfo.conditions || 'None reported'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Allergies
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {medicalInfo.allergies || 'None reported'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Current Medications
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {medicalInfo.medications || 'None reported'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Doctor Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {medicalInfo.doctorName}
                        {medicalInfo.doctorPhone && (
                          <>
                            <br />
                            Phone: {medicalInfo.doctorPhone}
                          </>
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No medical information recorded
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Contact Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Relationship</InputLabel>
                  <Select
                    value={formData.relationship}
                    onChange={(e) =>
                      setFormData({ ...formData, relationship: e.target.value })
                    }
                    label="Relationship"
                  >
                    {RELATIONSHIP_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Alternate Phone"
                  value={formData.alternatePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, alternatePhone: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Contact Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    label="Contact Type"
                  >
                    {Object.entries(CONTACT_TYPES).map(([key, value]) => (
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
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitContact} variant="contained">
            {editingContact ? 'Update' : 'Add'} Contact
          </Button>
        </DialogActions>
      </Dialog>

      {/* Medical Information Dialog */}
      <Dialog
        open={openMedicalDialog}
        onClose={() => setOpenMedicalDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Medical Information</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical Conditions"
                  multiline
                  rows={2}
                  value={medicalFormData.conditions}
                  onChange={(e) =>
                    setMedicalFormData({ ...medicalFormData, conditions: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Allergies"
                  multiline
                  rows={2}
                  value={medicalFormData.allergies}
                  onChange={(e) =>
                    setMedicalFormData({ ...medicalFormData, allergies: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Medications"
                  multiline
                  rows={2}
                  value={medicalFormData.medications}
                  onChange={(e) =>
                    setMedicalFormData({ ...medicalFormData, medications: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Blood Type"
                  value={medicalFormData.bloodType}
                  onChange={(e) =>
                    setMedicalFormData({ ...medicalFormData, bloodType: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Insurance Provider"
                  value={medicalFormData.insuranceProvider}
                  onChange={(e) =>
                    setMedicalFormData({ ...medicalFormData, insuranceProvider: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Insurance Number"
                  value={medicalFormData.insuranceNumber}
                  onChange={(e) =>
                    setMedicalFormData({ ...medicalFormData, insuranceNumber: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preferred Hospital"
                  value={medicalFormData.hospitalPreference}
                  onChange={(e) =>
                    setMedicalFormData({ ...medicalFormData, hospitalPreference: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Doctor's Name"
                  value={medicalFormData.doctorName}
                  onChange={(e) =>
                    setMedicalFormData({ ...medicalFormData, doctorName: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Doctor's Phone"
                  value={medicalFormData.doctorPhone}
                  onChange={(e) =>
                    setMedicalFormData({ ...medicalFormData, doctorPhone: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={2}
                  value={medicalFormData.notes}
                  onChange={(e) =>
                    setMedicalFormData({ ...medicalFormData, notes: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMedicalDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitMedical} variant="contained">
            Save Medical Information
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 