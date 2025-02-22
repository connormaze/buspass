import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  DirectionsWalk,
  TurnLeft,
  TurnRight,
  Straight,
} from '@mui/icons-material';
import { useMaps } from '../contexts/MapsContext';

const getDirectionIcon = (maneuver) => {
  switch (maneuver) {
    case 'turn-right':
      return <TurnRight />;
    case 'turn-left':
      return <TurnLeft />;
    case 'straight':
      return <Straight />;
    default:
      return <DirectionsWalk />;
  }
};

export default function NavigationPanel() {
  const {
    navigationSteps,
    currentStepIndex,
    nextStep,
    previousStep,
    currentNavigation,
  } = useMaps();

  if (!currentNavigation || navigationSteps.length === 0) {
    return null;
  }

  const currentStep = navigationSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / navigationSteps.length) * 100;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: 600,
        zIndex: 1000,
        p: 2,
      }}
      elevation={3}
    >
      <Box sx={{ mb: 1 }}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Step {currentStepIndex + 1} of {navigationSteps.length}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {getDirectionIcon(currentStep.maneuver)}
        <Typography
          dangerouslySetInnerHTML={{ __html: currentStep.instructions }}
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <IconButton
          onClick={previousStep}
          disabled={currentStepIndex === 0}
          color="primary"
        >
          <NavigateBefore />
        </IconButton>

        <Typography variant="body2" color="text.secondary">
          {currentStep.distance?.text} • {currentStep.duration?.text}
        </Typography>

        <IconButton
          onClick={nextStep}
          disabled={currentStepIndex === navigationSteps.length - 1}
          color="primary"
        >
          <NavigateNext />
        </IconButton>
      </Box>
    </Paper>
  );
} 