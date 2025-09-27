import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        
        console.log('AuthCallback - token:', !!token);
        console.log('AuthCallback - error:', error);
        
        if (error) {
          console.error('Auth error:', error);
          setError('Authentication failed. Please try again.');
          setTimeout(() => {
            navigate('/login?error=auth_failed');
          }, 2000);
          return;
        }
        
        if (token) {
          console.log('Processing login with token');
          
          // Validate token format before attempting to use it
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            console.error('Invalid token format');
            setError('Invalid authentication token.');
            setTimeout(() => {
              navigate('/login?error=invalid_token');
            }, 2000);
            return;
          }
          
          // Process login
          login(token);
          
          // Small delay to ensure state is updated
          setTimeout(() => {
            console.log('Redirecting to dashboard');
            navigate('/dashboard');
          }, 500);
        } else {
          console.error('No token found in callback');
          setError('No authentication token received.');
          setTimeout(() => {
            navigate('/login?error=no_token');
          }, 2000);
        }
      } catch (err) {
        console.error('AuthCallback error:', err);
        setError('Authentication processing failed.');
        setTimeout(() => {
          navigate('/login?error=processing_failed');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
        maxWidth="400px"
        mx="auto"
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Redirecting to login page...
        </Typography>
      </Box>
    );
  }

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
      <Typography variant="body2" color="text.secondary">
        Please wait while we set up your account
      </Typography>
    </Box>
  );
};

export default AuthCallback;