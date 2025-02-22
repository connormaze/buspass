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
  People as PeopleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Users() {
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
        User Management Implementation
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          User Types and Roles
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Administrator Roles"
                secondary="Configure system administrators and school staff"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Driver Accounts"
                secondary="Set up and manage bus driver profiles"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Parent Access"
                secondary="Create and manage parent/guardian accounts"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Access Control
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Permission Settings"
                secondary="Configure role-based access permissions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Authentication Methods"
                secondary="Set up login and verification processes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Account Security"
                secondary="Implement password policies and 2FA"
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
                <GroupIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Bulk User Import"
                secondary="Import users from existing systems"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GroupIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="User Groups"
                secondary="Create and manage user groups and hierarchies"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GroupIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Account Management"
                secondary="Handle user account lifecycle and maintenance"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Next Steps
        </Typography>
        <Typography paragraph>
          After setting up user management, configure safety features and review
          the implementation checklist.
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
            onClick={() => navigate('/help/docs/implementation/faq')}
          >
            View FAQs
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 