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
  DirectionsBus as BusIcon,
  Map as MapIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Routes() {
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
        Route Management Implementation
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Route Planning
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <MapIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Geographic Mapping"
                secondary="Set up service areas and route boundaries"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <MapIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Stop Configuration"
                secondary="Define and optimize bus stop locations"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <MapIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Route Creation"
                secondary="Design efficient routes with multiple stops"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Schedule Management
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <ScheduleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Time Scheduling"
                secondary="Set pickup and drop-off times for each stop"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ScheduleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Calendar Integration"
                secondary="Sync with school calendar for holidays and events"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ScheduleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Schedule Templates"
                secondary="Create reusable schedule templates"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Route Optimization
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <SpeedIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Efficiency Analysis"
                secondary="Optimize routes for time and distance"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SpeedIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Load Balancing"
                secondary="Distribute students evenly across routes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SpeedIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Real-time Adjustments"
                secondary="Handle traffic and weather-based route modifications"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Next Steps
        </Typography>
        <Typography paragraph>
          After setting up routes, implement safety features and user management
          to complete the system configuration.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/help/docs/implementation/safety')}
          >
            Configure Safety Features
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/help/docs/implementation/users')}
          >
            Manage Users
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 