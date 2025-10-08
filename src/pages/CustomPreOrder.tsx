import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, remove, update, get } from 'firebase/database';
import { db } from '../firebase';
import { Plus, Upload, X, ShoppingCart, ArrowLeft, Package, Clock, Star, User, Settings, CreditCard as Edit, Trash2, Eye, EyeOff, Flame, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase reference for candle products
const customProductsRef = ref(db, 'candleProducts');
const candleMaterialsRef = ref(db, 'candleMaterials');

interface CandleProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  additionalImages: string[];
  createdAt: number;
  isActive: boolean;
}

interface CandleMaterial {
  id: string;
  name: string;
  price: number;
  category: 'containers' | 'wicks' | 'wax' | 'addons' | 'scents' | 'colors';
  imageUrl?: string;
  isActive: boolean;
}

function CustomPreOrder() {
  const navigate = useNavigate();
  const [candleProducts, setCandleProducts] = useState<CandleProduct[]>([]);
  const [candleMaterials, setCandleMaterials] = useState<CandleMaterial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CandleProduct | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<CandleMaterial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    images: [] as string[]
  });
  const [materialFormData, setMaterialFormData] = useState({
    name: '',
    price: 0,
    category: 'containers' as 'containers' | 'wicks' | 'wax' | 'addons' | 'scents' | 'colors',
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch candle products
    const candleProductsRef = ref(db, 'candleProducts');
    const unsubscribe = onValue(customProductsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const productsList = Object.entries(data)
          .map(([id, product]) => ({
            id,
            ...(product as Omit<CandleProduct, 'id'>)
          }))
          .filter(product => product.isActive)
          .sort((a, b) => b.createdAt - a.createdAt);
        setCandleProducts(productsList);
      }
    });

    // Fetch candle materials
    const unsubscribeMaterials = onValue(candleMaterialsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const materialsList = Object.entries(data)
          .map(([id, material]) => ({
            id,
            ...(material as Omit<CandleMaterial, 'id'>)
          }))
          .filter(material => material.isActive);
        setCandleMaterials(materialsList);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeMaterials();
    };
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

  const handleMaterialImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setMaterialFormData(prev => ({
          ...prev,
          imageUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      Swal.fire({
        title: 'Images Required',
        text: 'Please upload at least one image of the candle product',
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
        productRef = ref(db, `candleProducts/${productId}`);
      } else {
        // Create new product
        const candleProductsRef = ref(db, 'candleProducts');
        const newProductRef = push(customProductsRef);
        productId = newProductRef.key;
        productRef = newProductRef;
      }

      const productData = {
        ...formData,
        id: productId,
        createdAt: editingProduct ? editingProduct.createdAt : Date.now(),
        isActive: editingProduct ? editingProduct.isActive : true,
        imageUrl: formData.images[0],
        additionalImages: formData.images.slice(1)
      };

      await set(productRef, productData);

      Swal.fire({
        title: editingProduct ? 'Candle Updated!' : 'Candle Added!',
        text: editingProduct ? 'Candle product has been updated successfully!' : 'New candle product has been added successfully!',
        icon: 'success',
        confirmButtonText: 'Great!'
      });

        // Reset form
        setFormData({
          name: '',
          description: '',
          price: 0,
          quantity: 0,
          images: []
        });
        setEditingProduct(null);
        setShowForm(false);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: editingProduct ? 'Failed to update candle. Please try again.' : 'Failed to add candle. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    try {
      let materialId;
      let materialRef;

      if (editingMaterial) {
        // Update existing material
        materialId = editingMaterial.id;
        materialRef = ref(db, `candleMaterials/${materialId}`);
      } else {
        // Create new material
        const newMaterialRef = push(candleMaterialsRef);
        materialId = newMaterialRef.key;
        materialRef = newMaterialRef;
      }

      const materialData = {
        ...materialFormData,
        id: materialId,
        isActive: editingMaterial ? editingMaterial.isActive : true
      };

      await set(materialRef, materialData);

      Swal.fire({
        title: editingMaterial ? 'Material Updated!' : 'Material Added!',
        text: editingMaterial ? 'Candle material has been updated successfully!' : 'New candle material has been added successfully!',
        icon: 'success',
        confirmButtonText: 'Great!'
      });

      // Reset form
      setMaterialFormData({
        name: '',
        price: 0,
        category: 'containers',
        imageUrl: ''
      });
      setEditingMaterial(null);
      setShowMaterialForm(false);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: editingMaterial ? 'Failed to update material. Please try again.' : 'Failed to add material. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToCart = (product: CandleProduct) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = {
      ...product,
      quantity: 1,
      selected: true,
      category: 'Candles'
    };

    const isProductInCart = existingCart.some((item: any) => item.id === product.id);

    if (isProductInCart) {
      Swal.fire({
        title: 'Already in Cart',
        text: 'This candle is already in your cart',
        icon: 'warning'
      });
      return;
    }

    const newCart = [...existingCart, cartItem];
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    Swal.fire({
      title: 'Success!',
      text: 'Candle added to cart',
      icon: 'success',
      timer: 1500
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

  const handleEditProduct = (product: CandleProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
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
        const productRef = ref(db, `candleProducts/${productId}`);
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

  const handleEditMaterial = (material: CandleMaterial) => {
    setEditingMaterial(material);
    setMaterialFormData({
      name: material.name,
      price: material.price,
      category: material.category,
      imageUrl: material.imageUrl || ''
    });
    setShowMaterialForm(true);
  };

  const handleDeleteMaterial = async (materialId: string, materialName: string) => {
    const result = await Swal.fire({
      title: 'Delete Material',
      text: `Are you sure you want to delete "${materialName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        const materialRef = ref(db, `candleMaterials/${materialId}`);
        await remove(materialRef);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Material has been deleted successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete material',
          icon: 'error'
        });
      }
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const result = await Swal.fire({
      title: currentStatus ? 'Hide Product' : 'Show Product',
      text: `Are you sure you want to ${currentStatus ? 'hide' : 'show'} this product?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${currentStatus ? 'hide' : 'show'} it`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: currentStatus ? '#ef4444' : '#10b981'
    });

    if (result.isConfirmed) {
      try {
        const productRef = ref(db, `candleProducts/${productId}`);
        await update(productRef, { isActive: !currentStatus });
        
        Swal.fire({
          title: 'Updated!',
          text: `Product has been ${currentStatus ? 'hidden' : 'shown'} successfully`,
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
    }
  };

  const getMaterialsByCategory = (category: string) => {
    return candleMaterials.filter(material => material.category === category);
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
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center">
            <Flame className="mr-3 text-orange-500" size={40} />
          <i className="text-[#fa8a3b]">~<span className="text-white">Candarial</span>~</i>
           <Flame className="ml-3 text-orange-500" size={40} />
        </h1>
        <p className="text-lg text-gray-600 font-bold dark:text-gray-300">
          Premium handcrafted candles for every occasion
        </p>
        
        {/* Candle Customizer Link */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/candle-customizer')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-lg font-semibold"
          >
            <span>🕯️</span>
            <span>Design Custom Candles</span>
          </button>
        </div>
        
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

      {/* Admin Buttons */}
      {isAdminAuthenticated && (
        <div className="fixed bottom-32 right-4 z-40 flex flex-col space-y-2">
          <motion.button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Add Candle Product"
          >
            <Plus className="h-6 w-6" />
          </motion.button>
          <motion.button
            onClick={() => setShowMaterialForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Add Material"
          >
            <Settings className="h-6 w-6" />
          </motion.button>
        </div>
      )}

      {/* Admin Materials Management */}
      {isAdminAuthenticated && (
        <div className="max-w-6xl mx-auto mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Candle Materials Management</h2>
            <button
              onClick={() => setShowMaterialForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Material</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candleMaterials.map((material) => (
              <div key={material.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    {material.imageUrl && (
                      <img
                        src={material.imageUrl}
                        alt={material.name}
                        className="w-16 h-16 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                      {material.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      {material.price} TK
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                      {material.category}
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEditMaterial(material)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material.id, material.name)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candle Products Grid */}
      {candleProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {candleProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-105 relative cursor-pointer border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="relative pb-[100%]">
                <img 
                  src={product.imageUrl}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                  product.quantity > 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Candle
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{product.price}</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">TK</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Candles
                    </span>
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
                          toggleProductStatus(product.id, product.isActive);
                        }}
                        className={`flex-1 text-white px-2 py-1 text-xs rounded flex items-center justify-center space-x-1 ${
                          product.isActive 
                            ? 'bg-yellow-500 hover:bg-yellow-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {product.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        <span>{product.isActive ? 'Hide' : 'Show'}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.id, product.name);
                        }}
                        className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600 flex items-center justify-center"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    disabled={product.quantity === 0}
                    className="w-full bg-blue-500 text-white px-3 py-2 text-xs rounded-lg hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center space-x-1"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    <span>{product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
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
            No candles available yet
          </p>
          {isAdminAuthenticated && (
            <p className="text-gray-500 dark:text-gray-500">
              Add your first candle product using the + button!
            </p>
          )}
        </div>
      )}

      {/* Product Form Modal */}
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
                    {editingProduct ? 'Edit Candle Product' : 'Add Candle Product'}
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
                      Candle Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Enter candle name"
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
                      placeholder="Describe the candle (scent, size, burn time, etc.)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Price (TK) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                        min="0"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                        min="0"
                        placeholder="0"
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
                        <ImageIcon className="h-8 w-8 text-gray-400" />
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
                          quantity: 0,
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
                        <span>{editingProduct ? 'Update Candle' : 'Add Candle'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Material Form Modal */}
      <AnimatePresence>
        {showMaterialForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMaterialForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {editingMaterial ? 'Edit Material' : 'Add Candle Material'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowMaterialForm(false);
                      setEditingMaterial(null);
                      setMaterialFormData({
                        name: '',
                        price: 0,
                        category: 'containers',
                        imageUrl: ''
                      });
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                <form onSubmit={handleMaterialSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Material Name *
                    </label>
                    <input
                      type="text"
                      value={materialFormData.name}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Enter material name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Category *
                    </label>
                    <select
                      value={materialFormData.category}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, category: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="containers">Containers</option>
                      <option value="wicks">Wicks</option>
                      <option value="wax">Main Body Wax</option>
                      <option value="addons">Add-ons</option>
                      <option value="scents">Scents</option>
                      <option value="colors">Colors</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Price (TK) *
                    </label>
                    <input
                      type="number"
                      value={materialFormData.price}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Material Image (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMaterialImageUpload}
                        className="hidden"
                        id="material-image-upload"
                      />
                      <label
                        htmlFor="material-image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          Click to upload image
                        </span>
                      </label>
                    </div>

                    {materialFormData.imageUrl && (
                      <div className="mt-4 relative inline-block">
                        <img
                          src={materialFormData.imageUrl}
                          alt="Material preview"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setMaterialFormData({ ...materialFormData, imageUrl: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMaterialForm(false);
                        setEditingMaterial(null);
                        setMaterialFormData({
                          name: '',
                          price: 0,
                          category: 'containers',
                          imageUrl: ''
                        });
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-green-400 flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{editingMaterial ? 'Updating...' : 'Adding...'}</span>
                        </>
                      ) : (
                        <span>{editingMaterial ? 'Update Material' : 'Add Material'}</span>
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