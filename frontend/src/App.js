import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import BookingForm from './pages/BookingForm';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';

// Context
import { AuthProvider } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff9800',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected routes - require authentication */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/restaurants" 
              element={
                <ProtectedRoute>
                  <RestaurantList />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/restaurants/:id" 
              element={
                <ProtectedRoute>
                  <RestaurantDetail />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/booking/:restaurantId" 
              element={
                <ProtectedRoute>
                  <BookingForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin-only routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;