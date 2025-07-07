import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HelpGuide from './components/HelpGuide';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import AdminEmployeePortal from './pages/AdminEmployeePortal';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Checkout from './pages/Checkout';
import Reviews from './pages/Reviews';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';

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
              <Route path="/admin-ep" element={<AdminEmployeePortal />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/employee/login" element={<EmployeeLogin />} />
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
          <HelpGuide />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;