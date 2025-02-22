import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Divider,
  Grid,
  Link,
  Button
} from '@mui/material';
import {
  Code as CodeIcon,
  CloudDownload as DownloadIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';

export default function ApiDocs() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        BusPass API Documentation
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CodeIcon color="primary" sx={{ mr: 2 }} />
          <Typography variant="h5">Getting Started with the API</Typography>
        </Box>
        <Typography paragraph>
          The BusPass API provides a comprehensive set of endpoints for integrating
          bus tracking, route management, and student safety features into your
          school's transportation system.
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          href="/help/docs/api/swagger.json"
          sx={{ mr: 2 }}
        >
          Download OpenAPI Spec
        </Button>
        <Button
          variant="outlined"
          startIcon={<GitHubIcon />}
          href="https://github.com/stardetect/buspass-api"
          target="_blank"
        >
          View on GitHub
        </Button>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Authentication
            </Typography>
            <Typography paragraph>
              Learn how to authenticate your requests using API keys and JWT tokens.
            </Typography>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '1rem',
              borderRadius: '4px',
              overflowX: 'auto'
            }}>
{`// Example API authentication
const response = await fetch('/api/v1/auth', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});`}
            </pre>
            <Button
              variant="text"
              color="primary"
              href="/help/docs/api/auth"
              sx={{ mt: 2 }}
            >
              Read More →
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Endpoints
            </Typography>
            <Typography paragraph>
              Explore our RESTful API endpoints for managing routes, tracking buses,
              and handling student data.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="primary">Available Endpoints:</Typography>
              <ul>
                <li>Route Management</li>
                <li>Real-time Tracking</li>
                <li>Student Management</li>
                <li>Driver Management</li>
                <li>Safety Alerts</li>
              </ul>
            </Box>
            <Button
              variant="text"
              color="primary"
              href="/help/docs/api/endpoints"
            >
              View All Endpoints →
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Integration Examples
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Route Tracking Integration
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Implement real-time bus tracking in your application.
                  </Typography>
                  <Link href="/help/docs/api/examples/tracking">
                    View Example →
                  </Link>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Student Management
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Handle student data and attendance tracking.
                  </Typography>
                  <Link href="/help/docs/api/examples/students">
                    View Example →
                  </Link>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Safety Alerts
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Implement safety notification systems.
                  </Typography>
                  <Link href="/help/docs/api/examples/alerts">
                    View Example →
                  </Link>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Need Help?
        </Typography>
        <Typography paragraph>
          If you need assistance with API integration or have technical questions,
          our support team is here to help.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href="mailto:buspass@stardetect.us"
        >
          Contact API Support
        </Button>
      </Paper>
    </Container>
  );
} 