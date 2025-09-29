import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Google as GoogleIcon,
  Restaurant as RestaurantIcon,
  EventNote as BookingIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';

const Login = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/auth/google`;
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Restaurant Booking System
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Secure admin login with Google authentication
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="stretch">
          {/* Login Card */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography component="h2" variant="h5" align="center" gutterBottom>
                Sign In
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  Authentication failed. Please try again.
                </Alert>
              )}

              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLogin}
                  sx={{ 
                    mt: 2, 
                    mb: 3, 
                    py: 1.5,
                    backgroundColor: '#db4437', 
                    '&:hover': { backgroundColor: '#c23321' },
                    fontSize: '1.1rem'
                  }}
                >
                  Continue with Google
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SecurityIcon color="success" />
                  <Typography variant="body2" color="text.secondary">
                    Secure OAuth 2.0 authentication
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" align="center">
                  Your Google account will be used to authenticate and determine your access level
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Features Card */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 4, height: '100%' }}>
              <Typography component="h2" variant="h5" gutterBottom>
                System Features
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                {/* Customer Features */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BookingIcon color="primary" />
                      <Typography variant="h6">Customer Features</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      • Browse restaurants and make reservations<br/>
                      • Select time slots and table preferences<br/>
                      • View booking history and status<br/>
                      • Manage personal reservations
                    </Typography>
                  </CardContent>
                </Card>

                {/* Admin Features */}
                <Card variant="outlined" sx={{ mb: 2, border: '2px solid', borderColor: 'primary.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AdminIcon color="primary" />
                      <Typography variant="h6" color="primary">Admin Features</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      • Comprehensive booking management dashboard<br/>
                      • Change reservation status (confirm/reject/cancel)<br/>
                      • View all restaurant and user analytics<br/>
                      • Manage high-volume reservations efficiently
                    </Typography>
                  </CardContent>
                </Card>

                {/* System Info */}
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <RestaurantIcon color="secondary" />
                      <Typography variant="h6">System Overview</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      • Real-time booking management<br/>
                      • Role-based access control<br/>
                      • Integrated Google authentication<br/>
                      • Responsive admin dashboard
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Demo Users Info */}
        <Paper elevation={1} sx={{ mt: 4, p: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom align="center">
            Access Levels
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <BookingIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Customer Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Regular users can browse restaurants, make reservations, and manage their bookings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <AdminIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Admin Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administrators have full system access including booking management and analytics
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Powered by React, Node.js, PostgreSQL, and Google OAuth 2.0
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;