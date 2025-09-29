import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  EventNote as BookingIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tabValue === 0) fetchReservations();
    else if (tabValue === 1) fetchRestaurants();
    else if (tabValue === 2) fetchUsers();
  }, [tabValue, statusFilter, dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchReservations(),
        fetchRestaurants(),
        fetchUsers()
      ]);
    } catch (error) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      let url = `${API_URL}/api/admin/reservations`;
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter !== 'all') params.append('date_filter', dateFilter);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/restaurants`);
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/reservations/${reservationId}/status`, {
        status: newStatus
      });
      
      // Refresh reservations
      fetchReservations();
      fetchDashboardStats();
      setDialogOpen(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error updating reservation status:', error);
      setError('Failed to update reservation status');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      case 'rejected': return <CancelIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <BookingIcon />;
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage restaurant bookings and system overview
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BookingIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" color="primary">
                {stats.totalReservations || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reservations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PendingIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" color="warning.main">
                {stats.pendingReservations || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <RestaurantIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h4" color="secondary.main">
                {stats.totalRestaurants || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Restaurants
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h4" color="info.main">
                {stats.totalUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registered Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab 
              label={
                <Badge badgeContent={stats.pendingReservations || 0} color="warning">
                  Reservations
                </Badge>
              } 
            />
            <Tab label="Restaurants" />
            <Tab label="Users" />
          </Tabs>
        </Box>

        {/* Reservations Tab */}
        {tabValue === 0 && (
          <CardContent>
            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Date</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date"
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">All Dates</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="tomorrow">Tomorrow</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>

              <IconButton onClick={fetchReservations} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>

            {/* Reservations Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Restaurant</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Party Size</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {reservation.customer_name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {reservation.customer_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {reservation.customer_email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {reservation.restaurant_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reservation.restaurant_address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(reservation.reservation_date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(reservation.reservation_time)}
                        </Typography>
                      </TableCell>
                      <TableCell>{reservation.party_size} guests</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(reservation.status)}
                          label={reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          color={getStatusColor(reservation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Manage Reservation">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {reservations.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BookingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No reservations found
                </Typography>
              </Box>
            )}
          </CardContent>
        )}

        {/* Restaurants Tab */}
        {tabValue === 1 && (
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Restaurant</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reservations</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {restaurants.map((restaurant) => (
                    <TableRow key={restaurant.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {restaurant.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {restaurant.address}
                        </Typography>
                      </TableCell>
                      <TableCell>{restaurant.owner_name || 'Unknown'}</TableCell>
                      <TableCell>{restaurant.capacity} seats</TableCell>
                      <TableCell>
                        <Chip
                          label={restaurant.status}
                          color={restaurant.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{restaurant.reservation_count || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Users Tab */}
        {tabValue === 2 && (
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Reservations</TableCell>
                    <TableCell>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={user.avatar_url} sx={{ width: 32, height: 32 }}>
                            {user.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.reservation_count || 0}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}
      </Card>

      {/* Reservation Management Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Manage Reservation #{selectedReservation?.id}
        </DialogTitle>
        <DialogContent>
          {selectedReservation && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Customer</Typography>
                  <Typography variant="body1">{selectedReservation.customer_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Restaurant</Typography>
                  <Typography variant="body1">{selectedReservation.restaurant_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">{formatDate(selectedReservation.reservation_date)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Time</Typography>
                  <Typography variant="body1">{formatTime(selectedReservation.reservation_time)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Party Size</Typography>
                  <Typography variant="body1">{selectedReservation.party_size} guests</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Current Status</Typography>
                  <Chip
                    label={selectedReservation.status}
                    color={getStatusColor(selectedReservation.status)}
                    size="small"
                  />
                </Grid>
                {selectedReservation.special_requests && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Special Requests</Typography>
                    <Typography variant="body1">{selectedReservation.special_requests}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {selectedReservation?.status === 'pending' && (
            <>
              <Button
                onClick={() => updateReservationStatus(selectedReservation.id, 'rejected')}
                color="error"
                variant="outlined"
              >
                Reject
              </Button>
              <Button
                onClick={() => updateReservationStatus(selectedReservation.id, 'confirmed')}
                color="success"
                variant="contained"
              >
                Confirm
              </Button>
            </>
          )}
          {selectedReservation?.status === 'confirmed' && (
            <Button
              onClick={() => updateReservationStatus(selectedReservation.id, 'cancelled')}
              color="error"
              variant="outlined"
            >
              Cancel
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;