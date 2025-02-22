import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DriverManagementService } from '../services/DriverManagementService';
import { useAuth } from '../contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { getDoc, updateDoc, doc, collection, setDoc, addDoc, getDocs, query, where } from 'firebase/firestore';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`driver-tabpanel-${index}`}
      aria-labelledby={`driver-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DriverManagement() {
  const [currentTab, setCurrentTab] = useState(0);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    licenseNumber: '',
    phoneNumber: '',
    email: '',
    status: 'AVAILABLE',
    password: '',
    isApproved: false,
    approvalStatus: 'PENDING',
    approvalDate: null,
    approvalNotes: '',
    schools: []
  });
  const [performanceData, setPerformanceData] = useState({
    safetyScore: 100,
    punctualityScore: 100,
    studentHandlingScore: 100,
    vehicleMaintenanceScore: 100,
    notes: ''
  });
  const [scheduleData, setScheduleData] = useState({
    monday: { isWorking: false, startTime: '', endTime: '' },
    tuesday: { isWorking: false, startTime: '', endTime: '' },
    wednesday: { isWorking: false, startTime: '', endTime: '' },
    thursday: { isWorking: false, startTime: '', endTime: '' },
    friday: { isWorking: false, startTime: '', endTime: '' },
    saturday: { isWorking: false, startTime: '', endTime: '' },
    sunday: { isWorking: false, startTime: '', endTime: '' }
  });
  const { currentUser } = useAuth();
  const driverService = new DriverManagementService();

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const driversData = await driverService.getSchoolDrivers(currentUser?.schoolId);
      
      const driversWithSchools = await Promise.all(
        driversData.map(async (driver) => {
          const schools = await driverService.getDriverSchools(driver.id);
          return {
            ...driver,
            schools: schools.map(s => s.schoolId)
          };
        })
      );
      
      setDrivers(driversWithSchools);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.schoolId]);

  useEffect(() => {
    if (currentUser?.schoolId) {
      fetchDrivers();
    }
  }, [currentUser?.schoolId, fetchDrivers]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (type, driver = null) => {
    setDialogType(type);
    setSelectedDriver(driver);
    setFormData(driver || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDriver(null);
    setFormData({});
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePerformanceChange = (event) => {
    const { name, value } = event.target;
    setPerformanceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (day, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (dialogType === 'add') {
        if (!formData.password) {
          throw new Error('Password is required for new drivers');
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        const userData = {
          ...formData,
          uid: userCredential.user.uid,
          role: 'BUSDRIVER',
          status: 'PENDING',
          approvalStatus: 'PENDING',
          isApproved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: currentUser.uid
        };

        await driverService.createDriver({
          ...userData,
          schoolId: currentUser.schoolId
        });

        await addDoc(collection(db, 'notifications'), {
          type: 'NEW_DRIVER',
          userId: userCredential.user.uid,
          schoolId: currentUser.schoolId,
          status: 'unread',
          message: `New driver account created: ${formData.firstName} ${formData.lastName}`,
          createdAt: new Date(),
          createdBy: currentUser.uid
        });
      } else if (dialogType === 'edit') {
        await driverService.updateDriver(selectedDriver.id, formData);
      }

      handleCloseDialog();
      fetchDrivers();
    } catch (error) {
      console.error('Error submitting driver:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPerformance = async () => {
    try {
      setLoading(true);
      await driverService.recordPerformance(selectedDriver.id, performanceData);
      await fetchDrivers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error recording performance:', error);
      setError('Failed to record performance: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSchedule = async () => {
    try {
      setLoading(true);
      const weekStart = new Date();
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      await driverService.updateDriverSchedule(selectedDriver.id, weekStart.toISOString(), scheduleData);
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating schedule:', error);
      setError('Failed to update schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (driver) => {
    try {
      if (window.confirm(`Are you sure you want to delete driver ${driver.firstName} ${driver.lastName}? This action cannot be undone.`)) {
        setLoading(true);
        await driverService.deleteDriver(driver.id);
        await fetchDrivers();
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      setError('Failed to delete driver: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (driverId, isApproved, notes = '') => {
    try {
      setLoading(true);
      const driverDoc = await getDoc(doc(db, 'users', driverId));
      if (!driverDoc.exists()) {
        throw new Error('Driver not found');
      }

      const status = isApproved ? 'APPROVED' : 'REJECTED';
      const approvalData = {
        isApproved,
        status,
        approvalStatus: status,
        approvalDate: new Date().toISOString(),
        approvalNotes: notes,
        updatedAt: new Date(),
        updatedBy: currentUser.uid
      };

      await updateDoc(doc(db, 'users', driverId), approvalData);

      await addDoc(collection(db, 'notifications'), {
        userId: driverId,
        type: isApproved ? 'DRIVER_APPROVED' : 'DRIVER_REJECTED',
        message: isApproved ? 
          'Your driver account has been approved. You can now log in to the system.' :
          `Your driver account has been rejected. Reason: ${notes || 'No reason provided'}`,
        status: 'unread',
        createdAt: new Date(),
        createdBy: currentUser.uid,
        schoolId: currentUser.schoolId
      });

      await fetchDrivers();
    } catch (error) {
      console.error('Error updating driver approval:', error);
      setError('Failed to update driver approval status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolAssociation = async (driverId, schoolId, action) => {
    try {
      setLoading(true);
      if (action === 'add') {
        await driverService.addDriverToSchool(driverId, schoolId);
      } else if (action === 'remove') {
        await driverService.removeDriverFromSchool(driverId, schoolId);
      }
      fetchDrivers();
    } catch (error) {
      console.error('Error managing school association:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDriverForm = () => (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleFormChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleFormChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="License Number"
            name="licenseNumber"
            value={formData.licenseNumber || ''}
            onChange={handleFormChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleFormChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleFormChange}
            required
          />
        </Grid>
        {dialogType === 'add' && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password || ''}
              onChange={handleFormChange}
              required
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Status"
            name="status"
            value={formData.status || 'AVAILABLE'}
            onChange={handleFormChange}
            required
          >
            <MenuItem value="AVAILABLE">Available</MenuItem>
            <MenuItem value="ON_LEAVE">On Leave</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </TextField>
        </Grid>
        {dialogType === 'edit' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Approval Status"
                name="approvalStatus"
                value={formData.approvalStatus || 'PENDING'}
                onChange={handleFormChange}
                required
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Approval Notes"
                name="approvalNotes"
                value={formData.approvalNotes || ''}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );

  const renderDriverList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>License</TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>{`${driver.firstName} ${driver.lastName}`}</TableCell>
              <TableCell>{driver.licenseNumber}</TableCell>
              <TableCell>
                <Typography variant="body2">{driver.email}</Typography>
                <Typography variant="body2" color="textSecondary">{driver.phoneNumber}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={driver.status || 'PENDING'}
                  color={
                    driver.status === 'APPROVED' ? 'success' :
                    driver.status === 'REJECTED' ? 'error' : 'warning'
                  }
                  size="small"
                />
                {driver.approvalNotes && (
                  <Typography variant="caption" display="block" color="textSecondary">
                    {driver.approvalNotes}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {driver.status !== 'APPROVED' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleApproval(driver.id, true)}
                    >
                      Approve
                    </Button>
                  )}
                  {driver.status !== 'REJECTED' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => handleApproval(driver.id, false)}
                    >
                      Reject
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog('edit', driver)}
                    title="Edit Driver"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(driver)}
                    title="Delete Driver"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Driver Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Driver
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Drivers" />
          <Tab label="Performance" />
          <Tab label="Schedules" />
          <Tab label="Assignments" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          {renderDriverList()}
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {/* Performance analytics will be implemented here */}
          <Typography>Driver Performance Analytics</Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {/* Schedule management will be implemented here */}
          <Typography>Driver Schedules</Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          {/* Route assignments will be implemented here */}
          <Typography>Route Assignments</Typography>
        </TabPanel>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'Add New Driver' :
           dialogType === 'edit' ? 'Edit Driver' :
           dialogType === 'performance' ? 'Record Performance' :
           'Manage Schedule'}
        </DialogTitle>
        <DialogContent>
          {(dialogType === 'add' || dialogType === 'edit') && renderDriverForm()}
          {dialogType === 'performance' && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Safety Score"
                    name="safetyScore"
                    type="number"
                    value={performanceData.safetyScore}
                    onChange={handlePerformanceChange}
                    inputProps={{ min: 0, max: 100 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Punctuality Score"
                    name="punctualityScore"
                    type="number"
                    value={performanceData.punctualityScore}
                    onChange={handlePerformanceChange}
                    inputProps={{ min: 0, max: 100 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Student Handling Score"
                    name="studentHandlingScore"
                    type="number"
                    value={performanceData.studentHandlingScore}
                    onChange={handlePerformanceChange}
                    inputProps={{ min: 0, max: 100 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vehicle Maintenance Score"
                    name="vehicleMaintenanceScore"
                    type="number"
                    value={performanceData.vehicleMaintenanceScore}
                    onChange={handlePerformanceChange}
                    inputProps={{ min: 0, max: 100 }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Performance Notes"
                    name="notes"
                    multiline
                    rows={4}
                    value={performanceData.notes}
                    onChange={handlePerformanceChange}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          {dialogType === 'schedule' && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {Object.entries(scheduleData).map(([day, schedule]) => (
                  <Grid item xs={12} key={day}>
                    <Paper sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                            {day}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label="Working"
                            select
                            fullWidth
                            value={schedule.isWorking}
                            onChange={(e) => handleScheduleChange(day, 'isWorking', e.target.value === 'true')}
                          >
                            <MenuItem value="true">Yes</MenuItem>
                            <MenuItem value="false">No</MenuItem>
                          </TextField>
                        </Grid>
                        {schedule.isWorking && (
                          <>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                label="Start Time"
                                type="time"
                                fullWidth
                                value={schedule.startTime}
                                onChange={(e) => handleScheduleChange(day, 'startTime', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                label="End Time"
                                type="time"
                                fullWidth
                                value={schedule.endTime}
                                onChange={(e) => handleScheduleChange(day, 'endTime', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={
              dialogType === 'performance' ? handleSubmitPerformance :
              dialogType === 'schedule' ? handleSubmitSchedule :
              handleSubmit
            }
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {selectedDriver && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Associated Schools</Typography>
          <List>
            {selectedDriver.schools?.map((schoolId) => (
              <ListItem
                key={schoolId}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="remove"
                    onClick={() => handleSchoolAssociation(selectedDriver.id, schoolId, 'remove')}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={schoolId} />
              </ListItem>
            ))}
          </List>
          <Button
            variant="outlined"
            onClick={() => {/* Open school selection dialog */}}
            startIcon={<AddIcon />}
          >
            Add School Association
          </Button>
        </Box>
      )}
    </Box>
  );
} 