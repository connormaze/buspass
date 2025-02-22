import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, deleteDoc, addDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { deleteUserComprehensively } from '../../utils/userManagement';

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    schoolId: '',
    status: 'pending',
  });

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch schools
      const schoolsQuery = query(collection(db, 'schools'));
      const schoolsSnapshot = await getDocs(schoolsQuery);
      const schoolsData = schoolsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchools(schoolsData);

      // Fetch users with role SCHOOLADMIN
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'SCHOOLADMIN')
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        schoolName: schoolsData.find(school => school.id === doc.data().schoolId)?.name || 'Not assigned'
      }));
      setUsers(usersData);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      setLoading(true);
      // Create user in users collection
      await addDoc(collection(db, 'users'), {
        ...formData,
        role: 'SCHOOLADMIN',
        createdAt: new Date(),
        createdBy: currentUser.uid,
      });
      setOpenDialog(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        schoolId: '',
        status: 'pending',
      });
      setSuccess('School admin added successfully');
      await fetchData();
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this school admin? This action cannot be undone and will remove all associated data.')) {
      try {
        setLoading(true);
        await deleteUserComprehensively(userId, currentUser.uid);
        setSuccess('School admin deleted successfully');
        await fetchData();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuickStatusUpdate = async (userId, newStatus) => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: currentUser.uid,
      });
      setSuccess(`Status updated to ${newStatus}`);
      await fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          School Admin Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/superadmin/users/add')}
        >
          Add School Admin
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search school admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>School</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No school admins found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.schoolName}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={user.status || 'pending'}
                          color={getStatusColor(user.status)}
                          size="small"
                        />
                        {user.status !== 'approved' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleQuickStatusUpdate(user.id, 'approved')}
                          >
                            Approve
                          </Button>
                        )}
                        {user.status !== 'rejected' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleQuickStatusUpdate(user.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => navigate(`/superadmin/users/edit/${user.id}`)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
} 