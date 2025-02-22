import React, { useState } from 'react';
import {
  Box,
  Button,
  Avatar,
  CircularProgress,
  Typography,
  IconButton,
} from '@mui/material';
import {
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export default function StudentProfilePicture({ student, onUpdate, readOnly = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${student.id}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Call the onUpdate callback with the new URL
      if (onUpdate) {
        onUpdate(downloadURL);
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setUploading(true);
      setError(null);

      // Delete the file from storage
      const storageRef = ref(storage, `profile-pictures/${student.id}`);
      await deleteObject(storageRef);

      // Call the onUpdate callback with null to remove the URL
      if (onUpdate) {
        onUpdate(null);
      }
    } catch (err) {
      console.error('Error deleting profile picture:', err);
      setError(err.message || 'Failed to delete profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Avatar
        src={student.profilePicture}
        sx={{ width: 120, height: 120, mb: 2 }}
      />
      
      {!readOnly && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoIcon />}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
          
          {student.profilePicture && (
            <IconButton
              color="error"
              onClick={handleDelete}
              disabled={uploading}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      )}

      {uploading && (
        <CircularProgress size={24} sx={{ mt: 1 }} />
      )}

      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
} 