import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Badge,
  Button,
  Avatar,
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  PeopleAlt as StudentsIcon,
  Report as IncidentIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
  ContactPhone as EmergencyIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

// Import components (to be created)
import PickupVerification from './PickupVerification';
import StudentAttendance from './StudentAttendance';
import IncidentReporting from './IncidentReporting';
import Communication from './Communication';
import EmergencyContacts from '../../components/EmergencyContacts';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`teacher-tabpanel-${index}`}
      aria-labelledby={`teacher-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function TeacherDashboard() {
  const { currentUser, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherDetails();
    fetchUnreadMessages();
  }, []);

  const fetchTeacherDetails = async () => {
    try {
      // Get teacher's school ID
      const teacherDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const schoolId = teacherDoc.docs[0].data().schoolId;
      const classId = teacherDoc.docs[0].data().classId;

      // Get students in the teacher's class
      const studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('classId', '==', classId),
        where('role', '==', 'student')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      setLoading(false);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientUid', '==', currentUser.uid),
        where('read', '==', false)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      setUnreadMessages(messagesSnapshot.size);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box>
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h5">
              Teacher Dashboard
            </Typography>
            <Typography color="textSecondary">
              {students.length} {students.length === 1 ? 'Student' : 'Students'} in Class
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<ScannerIcon />} label="Pickup Verification" />
          <Tab icon={<StudentsIcon />} label="Attendance" />
          <Tab icon={<IncidentIcon />} label="Incidents" />
          <Tab icon={<EmergencyIcon />} label="Emergency Contacts" />
          <Tab
            icon={
              <Badge badgeContent={unreadMessages} color="error">
                <MessageIcon />
              </Badge>
            }
            label="Messages"
          />
        </Tabs>
      </Paper>

      <TabPanel value={currentTab} index={0}>
        <PickupVerification students={students} />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <StudentAttendance students={students} />
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <IncidentReporting students={students} />
      </TabPanel>
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          {students.map((student) => (
            <Grid item xs={12} md={6} key={student.id}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {student.firstName[0]}
                  </Avatar>
                  <Typography variant="h6">
                    {student.firstName} {student.lastName}
                  </Typography>
                </Box>
                <EmergencyContacts 
                  studentId={student.id}
                  schoolId={currentUser.schoolId}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      <TabPanel value={currentTab} index={4}>
        <Communication onMessageRead={fetchUnreadMessages} />
      </TabPanel>
    </Box>
  );
} 