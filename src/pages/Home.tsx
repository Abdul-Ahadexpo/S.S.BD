import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { ShoppingCart, Search, ArrowUpDown, Filter, Share2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

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
  createdAt: number;
}

interface Category {
  id: string;
  name: string;
}

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [selectedVariant, setSelectedVariant] = useState<{ [key: string]: string }>({});
  const [displayImages, setDisplayImages] = useState<{ [key: string]: string }>({});

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
          productsList = productsList.sort(() => Math.random() - 0.5);
        }

        setProducts(productsList);
        filterProducts(productsList, selectedCategory, searchTerm);
        
        const initialDisplayImages = productsList.reduce((acc, product) => ({
          ...acc,
          [product.id]: product.imageUrl
        }), {});
        setDisplayImages(initialDisplayImages);
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
      selectedVariant: variant,
      quantity: 1
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
    
    if (product.quantity === 'Pre-order') {
      Swal.fire({
        title: 'Pre-order Payment Required',
        html: `
          <p>To confirm your pre-order, please send 60% advance payment to:</p>
          <p class="text-xl font-bold mt-4">bKash: 01722786111</p>
          <p class="mt-2 text-sm">Include your order number as reference when sending payment.</p>
        `,
        icon: 'info',
        confirmButtonText: 'Got it!'
      });
    } else {
      Swal.fire({
        title: 'Success!',
        text: 'Product added to cart',
        icon: 'success',
        timer: 1500
      });
    }
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

  const handleVariantChange = (productId: string, color: string) => {
    setSelectedVariant({
      ...selectedVariant,
      [productId]: color
    });

    const product = products.find(p => p.id === productId);
    if (product?.variants) {
      const variant = product.variants.find(v => v.color === color);
      if (variant?.imageUrl) {
        setDisplayImages({
          ...displayImages,
          [productId]: variant.imageUrl
        });
      } else {
        setDisplayImages({
          ...displayImages,
          [productId]: product.imageUrl
        });
      }
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Spin Strike</h1>
        
        {/* Search and Filters - Mobile Optimized */}
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
          </div>
          
          <div className="flex space-x-2">
            <div className="flex-1">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleSort}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ArrowUpDown size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayProducts.map((product) => (
          <div 
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl"
          >
            <div className="relative pb-[100%]">
              <img 
                src={displayImages[product.id] || product.imageUrl}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareProduct(product);
                }}
                className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md"
              >
                <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Stock Badge */}
              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
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
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                {product.name}
              </h3>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {product.price} TK
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {product.category}
                </span>
              </div>

              {product.variants && product.variants.length > 0 && (
                <select
                  value={selectedVariant[product.id] || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleVariantChange(product.id, e.target.value);
                  }}
                  className="w-full mb-3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="">Select Color</option>
                  {product.variants.map((variant, index) => (
                    <option key={index} value={variant.color} disabled={variant.stock === 0}>
                      {variant.color} {variant.stock === 0 ? '(Out of Stock)' : ''}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                disabled={product.quantity === 'Out of Stock'}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center space-x-2"
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
