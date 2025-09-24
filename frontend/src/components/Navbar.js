import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    loginWithGoogle();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-primary-600">
                    RestaurantBook
                  </h1>
                </Link>
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <Link
                    to="/restaurants"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                  >
                    Restaurants
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/my-reservations"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                    >
                      My Reservations
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </div>

              <div className="hidden md:flex md:items-center md:space-x-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.avatar_url || '/default-avatar.png'}
                      alt={user.name}
                    />
                    <span className="text-gray-700">{user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="btn-secondary"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="btn-primary"
                  >
                    Login with Google
                  </button>
                )}
              </div>

              <div className="md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/restaurants"
                className="text-gray-500 hover:text-gray-700 block px-3 py-2 text-base font-medium"
              >
                Restaurants
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/my-reservations"
                    className="text-gray-500 hover:text-gray-700 block px-3 py-2 text-base font-medium"
                  >
                    My Reservations
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-gray-500 hover:text-gray-700 block px-3 py-2 text-base font-medium"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 block px-3 py-2 text-base font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <button
                  onClick={handleLogin}
                  className="text-gray-500 hover:text-gray-700 block px-3 py-2 text-base font-medium w-full text-left"
                >
                  Login with Google
                </button>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;