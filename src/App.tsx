import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HelpGuide from './components/HelpGuide';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Reviews from './pages/Reviews';
import ProductDetails from './pages/ProductDetails';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Navbar />
          <div className="pb-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/product/:id" element={<ProductDetails />} />
            </Routes>
          </div>
          <HelpGuide />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
