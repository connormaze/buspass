import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  ButtonGroup,
  TextField,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { RouteManagementService } from '../services/RouteManagementService';
import { useAuth } from '../contexts/AuthContext';

export default function RouteAnalytics({ route, initialTimeRange = 'week' }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const theme = useTheme();
  const { currentUser } = useAuth();
  const routeService = new RouteManagementService();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main
  ];

  const fetchAnalyticsData = useCallback(async () => {
    if (!route?.id) return;
    
    try {
      setLoading(true);
      const data = await routeService.getRouteAnalytics(route.id, timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [route?.id, timeRange, routeService]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const renderPerformanceChart = () => {
    if (!analyticsData?.performance) return null;

    return (
      <Card sx={{ height: '400px', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Route Performance Over Time
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analyticsData.performance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="onTimePercentage"
              name="On-Time %"
              stroke={theme.palette.primary.main}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="completionRate"
              name="Completion Rate"
              stroke={theme.palette.secondary.main}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  const renderStudentDistributionChart = () => {
    if (!analyticsData?.studentDistribution) return null;

    return (
      <Card sx={{ height: '400px', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Student Distribution by Stop
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analyticsData.studentDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stopName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="students"
              name="Number of Students"
              fill={theme.palette.primary.main}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  const renderTimeDistributionChart = () => {
    if (!analyticsData?.timeDistribution) return null;

    return (
      <Card sx={{ height: '400px', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Time Distribution
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={analyticsData.timeDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {analyticsData.timeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  const renderStatistics = () => {
    if (!analyticsData?.statistics) return null;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Trip Time
              </Typography>
              <Typography variant="h4">
                {analyticsData.statistics.avgTripTime} min
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4">
                {analyticsData.statistics.totalStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                On-Time Performance
              </Typography>
              <Typography variant="h4">
                {analyticsData.statistics.onTimePerformance}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Distance
              </Typography>
              <Typography variant="h4">
                {analyticsData.statistics.totalDistance} km
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!route) {
    return (
      <Alert severity="info">
        Please select a route to view analytics
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Route Analytics: {route.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <ButtonGroup variant="outlined">
            <Button
              onClick={() => setTimeRange('day')}
              variant={timeRange === 'day' ? 'contained' : 'outlined'}
            >
              Day
            </Button>
            <Button
              onClick={() => setTimeRange('week')}
              variant={timeRange === 'week' ? 'contained' : 'outlined'}
            >
              Week
            </Button>
            <Button
              onClick={() => setTimeRange('month')}
              variant={timeRange === 'month' ? 'contained' : 'outlined'}
            >
              Month
            </Button>
          </ButtonGroup>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newValue) => {
                setSelectedDate(newValue);
                // You can add additional logic here to fetch data for the selected date
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {renderStatistics()}
        </Grid>
        <Grid item xs={12} md={8}>
          {renderPerformanceChart()}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderTimeDistributionChart()}
        </Grid>
        <Grid item xs={12}>
          {renderStudentDistributionChart()}
        </Grid>
      </Grid>
    </Box>
  );
} 