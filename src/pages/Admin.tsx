import React, { useState, useEffect } from 'react';
import { ref, push, remove, get } from 'firebase/database';
import { db } from '../firebase';
import { Trash2, Plus, Star } from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: string;
}

interface Review {
  buyerName: string;
  productName: string;
  reviewText: string;
  purchaseDate: string;
  images: string[];
}

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    quantity: ''
  });
  const [review, setReview] = useState<Review>({
    buyerName: '',
    productName: '',
    reviewText: '',
    purchaseDate: '',
    images: []
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  const loadProducts = async () => {
    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);
    if (snapshot.exists()) {
      const productsData = snapshot.val();
      const productsArray = Object.entries(productsData).map(([id, data]) => ({
        id,
        ...(data as Omit<Product, 'id'>)
      }));
      setProducts(productsArray);
    }
  };

  const authenticate = async () => {
    const { value: password } = await Swal.fire({
      title: 'Admin Authentication',
      input: 'password',
      inputLabel: 'Password',
      inputPlaceholder: 'Enter admin password',
      showCancelButton: true,
      background: '#1f2937',
      color: '#fff'
    });

    if (password === 'Niharuka1829') {
      setIsAuthenticated(true);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Incorrect password',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productsRef = ref(db, 'products');
      await push(productsRef, product);
      
      setProduct({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        quantity: ''
      });

      await loadProducts();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Product added successfully',
        background: '#1f2937',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add product',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const reviewsRef = ref(db, 'reviews');
      await push(reviewsRef, review);
      
      setReview({
        buyerName: '',
        productName: '',
        reviewText: '',
        purchaseDate: '',
        images: []
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Review added successfully',
        background: '#1f2937',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add review',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        background: '#1f2937',
        color: '#fff'
      });

      if (result.isConfirmed) {
        const productRef = ref(db, `products/${productId}`);
        await remove(productRef);
        await loadProducts();

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Product has been deleted.',
          background: '#1f2937',
          color: '#fff'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete product',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <button
          onClick={authenticate}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-lg"
        >
          Login as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'products'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          <Plus className="inline-block mr-2" size={20} />
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'reviews'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          <Star className="inline-block mr-2" size={20} />
          Add Reviews
        </button>
      </div>

      {activeTab === 'products' ? (
        <>
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Product Management</h1>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => setProduct({ ...product, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Price</label>
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Description</label>
                  <textarea
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={product.imageUrl}
                    onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quantity</label>
                  <select
                    value={product.quantity}
                    onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select quantity status</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Pre-order">Pre-order</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-lg"
                >
                  Add Product
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Current Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-md">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">{product.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{product.price} TK</p>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Stock: {product.quantity}</p>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                    >
                      <Trash2 className="mr-2" size={16} />
                      Delete Product
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Add Customer Review</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Buyer Name</label>
                  <input
                    type="text"
                    value={review.buyerName}
                    onChange={(e) => setReview({ ...review, buyerName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={review.productName}
                    onChange={(e) => setReview({ ...review, productName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Review Text</label>
                <textarea
                  value={review.reviewText}
                  onChange={(e) => setReview({ ...review, reviewText: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={review.purchaseDate}
                  onChange={(e) => setReview({ ...review, purchaseDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Image URLs (One per line)</label>
                <textarea
                  value={review.images.join('\n')}
                  onChange={(e) => setReview({ ...review, images: e.target.value.split('\n').filter(url => url.trim()) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter image URLs, one per line"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-lg"
              >
                Add Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
