import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Replay as RetakeIcon
} from '@mui/icons-material';

export default function PhotoCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        setPhoto(blob);
      }, 'image/jpeg', 0.8);
      
      stopCamera();
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    startCamera();
  };

  const handleSubmit = async () => {
    if (photo && onCapture) {
      setLoading(true);
      try {
        await onCapture(photo);
      } catch (error) {
        console.error('Error submitting photo:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {!photo ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', maxWidth: '400px', marginBottom: '1rem' }}
          />
          <Button
            variant="contained"
            startIcon={<CameraIcon />}
            onClick={capturePhoto}
            disabled={!stream}
          >
            Capture Photo
          </Button>
        </>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', maxWidth: '400px', marginBottom: '1rem' }}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RetakeIcon />}
              onClick={handleRetake}
              disabled={loading}
            >
              Retake
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
} 