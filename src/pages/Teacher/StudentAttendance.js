import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  AccessTime as LateIcon,
  Edit as EditIcon,
  Search as SearchIcon,
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

const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
};

export default function StudentAttendance({ students }) {
  const { currentUser } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (students.length > 0) {
      fetchTodayAttendance();
    }
  }, [students]);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('teacherUid', '==', currentUser.uid),
        where('date', '>=', today)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceList = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAttendance(attendanceList);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to load attendance records');
    }
  };

  const handleOpenDialog = (student) => {
    const existingRecord = attendance.find(a => a.studentId === student.id);
    setSelectedStudent(student);
    setStatus(existingRecord?.status || '');
    setNote(existingRecord?.note || '');
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setStatus('');
    setNote('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) {
      setError('Please select an attendance status');
      return;
    }

    try {
      const existingRecord = attendance.find(a => a.studentId === selectedStudent.id);
      const attendanceData = {
        studentId: selectedStudent.id,
        teacherUid: currentUser.uid,
        status,
        note: note.trim(),
        date: new Date().toISOString().split('T')[0],
        timestamp: serverTimestamp(),
      };

      if (existingRecord) {
        const attendanceRef = doc(db, 'attendance', existingRecord.id);
        await updateDoc(attendanceRef, attendanceData);
      } else {
        await addDoc(collection(db, 'attendance'), attendanceData);
      }

      handleCloseDialog();
      fetchTodayAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError('Failed to save attendance record');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return <PresentIcon color="success" />;
      case ATTENDANCE_STATUS.ABSENT:
        return <AbsentIcon color="error" />;
      case ATTENDANCE_STATUS.LATE:
        return <LateIcon color="warning" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return 'success';
      case ATTENDANCE_STATUS.ABSENT:
        return 'error';
      case ATTENDANCE_STATUS.LATE:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = attendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;
    const absent = attendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length;
    const late = attendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length;
    const unmarked = total - (present + absent + late);

    return { total, present, absent, late, unmarked };
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const stats = getAttendanceStats();

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Today's Attendance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Students
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" color="success.main">
                  Present
                </Typography>
                <Typography variant="h4">{stats.present}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" color="error.main">
                  Absent
                </Typography>
                <Typography variant="h4">{stats.absent}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" color="warning.main">
                  Late
                </Typography>
                <Typography variant="h4">{stats.late}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
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
            </Box>

            <List>
              {filteredStudents.map((student) => {
                const record = attendance.find(a => a.studentId === student.id);
                return (
                  <ListItem key={student.id}>
                    <ListItemText
                      primary={`${student.firstName} ${student.lastName}`}
                      secondary={record?.note}
                    />
                    <ListItemSecondaryAction>
                      {record ? (
                        <>
                          <Chip
                            icon={getStatusIcon(record.status)}
                            label={record.status}
                            color={getStatusColor(record.status)}
                            sx={{ mr: 1 }}
                          />
                          <IconButton
                            edge="end"
                            onClick={() => handleOpenDialog(student)}
                          >
                            <EditIcon />
                          </IconButton>
                        </>
                      ) : (
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenDialog(student)}
                        >
                          Mark Attendance
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedStudent && `Mark Attendance - ${selectedStudent.firstName} ${selectedStudent.lastName}`}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value={ATTENDANCE_STATUS.PRESENT}>Present</MenuItem>
                <MenuItem value={ATTENDANCE_STATUS.ABSENT}>Absent</MenuItem>
                <MenuItem value={ATTENDANCE_STATUS.LATE}>Late</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Note"
              multiline
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 