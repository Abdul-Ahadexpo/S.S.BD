import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Clock, FileText, Copy, Trash2, Edit2, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface OrderHistory {
  orderId: string;
  timestamp: number;
  items: any[];
  total: number;
  address: string;
  isGiftWrapped: boolean;
  status: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  orderHistory: OrderHistory[];
}

function Profile() {
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    const savedData = localStorage.getItem('profileData');
    return savedData ? JSON.parse(savedData) : {
      name: '',
      email: '',
      phone: '',
      address: '',
      orderHistory: []
    };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const checkoutInfo = localStorage.getItem('userCheckoutInfo');
    if (checkoutInfo) {
      const parsedInfo = JSON.parse(checkoutInfo);
      setProfileData(prev => ({
        ...prev,
        name: parsedInfo.name || prev.name,
        email: parsedInfo.email || prev.email,
        phone: parsedInfo.phone || prev.phone,
        address: parsedInfo.address || prev.address
      }));
    }
  }, []);

  const saveProfileChanges = () => {
    const updatedProfile = {
      ...profileData,
      ...editForm
    };
    setProfileData(updatedProfile);
    localStorage.setItem('profileData', JSON.stringify(updatedProfile));
    localStorage.setItem('userCheckoutInfo', JSON.stringify(editForm));
    setIsEditing(false);
    
    Swal.fire({
      title: 'Success!',
      text: 'Profile information updated successfully',
      icon: 'success',
      timer: 1500
    });
  };

  const startEditing = () => {
    setEditForm({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address
    });
    setIsEditing(true);
  };

  const deleteOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: 'Delete Order',
      text: 'Are you sure you want to delete this order from your history?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      const updatedHistory = profileData.orderHistory.filter(
        order => order.orderId !== orderId
      );
      const updatedProfile = {
        ...profileData,
        orderHistory: updatedHistory
      };
      setProfileData(updatedProfile);
      localStorage.setItem('profileData', JSON.stringify(updatedProfile));

      Swal.fire({
        title: 'Deleted!',
        text: 'Order has been removed from history',
        icon: 'success',
        timer: 1500
      });
    }
  };

  const clearAllOrders = async () => {
    const result = await Swal.fire({
      title: 'Clear All Orders',
      text: 'Are you sure you want to delete all orders from your history? This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear all',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      const updatedProfile = {
        ...profileData,
        orderHistory: []
      };
      setProfileData(updatedProfile);
      localStorage.setItem('profileData', JSON.stringify(updatedProfile));

      Swal.fire({
        title: 'Cleared!',
        text: 'All orders have been removed from history',
        icon: 'success',
        timer: 1500
      });
    }
  };

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    Swal.fire({
      title: 'Copied!',
      text: 'Order ID copied to clipboard',
      icon: 'success',
      timer: 1500
    });
  };

  const exportProfile = () => {
    const dataStr = JSON.stringify(profileData);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spin-strike-profile.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Swal.fire({
      title: 'Profile Exported!',
      text: 'Your profile data has been downloaded successfully.',
      icon: 'success'
    });
  };

  const importProfile = async () => {
    const { value: file } = await Swal.fire({
      title: 'Select Profile File',
      input: 'file',
      inputAttributes: {
        accept: '.json',
        'aria-label': 'Upload your profile file'
      }
    });

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setProfileData(data);
          localStorage.setItem('profileData', JSON.stringify(data));
          localStorage.setItem('userCheckoutInfo', JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address
          }));
          
          Swal.fire({
            title: 'Profile Imported!',
            text: 'Your profile data has been restored successfully.',
            icon: 'success'
          });
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: 'Invalid profile file format',
            icon: 'error'
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">My Profile</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Profile Information</h2>
            <div className="flex space-x-2">
              {!isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startEditing}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportProfile}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={importProfile}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Import</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveProfileChanges}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <span>Save</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </motion.button>
                </>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="profile-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Name: {profileData.name}</p>
                  <p className="text-gray-600 dark:text-gray-300">Email: {profileData.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Phone: {profileData.phone}</p>
                  <p className="text-gray-600 dark:text-gray-300">Address: {profileData.address}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Order History</h2>
            {profileData.orderHistory.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllOrders}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </motion.button>
            )}
          </div>
          
          <div className="space-y-6">
            <AnimatePresence>
              {profileData.orderHistory.map((order) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        Order #{order.orderId}
                      </h3>
                      <button
                        onClick={() => copyOrderId(order.orderId)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => deleteOrder(order.orderId)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(order.timestamp).toLocaleString()}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
                          {item.selectedVariant && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Color: {item.selectedVariant}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {item.quantity} × {item.price} TK
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-between items-center pt-4 border-t dark:border-gray-700">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Delivery to: {order.address}
                      </p>
                      {order.isGiftWrapped && (
                        <p className="text-sm text-pink-600 dark:text-pink-400">
                          Gift wrapped
                        </p>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      Total: {order.total} TK
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {profileData.orderHistory.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No orders yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
