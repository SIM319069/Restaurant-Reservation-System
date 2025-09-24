import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';

const Restaurants = () => {
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const { data: restaurants = [], isLoading, error } = useQuery(
    ['restaurants', search, cuisine, priceRange],
    async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (cuisine) params.append('cuisine', cuisine);
      if (priceRange) params.append('price_range', priceRange);
      
      const response = await axios.get(`/api/restaurants?${params}`);
      return response.data;
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading restaurants</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Restaurants</h1>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Cuisines</option>
              <option value="Italian">Italian</option>
              <option value="Asian">Asian</option>
              <option value="American">American</option>
              <option value="Mexican">Mexican</option>
              <option value="International">International</option>
            </select>
            
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Price Ranges</option>
              <option value="$">$ - Budget</option>
              <option value="$">$ - Moderate</option>
              <option value="$$">$$ - Expensive</option>
              <option value="$$">$$ - Very Expensive</option>
            </select>
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/restaurants/${restaurant.id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              {restaurant.image_url && (
                <img
                  src={restaurant.image_url}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {restaurant.name}
              </h3>
              
              <p className="text-gray-600 mb-3 line-clamp-2">
                {restaurant.description}
              </p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{restaurant.cuisine_type}</span>
                <span>{restaurant.price_range}</span>
              </div>
              
              <p className="text-gray-500 text-sm mt-2">
                {restaurant.address}
              </p>
            </Link>
          ))}
        </div>

        {restaurants.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;