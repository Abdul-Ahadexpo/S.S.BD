import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { db } from '../firebase';
import { Plus, Upload, X, ShoppingCart, ArrowLeft, Package, Clock, Star, User, Settings, CreditCard as Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  additionalImages?: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  estimatedPrice?: number;
}

function CustomPreOrder() {
  const navigate = useNavigate();
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CustomProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerLocation: '',
    images: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch custom pre-order products
    const customProductsRef = ref(db, 'customPreOrders');
    const unsubscribe = onValue(customProductsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const productsList = Object.entries(data)
          .map(([id, product]) => ({
            id,
            ...(product as Omit<CustomProduct, 'id'>)
          }))
          .filter(product => product.status === 'approved' || product.status === 'pending')
          .sort((a, b) => b.createdAt - a.createdAt);
        setCustomProducts(productsList);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageUrl]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      Swal.fire({
        title: 'Images Required',
        text: 'Please upload at least one image of the product you want to pre-order',
        icon: 'warning'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let productId;
      let productRef;

      if (editingProduct) {
        // Update existing product
        productId = editingProduct.id;
        productRef = ref(db, `customPreOrders/${productId}`);
      } else {
        // Create new product
        const customProductsRef = ref(db, 'customPreOrders');
        const newProductRef = push(customProductsRef);
        productId = newProductRef.key;
        productRef = newProductRef;
      }

      const productData = {
        ...formData,
        id: productId,
        status: editingProduct ? editingProduct.status : 'pending',
        createdAt: editingProduct ? editingProduct.createdAt : Date.now(),
        price: formData.price || 0, // Will be set by admin
        imageUrl: formData.images[0],
        additionalImages: formData.images.slice(1)
      };

      await set(productRef, productData);

      // Send email notification only for new products
      if (!editingProduct) {
        const emailData = {
          access_key: "78bafe1f-05fd-4f4a-bd3b-c12ec189a7e7",
          subject: `New Custom Pre-Order Request - ${formData.name}`,
          from_name: "SenTorial Custom Orders",
          message: `
NEW CUSTOM PRE-ORDER REQUEST

Product Details:
- Product Name: ${formData.name}
- Description: ${formData.description}

Customer Information:
- Name: ${formData.customerName}
- Email: ${formData.customerEmail}
- Phone: ${formData.customerPhone}
- Location: ${formData.customerLocation}

Images: ${formData.images.length} image(s) uploaded
Product ID: ${productId}

Please review this request in the admin panel and set the price and approval status.

Time: ${new Date().toLocaleString()}
        `
        };

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }
      }

        Swal.fire({
          title: editingProduct ? 'Product Updated!' : 'Request Submitted!',
          html: `
            <p>Your custom pre-order ${editingProduct ? 'has been updated' : 'request has been submitted'} successfully!</p>
            <p class="mt-4"><strong>Request ID:</strong> ${productId}</p>
            ${!editingProduct ? '<p class="mt-2 text-sm">We will review your request and contact you within 24-48 hours with pricing and availability.</p>' : ''}
          `,
          icon: 'success',
          confirmButtonText: 'Great!'
        });

        // Reset form
        setFormData({
          name: '',
          description: '',
          price: 0,
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          customerLocation: '',
          images: []
        });
        setEditingProduct(null);
        setShowForm(false);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: editingProduct ? 'Failed to update product. Please try again.' : 'Failed to submit your request. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToCart = (product: CustomProduct) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 'Pre-order',
      category: 'Custom Pre-order',
      selected: true,
      quantity: 1
    };

    const isProductInCart = existingCart.some((item: any) => item.id === product.id);

    if (isProductInCart) {
      Swal.fire({
        title: 'Already in Cart',
        text: 'This custom product is already in your cart',
        icon: 'warning'
      });
      return;
    }

    const newCart = [...existingCart, cartItem];
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    Swal.fire({
      title: 'Pre-order Payment Required',
      html: `
        <p>To confirm your custom pre-order, please send 25% advance payment to:</p>
        <p class="text-xl font-bold mt-4">bKash: 01722786111</p>
        <p class="mt-2 text-sm">Include your order number as reference when sending payment.</p>
      `,
      icon: 'info',
      confirmButtonText: 'Got it!'
    });
  };

  const handleAdminLogin = async () => {
    const { value: password } = await Swal.fire({
      title: 'Admin Access',
      input: 'password',
      inputLabel: 'Enter admin password',
      inputPlaceholder: 'Password',
      showCancelButton: true,
      confirmButtonText: 'Login',
      cancelButtonText: 'Cancel'
    });

    if (password === '69') {
      setIsAdminAuthenticated(true);
      setShowAdminPanel(true);
      Swal.fire({
        title: 'Access Granted',
        text: 'You can now manage custom products',
        icon: 'success',
        timer: 1500
      });
    } else if (password) {
      Swal.fire({
        title: 'Access Denied',
        text: 'Incorrect password',
        icon: 'error'
      });
    }
  };

  const handleEditProduct = (product: CustomProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      customerName: product.customerName,
      customerEmail: product.customerEmail,
      customerPhone: product.customerPhone,
      customerLocation: product.customerLocation,
      images: [product.imageUrl, ...(product.additionalImages || [])]
    });
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    const result = await Swal.fire({
      title: 'Delete Product',
      text: `Are you sure you want to delete "${productName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        const productRef = ref(db, `customPreOrders/${productId}`);
        await remove(productRef);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Product has been deleted successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete product',
          icon: 'error'
        });
      }
    }
  };

  const handleUpdateProductStatus = async (productId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const productRef = ref(db, `customPreOrders/${productId}`);
      await update(productRef, { status: newStatus });
      
      Swal.fire({
        title: 'Status Updated',
        text: `Product has been ${newStatus}`,
        icon: 'success',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to update product status',
        icon: 'error'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 mb-6"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Home
      </button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Custom Pre-Orders
        </h1>
        <p className="text-lg text-gray-600 font-bold dark:text-gray-300">
          Can't find what you're looking for? Request a custom product by using the blue + button!
        </p>
        
        {/* Admin Button */}
        <div className="mt-4">
          <button
            onClick={handleAdminLogin}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            <Settings className="h-4 w-4" />
            <span>Admin Panel</span>
          </button>
        </div>
      </div>

      {/* Floating Add Button */}
      <motion.button
        onClick={() => setShowForm(true)}
        className="fixed bottom-32 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Add Custom Pre-order"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Custom Products Grid */}
      {customProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {customProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-105 relative cursor-pointer border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="relative pb-[100%]">
                <img 
                  src={product.imageUrl}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Pre-order
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Custom
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {product.price > 0 ? `${product.price}` : 'TBD'}
                      </span>
                      {product.price > 0 && <span className="text-sm text-blue-600 dark:text-blue-400">TK</span>}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Custom
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>Requested by {product.customerName}</span>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  {isAdminAuthenticated && (
                    <div className="flex space-x-1 mb-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                        className="flex-1 bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600 flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.id, product.name);
                        }}
                        className="flex-1 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600 flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  {/* Status Controls for Admin */}
                  {isAdminAuthenticated && product.status === 'pending' && (
                    <div className="flex space-x-1 mb-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateProductStatus(product.id, 'approved');
                        }}
                        className="flex-1 bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateProductStatus(product.id, 'rejected');
                        }}
                        className="flex-1 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.status === 'pending'}
                    className="w-full bg-blue-500 text-white px-3 py-2 text-xs rounded-lg hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center space-x-1"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    <span>{product.status === 'approved' ? 'Pre-order Now' : 'Under Review'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            No custom products available yet
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Be the first to request a custom product!
          </p>
        </div>
      )}

      {/* Request Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Request Custom Product
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="What product do you want?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Product Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      required
                      placeholder="Describe the product in detail (size, color, material, etc.)"
                    />
                  </div>

                  {/* Price field for admin editing */}
                  {isAdminAuthenticated && editingProduct && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Product Price (TK) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                        min="0"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={formData.customerLocation}
                        onChange={(e) => setFormData({ ...formData, customerLocation: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Product Images * (At least 1 required)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Click to upload images or drag and drop
                        </span>
                        <span className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB each
                        </span>
                      </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      What happens next?
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• We'll review your request within 24-48 hours</li>
                      <li>• You'll receive pricing and availability via email</li>
                      <li>• Once approved, the product will appear on this page</li>
                      <li>• You can then place a pre-order with 25% advance payment</li>
                    </ul>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                        setFormData({
                          name: '',
                          description: '',
                          price: 0,
                          customerName: '',
                          customerEmail: '',
                          customerPhone: '',
                          customerLocation: '',
                          images: []
                        });
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-400 flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{editingProduct ? 'Updating...' : 'Submitting...'}</span>
                        </>
                      ) : (
                        <span>{editingProduct ? 'Update Product' : 'Submit Request'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomPreOrder;