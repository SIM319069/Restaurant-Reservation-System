import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useSearchParams } from 'react-router-dom';

const Login = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/auth/google`;
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Restaurant Booking
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Authentication failed. Please try again.
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ mt: 3, mb: 2, backgroundColor: '#db4437', '&:hover': { backgroundColor: '#c23321' } }}
            >
              Sign in with Google
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;