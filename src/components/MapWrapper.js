import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useMaps } from '../contexts/MapsContext';

export default function MapWrapper({ children }) {
  const { mapsLoaded, mapsError } = useMaps();

  if (mapsError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {mapsError}
        </Alert>
      </Box>
    );
  }

  if (!mapsLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return children;
} 