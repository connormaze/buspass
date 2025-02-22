import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export default function PendingUsers() {
  const { currentUser, getPendingUsers, approveUser, rejectUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [action, setAction] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, [currentUser?.schoolId]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const users = await getPendingUsers(currentUser.schoolId);
      setPendingUsers(users);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setError('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (user, actionType) => {
    setSelectedUser(user);
    setAction(actionType);
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (action === 'approve') {
        await approveUser(selectedUser.id);
      } else {
        await rejectUser(selectedUser.id);
      }
      await fetchPendingUsers();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error processing user:', error);
      setError(`Failed to ${action} user`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Pending User Approvals
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {pendingUsers.length === 0 ? (
          <Typography color="textSecondary">
            No pending users to approve
          </Typography>
        ) : (
          <List>
            {pendingUsers.map((user) => (
              <ListItem
                key={user.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {user.email}
                      <Chip
                        label={user.role}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="success"
                    onClick={() => handleAction(user, 'approve')}
                    sx={{ mr: 1 }}
                  >
                    <ApproveIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleAction(user, 'reject')}
                  >
                    <RejectIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            {action === 'approve' ? 'Approve User' : 'Reject User'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to {action}{' '}
              {selectedUser && `${selectedUser.firstName} ${selectedUser.lastName}`}?
              {action === 'reject' &&
                ' This will prevent them from accessing the system.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmAction}
              color={action === 'approve' ? 'success' : 'error'}
              variant="contained"
            >
              Confirm {action}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
} 