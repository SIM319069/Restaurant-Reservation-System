import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  TableBar as TableIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminRestaurantManagement = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [restaurantDialog, setRestaurantDialog] = useState(false);
  const [tableDialog, setTableDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    capacity: 50,
    image_url: '',
    opening_hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    }
  });

  const [tableForm, setTableForm] = useState({
    table_number: '',
    capacity: 2
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchMyRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchRestaurantTables(selectedRestaurant.id);
    }
  }, [selectedRestaurant]);

  const fetchMyRestaurants = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/my-restaurants`);
      setRestaurants(response.data);
      if (response.data.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to load restaurants');
    }
  };

  const fetchRestaurantTables = async (restaurantId) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/restaurants/${restaurantId}/tables`);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleCreateRestaurant = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/restaurants`, restaurantForm);
      setSuccess('Restaurant created successfully!');
      setRestaurantDialog(false);
      fetchMyRestaurants();
      resetRestaurantForm();
    } catch (error) {
      setError('Failed to create restaurant');
    }
  };

  const handleUpdateRestaurant = async () => {
    try {
      await axios.put(`${API_URL}/api/admin/restaurants/${selectedRestaurant.id}`, restaurantForm);
      setSuccess('Restaurant updated successfully!');
      setRestaurantDialog(false);
      fetchMyRestaurants();
    } catch (error) {
      setError('Failed to update restaurant');
    }
  };

  const handleCreateTable = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/restaurants/${selectedRestaurant.id}/tables`, tableForm);
      setSuccess('Table added successfully!');
      setTableDialog(false);
      fetchRestaurantTables(selectedRestaurant.id);
      resetTableForm();
    } catch (error) {
      setError('Failed to add table');
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/admin/tables/${tableId}`);
      setSuccess('Table deleted successfully!');
      fetchRestaurantTables(selectedRestaurant.id);
    } catch (error) {
      setError('Failed to delete table');
    }
  };

  const resetRestaurantForm = () => {
    setRestaurantForm({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      capacity: 50,
      image_url: '',
      opening_hours: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false }
      }
    });
  };

  const resetTableForm = () => {
    setTableForm({
      table_number: '',
      capacity: 2
    });
  };

  const openEditDialog = (restaurant) => {
    setRestaurantForm({
      name: restaurant.name,
      description: restaurant.description || '',
      address: restaurant.address,
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      capacity: restaurant.capacity,
      image_url: restaurant.image_url || '',
      opening_hours: restaurant.opening_hours || restaurantForm.opening_hours
    });
    setRestaurantDialog(true);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          My Restaurants
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetRestaurantForm();
            setRestaurantDialog(true);
          }}
        >
          Create Restaurant
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Restaurant List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Restaurants ({restaurants.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    border: selectedRestaurant?.id === restaurant.id ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                  onClick={() => setSelectedRestaurant(restaurant)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {restaurant.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {restaurant.address}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRestaurant(restaurant);
                          openEditDialog(restaurant);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={`${restaurant.capacity} seats`}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={restaurant.status}
                        size="small"
                        color={restaurant.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {restaurants.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <RestaurantIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No restaurants yet. Create your first restaurant!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Restaurant Details & Tables */}
        <Grid item xs={12} md={8}>
          {selectedRestaurant ? (
            <Card>
              <CardContent>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                  <Tab label="Details" />
                  <Tab label="Tables" />
                  <Tab label="Time Slots" />
                </Tabs>

                {/* Details Tab */}
                {tabValue === 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                          {selectedRestaurant.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1">{selectedRestaurant.address}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">{selectedRestaurant.phone || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">{selectedRestaurant.email || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Capacity
                        </Typography>
                        <Typography variant="body1">{selectedRestaurant.capacity} seats</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {selectedRestaurant.description || 'No description'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Tables Tab */}
                {tabValue === 1 && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Tables ({tables.length})
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          resetTableForm();
                          setTableDialog(true);
                        }}
                      >
                        Add Table
                      </Button>
                    </Box>

                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Table Number</TableCell>
                            <TableCell>Capacity</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tables.map((table) => (
                            <TableRow key={table.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <TableIcon />
                                  Table {table.table_number}
                                </Box>
                              </TableCell>
                              <TableCell>{table.capacity} seats</TableCell>
                              <TableCell>
                                <Chip
                                  label={table.status}
                                  size="small"
                                  color={table.status === 'available' ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteTable(table.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {tables.length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <TableIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          No tables yet. Add tables to start accepting reservations!
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Time Slots Tab */}
                {tabValue === 2 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Opening Hours
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Day</TableCell>
                            <TableCell>Opening Time</TableCell>
                            <TableCell>Closing Time</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedRestaurant.opening_hours && Object.entries(selectedRestaurant.opening_hours).map(([day, hours]) => (
                            <TableRow key={day}>
                              <TableCell sx={{ textTransform: 'capitalize' }}>{day}</TableCell>
                              <TableCell>{hours.closed ? '-' : hours.open}</TableCell>
                              <TableCell>{hours.closed ? '-' : hours.close}</TableCell>
                              <TableCell>
                                <Chip
                                  label={hours.closed ? 'Closed' : 'Open'}
                                  size="small"
                                  color={hours.closed ? 'default' : 'success'}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select a restaurant to view details
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Restaurant Dialog */}
      <Dialog open={restaurantDialog} onClose={() => setRestaurantDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRestaurant && restaurantForm.name === selectedRestaurant.name ? 'Edit Restaurant' : 'Create Restaurant'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Restaurant Name"
                value={restaurantForm.name}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={restaurantForm.description}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={restaurantForm.address}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={restaurantForm.phone}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={restaurantForm.email}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Capacity"
                type="number"
                value={restaurantForm.capacity}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, capacity: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Image URL"
                value={restaurantForm.image_url}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, image_url: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestaurantDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={selectedRestaurant && restaurantForm.name === selectedRestaurant.name ? handleUpdateRestaurant : handleCreateRestaurant}
          >
            {selectedRestaurant && restaurantForm.name === selectedRestaurant.name ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table Dialog */}
      <Dialog open={tableDialog} onClose={() => setTableDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Table</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Table Number"
                value={tableForm.table_number}
                onChange={(e) => setTableForm({ ...tableForm, table_number: e.target.value })}
                placeholder="e.g., 1, A1, VIP-1"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity (seats)"
                type="number"
                value={tableForm.capacity}
                onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTableDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTable}>
            Add Table
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminRestaurantManagement;