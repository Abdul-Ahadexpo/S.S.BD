import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminEmployeePortal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin/Employee Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Choose your login type
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin')}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <ShieldCheck className="h-5 w-5 text-purple-500 group-hover:text-purple-400" />
            </span>
            Admin Login
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/employee/login')}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Users className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
            </span>
            Employee Login
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default AdminEmployeePortal;
