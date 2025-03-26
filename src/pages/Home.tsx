import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { ShoppingCart, Search, ArrowUpDown } from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: string | number;
}

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList = Object.entries(data).map(([id, product]) => ({
          id,
          ...(product as Omit<Product, 'id'>)
        }));
        setProducts(productsList);
        setDisplayProducts(productsList);
      }
    });

    return () => unsubscribe();
  }, []);

  const addToCart = (product: Product) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const isProductInCart = existingCart.some((item: Product) => item.id === product.id);

    if (isProductInCart) {
      Swal.fire({
        title: 'Already in Cart',
        text: 'This item is already in your cart. Please remove it first to add it again.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const newCart = [...existingCart, { ...product, quantity: 1 }];
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    Swal.fire({
      title: 'Success!',
      text: 'Product added to cart',
      icon: 'success',
      timer: 1500
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    let filtered = products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );

    if (sortOrder !== 'none') {
      filtered = sortProducts(filtered, sortOrder);
    }

    setDisplayProducts(filtered);
  };

  const sortProducts = (productsToSort: Product[], order: 'asc' | 'desc') => {
    return [...productsToSort].sort((a, b) => {
      if (order === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'none' ? 'asc' : sortOrder === 'asc' ? 'desc' : 'none';
    setSortOrder(newOrder);

    if (newOrder === 'none') {
      setDisplayProducts(products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setDisplayProducts(sortProducts(displayProducts, newOrder));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Spin Strike</h1>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-300" size={20} />
          </div>
          <button
            onClick={handleSort}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowUpDown size={20} />
            <span className="hidden sm:inline">
              {sortOrder === 'none' ? 'Sort' : sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        {displayProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105">
            <div className="relative pb-[100%]">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="absolute inset-0 w-full h-full object-contain p-2"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white line-clamp-2">{product.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm line-clamp-2">{product.description}</p>
              <p className="text-lg font-bold mb-2 text-gray-800 dark:text-white">{product.price} TK</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Status: {
                  typeof product.quantity === 'number' 
                    ? `${product.quantity} in stock` 
                    : product.quantity
                }
              </p>
              <button
                onClick={() => addToCart(product)}
                disabled={product.quantity === 'Out of Stock'}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center space-x-2 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
