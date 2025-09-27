import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth(); // FIXED: Include loading state

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Restaurant Booking
          </Link>
        </Typography>

        {loading ? (
          // Show loading indicator while checking auth
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={24} color="inherit" />
          </Box>
        ) : user ? (
          // Show user info and logout when logged in
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/dashboard')}
              sx={{ textTransform: 'none' }}
            >
              Hello, {user.name}
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          // Show sign in when not logged in
          <Button color="inherit" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;