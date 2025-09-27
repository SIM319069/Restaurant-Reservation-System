import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Restaurant as RestaurantIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RestaurantList = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/restaurants`);
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = !cuisineFilter || restaurant.cuisine === cuisineFilter;
    
    return matchesSearch && matchesCuisine;
  });

  const availableCuisines = [...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];

  const placeholderRestaurants = [
    {
      id: 1,
      name: 'The Golden Spoon',
      description: 'Authentic Italian cuisine with a modern twist',
      address: '123 Main Street, Downtown',
      cuisine: 'Italian',
      capacity: 50,
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      rating: 4.8,
      price_range: '$$$'
    },
    {
      id: 2,
      name: 'Sakura Sushi',
      description: 'Fresh sushi and Japanese specialties',
      address: '456 Oak Avenue, Midtown',
      cuisine: 'Japanese',
      capacity: 30,
      image_url: 'https://images.unsplash.com/photo-1579027989054-b11ccc6a6ac9?w=400',
      rating: 4.9,
      price_range: '$$$$'
    },
    {
      id: 3,
      name: 'Bistro Delight',
      description: 'Classic French bistro with seasonal menu',
      address: '789 Elm Street, Old Town',
      cuisine: 'French',
      capacity: 40,
      image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
      rating: 4.7,
      price_range: '$$'
    }
  ];

  const displayRestaurants = restaurants.length > 0 ? filteredRestaurants : placeholderRestaurants;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading restaurants...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center">
        Discover Restaurants
      </Typography>
      <Typography variant="h6" color="text.secondary" textAlign="center" paragraph>
        Find the perfect place for your next meal
      </Typography>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Cuisine Type</InputLabel>
              <Select
                value={cuisineFilter}
                label="Cuisine Type"
                onChange={(e) => setCuisineFilter(e.target.value)}
              >
                <MenuItem value="">All Cuisines</MenuItem>
                {availableCuisines.map((cuisine) => (
                  <MenuItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setCuisineFilter('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {restaurants.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 4 }}>
          No restaurants found. Here are some sample restaurants to get you started!
        </Alert>
      )}

      {/* Restaurant Grid */}
      <Grid container spacing={4}>
        {displayRestaurants.map((restaurant) => (
          <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
              }}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                alt={restaurant.name}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  {restaurant.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                  {restaurant.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {restaurant.address}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {restaurant.cuisine && (
                    <Chip label={restaurant.cuisine} size="small" color="primary" />
                  )}
                  {restaurant.price_range && (
                    <Chip label={restaurant.price_range} size="small" variant="outlined" />
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={restaurant.rating || 4.5} readOnly size="small" precision={0.1} />
                    <Typography variant="caption">
                      ({restaurant.rating || 4.5})
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Seats {restaurant.capacity || 50}
                  </Typography>
                </Box>

                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/booking/${restaurant.id}`);
                  }}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {displayRestaurants.length === 0 && searchTerm && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No restaurants found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default RestaurantList;