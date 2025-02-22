import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
  writeBatch,
  setDoc,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { deleteUserComprehensively } from '../../utils/userManagement';

const USER_ROLES = {
  TEACHER: 'Teacher',
  STUDENT: 'Student',
};

const USER_STATUS = {
  APPROVED: 'APPROVED',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  REJECTED: 'REJECTED'
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function UserManagement() {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    status: 'APPROVED',
    classId: '',
    grade: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    assignedTeachers: [],
    teachingClasses: [],
    password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthChecked(true);
      if (!user) {
        // Redirect to login if no user
        window.location.href = '/login';
        return;
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser?.schoolId && authChecked) {
      fetchUsers();
      fetchClasses();
      fetchTeachers();
      updateExistingStudents();
    }
  }, [currentUser, authChecked]);

  const fetchUsers = async () => {
    try {
      if (!currentUser?.schoolId) {
        console.log('No school ID available');
        return;
      }

      const usersQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const fetchClasses = async () => {
    try {
      if (!currentUser?.schoolId) {
        console.log('No school ID available');
        return;
      }

      const classesQuery = query(
        collection(db, 'classes'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const classesSnapshot = await getDocs(classesQuery);
      const classesList = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClasses(classesList);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes');
    }
  };

  const fetchTeachers = async () => {
    try {
      const teachersQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', currentUser.schoolId),
        where('role', '==', 'TEACHER')
      );
      const snapshot = await getDocs(teachersQuery);
      const teachersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeachers(teachersList);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to load teachers');
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        status: user.status || 'APPROVED',
        classId: user.classId || '',
        grade: user.grade || '',
        parentName: user.parentName || '',
        parentEmail: user.parentEmail || '',
        parentPhone: user.parentPhone || '',
        assignedTeachers: user.assignedTeachers || [],
        teachingClasses: user.teachingClasses || [],
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: currentTab === 0 ? 'TEACHER' : 'STUDENT',
        status: 'PENDING_APPROVAL',
        classId: '',
        grade: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        assignedTeachers: [],
        teachingClasses: [],
        password: '',
      });
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      status: 'APPROVED',
      classId: '',
      grade: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      assignedTeachers: [],
      teachingClasses: [],
      password: '',
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('First name, last name, and email are required');
      return false;
    }

    if (!editingUser && !formData.password) {
      setError('Password is required for new users');
      return false;
    }

    if (currentTab === 1 && !formData.grade) {
      setError('Grade is required for students');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (optional)
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Parent email validation if provided
    if (formData.parentEmail && !emailRegex.test(formData.parentEmail)) {
      setError('Please enter a valid parent email address');
      return false;
    }

    // Password validation for new users
    if (!editingUser && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!currentUser?.schoolId) {
      setError('School ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Debug logging
      console.log('Current User:', currentUser);
      console.log('Current User Role:', currentUser?.role);
      console.log('Current User School:', currentUser?.schoolId);
      console.log('Form Data:', formData);

      if (editingUser) {
        // Handle editing existing user
        const userRef = doc(db, 'users', editingUser.id);
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: currentTab === 0 ? 'TEACHER' : 'STUDENT',
          status: formData.status,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid
        };

        await updateDoc(userRef, userData);

        if (formData.role === 'STUDENT' && formData.assignedTeachers?.length > 0) {
          const batch = writeBatch(db);
          
          const previousTeachers = editingUser.assignedTeachers || [];
          for (const teacherId of previousTeachers) {
            if (!formData.assignedTeachers.includes(teacherId)) {
              const teacherRef = doc(db, 'users', teacherId);
              const teacherDoc = await getDoc(teacherRef);
              if (teacherDoc.exists()) {
                batch.update(teacherRef, {
                  studentIds: arrayRemove(editingUser.id)
                });
              }
            }
          }

          for (const teacherId of formData.assignedTeachers) {
            if (!previousTeachers.includes(teacherId)) {
              batch.update(doc(db, 'users', teacherId), {
                studentIds: arrayUnion(editingUser.id)
              });
            }
          }

          // Update both assignedTeachers and teacherIds fields
          batch.update(doc(db, 'users', editingUser.id), {
            assignedTeachers: formData.assignedTeachers,
            teacherIds: formData.assignedTeachers
          });

          await batch.commit();
        }

        setSuccess('User updated successfully');
      } else {
        // Handle creating new user
        if (!formData.password) {
          throw new Error('Password is required for new users');
        }

        // Get fresh user data to ensure we have current permissions
        const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!currentUserDoc.exists()) {
          throw new Error('Your user account was not found');
        }

        const currentUserData = currentUserDoc.data();
        if (currentUserData.role !== 'SCHOOLADMIN') {
          throw new Error('You must be a school admin to create users');
        }

        let authUser = null;
        let userDocRef = null;
        let originalUser = null;

        try {
          // Store the original user's auth state
          originalUser = auth.currentUser;
          if (!originalUser) {
            throw new Error('Authentication state lost. Please refresh and try again.');
          }

          // Create Firebase Auth user first
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
          );

          authUser = userCredential.user;
          console.log('Auth user created:', authUser.uid);

          // Important: Sign back in as the original user to maintain admin permissions
          await auth.updateCurrentUser(originalUser);

          // Prepare the base user data
          const userData = {
            uid: authUser.uid,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            role: currentTab === 0 ? 'TEACHER' : 'STUDENT',
            schoolId: currentUser.schoolId,
            status: 'PENDING_APPROVAL',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: currentUser.uid,
            updatedBy: currentUser.uid,
            setupComplete: true
          };

          // Create the user document with the auth UID
          userDocRef = doc(db, 'users', authUser.uid); // Use auth UID as document ID
          await setDoc(userDocRef, userData);

          console.log('Firestore document created');

          // Add role-specific fields
          if (currentTab === 1) { // Student
            // Get school name
            const schoolDoc = await getDoc(doc(db, 'schools', currentUser.schoolId));
            const schoolName = schoolDoc.exists() ? schoolDoc.data().name : '';
            
            // Generate student ID (you can customize this format)
            const studentId = `ST${new Date().getFullYear()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            
            userData.grade = formData.grade;
            userData.classId = formData.classId;
            userData.assignedTeachers = formData.assignedTeachers || [];
            userData.teacherIds = formData.assignedTeachers || [];
            userData.studentId = studentId;
            userData.schoolName = schoolName;

            if (formData.parentEmail) {
              // Check if parent already exists
              const parentQuery = query(
                collection(db, 'users'),
                where('email', '==', formData.parentEmail),
                where('role', '==', 'PARENT')
              );
              const parentSnapshot = await getDocs(parentQuery);
              
              if (parentSnapshot.empty) {
                // Create new parent document
                const parentRef = doc(collection(db, 'users'));
                const parentData = {
                  firstName: formData.parentName,
                  lastName: '',
                  email: formData.parentEmail,
                  phone: formData.parentPhone,
                  role: 'PARENT',
                  schoolId: currentUser.schoolId,
                  status: 'ACTIVE',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  createdBy: currentUser.uid,
                  updatedBy: currentUser.uid,
                  setupComplete: true,
                  students: [authUser.uid]
                };
                await setDoc(parentRef, parentData);
                userData.parentId = parentRef.id;
              } else {
                userData.parentId = parentSnapshot.docs[0].id;
                // Update parent's students array
                await updateDoc(doc(db, 'users', userData.parentId), {
                  students: arrayUnion(authUser.uid)
                });
              }

              userData.parentEmail = formData.parentEmail;
              userData.parentName = formData.parentName;
              userData.parentPhone = formData.parentPhone;
            }

            // Update the user document with additional student data
            await updateDoc(userDocRef, userData);

            // Create the student document
            const studentRef = doc(db, 'students', authUser.uid);
            const studentData = {
              ...userData,
              userId: authUser.uid
            };
            await setDoc(studentRef, studentData);

            console.log('Student document created');

            // Update teacher references
            if (formData.assignedTeachers?.length > 0) {
              const batch = writeBatch(db);
              for (const teacherId of formData.assignedTeachers) {
                batch.update(doc(db, 'users', teacherId), {
                  studentIds: arrayUnion(authUser.uid)
                });
              }
              await batch.commit();
              console.log('Teacher references updated');
            }
          } else { // Teacher
            userData.teachingClasses = formData.teachingClasses || [];
            userData.studentIds = [];
            // Update the user document with additional teacher data
            await updateDoc(userDocRef, userData);
          }

          // Send password reset email
          await sendPasswordResetEmail(auth, formData.email);
          console.log('Password reset email sent');
          
          setSuccess('User created successfully. A password reset email has been sent.');
        } catch (error) {
          console.error('Detailed error:', error);
          
          // Comprehensive cleanup
          try {
            // Clean up Firestore documents if they were created
            if (userDocRef) {
              await deleteDoc(userDocRef);
              if (currentTab === 1) { // If student
                await deleteDoc(doc(db, 'students', authUser.uid));
              }
            }
            
            // Clean up Firebase Auth user
            if (authUser) {
              await authUser.delete();
            }

            // Ensure we're signed back in as the original user
            if (originalUser) {
              await auth.updateCurrentUser(originalUser);
            }
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }

          // Throw specific error messages
          if (error.code === 'auth/email-already-in-use') {
            throw new Error('An account with this email already exists');
          } else if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email format');
          } else if (error.code === 'auth/operation-not-allowed') {
            throw new Error('Email/password accounts are not enabled. Please contact support.');
          } else if (error.code === 'auth/weak-password') {
            throw new Error('Password is too weak. Please use a stronger password.');
          } else if (error.code === 'permission-denied') {
            throw new Error('You do not have permission to create users. Please check your role and try again.');
          }
          
          throw error;
        }
      }

      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.message || 'An error occurred while saving the user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone and will remove all associated data.')) {
      try {
        await deleteUserComprehensively(userId, currentUser.uid);
        setSuccess('User deleted successfully');
        fetchUsers(); // Refresh the users list
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user: ' + error.message);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSearchQuery('');
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const role = currentTab === 0 ? 'TEACHER' : 'STUDENT';
    return user.role === role && fullName.includes(searchQuery.toLowerCase());
  });

  const getClassName = (classId) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem ? classItem.name : 'N/A';
  };

  const renderStudentFields = () => (
    <>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={teachers}
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          value={teachers.filter(teacher => formData.assignedTeachers?.includes(teacher.id))}
          onChange={(e, newValue) => setFormData({
            ...formData,
            assignedTeachers: newValue.map(teacher => teacher.id)
          })}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Assigned Teachers"
              placeholder="Select teachers"
            />
          )}
        />
      </Grid>
    </>
  );

  const renderTeacherFields = () => (
    <>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={classes}
          getOptionLabel={(option) => option.name}
          value={classes.filter(cls => formData.teachingClasses?.includes(cls.id))}
          onChange={(e, newValue) => setFormData({
            ...formData,
            teachingClasses: newValue.map(cls => cls.id)
          })}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Teaching Classes"
              placeholder="Select classes"
            />
          )}
        />
      </Grid>
    </>
  );

  const handleApproveUser = async (userId, approve) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: approve ? 'APPROVED' : 'REJECTED',
        approvedAt: approve ? serverTimestamp() : null
      });
      setSuccess(`User successfully ${approve ? 'approved' : 'rejected'}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

  const updateExistingStudents = async () => {
    try {
      if (!currentUser?.schoolId) return;
      
      // Get all students in the school
      const studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', currentUser.schoolId),
        where('role', '==', 'STUDENT')
      );
      
      const studentsSnapshot = await getDocs(studentsQuery);
      const batch = writeBatch(db);
      let batchCount = 0;
      
      for (const studentDoc of studentsSnapshot.docs) {
        const studentData = studentDoc.data();
        const teacherIds = new Set([
          ...(studentData.teacherIds || []),
          ...(studentData.assignedTeachers || [])
        ]);
        
        if (teacherIds.size > 0) {
          // Update student document with consistent teacher assignments
          batch.update(doc(db, 'users', studentDoc.id), {
            teacherIds: Array.from(teacherIds),
            assignedTeachers: Array.from(teacherIds)
          });
          
          // Update each teacher's studentIds
          for (const teacherId of teacherIds) {
            batch.update(doc(db, 'users', teacherId), {
              studentIds: arrayUnion(studentDoc.id)
            });
          }
          
          batchCount++;
          
          // Commit batch when it reaches 500 operations
          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }
      
      // Commit any remaining operations
      if (batchCount > 0) {
        await batch.commit();
      }
      
      console.log('Completed teacher assignment migration');
    } catch (error) {
      console.error('Error in updateExistingStudents:', error);
    }
  };

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Teachers" />
          <Tab label="Students" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add {currentTab === 0 ? 'Teacher' : 'Student'}
          </Button>
        </Box>

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

        <List>
          {users
            .filter(user => 
              (currentTab === 0 ? user.role === 'TEACHER' : user.role === 'STUDENT') &&
              (user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map((user) => (
              <ListItem key={user.id}>
                <ListItemText
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {user.email}
                      </Typography>
                      <br />
                      <Chip
                        size="small"
                        label={user.status}
                        color={
                          user.status === 'APPROVED' ? 'success' :
                          user.status === 'PENDING_APPROVAL' ? 'warning' :
                          user.status === 'REJECTED' ? 'error' : 'default'
                        }
                        sx={{ mr: 1 }}
                      />
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  {user.status === 'PENDING_APPROVAL' && (
                    <>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleApproveUser(user.id, true)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleApproveUser(user.id, false)}
                        sx={{ mr: 1 }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteUser(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          }
        </List>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Edit User' : `Add New ${formData.role}`}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  helperText="Required for all users"
                />
              </Grid>
              {!editingUser && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Initial Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    helperText="Set an initial password for the user"
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    {Object.entries(USER_STATUS).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {formData.role === 'STUDENT' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Grade"
                      type="number"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Class (Optional)</InputLabel>
                      <Select
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        label="Class (Optional)"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {classes.map((classItem) => (
                          <MenuItem key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Parent/Guardian Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Parent Name"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Parent Email"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Parent Phone"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      required
                    />
                  </Grid>
                  {renderStudentFields()}
                </>
              )}

              {formData.role === 'TEACHER' && renderTeacherFields()}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 