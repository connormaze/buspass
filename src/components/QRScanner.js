import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function QRScanner({ onScan, onError }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create instance of QR Scanner
    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
      rememberLastUsedCamera: true,
    });

    // Success callback
    const onScanSuccess = (decodedText, decodedResult) => {
      scanner.clear();
      onScan(decodedText, decodedResult);
    };

    // Error callback
    const onScanError = (errorMessage) => {
      if (onError) {
        onError(errorMessage);
      }
      setError(errorMessage);
    };

    // Start scanner
    scanner.render(onScanSuccess, onScanError);
    setLoading(false);

    // Cleanup
    return () => {
      scanner.clear();
    };
  }, [onScan, onError]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Error accessing camera: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <div id="qr-reader" style={{ width: '100%' }} />
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Position the QR code within the frame to scan
      </Typography>
    </Box>
  );
} 