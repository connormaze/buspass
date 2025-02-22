import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Link,
  Button,
  Divider
} from '@mui/material';
import {
  Description as DocIcon,
  Email as EmailIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function WorkingDocs() {
  const navigate = useNavigate();

  const handleEmailClick = () => {
    window.location.href = 'mailto:buspass@stardetect.us';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Working Documentation
      </Typography>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Technical Documentation
        </Typography>
        <Typography paragraph>
          Access our comprehensive technical documentation to understand the inner workings
          of the BusPass system. This documentation is regularly updated to reflect the
          latest features and improvements.
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DocIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">API Documentation</Typography>
              </Box>
              <Typography paragraph>
                Complete API reference with examples and integration guides.
              </Typography>
              <Button
                variant="contained"
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/help/docs/api')}
              >
                View API Docs
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DocIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Implementation Guide</Typography>
              </Box>
              <Typography paragraph>
                Step-by-step guide for implementing BusPass features.
              </Typography>
              <Button
                variant="contained"
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/help/docs/implementation')}
              >
                View Guide
              </Button>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Need Help?
        </Typography>
        <Typography paragraph>
          Our technical support team is here to help you with any questions or issues
          you may encounter while working with our documentation.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EmailIcon />}
            onClick={handleEmailClick}
          >
            Contact Support: buspass@stardetect.us
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Additional Resources
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Link 
              href="/help/getting-started" 
              underline="none"
              onClick={(e) => {
                e.preventDefault();
                navigate('/help/getting-started');
              }}
            >
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                Getting Started Guide
              </Paper>
            </Link>
          </Grid>
          <Grid item xs={12} md={4}>
            <Link 
              href="/help/troubleshooting" 
              underline="none"
              onClick={(e) => {
                e.preventDefault();
                navigate('/help/troubleshooting');
              }}
            >
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                Troubleshooting Guide
              </Paper>
            </Link>
          </Grid>
          <Grid item xs={12} md={4}>
            <Link 
              href="/help/safety-features" 
              underline="none"
              onClick={(e) => {
                e.preventDefault();
                navigate('/help/safety-features');
              }}
            >
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                Safety Features Guide
              </Paper>
            </Link>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 