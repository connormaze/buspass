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
  Computer as ComputerIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function SchoolSetup() {
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
        School Setup Guide
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          System Requirements
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <ComputerIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Hardware Requirements"
                secondary="Modern web browser (Chrome, Firefox, Safari, Edge), Internet connection with minimum 10Mbps"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <StorageIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Server Requirements"
                secondary="Compatible with cloud hosting or on-premises deployment"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Database Configuration
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Student Database"
                secondary="Import or create student records with required fields (name, grade, address, etc.)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Route Database"
                secondary="Set up route templates and stop locations"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Data Migration"
                secondary="Tools for importing existing transportation data"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          User Management
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <PeopleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Administrator Accounts"
                secondary="Create and configure school administrator accounts with full system access"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PeopleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Staff Accounts"
                secondary="Set up accounts for teachers, bus drivers, and other staff members"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PeopleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Parent Access"
                secondary="Configure parent portal access and authentication"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Next Steps
        </Typography>
        <Typography paragraph>
          After completing the initial setup, proceed to configure security settings
          and implement route management features.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/help/docs/implementation/security')}
          >
            Configure Security Settings
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/help/docs/implementation/routes')}
          >
            Set Up Routes
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 