import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { ShoppingCart, Search, ArrowUpDown, Filter, Share2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface ProductVariant {
  color: string;
  stock: number;
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
  createdAt: number;
}

interface Category {
  id: string;
  name: string;
}

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [selectedVariant, setSelectedVariant] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const productsRef = ref(db, 'products');
    const categoriesRef = ref(db, 'categories');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let productsList = Object.entries(data).map(([id, product]) => ({
          id,
          ...(product as Omit<Product, 'id'>)
        }));

        if (productId) {
          productsList = productsList.filter(product => product.id === productId);
        } else {
          // Shuffle products for random order
          productsList = productsList.sort(() => Math.random() - 0.5);
        }

        setProducts(productsList);
        filterProducts(productsList, selectedCategory, searchTerm);
      }
    });

    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesList = Object.entries(data).map(([id, category]) => ({
          id,
          ...(category as Omit<Category, 'id'>)
        }));
        setCategories(categoriesList);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  const filterProducts = (productsList: Product[], category: string, search: string) => {
    let filtered = productsList;

    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }

    if (search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortOrder !== 'none') {
      filtered = sortProducts(filtered, sortOrder);
    }

    setDisplayProducts(filtered);
  };

  const addToCart = (product: Product) => {
    const variant = selectedVariant[product.id];
    if (product.variants && product.variants.length > 0 && !variant) {
      Swal.fire({
        title: 'Select Variant',
        text: 'Please select a color variant before adding to cart',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = {
      ...product,
      selectedVariant: variant
    };

    const isProductInCart = existingCart.some((item: any) => 
      item.id === product.id && item.selectedVariant === variant
    );

    if (isProductInCart) {
      Swal.fire({
        title: 'Already in Cart',
        text: 'This item is already in your cart. Please remove it first to add it again.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const newCart = [...existingCart, cartItem];
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    Swal.fire({
      title: 'Success!',
      text: 'Product added to cart',
      icon: 'success',
      timer: 1500
    });
  };

  const shareProduct = (product: Product) => {
    const url = `${window.location.origin}/?id=${product.id}`;
    navigator.clipboard.writeText(url);
    Swal.fire({
      title: 'Link Copied!',
      text: 'Product link has been copied to clipboard',
      icon: 'success',
      timer: 1500
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterProducts(products, selectedCategory, term);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    filterProducts(products, category, searchTerm);
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
    filterProducts(products, selectedCategory, searchTerm);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Spin Strike</h1>
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-300" size={20} />
          </div>
          <div className="flex space-x-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-300" size={20} />
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
              <button
                onClick={() => shareProduct(product)}
                className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-200" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">{product.name}</h2>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {product.category}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm line-clamp-2">{product.description}</p>
              <p className="text-lg font-bold mb-2 text-gray-800 dark:text-white">{product.price} TK</p>
              
              {product.variants && product.variants.length > 0 ? (
                <div className="mb-4">
                  <select
                    value={selectedVariant[product.id] || ''}
                    onChange={(e) => setSelectedVariant({
                      ...selectedVariant,
                      [product.id]: e.target.value
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white mb-2"
                  >
                    <option value="">Select Color</option>
                    {product.variants.map((variant, index) => (
                      <option key={index} value={variant.color} disabled={variant.stock === 0}>
                        {variant.color} {variant.stock === 0 ? '(Out of Stock)' : `(${variant.stock} available)`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Status: {
                    typeof product.quantity === 'number' 
                      ? `${product.quantity} in stock` 
                      : product.quantity
                  }
                </p>
              )}

              <button
                onClick={() => addToCart(product)}
                disabled={product.quantity === 'Out of Stock' || (product.variants && product.variants.length > 0 && !selectedVariant[product.id])}
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
