import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  TableBar as TableIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  EventNote as CalendarIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CustomerBookingForm = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [restaurant, setRestaurant] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [bookingData, setBookingData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    party_size: 2,
    table_id: null,
    special_requests: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  const steps = ['Select Date & Time', 'Choose Table', 'Confirm Details'];

  useEffect(() => {
    fetchRestaurantDetails();
  }, [restaurantId]);

  useEffect(() => {
    if (bookingData.date && bookingData.time) {
      fetchAvailableTables();
    }
  }, [bookingData.date, bookingData.time, bookingData.party_size]);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/restaurants/${restaurantId}`);
      setRestaurant(response.data);
      generateTimeSlots(response.data.opening_hours);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      setError('Failed to load restaurant details');
      setLoading(false);
    }
  };

  const generateTimeSlots = (openingHours) => {
    const today = new Date(bookingData.date);
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (!openingHours || !openingHours[dayName] || openingHours[dayName].closed) {
      setTimeSlots([]);
      return;
    }

    const { open, close } = openingHours[dayName];
    const slots = [];
    
    const [openHour, openMin] = open.split(':').map(Number);
    const [closeHour, closeMin] = close.split(':').map(Number);
    
    let currentHour = openHour;
    let currentMin = openMin;
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      slots.push(timeString);
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    
    setTimeSlots(slots);
  };

  const fetchAvailableTables = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/restaurants/${restaurantId}/available-tables`,
        {
          params: {
            date: bookingData.date,
            time: bookingData.time,
            party_size: bookingData.party_size
          }
        }
      );
      setAvailableTables(response.data);
    } catch (error) {
      console.error('Error fetching available tables:', error);
      setError('Failed to load available tables');
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && (!bookingData.date || !bookingData.time)) {
      setError('Please select both date and time');
      return;
    }
    if (activeStep === 1 && !bookingData.table_id) {
      setError('Please select a table');
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmitBooking = async () => {
    try {
      await axios.post(`${API_URL}/api/reservations`, {
        restaurant_id: parseInt(restaurantId),
        table_id: bookingData.table_id,
        reservation_date: bookingData.date,
        reservation_time: bookingData.time,
        party_size: bookingData.party_size,
        special_requests: bookingData.special_requests
      });
      
      setSuccess('Booking request submitted successfully! Waiting for admin confirmation.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setError('Failed to submit booking request');
    }
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Restaurant not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5">{restaurant.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {restaurant.address}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Step 1: Date & Time Selection */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon /> Select Date & Time
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => {
                    setBookingData({ ...bookingData, date: e.target.value, time: '' });
                    const newDate = new Date(e.target.value);
                    const dayName = newDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                    if (restaurant.opening_hours && restaurant.opening_hours[dayName]) {
                      generateTimeSlots(restaurant.opening_hours);
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0]
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Party Size</InputLabel>
                  <Select
                    value={bookingData.party_size}
                    label="Party Size"
                    onChange={(e) => setBookingData({ ...bookingData, party_size: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                      <MenuItem key={size} value={size}>
                        {size} {size === 1 ? 'Guest' : 'Guests'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Time Slots
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {timeSlots.length > 0 ? (
                    timeSlots.map((slot) => (
                      <Chip
                        key={slot}
                        label={formatTime(slot)}
                        onClick={() => setBookingData({ ...bookingData, time: slot })}
                        color={bookingData.time === slot ? 'primary' : 'default'}
                        variant={bookingData.time === slot ? 'filled' : 'outlined'}
                        sx={{ minWidth: 100 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Restaurant is closed on this day
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 2: Table Selection */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TableIcon /> Choose Your Table
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {availableTables.length > 0 ? (
                availableTables.map((table) => (
                  <Grid item xs={12} sm={6} md={4} key={table.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: bookingData.table_id === table.id ? 2 : 1,
                        borderColor: bookingData.table_id === table.id ? 'primary.main' : 'divider',
                        '&:hover': {
                          boxShadow: 3
                        }
                      }}
                      onClick={() => setBookingData({ ...bookingData, table_id: table.id })}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <TableIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6">
                          Table {table.table_number}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                          <PeopleIcon fontSize="small" />
                          <Typography variant="body2">
                            {table.capacity} seats
                          </Typography>
                        </Box>
                        {bookingData.table_id === table.id && (
                          <Chip
                            label="Selected"
                            color="primary"
                            size="small"
                            icon={<CheckIcon />}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No tables available for the selected date, time, and party size. Please try a different time or date.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Step 3: Confirmation */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon /> Confirm Your Booking
            </Typography>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Restaurant
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {restaurant.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {new Date(bookingData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatTime(bookingData.time)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Party Size
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {bookingData.party_size} {bookingData.party_size === 1 ? 'Guest' : 'Guests'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Table
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      Table {availableTables.find(t => t.id === bookingData.table_id)?.table_number}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Special Requests (Optional)"
                      multiline
                      rows={3}
                      value={bookingData.special_requests}
                      onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                      placeholder="Any dietary restrictions, accessibility needs, or special occasions?"
                    />
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 3 }}>
                  Your booking will be sent to the restaurant admin for confirmation. You'll receive an update once it's reviewed.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/restaurants')}
            >
              Cancel
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmitBooking}
              >
                Submit Booking
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerBookingForm;