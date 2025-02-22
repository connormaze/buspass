import React from 'react';
import {
  Alert,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  WbSunny as SunIcon,
  Thunderstorm as StormIcon,
  AcUnit as SnowIcon,
  WaterDrop as RainIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const getWeatherIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'sun':
    case 'heat':
      return <SunIcon />;
    case 'storm':
    case 'thunder':
      return <StormIcon />;
    case 'snow':
    case 'ice':
      return <SnowIcon />;
    case 'rain':
    case 'flood':
      return <RainIcon />;
    default:
      return <WarningIcon />;
  }
};

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'info';
  }
};

const WeatherAlert = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Weather Alerts
      </Typography>
      <Stack spacing={2}>
        {alerts.map((alert, index) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Alert
                icon={getWeatherIcon(alert.type)}
                severity={getSeverityColor(alert.severity)}
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle1" component="div">
                  {alert.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {alert.description}
                </Typography>
                {alert.recommendations && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Recommendation: {alert.recommendations}
                  </Typography>
                )}
              </Alert>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default WeatherAlert; 