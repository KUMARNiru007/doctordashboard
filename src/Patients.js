import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Patients = () => {
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Patient
      </Typography>
      <Typography variant="body1" color="text.secondary">
        content
      </Typography>
    </Paper>
  );
};

export default Patients;
