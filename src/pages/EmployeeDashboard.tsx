import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, update, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Plus, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
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
}

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    quantity: '',
    category: '',
    variants: [],
    additionalImages: ['', '', ''] // Three slots for additional images
  });
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    color: '',
    stock: 0,
    imageUrl: ''
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

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, [navigate]);

  const handleAddProduct = async () => {
    try {
      // Filter out empty additional image URLs
      const filteredAdditionalImages = newProduct.additionalImages?.filter(url => url.trim() !== '');
      
      const productData = {
        ...newProduct,
        additionalImages: filteredAdditionalImages,
        variants: newProduct.variants?.filter(v => v.color && v.stock > 0)
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
        additionalImages: ['', '', '']
      });

      Swal.fire({
        title: 'Success',
        text: 'Product added successfully',
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Employee Dashboard</h1>

      {/* Add New Product Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Add New Product</h2>
        
        <div className="space-y-6">
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
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {product.name}
                      </h3>
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
    </div>
  );
}

export default EmployeeDashboard;
