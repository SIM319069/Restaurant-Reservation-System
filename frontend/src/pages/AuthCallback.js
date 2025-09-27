import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthCallback = () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      
      console.log('AuthCallback - token:', token);
      console.log('AuthCallback - error:', error);
      
      if (error) {
        console.error('Auth error:', error);
        navigate('/login?error=auth_failed');
        return;
      }
      
      if (token) {
        console.log('Processing login with token');
        login(token);
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          console.log('Redirecting to dashboard');
          navigate('/dashboard');
        }, 100);
      } else {
        console.error('No token found in callback');
        navigate('/login?error=no_token');
      }
    };

    handleAuthCallback();
  }, [searchParams, login, navigate]);

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">
        Completing login...
      </Typography>
    </Box>
  );
};

export default AuthCallback;