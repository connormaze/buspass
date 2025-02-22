import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          color: 'text.secondary',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
} 