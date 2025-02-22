import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';

export default function Dashboard() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            StarDetect Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Message */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Welcome, {currentUser?.email}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Role: {userRole}
              </Typography>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          {userRole === 'PARENT' && (
            <>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => navigate('/bus-tracking')}
                >
                  <DirectionsBusIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Bus Tracking
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Track your child's bus location and receive arrival notifications
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => navigate('/emergency-contacts')}
                >
                  <ContactPhoneIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Emergency Contacts
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Manage emergency contact information for your children
                  </Typography>
                </Paper>
              </Grid>
            </>
          )}

          {/* Add more role-specific content here */}
        </Grid>
      </Container>
    </Box>
  );
} 