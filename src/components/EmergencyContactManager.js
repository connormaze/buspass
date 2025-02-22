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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { EmergencyContactService } from '../services/EmergencyContactService';

const emergencyContactService = new EmergencyContactService();

export default function EmergencyContactManager({ student, readOnly }) {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (student?.id) {
      loadContacts();
    }
  }, [student?.id]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const studentContacts = await emergencyContactService.getStudentEmergencyContacts(student.id);
      setContacts(studentContacts);
      setError(null);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError('Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (editContact) {
        await emergencyContactService.updateEmergencyContact(editContact.id, formData);
      } else {
        await emergencyContactService.addEmergencyContact(student.id, formData);
      }

      setOpen(false);
      resetForm();
      await loadContacts();
    } catch (err) {
      console.error('Error saving contact:', err);
      setError('Failed to save emergency contact');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setEditContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email,
      address: contact.address,
      notes: contact.notes || ''
    });
    setOpen(true);
  };

  const handleDelete = async (contactId) => {
    try {
      setLoading(true);
      setError(null);
      await emergencyContactService.deleteEmergencyContact(contactId);
      await loadContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete emergency contact');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
    setEditContact(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Emergency Contacts</Typography>
        {!readOnly && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            disabled={loading}
          >
            Add Contact
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {contacts.map((contact) => (
          <Card key={contact.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" component="div">
                    {contact.name} - {contact.relationship}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {contact.phone}
                  </Typography>
                  {contact.email && (
                    <Typography variant="body2" color="text.secondary">
                      Email: {contact.email}
                    </Typography>
                  )}
                  {contact.address && (
                    <Typography variant="body2" color="text.secondary">
                      Address: {contact.address}
                    </Typography>
                  )}
                  {contact.notes && (
                    <Typography variant="body2" color="text.secondary">
                      Notes: {contact.notes}
                    </Typography>
                  )}
                </Box>
                {!readOnly && (
                  <Box>
                    <IconButton onClick={() => handleEdit(contact)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(contact.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
        {contacts.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No emergency contacts added yet
          </Typography>
        )}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editContact ? 'Edit Contact' : 'Add Emergency Contact'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
            />
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            disabled={loading || !formData.name || !formData.relationship || !formData.phone}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 