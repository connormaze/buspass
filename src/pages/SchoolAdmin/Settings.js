import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import IntegrationManager from '../../components/IntegrationManager';

export default function Settings() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        School Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Integrations
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Manage your school's integrations with third-party platforms and services.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <IntegrationManager />
      </Paper>
    </Box>
  );
} 