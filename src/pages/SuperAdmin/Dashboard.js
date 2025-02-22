import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  ListAlt as QueueIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const SuperAdminDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    schools: 0,
    users: 0,
    students: 0,
    buses: 0,
    pendingRegistrations: 0,
  });
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch schools count
        const schoolsQuery = query(collection(db, 'schools'));
        const schoolsSnapshot = await getDocs(schoolsQuery);
        
        // Fetch users count
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        
        // Fetch students count
        const studentsQuery = query(collection(db, 'students'));
        const studentsSnapshot = await getDocs(studentsQuery);
        
        // Fetch buses count
        const busesQuery = query(collection(db, 'busLocations'));
        const busesSnapshot = await getDocs(busesQuery);

        // Fetch pending registrations count
        const registrationsQuery = query(
          collection(db, 'schoolRegistrationQueue'),
          where('status', '==', 'pending')
        );
        const registrationsSnapshot = await getDocs(registrationsQuery);

        setStats({
          schools: schoolsSnapshot.size,
          users: usersSnapshot.size,
          students: studentsSnapshot.size,
          buses: busesSnapshot.size,
          pendingRegistrations: registrationsSnapshot.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/superadmin/dashboard' },
    { text: 'Schools', icon: <SchoolIcon />, path: '/superadmin/schools' },
    { text: 'Users', icon: <GroupIcon />, path: '/superadmin/users' },
    { text: 'Registration Queue', icon: <QueueIcon />, path: '/superadmin/registration-queue' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/superadmin/settings' },
    { text: 'Migrations', icon: <BuildIcon />, path: '/superadmin/migrations' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SuperAdmin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: (theme) => theme.palette.grey[100],
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome back, {currentUser?.firstName} {currentUser?.lastName}
              </Typography>
            </Grid>

            {/* Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h4">{stats.schools}</Typography>
                <Typography variant="subtitle1">Schools</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h4">{stats.users}</Typography>
                <Typography variant="subtitle1">Users</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h4">{stats.students}</Typography>
                <Typography variant="subtitle1">Students</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h4">{stats.buses}</Typography>
                <Typography variant="subtitle1">Buses</Typography>
              </Paper>
            </Grid>

            {/* School Management */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  School Management
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => navigate('/superadmin/schools')}
                >
                  Manage Schools
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => navigate('/superadmin/schools/add')}
                >
                  Add New School
                </Button>
              </Paper>
            </Grid>

            {/* Administrator Management */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Administrator Management
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => navigate('/superadmin/users')}
                >
                  Manage School Admins
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => navigate('/superadmin/users/add')}
                >
                  Add School Admin
                </Button>
              </Paper>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<QueueIcon />}
                      onClick={() => navigate('/superadmin/registration-queue')}
                    >
                      Registration Queue
                      {stats.pendingRegistrations > 0 && (
                        <Box
                          component="span"
                          sx={{
                            backgroundColor: 'error.main',
                            color: 'white',
                            borderRadius: '50%',
                            padding: '2px 8px',
                            marginLeft: 1,
                            fontSize: '0.8rem',
                          }}
                        >
                          {stats.pendingRegistrations}
                        </Box>
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default SuperAdminDashboard; 