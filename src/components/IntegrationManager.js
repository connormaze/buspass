import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { integrationManager, SUPPORTED_PLATFORMS, INTEGRATION_TYPES } from '../utils/integrations/integrationManager';
import { doc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function IntegrationManager() {
  const { currentUser } = useAuth();
  const [activeIntegrations, setActiveIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [credentials, setCredentials] = useState({});

  const fetchIntegrations = useCallback(async () => {
    if (!currentUser?.schoolId) return;
    
    try {
      const integrationsRef = collection(db, 'schools', currentUser.schoolId, 'integrations');
      const integrationsSnapshot = await getDocs(integrationsRef);
      const integrationsList = integrationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActiveIntegrations(integrationsList);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setError('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.schoolId]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleAddIntegration = (platform) => {
    setSelectedPlatform(platform);
    setCredentials({});
    setOpenDialog(true);
  };

  const handleSaveIntegration = async () => {
    try {
      setLoading(true);
      setError('');
      
      await integrationManager.setupIntegration(
        currentUser.schoolId,
        selectedPlatform,
        credentials
      );

      setSuccess(`${SUPPORTED_PLATFORMS[selectedPlatform].name} integration added successfully`);
      setOpenDialog(false);
      fetchIntegrations();
    } catch (error) {
      console.error('Error setting up integration:', error);
      setError('Failed to set up integration');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (platform) => {
    try {
      setLoading(true);
      setError('');
      
      await integrationManager.syncData(currentUser.schoolId, platform);
      
      setSuccess(`${SUPPORTED_PLATFORMS[platform].name} data synced successfully`);
      fetchIntegrations();
    } catch (error) {
      console.error('Error syncing data:', error);
      setError('Failed to sync data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (platform) => {
    if (window.confirm(`Are you sure you want to remove the ${SUPPORTED_PLATFORMS[platform].name} integration?`)) {
      try {
        setLoading(true);
        setError('');
        
        await deleteDoc(doc(db, 'schools', currentUser.schoolId, 'integrations', platform));
        
        setSuccess(`${SUPPORTED_PLATFORMS[platform].name} integration removed successfully`);
        fetchIntegrations();
      } catch (error) {
        console.error('Error removing integration:', error);
        setError('Failed to remove integration');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderCredentialsForm = () => {
    if (!selectedPlatform) return null;

    switch (selectedPlatform) {
      case 'POWERSCHOOL':
        return (
          <>
            <TextField
              fullWidth
              label="Client ID"
              margin="normal"
              value={credentials.clientId || ''}
              onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
            />
            <TextField
              fullWidth
              label="Client Secret"
              margin="normal"
              type="password"
              value={credentials.clientSecret || ''}
              onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
            />
            <TextField
              fullWidth
              label="API URL"
              margin="normal"
              value={credentials.apiUrl || ''}
              onChange={(e) => setCredentials({ ...credentials, apiUrl: e.target.value })}
            />
          </>
        );
      case 'GOOGLE_CLASSROOM':
        return (
          <>
            <TextField
              fullWidth
              label="API Key"
              margin="normal"
              value={credentials.apiKey || ''}
              onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
            />
            <TextField
              fullWidth
              label="Client ID"
              margin="normal"
              value={credentials.clientId || ''}
              onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
            />
            <TextField
              fullWidth
              label="Client Secret"
              margin="normal"
              type="password"
              value={credentials.clientSecret || ''}
              onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
            />
          </>
        );
      case 'CANVAS':
        return (
          <>
            <TextField
              fullWidth
              label="Access Token"
              margin="normal"
              type="password"
              value={credentials.accessToken || ''}
              onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
            />
            <TextField
              fullWidth
              label="Domain"
              margin="normal"
              value={credentials.domain || ''}
              onChange={(e) => setCredentials({ ...credentials, domain: e.target.value })}
              helperText="e.g., school.instructure.com"
            />
          </>
        );
      case 'BLACKBOARD':
        return (
          <>
            <TextField
              fullWidth
              label="Application Key"
              margin="normal"
              value={credentials.applicationKey || ''}
              onChange={(e) => setCredentials({ ...credentials, applicationKey: e.target.value })}
            />
            <TextField
              fullWidth
              label="Secret"
              margin="normal"
              type="password"
              value={credentials.secret || ''}
              onChange={(e) => setCredentials({ ...credentials, secret: e.target.value })}
            />
            <TextField
              fullWidth
              label="Domain"
              margin="normal"
              value={credentials.domain || ''}
              onChange={(e) => setCredentials({ ...credentials, domain: e.target.value })}
              helperText="e.g., blackboard.school.edu"
            />
          </>
        );
      case 'MICROSOFT_TEAMS':
        return (
          <>
            <TextField
              fullWidth
              label="Client ID"
              margin="normal"
              value={credentials.clientId || ''}
              onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
            />
            <TextField
              fullWidth
              label="Client Secret"
              margin="normal"
              type="password"
              value={credentials.clientSecret || ''}
              onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
            />
            <TextField
              fullWidth
              label="Tenant ID"
              margin="normal"
              value={credentials.tenantId || ''}
              onChange={(e) => setCredentials({ ...credentials, tenantId: e.target.value })}
            />
          </>
        );
      case 'ZOOM':
        return (
          <>
            <TextField
              fullWidth
              label="API Key"
              margin="normal"
              value={credentials.apiKey || ''}
              onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
            />
            <TextField
              fullWidth
              label="API Secret"
              margin="normal"
              type="password"
              value={credentials.apiSecret || ''}
              onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
            />
          </>
        );
      case 'SLACK':
        return (
          <>
            <TextField
              fullWidth
              label="Bot Token"
              margin="normal"
              value={credentials.botToken || ''}
              onChange={(e) => setCredentials({ ...credentials, botToken: e.target.value })}
              helperText="xoxb-... token from Slack App settings"
            />
            <TextField
              fullWidth
              label="Signing Secret"
              margin="normal"
              type="password"
              value={credentials.signingSecret || ''}
              onChange={(e) => setCredentials({ ...credentials, signingSecret: e.target.value })}
            />
          </>
        );
      case 'CLEVER':
        return (
          <>
            <TextField
              fullWidth
              label="District ID"
              margin="normal"
              value={credentials.districtId || ''}
              onChange={(e) => setCredentials({ ...credentials, districtId: e.target.value })}
            />
            <TextField
              fullWidth
              label="API Token"
              margin="normal"
              type="password"
              value={credentials.apiToken || ''}
              onChange={(e) => setCredentials({ ...credentials, apiToken: e.target.value })}
            />
          </>
        );
      case 'PARENTSQUARE':
        return (
          <>
            <TextField
              fullWidth
              label="API Key"
              margin="normal"
              value={credentials.apiKey || ''}
              onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
            />
            <TextField
              fullWidth
              label="School Token"
              margin="normal"
              type="password"
              value={credentials.schoolToken || ''}
              onChange={(e) => setCredentials({ ...credentials, schoolToken: e.target.value })}
            />
          </>
        );
      default:
        return (
          <Typography color="error">
            Credentials form not implemented for this platform
          </Typography>
        );
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Third-Party Integrations
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Available Integrations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Integrations
              </Typography>
              <List>
                {Object.entries(SUPPORTED_PLATFORMS).map(([key, platform]) => {
                  const isActive = activeIntegrations.some(i => i.platform === key);
                  return (
                    <ListItem key={key}>
                      <ListItemText
                        primary={platform.name}
                        secondary={platform.type}
                      />
                      <ListItemSecondaryAction>
                        {!isActive && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddIntegration(key)}
                          >
                            Add
                          </Button>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Integrations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Integrations
              </Typography>
              <List>
                {activeIntegrations.map((integration) => (
                  <ListItem key={integration.platform}>
                    <ListItemText
                      primary={SUPPORTED_PLATFORMS[integration.platform]?.name}
                      secondary={
                        <>
                          Last synced: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                          <br />
                          <Chip
                            size="small"
                            label={integration.status}
                            color={integration.status === 'active' ? 'success' : 'error'}
                            sx={{ mt: 1 }}
                          />
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Sync Now">
                        <IconButton
                          edge="end"
                          onClick={() => handleSync(integration.platform)}
                          sx={{ mr: 1 }}
                        >
                          <SyncIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove Integration">
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(integration.platform)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Integration Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add {selectedPlatform ? SUPPORTED_PLATFORMS[selectedPlatform].name : ''} Integration
        </DialogTitle>
        <DialogContent>
          {renderCredentialsForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveIntegration}
            disabled={!selectedPlatform || Object.keys(credentials).length === 0}
          >
            Save Integration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 