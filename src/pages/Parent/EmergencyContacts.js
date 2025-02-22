import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function EmergencyContacts() {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchContacts();
  }, [currentUser.uid]);

  const fetchContacts = async () => {
    try {
      const q = query(
        collection(db, 'emergencyContacts'),
        where('parentId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const contactsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsList);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleOpenDialog = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        email: contact.email,
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        relationship: '',
        phone: '',
        email: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContact(null);
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await updateDoc(doc(db, 'emergencyContacts', editingContact.id), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'emergencyContacts'), {
          ...formData,
          parentId: currentUser.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      handleCloseDialog();
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteDoc(doc(db, 'emergencyContacts', contactId));
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Emergency Contacts
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
          >
            Add Contact
          </Button>
        </Box>

        <List>
          {contacts.map((contact) => (
            <ListItem
              key={contact.id}
              component={Paper}
              variant="outlined"
              sx={{ mb: 1 }}
            >
              <ListItemText
                primary={contact.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" display="block">
                      {contact.relationship}
                    </Typography>
                    <Typography component="span" variant="body2" display="block">
                      Phone: {contact.phone}
                    </Typography>
                    <Typography component="span" variant="body2" display="block">
                      Email: {contact.email}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleOpenDialog(contact)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(contact.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {editingContact ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingContact ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
} 