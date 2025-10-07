import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Home, Settings, Sun, Moon, Star, User, Menu, X, Package } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Update cart count when cart changes
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalItems = cart.reduce((total: number, item: any) => total + (item.quantity || 1), 0);
      setCartItemCount(totalItems);
    };

    // Initial count
    updateCartCount();

    // Listen for storage changes (when cart is updated)
    window.addEventListener('storage', updateCartCount);

    // Listen for custom cart update events
    window.addEventListener('cartUpdated', updateCartCount);

    // Check for cart updates periodically (fallback)
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
      clearInterval(interval);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const menuItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/custom-preorder', icon: Package, label: 'Candles' },
    { to: '/candle-customizer', icon: Package, label: 'Custom Candles' },
    { to: '/reviews', icon: Star, label: 'Reviews' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/admin-ep', icon: Settings, label: 'Admin/Ep' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <Home className="h-6 w-6 text-gray-800 dark:text-white" />
              <span className="font-fascinate text-xl text-gray-800 dark:text-white">SenTorial</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/custom-preorder" 
              className="flex items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Package className="h-6 w-6" />
              <span>Candles</span>
            </Link>
            <Link 
              to="/candle-customizer" 
              className="flex items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Package className="h-6 w-6" />
              <span>Custom Candles</span>
            </Link>
            <Link 
              to="/reviews" 
              className="flex items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Star className="h-6 w-6" />
              <span>Reviews</span>
            </Link>
            <Link 
              to="/profile" 
              className="flex items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <User className="h-6 w-6" />
              <span>Profile</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link 
              to="/cart" 
              className="flex items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </motion.span>
                )}
              </div>
              <span>Cart</span>
            </Link>
            <Link 
              to="/admin-ep" 
              className="flex items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Settings className="h-6 w-6" />
              <span>Admin/Ep</span>
            </Link>
          </div>

          {/* Mobile Menu - Cart and Hamburger */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Cart Button - Always Visible on Mobile */}
            <Link 
              to="/cart" 
              className="flex items-center text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </motion.span>
                )}
              </div>
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeMenu}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="md:hidden fixed top-16 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 border-l border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col p-4 space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Theme Toggle in Mobile Menu */}
                <button
                  onClick={() => {
                    toggleTheme();
                    closeMenu();
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;