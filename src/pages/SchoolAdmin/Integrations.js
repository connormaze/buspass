import React from 'react';
import IntegrationManager from '../../components/IntegrationManager';
import { Box } from '@mui/material';
import { SUPPORTED_PLATFORMS, INTEGRATION_TYPES } from '../../utils/integrations/integrationManager';

export default function Integrations({ schoolId, onUpdate }) {
  return (
    <Box>
      <IntegrationManager 
        supportedPlatforms={SUPPORTED_PLATFORMS}
        integrationTypes={INTEGRATION_TYPES}
        schoolId={schoolId}
        onUpdate={onUpdate}
      />
    </Box>
  );
} 