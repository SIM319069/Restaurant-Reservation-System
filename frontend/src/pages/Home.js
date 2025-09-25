import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box textAlign="center">
        <Typography variant="h2" gutterBottom>
          Restaurant Booking System
        </Typography>
        <Typography variant="h6" paragraph>
          Book tables at your favorite restaurants
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/login')}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
};

export default Home;