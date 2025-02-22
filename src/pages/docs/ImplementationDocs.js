import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Link as MuiLink,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  School as SchoolIcon,
  DirectionsBus as BusIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

const implementationSteps = [
  'Initial Setup',
  'Configuration',
  'Integration',
  'Testing',
  'Deployment'
];

export default function ImplementationDocs() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Implementation Guide
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Implementation Process
        </Typography>
        <Stepper activeStep={-1} alternativeLabel sx={{ mb: 4 }}>
          {implementationSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Typography paragraph>
          Follow our step-by-step implementation guide to successfully integrate
          BusPass into your school's transportation system. This guide covers
          everything from initial setup to deployment and maintenance.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon color="primary" sx={{ mr: 2 }} />
              <Typography variant="h6">School Setup</Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="System Requirements"
                  secondary="Hardware and software prerequisites"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Database Configuration"
                  secondary="Setting up student and route databases"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="User Management"
                  secondary="Setting up admin and staff accounts"
                />
              </ListItem>
            </List>
            <Button
              variant="outlined"
              onClick={() => handleNavigation('/help/docs/implementation/school-setup')}
              sx={{ mt: 2 }}
            >
              View Setup Guide
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="primary" sx={{ mr: 2 }} />
              <Typography variant="h6">Security Implementation</Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Data Encryption"
                  secondary="Implementing secure data transmission"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Access Control"
                  secondary="Setting up role-based permissions"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Compliance"
                  secondary="Meeting security standards and regulations"
                />
              </ListItem>
            </List>
            <Button
              variant="outlined"
              onClick={() => handleNavigation('/help/docs/implementation/security')}
              sx={{ mt: 2 }}
            >
              View Security Guide
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Integration Modules
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      Route Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    Implement route planning and optimization features.
                  </Typography>
                  <MuiLink
                    component="button"
                    variant="body2"
                    onClick={() => handleNavigation('/help/docs/implementation/routes')}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    Learn More →
                  </MuiLink>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      User Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    Set up student, parent, and staff accounts.
                  </Typography>
                  <MuiLink
                    component="button"
                    variant="body2"
                    onClick={() => handleNavigation('/help/docs/implementation/users')}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    Learn More →
                  </MuiLink>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      Safety Features
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    Implement safety and monitoring systems.
                  </Typography>
                  <MuiLink
                    component="button"
                    variant="body2"
                    onClick={() => handleNavigation('/help/docs/implementation/safety')}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    Learn More →
                  </MuiLink>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Implementation Support
        </Typography>
        <Typography paragraph>
          Need assistance with your implementation? Our technical team is ready to help
          you every step of the way.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            href="mailto:buspass@stardetect.us"
          >
            Contact Implementation Team
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleNavigation('/help/docs/implementation/faq')}
          >
            View FAQs
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 