import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  EventNote as BookingIcon,
  Add as AddIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reservations`);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Please log in to view your dashboard.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={user.avatar_url}
              sx={{ width: 80, height: 80 }}
            >
              {user.name?.charAt(0)}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
            <Chip 
              label={user.role} 
              color={user.role === 'admin' ? 'primary' : 'default'}
              size="small"
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/restaurants')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <RestaurantIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Browse Restaurants
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discover amazing restaurants
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/restaurants')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AddIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Make Reservation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Book a table now
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <BookingIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                My Bookings
              </Typography>
              <Typography variant="h4" color="primary">
                {reservations.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Confirmed
              </Typography>
              <Typography variant="h4" color="success.main">
                {reservations.filter(r => r.status === 'confirmed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {user.role === 'admin' && (
          <Grid item xs={12}>
            <Card sx={{ background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  Admin Panel
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mr: 2, bgcolor: 'white', color: 'primary.main' }}
                  onClick={() => navigate('/admin')}
                >
                  Manage Restaurants
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ color: 'white', borderColor: 'white' }}
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Recent Reservations */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookingIcon />
            My Reservations
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : reservations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BookingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No reservations yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start exploring restaurants and make your first booking!
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<RestaurantIcon />}
                onClick={() => navigate('/restaurants')}
              >
                Browse Restaurants
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Restaurant</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Party Size</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.slice(0, 5).map((reservation) => (
                    <TableRow key={reservation.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {reservation.restaurant_name || 'Unknown Restaurant'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reservation.restaurant_address}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(reservation.reservation_date)}</TableCell>
                      <TableCell>{formatTime(reservation.reservation_time)}</TableCell>
                      <TableCell>{reservation.party_size} guests</TableCell>
                      <TableCell>
                        <Chip 
                          label={reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          color={getStatusColor(reservation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {reservation.status === 'pending' && (
                          <Button size="small" color="error">
                            Cancel
                          </Button>
                        )}
                        {reservation.status === 'confirmed' && (
                          <Button size="small" color="primary">
                            View Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {reservations.length > 5 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="outlined">
                View All Reservations
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;