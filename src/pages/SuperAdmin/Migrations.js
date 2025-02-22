import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { fixParentStudentAssociations } from '../../utils/migrations/fixParentStudentAssociations';
import { fixStudentTeacherAssociations } from '../../utils/migrations/fixStudentTeacherAssociations';

export default function Migrations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const runParentStudentFix = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const migrationResult = await fixParentStudentAssociations();
      setResult(migrationResult);

      if (!migrationResult.success) {
        setError(migrationResult.error);
      }
    } catch (err) {
      console.error('Migration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runStudentTeacherFix = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const migrationResult = await fixStudentTeacherAssociations();
      setResult(migrationResult);

      if (!migrationResult.success) {
        setError(migrationResult.error);
      }
    } catch (err) {
      console.error('Migration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Database Migrations
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Run maintenance tasks and data fixes
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result?.success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Migration completed successfully
          </Alert>
        )}

        <List>
          <ListItem>
            <ListItemText
              primary="Fix Parent-Student Associations"
              secondary="Updates all student records with correct parent associations and vice versa"
            />
            <Button
              variant="contained"
              onClick={runParentStudentFix}
              disabled={loading}
              sx={{ ml: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Run Fix'}
            </Button>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Fix Student-Teacher Associations"
              secondary="Updates all student records with correct teacher associations and vice versa"
            />
            <Button
              variant="contained"
              onClick={runStudentTeacherFix}
              disabled={loading}
              sx={{ ml: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Run Fix'}
            </Button>
          </ListItem>
          <Divider />
        </List>

        {result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Migration Results:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Total Records Processed"
                  secondary={result.totalProcessed}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Successfully Updated"
                  secondary={result.updated}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Errors Encountered"
                  secondary={result.errors}
                />
              </ListItem>
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
} 