import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Home, Settings, Sun, Moon, Star, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-gray-800 dark:text-white" />
              <span className="font-bold text-xl text-gray-800 dark:text-white">Spin Strike</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/reviews" 
              className="flex items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Star className="h-6 w-6" />
              <span className="hidden sm:inline">Reviews</span>
            </Link>
            <Link 
              to="/profile" 
              className="flex items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
            >
              <User className="h-6 w-6" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link 
              to="/cart" 
              className="flex items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="hidden sm:inline">Cart</span>
            </Link>
            <Link 
              to="/admin-ep" 
              className="flex items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Settings className="h-6 w-6" />
              <span className="hidden sm:inline">Admin/Ep</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
