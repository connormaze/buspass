import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  DirectionsBus as BusIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const ABSENCE_TYPES = {
  SICK: 'Sick',
  VACATION: 'Vacation',
  APPOINTMENT: 'Appointment',
  OTHER: 'Other',
};

const ATTENDANCE_STATUS = {
  PRESENT: { label: 'Present', color: 'success' },
  ABSENT: { label: 'Absent', color: 'error' },
  EXCUSED: { label: 'Excused', color: 'warning' },
  LATE: { label: 'Late', color: 'info' },
};

export default function AttendanceHistory() {
  const { currentUser } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAbsenceDialog, setOpenAbsenceDialog] = useState(false);
  const [absenceForm, setAbsenceForm] = useState({
    date: '',
    type: '',
    reason: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchStudentInfo();
    }
  }, [currentUser]);

  useEffect(() => {
    if (studentInfo) {
      fetchAttendanceRecords();
    }
  }, [studentInfo]);

  const fetchStudentInfo = async () => {
    try {
      const studentDoc = await getDocs(
        query(
          collection(db, 'students'),
          where('userId', '==', currentUser.uid)
        )
      );
      if (!studentDoc.empty) {
        setStudentInfo({ id: studentDoc.docs[0].id, ...studentDoc.docs[0].data() });
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
      setError('Failed to load student information');
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', studentInfo.id),
        orderBy('date', 'desc'),
        limit(30)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const records = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAbsenceDialog = () => {
    setAbsenceForm({
      date: new Date().toISOString().split('T')[0],
      type: '',
      reason: '',
    });
    setOpenAbsenceDialog(true);
    setError(null);
  };

  const handleCloseAbsenceDialog = () => {
    setOpenAbsenceDialog(false);
    setAbsenceForm({
      date: '',
      type: '',
      reason: '',
    });
    setError(null);
  };

  const validateAbsenceForm = () => {
    if (!absenceForm.date || !absenceForm.type) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmitAbsence = async (e) => {
    e.preventDefault();
    if (!validateAbsenceForm()) return;

    try {
      const absenceData = {
        studentId: studentInfo.id,
        schoolId: studentInfo.schoolId,
        date: new Date(absenceForm.date),
        type: absenceForm.type,
        reason: absenceForm.reason,
        status: 'EXCUSED',
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      };

      await addDoc(collection(db, 'attendance'), absenceData);
      
      handleCloseAbsenceDialog();
      fetchAttendanceRecords();
      setSuccess('Absence reported successfully');
    } catch (error) {
      console.error('Error reporting absence:', error);
      setError('Failed to report absence');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  };

  const calculateAttendanceStats = () => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'PRESENT').length;
    const absent = attendanceRecords.filter(r => r.status === 'ABSENT').length;
    const excused = attendanceRecords.filter(r => r.status === 'EXCUSED').length;
    const late = attendanceRecords.filter(r => r.status === 'LATE').length;

    return {
      total,
      present,
      absent,
      excused,
      late,
      attendanceRate: total > 0 ? ((present + excused) / total * 100).toFixed(1) : 0,
    };
  };

  const stats = calculateAttendanceStats();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Attendance Rate
                  </Typography>
                  <Typography variant="h4">
                    {stats.attendanceRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Present Days
                  </Typography>
                  <Typography variant="h4">
                    {stats.present}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Absences
                  </Typography>
                  <Typography variant="h4">
                    {stats.absent + stats.excused}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Late Arrivals
                  </Typography>
                  <Typography variant="h4">
                    {stats.late}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Attendance Records */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <CalendarIcon />
                </Avatar>
              }
              title="Attendance History"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAbsenceDialog}
                >
                  Report Absence
                </Button>
              }
            />
            <CardContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={ATTENDANCE_STATUS[record.status].label}
                            color={ATTENDANCE_STATUS[record.status].color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{record.type || '-'}</TableCell>
                        <TableCell>{record.reason || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {attendanceRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Absence Dialog */}
      <Dialog
        open={openAbsenceDialog}
        onClose={handleCloseAbsenceDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report Absence</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={absenceForm.date}
                  onChange={(e) =>
                    setAbsenceForm({ ...absenceForm, date: e.target.value })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Absence Type</InputLabel>
                  <Select
                    value={absenceForm.type}
                    onChange={(e) =>
                      setAbsenceForm({ ...absenceForm, type: e.target.value })
                    }
                    label="Absence Type"
                  >
                    {Object.entries(ABSENCE_TYPES).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  multiline
                  rows={3}
                  value={absenceForm.reason}
                  onChange={(e) =>
                    setAbsenceForm({ ...absenceForm, reason: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAbsenceDialog}>Cancel</Button>
          <Button onClick={handleSubmitAbsence} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 