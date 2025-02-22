import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Clear as ClearIcon,
  Save as SaveIcon
} from '@mui/icons-material';

export default function SignaturePad({ onCapture }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set up drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setContext(ctx);
  }, []);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (event.touches && event.touches[0]) {
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY
      };
    }

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();
    const coordinates = getCoordinates(event);
    context.beginPath();
    context.moveTo(coordinates.x, coordinates.y);
    setIsDrawing(true);
  };

  const draw = (event) => {
    event.preventDefault();
    if (!isDrawing) return;

    const coordinates = getCoordinates(event);
    context.lineTo(coordinates.x, coordinates.y);
    context.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    context.closePath();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = async () => {
    if (!hasSignature) return;

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const signatureBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });
      await onCapture(signatureBlob);
    } catch (error) {
      console.error('Error saving signature:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Please sign in the box below
      </Typography>
      
      <Box
        sx={{
          border: '1px solid #ccc',
          borderRadius: 1,
          mb: 2,
          touchAction: 'none'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '200px' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={clearSignature}
          disabled={!hasSignature || loading}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasSignature || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </Box>
    </Box>
  );
} 