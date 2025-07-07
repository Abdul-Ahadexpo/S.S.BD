import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, update, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import { Plus, Edit2, Save, X, Image as ImageIcon, Star, Megaphone } from 'lucide-react';
import Swal from 'sweetalert2';

interface ProductVariant {
  color: string;
  stock: number;
  imageUrl?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: string | number;
  category: string;
  variants?: ProductVariant[];
  additionalImages?: string[];
  isExclusive?: boolean;
}

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
}

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'banners'>('products');
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    quantity: '',
    category: '',
    variants: [],
    additionalImages: ['', '', ''],
    isExclusive: false
  });
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    color: '',
    stock: 0,
    imageUrl: ''
  });
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('employeeAuth') === 'true';
    if (!isAuthenticated) {
      navigate('/employee/login');
      return;
    }

    // Fetch products
    const productsRef = ref(db, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList = Object.entries(data).map(([id, product]) => ({
          id,
          ...(product as Omit<Product, 'id'>)
        }));
        setProducts(productsList);
      }
    });

    // Fetch categories
    const categoriesRef = ref(db, 'categories');
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesList = Object.values(data).map((cat: any) => cat.name);
        setCategories(categoriesList);
      }
    });

    // Fetch banners
    const bannersRef = ref(db, 'banners');
    const unsubscribeBanners = onValue(bannersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bannersList = Object.entries(data).map(([id, banner]) => ({
          id,
          ...(banner as Omit<Banner, 'id'>)
        }));
        setBanners(bannersList);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeBanners();
    };
  }, [navigate]);

  const handleAddProduct = async () => {
    try {
      // Filter out empty additional image URLs
      const filteredAdditionalImages = newProduct.additionalImages?.filter(url => url.trim() !== '');
      
      const productData = {
        ...newProduct,
        additionalImages: filteredAdditionalImages,
        variants: newProduct.variants?.filter(v => v.color && v.stock > 0),
        isExclusive: newProduct.isExclusive || false
      };

      const productsRef = ref(db, 'products');
      await push(productsRef, productData);
      
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        quantity: '',
        category: '',
        variants: [],
        additionalImages: ['', '', ''],
        isExclusive: false
      });

      Swal.fire({
        title: 'Success',
        text: `${newProduct.isExclusive ? 'Exclusive product' : 'Product'} added successfully`,
        icon: 'success',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to add product',
        icon: 'error'
      });
    }
  };

  const handleAddBanner = async () => {
    try {
      if (!newBanner.imageUrl) {
        Swal.fire({
          title: 'Error',
          text: 'Please provide an image URL',
          icon: 'error'
        });
        return;
      }

      // Allow banners with just images (no title/subtitle required)
      const bannerData = {
        title: newBanner.title || '',
        subtitle: newBanner.subtitle || '',
        imageUrl: newBanner.imageUrl,
        linkUrl: newBanner.linkUrl || '',
        isActive: newBanner.isActive
      };

      const bannersRef = ref(db, 'banners');
      await push(bannersRef, bannerData);
      
      setNewBanner({
        title: '',
        subtitle: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true
      });

      Swal.fire({
        title: 'Success',
        text: 'Banner added successfully',
        icon: 'success',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to add banner',
        icon: 'error'
      });
    }
  };

  const handleAddVariant = () => {
    if (!newVariant.color || newVariant.stock <= 0) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill in all variant fields',
        icon: 'error'
      });
      return;
    }

    setNewProduct(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));

    setNewVariant({
      color: '',
      stock: 0,
      imageUrl: ''
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const productRef = ref(db, `products/${editingProduct.id}`);
      await update(productRef, editingProduct);
      
      setEditingProduct(null);

      Swal.fire({
        title: 'Success',
        text: 'Product updated successfully',
        icon: 'success',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to update product',
        icon: 'error'
      });
    }
  };

  const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      const bannerRef = ref(db, `banners/${bannerId}`);
      await update(bannerRef, { isActive: !currentStatus });
      
      Swal.fire({
        title: 'Success',
        text: `Banner ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        icon: 'success',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to update banner status',
        icon: 'error'
      });
    }
  };

  const deleteBanner = async (bannerId: string) => {
    const result = await Swal.fire({
      title: 'Delete Banner',
      text: 'Are you sure you want to delete this banner?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const bannerRef = ref(db, `banners/${bannerId}`);
        await set(bannerRef, null);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Banner has been deleted',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete banner',
          icon: 'error'
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Employee Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'products'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Products</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'banners'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5" />
            <span>Banners</span>
          </div>
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          {/* Add New Product Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Add New Product</h2>
            
            <div className="space-y-6">
              {/* Exclusive Product Toggle */}
              <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <input
                  type="checkbox"
                  id="isExclusive"
                  checked={newProduct.isExclusive}
                  onChange={(e) => setNewProduct({ ...newProduct, isExclusive: e.target.checked })}
                  className="h-5 w-5 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
                />
                <label htmlFor="isExclusive" className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200 font-medium">
                  <Star className="h-5 w-5" />
                  <span>Make this an Exclusive Product (appears first on homepage)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Main Image URL
                  </label>
                  <input
                    type="text"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity Status
                  </label>
                  <select
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select quantity status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Pre-order">Pre-order</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Images (Optional)
                </label>
                <div className="space-y-3">
                  {newProduct.additionalImages?.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          const newImages = [...(newProduct.additionalImages || [])];
                          newImages[index] = e.target.value;
                          setNewProduct({ ...newProduct, additionalImages: newImages });
                        }}
                        placeholder={`Additional Image URL ${index + 1}`}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Variants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Variants
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    value={newVariant.color}
                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                    placeholder="Color"
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) })}
                    placeholder="Stock"
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newVariant.imageUrl}
                    onChange={(e) => setNewVariant({ ...newVariant, imageUrl: e.target.value })}
                    placeholder="Variant Image URL (Optional)"
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleAddVariant}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Variant
                </button>

                {/* Display added variants */}
                {newProduct.variants && newProduct.variants.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Added Variants:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {newProduct.variants.map((variant, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Color: {variant.color}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Stock: {variant.stock}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddProduct}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Plus className="h-5 w-5" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Manage Products</h2>
            <div className="space-y-6">
              {products.map((product) => (
                <div key={product.id} className="border dark:border-gray-700 rounded-lg p-6">
                  {editingProduct?.id === product.id ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <input
                          type="checkbox"
                          checked={editingProduct.isExclusive}
                          onChange={(e) => setEditingProduct({ ...editingProduct, isExclusive: e.target.checked })}
                          className="h-5 w-5 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
                        />
                        <label className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200 font-medium">
                          <Star className="h-5 w-5" />
                          <span>Exclusive Product</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={editingProduct.quantity}
                          onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Pre-order">Pre-order</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map((category, index) => (
                            <option key={index} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                      <div className="flex space-x-4">
                        <button
                          onClick={handleUpdateProduct}
                          className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <Save className="h-5 w-5" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingProduct(null)}
                          className="flex items-center space-x-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <X className="h-5 w-5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-4">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                              {product.name}
                            </h3>
                            {product.isExclusive && (
                              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs">
                                <Star className="h-3 w-3" />
                                <span>Exclusive</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{product.price} TK</p>
                          <p className="text-gray-600 dark:text-gray-300">
                            Category: {product.category}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            Status: {product.quantity}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <Edit2 className="h-5 w-5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'banners' && (
        <>
          {/* Add New Banner Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Add New Banner</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banner Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter banner title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banner Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBanner.subtitle}
                    onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter banner subtitle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banner Image URL *
                  </label>
                  <input
                    type="text"
                    value={newBanner.imageUrl}
                    onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter image URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBanner.linkUrl}
                    onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter link URL"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={newBanner.isActive}
                  onChange={(e) => setNewBanner({ ...newBanner, isActive: e.target.checked })}
                  className="h-5 w-5 text-purple-500 rounded border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="bannerActive" className="text-gray-700 dark:text-gray-300 font-medium">
                  Make banner active immediately
                </label>
              </div>

              <button
                onClick={handleAddBanner}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                <Plus className="h-5 w-5" />
                <span>Add Banner</span>
              </button>
            </div>
          </div>

          {/* Banners List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Manage Banners</h2>
            <div className="space-y-6">
              {banners.map((banner) => (
                <div key={banner.id} className="border dark:border-gray-700 rounded-lg p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    <div className="flex space-x-4 flex-1">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || 'Banner'}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {banner.title || 'Image Banner'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            banner.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {banner.subtitle && (
                          <p className="text-gray-600 dark:text-gray-300 mb-2">{banner.subtitle}</p>
                        )}
                        {banner.linkUrl && (
                          <p className="text-blue-500 dark:text-blue-400 text-sm">
                            Link: {banner.linkUrl}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleBannerStatus(banner.id, banner.isActive)}
                        className={`px-4 py-2 rounded-lg text-white font-medium ${
                          banner.isActive 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {banner.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No banners created yet
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EmployeeDashboard;