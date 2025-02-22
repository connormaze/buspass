import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Chip,
  Tooltip,
  Collapse,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  QrCodeScanner as ScanIcon,
  CheckCircle as CheckInIcon,
  Cancel as CheckOutIcon,
  Search as SearchIcon,
  SwapHoriz as BuddyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationOn as LocationIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import QRScanner from '../../components/QRScanner';

export default function StudentCheckIn({ bus, route }) {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [checkedInStudents, setCheckedInStudents] = useState([]);
  const [buddyPasses, setBuddyPasses] = useState([]);
  const [openScanner, setOpenScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [expandedBuddyPass, setExpandedBuddyPass] = useState(null);
  const [showBuddyPassSection, setShowBuddyPassSection] = useState(true);

  useEffect(() => {
    if (route) {
      fetchStudents();
      fetchCheckedInStudents();
      fetchBuddyPasses();
    }
  }, [route]);

  const fetchStudents = async () => {
    try {
      const adminDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = adminDoc.docs[0].data().schoolId;

      const studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('role', '==', 'student')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    }
  };

  const fetchCheckedInStudents = async () => {
    try {
      const checkInsQuery = query(
        collection(db, 'checkIns'),
        where('routeId', '==', route.id),
        where('date', '==', new Date().toISOString().split('T')[0])
      );
      const checkInsSnapshot = await getDocs(checkInsQuery);
      const checkedIn = checkInsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCheckedInStudents(checkedIn);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      setError('Failed to load attendance records');
    }
  };

  const fetchBuddyPasses = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const buddyPassesQuery = query(
        collection(db, 'buddyPasses'),
        where('routeId', '==', route.id),
        where('date', '==', today),
        where('status', '==', 'APPROVED')
      );
      const buddyPassesSnapshot = await getDocs(buddyPassesQuery);
      const buddyPassesList = await Promise.all(buddyPassesSnapshot.docs.map(async doc => {
        const data = doc.data();
        
        // Fetch buddy's assigned route and stop
        const buddyStudent = await getBuddyStudentDetails(data.buddyId);
        const buddyStop = buddyStudent?.assignedStop;
        
        return {
          id: doc.id,
          ...data,
          buddyStudent,
          destinationStop: buddyStop, // The destination is always the buddy's assigned stop
          status: getBuddyPassStatus(data, checkedInStudents)
        };
      }));
      setBuddyPasses(buddyPassesList);
    } catch (error) {
      console.error('Error fetching buddy passes:', error);
      setError('Failed to load buddy passes');
    }
  };

  const getBuddyStudentDetails = async (studentId) => {
    try {
      const studentDoc = await getDocs(doc(db, 'users', studentId));
      if (!studentDoc.exists()) return null;

      const studentData = studentDoc.data();
      
      // Get student's assigned stop
      const stopDoc = await getDocs(doc(db, 'stops', studentData.assignedStopId));
      const assignedStop = stopDoc.exists() ? stopDoc.data() : null;

      return {
        ...studentData,
        assignedStop
      };
    } catch (error) {
      console.error('Error fetching buddy student details:', error);
      return null;
    }
  };

  const getBuddyPassStatus = (buddyPass, checkIns) => {
    const originalStudentCheckin = checkIns.find(c => 
      c.studentId === buddyPass.studentId && !c.checkOutTime
    );
    const buddyStudentCheckin = checkIns.find(c => 
      c.studentId === buddyPass.buddyId && !c.checkOutTime
    );

    if (!originalStudentCheckin && !buddyStudentCheckin) {
      return { status: 'PENDING', label: 'Waiting for Check-in', color: 'default' };
    }
    if (originalStudentCheckin && !buddyStudentCheckin) {
      return { status: 'PARTIAL', label: 'Original Student Checked In', color: 'warning' };
    }
    if (!originalStudentCheckin && buddyStudentCheckin) {
      return { status: 'PARTIAL', label: 'Buddy Student Checked In', color: 'warning' };
    }
    return { status: 'COMPLETE', label: 'Both Students Checked In', color: 'success' };
  };

  const getBuddyPassInfo = (studentId) => {
    const buddyPass = buddyPasses.find(
      pass => pass.studentId === studentId || pass.buddyId === studentId
    );
    
    if (!buddyPass) return null;

    const isOriginalStudent = buddyPass.studentId === studentId;
    const buddyStudent = students.find(s => 
      s.id === (isOriginalStudent ? buddyPass.buddyId : buddyPass.studentId)
    );

    return {
      ...buddyPass,
      buddyName: buddyStudent ? `${buddyStudent.firstName} ${buddyStudent.lastName}` : 'Unknown',
      isOriginalStudent,
      status: getBuddyPassStatus(buddyPass, checkedInStudents)
    };
  };

  const validateBuddyPass = (buddyPassInfo, studentId) => {
    if (!buddyPassInfo) return { valid: true };

    const currentTime = new Date();
    const scheduledTime = new Date(buddyPassInfo.scheduledTime);
    
    // Time validation
    if (currentTime < new Date(scheduledTime.getTime() - 30 * 60000)) {
      return { 
        valid: false, 
        error: 'Too early for buddy pass check-in' 
      };
    }
    
    if (currentTime > new Date(scheduledTime.getTime() + 30 * 60000)) {
      return { 
        valid: false, 
        error: 'Too late for buddy pass check-in' 
      };
    }

    // Route validation - ensure buddy is assigned to this route
    if (buddyPassInfo.buddyStudent?.assignedRouteId !== route.id) {
      return {
        valid: false,
        error: 'Invalid buddy pass - buddy is not assigned to this route'
      };
    }

    // Stop validation - ensure destination is buddy's assigned stop
    if (buddyPassInfo.buddyStudent?.assignedStopId !== buddyPassInfo.destinationStopId) {
      return {
        valid: false,
        error: 'Invalid buddy pass - destination must be buddy\'s assigned stop'
      };
    }

    return { valid: true };
  };

  const handleQRScan = async (decodedText) => {
    try {
      const studentId = decodedText;
      const student = students.find(s => s.id === studentId);
      if (!student) {
        setError('Student not found');
        return;
      }

      const buddyPassInfo = getBuddyPassInfo(studentId);
      
      // Validate buddy pass
      const validation = validateBuddyPass(buddyPassInfo, studentId);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      const existingCheckIn = checkedInStudents.find(
        c => c.studentId === studentId && !c.checkOutTime
      );

      if (existingCheckIn) {
        const checkInRef = doc(db, 'checkIns', existingCheckIn.id);
        await updateDoc(checkInRef, {
          checkOutTime: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'checkIns'), {
          studentId,
          routeId: route.id,
          busId: bus.id,
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
          date: new Date().toISOString().split('T')[0],
          hasBuddyPass: !!buddyPassInfo,
          buddyPassId: buddyPassInfo?.id,
          destinationStopId: buddyPassInfo?.buddyStudent?.assignedStopId,
          createdAt: serverTimestamp(),
          validatedDestination: buddyPassInfo ? {
            buddyId: buddyPassInfo.buddyId,
            buddyStopId: buddyPassInfo.buddyStudent?.assignedStopId,
            buddyRouteId: buddyPassInfo.buddyStudent?.assignedRouteId,
            validatedAt: serverTimestamp()
          } : null
        });

        if (buddyPassInfo) {
          const buddyPassRef = doc(db, 'buddyPasses', buddyPassInfo.id);
          await updateDoc(buddyPassRef, {
            lastCheckIn: serverTimestamp(),
            status: 'IN_PROGRESS',
            validationDetails: {
              checkedInAt: serverTimestamp(),
              validDestination: true,
              validRoute: true,
              checkedInBy: currentUser.uid
            }
          });
        }
      }

      await Promise.all([
        fetchCheckedInStudents(),
        fetchBuddyPasses(),
      ]);
      setError(null);
      setOpenScanner(false);
    } catch (error) {
      console.error('Error processing check-in:', error);
      setError('Failed to process check-in');
    }
  };

  const handleQRError = (error) => {
    console.error('QR Scanner error:', error);
    setError('Failed to access camera');
  };

  const handleManualCheckIn = async (student) => {
    try {
      const buddyPassInfo = getBuddyPassInfo(student.id);
      
      // Validate buddy pass
      const validation = validateBuddyPass(buddyPassInfo, student.id);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      const existingCheckIn = checkedInStudents.find(
        c => c.studentId === student.id && !c.checkOutTime
      );

      if (existingCheckIn) {
        const checkInRef = doc(db, 'checkIns', existingCheckIn.id);
        await updateDoc(checkInRef, {
          checkOutTime: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'checkIns'), {
          studentId: student.id,
          routeId: route.id,
          busId: bus.id,
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
          date: new Date().toISOString().split('T')[0],
          hasBuddyPass: !!buddyPassInfo,
          buddyPassId: buddyPassInfo?.id,
          destinationStopId: buddyPassInfo?.buddyStudent?.assignedStopId,
          createdAt: serverTimestamp(),
          // Add validation info
          validatedDestination: buddyPassInfo ? {
            buddyId: buddyPassInfo.buddyId,
            buddyStopId: buddyPassInfo.buddyStudent?.assignedStopId,
            buddyRouteId: buddyPassInfo.buddyStudent?.assignedRouteId,
            validatedAt: serverTimestamp()
          } : null
        });

        if (buddyPassInfo) {
          const buddyPassRef = doc(db, 'buddyPasses', buddyPassInfo.id);
          await updateDoc(buddyPassRef, {
            lastCheckIn: serverTimestamp(),
            status: 'IN_PROGRESS',
            validationDetails: {
              checkedInAt: serverTimestamp(),
              validDestination: true,
              validRoute: true,
              checkedInBy: currentUser.uid
            }
          });
        }
      }

      await Promise.all([
        fetchCheckedInStudents(),
        fetchBuddyPasses(),
      ]);
      setError(null);
    } catch (error) {
      console.error('Error processing manual check-in:', error);
      setError('Failed to process check-in');
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower)
    );
  });

  const isStudentCheckedIn = (studentId) => {
    return checkedInStudents.some(c => c.studentId === studentId && !c.checkOutTime);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!route) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6">No active route</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Student Check-In
              </Typography>
              <Button
                variant="contained"
                startIcon={<ScanIcon />}
                onClick={() => setOpenScanner(true)}
              >
                Scan QR Code
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Search Students"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" />,
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2 
            }}>
              <Typography variant="h6">
                Active Buddy Passes ({buddyPasses.length})
              </Typography>
              <Button
                startIcon={showBuddyPassSection ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowBuddyPassSection(!showBuddyPassSection)}
              >
                {showBuddyPassSection ? 'Hide' : 'Show'}
              </Button>
            </Box>

            <Collapse in={showBuddyPassSection}>
              <Grid container spacing={2}>
                {buddyPasses.map((pass) => {
                  const status = getBuddyPassStatus(pass, checkedInStudents);
                  const originalStudent = students.find(s => s.id === pass.studentId);
                  const buddyStudent = students.find(s => s.id === pass.buddyId);
                  const isExpanded = expandedBuddyPass === pass.id;

                  return (
                    <Grid item xs={12} md={6} key={pass.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              Buddy Pass #{pass.id.slice(-4)}
                            </Typography>
                            <Chip
                              label={status.label}
                              color={status.color}
                              size="small"
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PersonIcon sx={{ mr: 1 }} />
                            <Typography>
                              {originalStudent ? `${originalStudent.firstName} ${originalStudent.lastName}` : 'Unknown'} →{' '}
                              {buddyStudent ? `${buddyStudent.firstName} ${buddyStudent.lastName}` : 'Unknown'}
                            </Typography>
                          </Box>

                          <Button
                            size="small"
                            onClick={() => setExpandedBuddyPass(isExpanded ? null : pass.id)}
                            endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          >
                            {isExpanded ? 'Less Details' : 'More Details'}
                          </Button>

                          <Collapse in={isExpanded}>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationIcon sx={{ mr: 1, fontSize: 'small' }} />
                                From: {pass.originStop?.name || 'Unknown Stop'}
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationIcon sx={{ mr: 1, fontSize: 'small' }} />
                                To: {pass.destinationStop?.name || 'Unknown Stop'}
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <TimeIcon sx={{ mr: 1, fontSize: 'small' }} />
                                Scheduled: {formatTime(pass.scheduledTime)}
                              </Typography>
                              {pass.notes && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  Note: {pass.notes}
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Collapse>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper>
            <List>
              {filteredStudents.map((student) => {
                const isCheckedIn = isStudentCheckedIn(student.id);
                const buddyPassInfo = getBuddyPassInfo(student.id);
                return (
                  <ListItem key={student.id}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography>{`${student.firstName} ${student.lastName}`}</Typography>
                          {buddyPassInfo && (
                            <Tooltip title={
                              <Box>
                                <Typography variant="body2">Buddy: {buddyPassInfo.buddyName}</Typography>
                                <Typography variant="body2">
                                  Going to: {buddyPassInfo.buddyStudent?.assignedStop?.name || 'Unknown Stop'}
                                </Typography>
                                <Typography variant="body2">
                                  Scheduled: {formatTime(buddyPassInfo.scheduledTime)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {buddyPassInfo.isOriginalStudent ? 'Riding to buddy\'s stop' : 'Buddy riding to this stop'}
                                </Typography>
                              </Box>
                            }>
                              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                <BuddyIcon color="primary" />
                                <Chip 
                                  label={buddyPassInfo.status.label}
                                  color={buddyPassInfo.status.color}
                                  size="small"
                                  sx={{ ml: 0.5 }}
                                />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          {student.grade ? `Grade ${student.grade}` : ''}
                          {buddyPassInfo && (
                            <Typography variant="body2" color="text.secondary">
                              {buddyPassInfo.isOriginalStudent ? 'Going to' : 'Coming from'} {buddyPassInfo.buddyName}
                              {' • '}{formatTime(buddyPassInfo.scheduledTime)}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={isCheckedIn ? 'Checked In' : 'Not Checked In'}
                        color={isCheckedIn ? 'success' : 'default'}
                        sx={{ mr: 1 }}
                      />
                      <IconButton
                        edge="end"
                        onClick={() => handleManualCheckIn(student)}
                        color={isCheckedIn ? 'error' : 'success'}
                      >
                        {isCheckedIn ? <CheckOutIcon /> : <CheckInIcon />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Attendance
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Total Students: {students.length}
              </Typography>
              <Typography variant="body1">
                Checked In: {checkedInStudents.filter(c => !c.checkOutTime).length}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">
                Active Buddy Passes: {buddyPasses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Pending: {buddyPasses.filter(p => getBuddyPassStatus(p, checkedInStudents).status === 'PENDING').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • In Progress: {buddyPasses.filter(p => getBuddyPassStatus(p, checkedInStudents).status === 'PARTIAL').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Complete: {buddyPasses.filter(p => getBuddyPassStatus(p, checkedInStudents).status === 'COMPLETE').length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan Student QR Code</DialogTitle>
        <DialogContent>
          <QRScanner 
            onScan={handleQRScan}
            onError={handleQRError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScanner(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 