import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Chip
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
      title: 'Wide Selection',
      description: 'Choose from hundreds of restaurants in your area'
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      title: 'Real-time Booking',
      description: 'Book tables instantly with real-time availability'
    },
    {
      icon: <StarIcon sx={{ fontSize: 40 }} />,
      title: 'Quality Guaranteed',
      description: 'All restaurants are verified and reviewed'
    }
  ];

  const featuredRestaurants = [
    {
      id: 1,
      name: 'The Golden Spoon',
      cuisine: 'Italian',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      rating: 4.8,
      priceRange: '$$$'
    },
    {
      id: 2,
      name: 'Sakura Sushi',
      cuisine: 'Japanese',
      image: 'https://images.unsplash.com/photo-1579027989054-b11ccc6a6ac9?w=400',
      rating: 4.9,
      priceRange: '$$$$'
    },
    {
      id: 3,
      name: 'Bistro Delight',
      cuisine: 'French',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
      rating: 4.7,
      priceRange: '$$'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Reserve Your Perfect Table
          </Typography>
          <Typography variant="h5" paragraph sx={{ mb: 4 }}>
            Discover and book amazing restaurants in seconds
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/restaurants')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Browse Restaurants
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  sx={{ px: 4, py: 1.5, color: 'white', borderColor: 'white' }}
                >
                  My Dashboard
                </Button>
              </>
            ) : (
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/login')}
                sx={{ px: 4, py: 1.5 }}
              >
                Get Started
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Making restaurant reservations has never been easier
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Restaurants */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Featured Restaurants
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Discover top-rated dining experiences
          </Typography>

          <Grid container spacing={4}>
            {featuredRestaurants.map((restaurant) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
                <Card sx={{ height: '100%', cursor: 'pointer' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={restaurant.image}
                    alt={restaurant.name}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {restaurant.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label={restaurant.cuisine} size="small" />
                      <Chip label={restaurant.priceRange} size="small" variant="outlined" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ color: 'orange', fontSize: 20 }} />
                      <Typography variant="body2">
                        {restaurant.rating} rating
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate(user ? '/restaurants' : '/login')}
            >
              View All Restaurants
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Ready to dine?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4 }}>
            Join thousands of satisfied customers who trust us with their dining experiences
          </Typography>
          {!user && (
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              Sign Up Now
            </Button>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default Home;