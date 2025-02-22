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
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
  Policy as PolicyIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Security() {
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
        Security Implementation Guide
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Data Encryption
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <LockIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Transport Layer Security"
                secondary="Configure TLS 1.3 for all data transmission"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LockIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Data at Rest"
                secondary="Implement AES-256 encryption for stored data"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LockIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="End-to-End Encryption"
                secondary="Secure messaging and sensitive communications"
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
                <VpnKeyIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Role-Based Access Control"
                secondary="Configure permissions for different user roles"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <VpnKeyIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Multi-Factor Authentication"
                secondary="Set up 2FA for administrative accounts"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <VpnKeyIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Session Management"
                secondary="Configure timeout and security policies"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Compliance
        </Typography>
        <Box sx={{ mb: 4 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <PolicyIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="FERPA Compliance"
                secondary="Ensure student data protection meets FERPA requirements"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PolicyIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Data Privacy"
                secondary="Implement data retention and privacy policies"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PolicyIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Audit Logging"
                secondary="Set up comprehensive security audit trails"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Next Steps
        </Typography>
        <Typography paragraph>
          After implementing security measures, proceed to set up user management
          and route configuration.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/help/docs/implementation/users')}
          >
            Configure User Management
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