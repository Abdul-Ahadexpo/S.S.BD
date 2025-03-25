import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../firebase';
import Swal from 'sweetalert2';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    quantity: ''
  });

  const authenticate = async () => {
    const { value: password } = await Swal.fire({
      title: 'Admin Authentication',
      input: 'password',
      inputLabel: 'Password',
      inputPlaceholder: 'Enter admin password',
      showCancelButton: true
    });

    if (password === 'Niharuka1829') {
      setIsAuthenticated(true);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Incorrect password'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Product added successfully'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add product'
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <button
          onClick={authenticate}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Login as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              value={product.imageUrl}
              onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <select
              value={product.quantity}
              onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin;