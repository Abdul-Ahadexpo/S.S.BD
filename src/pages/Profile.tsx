import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Clock, FileText } from 'lucide-react';
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

  useEffect(() => {
    // Load checkout info if available
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

  const modifyOrder = async (orderId: string) => {
    const order = profileData.orderHistory.find(o => o.orderId === orderId);
    if (!order) return;

    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    if (order.timestamp < tenMinutesAgo) {
      Swal.fire({
        title: 'Cannot Modify Order',
        text: 'Orders can only be modified within 10 minutes of placement',
        icon: 'warning'
      });
      return;
    }

    const { value: action } = await Swal.fire({
      title: 'Modify Order',
      input: 'select',
      inputOptions: {
        address: 'Edit Address',
        cancel: 'Cancel Order',
        add: 'Add More Products'
      },
      inputPlaceholder: 'Select action',
      showCancelButton: true
    });

    if (action) {
      let modificationData = {};
      
      switch (action) {
        case 'address':
          const { value: newAddress } = await Swal.fire({
            title: 'Edit Address',
            input: 'textarea',
            inputValue: order.address,
            showCancelButton: true
          });
          
          if (newAddress) {
            modificationData = { 
              type: 'address_change',
              oldAddress: order.address,
              newAddress 
            };
            order.address = newAddress;
          }
          break;

        case 'cancel':
          const { isConfirmed } = await Swal.fire({
            title: 'Cancel Order',
            text: 'Are you sure you want to cancel this order?',
            icon: 'warning',
            showCancelButton: true
          });
          
          if (isConfirmed) {
            modificationData = { type: 'cancellation' };
            order.status = 'Cancelled';
          }
          break;

        case 'add':
          navigate('/');
          return;
      }

      if (Object.keys(modificationData).length > 0) {
        // Send modification email
        const emailData = {
          access_key: "78bafe1f-05fd-4f4a-bd3b-c12ec189a7e7",
          orderId: order.orderId,
          modification: JSON.stringify(modificationData),
          customerName: profileData.name,
          customerEmail: profileData.email,
          orderDetails: JSON.stringify(order)
        };

        try {
          await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
          });

          // Update local storage
          localStorage.setItem('profileData', JSON.stringify(profileData));

          Swal.fire({
            title: 'Order Modified',
            text: 'Your order has been modified successfully',
            icon: 'success'
          });
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: 'Failed to modify order',
            icon: 'error'
          });
        }
      }
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={importProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 dark:text-gray-300">Name: {profileData.name}</p>
              <p className="text-gray-600 dark:text-gray-300">Email: {profileData.email}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Phone: {profileData.phone}</p>
              <p className="text-gray-600 dark:text-gray-300">Address: {profileData.address}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Order History</h2>
          
          <div className="space-y-6">
            {profileData.orderHistory.map((order) => (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(order.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {item.name} {item.selectedVariant ? `(${item.selectedVariant})` : ''} × {item.quantity}
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">{item.price * item.quantity} TK</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                  <div className="text-gray-600 dark:text-gray-300">
                    Total: <span className="font-semibold">{order.total} TK</span>
                  </div>
                  
                  {Date.now() - order.timestamp < 10 * 60 * 1000 && order.status !== 'Cancelled' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => modifyOrder(order.orderId)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Modify Order</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}

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
