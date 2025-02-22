import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import {
  Security as SecurityIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Report as ReportIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Safety() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/help/docs/implementation')}
        sx={{ mb: 4 }}
      >
        Back to Implementation Guide
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Safety Features Implementation
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Real-time Tracking
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <LocationIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="GPS Integration"
                secondary="Set up real-time vehicle tracking"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LocationIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Geofencing"
                secondary="Configure route boundaries and safe zones"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LocationIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Location History"
                secondary="Implement route history and playback"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Alert System
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Emergency Alerts"
                secondary="Configure emergency notification system"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Parent Notifications"
                secondary="Set up arrival and departure alerts"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Weather Alerts"
                secondary="Implement weather-related notifications"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Safety Monitoring
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <ReportIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Incident Reporting"
                secondary="Set up safety incident reporting system"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ReportIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Driver Monitoring"
                secondary="Implement driver behavior tracking"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ReportIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Safety Analytics"
                secondary="Configure safety performance metrics"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Next Steps
        </Typography>
        <Typography paragraph>
          After implementing safety features, review the implementation checklist
          and prepare for system testing.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/help/docs/implementation/faq')}
          >
            View FAQs
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/help/docs/implementation')}
          >
            Back to Overview
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 