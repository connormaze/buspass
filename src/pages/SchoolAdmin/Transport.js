import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Route as RouteIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function SchoolAdminTransport({ schoolId }) {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openBusDialog, setOpenBusDialog] = useState(false);
  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [busFormData, setBusFormData] = useState({
    number: '',
    driver: '',
    status: 'Active',
  });
  const [routeFormData, setRouteFormData] = useState({
    name: '',
    stops: '',
    students: '',
    duration: '',
  });

  const { currentUser } = useAuth();

  useEffect(() => {
    if (schoolId) {
      fetchTransportData();
    }
  }, [schoolId]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const fetchTransportData = async () => {
    try {
      setLoading(true);
      // Fetch buses
      const busesQuery = query(collection(db, 'buses'), where('schoolId', '==', schoolId));
      const busesSnapshot = await getDocs(busesQuery);
      const busesData = busesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBuses(busesData);

      // Fetch routes
      const routesQuery = query(collection(db, 'routes'), where('schoolId', '==', schoolId));
      const routesSnapshot = await getDocs(routesQuery);
      const routesData = routesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoutes(routesData);
      setError('');
    } catch (err) {
      console.error('Error fetching transport data:', err);
      setError('Failed to load transport data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async () => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'buses'), {
        ...busFormData,
        schoolId,
        createdAt: new Date(),
        createdBy: currentUser.uid,
      });
      setOpenBusDialog(false);
      setBusFormData({ number: '', driver: '', status: 'Active' });
      await fetchTransportData();
    } catch (err) {
      console.error('Error adding bus:', err);
      setError('Failed to add bus. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async () => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'routes'), {
        ...routeFormData,
        schoolId,
        createdAt: new Date(),
        createdBy: currentUser.uid,
      });
      setOpenRouteDialog(false);
      setRouteFormData({ name: '', stops: '', students: '', duration: '' });
      await fetchTransportData();
    } catch (err) {
      console.error('Error adding route:', err);
      setError('Failed to add route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBus = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'buses', busId));
        await fetchTransportData();
      } catch (err) {
        console.error('Error deleting bus:', err);
        setError('Failed to delete bus. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'routes', routeId));
        await fetchTransportData();
      } catch (err) {
        console.error('Error deleting route:', err);
        setError('Failed to delete route. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Transport Management
            </Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="DRIVERS" />
              <Tab label="BUSES" />
              <Tab label="ROUTES" />
              <Tab label="SCHEDULES" />
            </Tabs>
          </Paper>
        </Grid>

        {currentTab === 1 && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenBusDialog(true)}
              >
                Add Bus
              </Button>
            </Box>
            <Grid container spacing={3}>
              {buses.map((bus) => (
                <Grid item xs={12} md={6} lg={4} key={bus.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BusIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          Bus #{bus.number}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Driver: {bus.driver}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={bus.status}
                          color={bus.status === 'Active' ? 'success' : 'warning'}
                          size="small"
                        />
                        <Box>
                          <IconButton 
                            size="small" 
                            sx={{ mr: 1 }}
                            onClick={() => {
                              setSelectedBus(bus);
                              setBusFormData({
                                number: bus.number,
                                driver: bus.driver,
                                status: bus.status,
                              });
                              setOpenBusDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleDeleteBus(bus.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}

        <Dialog open={openBusDialog} onClose={() => {
          setOpenBusDialog(false);
          setSelectedBus(null);
          setBusFormData({ number: '', driver: '', status: 'Active' });
        }}>
          <DialogTitle>{selectedBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Bus Number"
                value={busFormData.number}
                onChange={(e) => setBusFormData({ ...busFormData, number: e.target.value })}
              />
              <TextField
                fullWidth
                label="Driver Name"
                value={busFormData.driver}
                onChange={(e) => setBusFormData({ ...busFormData, driver: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={busFormData.status}
                  label="Status"
                  onChange={(e) => setBusFormData({ ...busFormData, status: e.target.value })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBusDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddBus}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : selectedBus ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openRouteDialog} onClose={() => {
          setOpenRouteDialog(false);
          setSelectedRoute(null);
          setRouteFormData({ name: '', stops: '', students: '', duration: '' });
        }}>
          <DialogTitle>{selectedRoute ? 'Edit Route' : 'Create New Route'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Route Name"
                value={routeFormData.name}
                onChange={(e) => setRouteFormData({ ...routeFormData, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Number of Stops"
                type="number"
                value={routeFormData.stops}
                onChange={(e) => setRouteFormData({ ...routeFormData, stops: e.target.value })}
              />
              <TextField
                fullWidth
                label="Number of Students"
                type="number"
                value={routeFormData.students}
                onChange={(e) => setRouteFormData({ ...routeFormData, students: e.target.value })}
              />
              <TextField
                fullWidth
                label="Duration (e.g., 45 min)"
                value={routeFormData.duration}
                onChange={(e) => setRouteFormData({ ...routeFormData, duration: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRouteDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddRoute}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : selectedRoute ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Box>
  );
} 