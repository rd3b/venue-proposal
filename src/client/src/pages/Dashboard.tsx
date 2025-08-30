import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Venue Finder CRM
        </Typography>
        <Typography variant="body1">
          Welcome to the Venue Finder CRM system. This application helps venue
          finding consultants manage clients, venues, proposals, and bookings.
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;