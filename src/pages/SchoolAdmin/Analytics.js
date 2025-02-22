import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  DirectionsBus as BusIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Route as RouteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { fetchTransportAnalytics } from '../../services/AnalyticsService';

const TIME_RANGES = {
  DAY: 'Last 24 Hours',
  WEEK: 'Last 7 Days',
  MONTH: 'Last 30 Days',
};

export default function Analytics({ schoolInfo }) {
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState('WEEK');
  const [transportStats, setTransportStats] = useState({
    totalTrips: 0,
    onTimePercentage: 0,
    activeRoutes: 0,
    activeBuses: 0,
    averageDelay: 0,
    totalStudentsTransported: 0,
    hasData: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (schoolInfo) {
      fetchTransportStats();
    }
  }, [schoolInfo, timeRange]);

  const fetchTransportStats = async () => {
    try {
      setLoading(true);
      const stats = await fetchTransportAnalytics(schoolInfo.id, timeRange);
      setTransportStats(stats);
      setError(null);
    } catch (error) {
      console.error('Error fetching transport stats:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const renderLoadingState = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Loading analytics data...
      </Typography>
    </Box>
  );

  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Collecting Data
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Analytics will be available once transport events are processed.
        Check back in a few hours to see your first insights.
      </Typography>
    </Box>
  );

  const renderAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Total Trips</Typography>
            </Box>
            <Typography variant="h4">{transportStats.totalTrips}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">On-Time Performance</Typography>
            </Box>
            <Typography variant="h4">{transportStats.onTimePercentage}%</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RouteIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Active Routes</Typography>
            </Box>
            <Typography variant="h4">{transportStats.activeRoutes}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Active Buses</Typography>
            </Box>
            <Typography variant="h4">{transportStats.activeBuses}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6">Average Delay</Typography>
            </Box>
            <Typography variant="h4">{transportStats.averageDelay} min</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GroupIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h6">Students Transported</Typography>
            </Box>
            <Typography variant="h4">{transportStats.totalStudentsTransported}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Transport Analytics</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {Object.entries(TIME_RANGES).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? renderLoadingState() :
        !transportStats.hasData ? renderEmptyState() :
        renderAnalytics()
      }
    </Box>
  );
} 