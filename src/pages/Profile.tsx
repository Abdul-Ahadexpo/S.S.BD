import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Clock, FileText, Copy, Trash2, Edit2, X, Phone, MapPin, Ban, Heart, Star, Package, ShoppingCart } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface OrderHistory {
  orderId: string;
  timestamp: number;
  items: any[];
  total: number;
  address: string;
  phone?: string;
  isGiftWrapped: boolean;
  deliveryCharge?: number;
  status: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  orderHistory: OrderHistory[];
  wishlist: string[];
}

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: string | number;
  category: string;
}

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    const savedData = localStorage.getItem('profileData');
    return savedData ? JSON.parse(savedData) : {
      name: '',
      email: '',
      phone: '',
      address: '',
      orderHistory: [],
      wishlist: []
    };
  });
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    // Load wishlist from localStorage and fetch product details
    const loadWishlist = async () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      if (wishlist.length > 0) {
        try {
          const productsRef = ref(db, 'products');
          const snapshot = await get(productsRef);
          
          if (snapshot.exists()) {
            const allProducts = snapshot.val();
            const wishlistProductsData = wishlist
              .map((productId: string) => {
                const product = allProducts[productId];
                return product ? { id: productId, ...product } : null;
              })
              .filter(Boolean);
            
            setWishlistProducts(wishlistProductsData);
            
            // Update profile data with current wishlist
            setProfileData(prev => ({
              ...prev,
              wishlist: wishlist
            }));
          }
        } catch (error) {
          console.error('Error loading wishlist products:', error);
        }
      }
    };

    loadWishlist();

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

  const canModifyOrder = (timestamp: number) => {
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    return Date.now() - timestamp < tenMinutes;
  };

  const cancelOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: 'Cancel Order',
      text: 'Are you sure you want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'No, keep it',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      const updatedHistory = profileData.orderHistory.map(order => 
        order.orderId === orderId 
          ? { ...order, status: 'Cancelled' }
          : order
      );
      
      const updatedProfile = {
        ...profileData,
        orderHistory: updatedHistory
      };
      
      setProfileData(updatedProfile);
      localStorage.setItem('profileData', JSON.stringify(updatedProfile));

      Swal.fire({
        title: 'Order Cancelled!',
        text: 'Your order has been cancelled successfully',
        icon: 'success',
        timer: 2000
      });
    }
  };

  const sendOrderUpdateEmail = async (order: OrderHistory, newPhone: string, newAddress: string) => {
    const deliveryCharge = order.deliveryCharge || (order.total - (order.total - 120 - (order.isGiftWrapped ? 20 : 0)) >= 2000 ? 0 : 120);
    const subtotal = order.total - deliveryCharge - (order.isGiftWrapped ? 20 : 0);
    
    const emailData = {
      access_key: "78bafe1f-05fd-4f4a-bd3b-c12ec189a7e7",
      subject: `Order Update - ${order.orderId}`,
      from_name: "Sentorial",
      to: profileData.email,
      message: `
ORDER UPDATE NOTIFICATION

Order ID: ${order.orderId}
Customer: ${profileData.name}
Email: ${profileData.email}

UPDATED DELIVERY INFORMATION:
Phone: ${newPhone}
Address: ${newAddress}

ORDER DETAILS:
${order.items.map(item => 
  `• ${item.name}${item.selectedVariant ? ` (${item.selectedVariant})` : ''} - Qty: ${item.quantity} - Price: ${item.price} TK`
).join('\n')}

PRICING BREAKDOWN:
Subtotal: ${subtotal} TK
Delivery Charge: ${deliveryCharge === 0 ? 'FREE (Order over 2000 TK)' : `${deliveryCharge} TK`}${order.isGiftWrapped ? '\nGift Wrapping: 20 TK' : ''}
Total Amount: ${order.total} TK

${order.isGiftWrapped ? 'Note: This order includes gift wrapping\n' : ''}
Order Status: ${order.status}
Order Date: ${new Date(order.timestamp).toLocaleString()}

Thank you for shopping with Sentorial!
For any queries, contact us at: spinstrikebd@gmail.com
      `
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log('Order update email sent successfully');
      }
    } catch (error) {
      console.error('Failed to send order update email:', error);
    }
  };

  const changeOrderDetails = async (orderId: string, currentAddress: string, currentPhone?: string) => {
    const { value: formValues } = await Swal.fire({
      title: 'Update Order Details',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input id="swal-phone" class="swal2-input" placeholder="Phone Number" value="${currentPhone || profileData.phone}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
            <textarea id="swal-address" class="swal2-textarea" placeholder="Delivery Address" rows="3">${currentAddress}</textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Details',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const phone = (document.getElementById('swal-phone') as HTMLInputElement).value;
        const address = (document.getElementById('swal-address') as HTMLTextAreaElement).value;
        
        if (!phone || !address) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }
        
        return { phone, address };
      }
    });

    if (formValues) {
      const order = profileData.orderHistory.find(o => o.orderId === orderId);
      
      const updatedHistory = profileData.orderHistory.map(order => 
        order.orderId === orderId 
          ? { ...order, address: formValues.address, phone: formValues.phone }
          : order
      );
      
      const updatedProfile = {
        ...profileData,
        orderHistory: updatedHistory
      };
      
      setProfileData(updatedProfile);
      localStorage.setItem('profileData', JSON.stringify(updatedProfile));

      // Send email notification about the update
      if (order) {
        await sendOrderUpdateEmail(order, formValues.phone, formValues.address);
      }

      Swal.fire({
        title: 'Details Updated!',
        text: 'Order details have been updated successfully. A confirmation email has been sent.',
        icon: 'success',
        timer: 3000
      });
    }
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

  const addWishlistToCart = (product: WishlistProduct) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = {
      ...product,
      quantity: 1,
      selected: true
    };

    const isProductInCart = existingCart.some((item: any) => item.id === product.id);

    if (isProductInCart) {
      Swal.fire({
        title: 'Already in Cart',
        text: 'This item is already in your cart',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const newCart = [...existingCart, cartItem];
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    Swal.fire({
      title: 'Success!',
      text: 'Product added to cart from wishlist',
      icon: 'success',
      timer: 1500
    });
  };

  const removeFromWishlist = (productId: string) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const newWishlist = wishlist.filter((id: string) => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    
    // Update local state
    setWishlistProducts(prev => prev.filter(product => product.id !== productId));
    setProfileData(prev => ({
      ...prev,
      wishlist: newWishlist
    }));
    
    Swal.fire({
      title: 'Removed!',
      text: 'Product removed from wishlist',
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
    link.download = 'sentorial-profile.json';
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
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Profile Information</h2>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              {!isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startEditing}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 min-w-[100px] justify-center"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportProfile}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 min-w-[100px] justify-center"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={importProfile}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 min-w-[100px] justify-center"
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
                    className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 min-w-[100px] justify-center"
                  >
                    <span>Save</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 min-w-[100px] justify-center"
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

        {/* Wishlist Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Heart className="h-6 w-6 mr-2 text-red-500" />
              My Wishlist ({wishlistProducts.length})
            </h2>
          </div>
          
          {wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {wishlistProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div 
                      className="aspect-square cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 
                        className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {product.price} TK
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {product.category}
                        </span>
                      </div>
                      <div className={`mb-3 px-2 py-1 rounded-full text-xs font-medium inline-block ${
                        product.quantity === 'Out of Stock'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : product.quantity === 'Pre-order'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {product.quantity === 'Out of Stock' ? 'Out of Stock' :
                         product.quantity === 'Pre-order' ? 'Pre-order' :
                         'In Stock'}
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addWishlistToCart(product)}
                          disabled={product.quantity === 'Out of Stock'}
                          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 text-sm flex items-center justify-center space-x-1"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromWishlist(product.id)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                Your wishlist is empty
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Browse Products
              </motion.button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
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
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
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
                    {canModifyOrder(order.timestamp) && order.status === 'Pending' && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs rounded-full">
                        Can modify
                      </span>
                    )}
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

                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-4 border-t dark:border-gray-700 gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {order.address}
                        </p>
                      </div>
                      {order.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {order.phone}
                          </p>
                        </div>
                      )}
                      {order.isGiftWrapped && (
                        <p className="text-sm text-pink-600 dark:text-pink-400">
                          ✨ This order will be gift wrapped
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        Total: {order.total} TK
                      </p>
                      
                      {/* Order Action Buttons */}
                      {order.status === 'Pending' && (
                        <div className="flex flex-wrap gap-2">
                          {canModifyOrder(order.timestamp) && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => changeOrderDetails(order.orderId, order.address, order.phone)}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                              >
                                <Edit2 className="h-3 w-3" />
                                <span>Edit Details</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => cancelOrder(order.orderId)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                              >
                                <Ban className="h-3 w-3" />
                                <span>Cancel</span>
                              </motion.button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
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