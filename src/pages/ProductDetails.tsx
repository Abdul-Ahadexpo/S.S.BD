import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { ShoppingCart, ArrowLeft, Clock, Shield, Truck, HeadphonesIcon, Share2, Star, User, Calendar, Heart, Eye, TrendingUp, Package, MapPin, Bell, Gift, Zap, Users, MessageCircle } from 'lucide-react';
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
  additionalImages: string[];
  quantity: string | number;
  category: string;
  variants?: ProductVariant[];
  views?: number;
  wishlistCount?: number;
}

interface Review {
  id: string;
  buyerName: string;
  productName: string;
  reviewText: string;
  purchaseDate: string;
  images: string[];
  linkedProductId?: string;
}
function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [priceHistory, setPriceHistory] = useState<{date: string, price: number}[]>([]);
  const [deliveryDate, setDeliveryDate] = useState<{min: string, max: string}>({min: '', max: ''});
  const [isNotifyEnabled, setIsNotifyEnabled] = useState(false);
  const [recentViewers, setRecentViewers] = useState(0);

  useEffect(() => {
    // Track product view
    const trackView = async () => {
      if (id) {
        const productRef = ref(db, `products/${id}`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
          const currentViews = snapshot.val().views || 0;
          await update(productRef, { views: currentViews + 1 });
        }
      }
    };
    
    trackView();
    
    // Check if product is in wishlist
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsInWishlist(wishlist.includes(id));
    
    // Generate random recent viewers (simulated)
    setRecentViewers(Math.floor(Math.random() * 15) + 3);
    
    const fetchProduct = async () => {
      const productRef = ref(db, `products/${id}`);
      const snapshot = await get(productRef);
      
      if (snapshot.exists()) {
        const productData = {
          id: snapshot.key,
          ...snapshot.val()
        };
        setProduct(productData);
        setSelectedImage(productData.imageUrl);
        setQuantity(1); // Reset quantity when product changes
        
        // Calculate delivery dates
        const today = new Date();
        let minDays, maxDays;
        
        if (productData.quantity === 'Pre-order') {
          minDays = 25;
          maxDays = 35;
        } else {
          minDays = 2;
          maxDays = 3;
        }
        
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + minDays);
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + maxDays);
        
        setDeliveryDate({
          min: minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          max: maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
        
        // Simulate price history (in real app, this would come from database)
        const mockPriceHistory = [
          { date: '30 days ago', price: productData.price + 200 },
          { date: '15 days ago', price: productData.price + 100 },
          { date: 'Today', price: productData.price }
        ];
        setPriceHistory(mockPriceHistory);
        
        // Fetch recommendations
        const productsRef = ref(db, 'products');
        const allProductsSnapshot = await get(productsRef);
        if (allProductsSnapshot.exists()) {
          const allProducts = Object.entries(allProductsSnapshot.val())
            .map(([key, value]) => ({ id: key, ...value as Omit<Product, 'id'> }))
            .filter(p => p.id !== id && p.category === productData.category)
            .slice(0, 4);
          setRecommendations(allProducts);
        }
        
        // Fetch reviews linked to this product
        const reviewsRef = ref(db, 'reviews');
        const reviewsSnapshot = await get(reviewsRef);
        if (reviewsSnapshot.exists()) {
          const allReviews = Object.entries(reviewsSnapshot.val())
            .map(([key, value]) => ({ id: key, ...value as Omit<Review, 'id'> }))
            .filter(review => review.linkedProductId === id)
            .sort((a, b) => {
              // Sort by timestamp if available, otherwise by purchase date
              if (a.timestamp && b.timestamp) {
                return b.timestamp - a.timestamp;
              }
              const dateA = new Date(a.purchaseDate).getTime();
              const dateB = new Date(b.purchaseDate).getTime();
              return dateB - dateA;
            });
          setProductReviews(allReviews);
        }
      }
    };

    fetchProduct();
    // Scroll to top when ID changes
    window.scrollTo(0, 0);
  }, [id]);

  const handleVariantChange = (color: string) => {
    setSelectedVariant(color);
    if (product) {
      const variant = product.variants?.find(v => v.color === color);
      if (variant?.imageUrl) {
        setSelectedImage(variant.imageUrl);
      } else {
        setSelectedImage(product.imageUrl);
      }
      // Reset quantity when variant changes
      setQuantity(1);
    }
  };

  const shareProduct = () => {
    const url = `${window.location.origin}/?id=${id}`;
    navigator.clipboard.writeText(url);
    Swal.fire({
      title: 'Link Copied!',
      text: 'Product link has been copied to clipboard',
      icon: 'success',
      timer: 1500
    });
  };

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let newWishlist;
    
    if (isInWishlist) {
      newWishlist = wishlist.filter((item: string) => item !== id);
      Swal.fire({
        title: 'Removed from Wishlist',
        text: 'Product removed from your wishlist',
        icon: 'info',
        timer: 1500
      });
    } else {
      newWishlist = [...wishlist, id];
      Swal.fire({
        title: 'Added to Wishlist',
        text: 'Product added to your wishlist',
        icon: 'success',
        timer: 1500
      });
    }
    
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setIsInWishlist(!isInWishlist);
  };

  const toggleNotification = () => {
    const notifications = JSON.parse(localStorage.getItem('stockNotifications') || '[]');
    let newNotifications;
    
    if (isNotifyEnabled) {
      newNotifications = notifications.filter((item: string) => item !== id);
      setIsNotifyEnabled(false);
      Swal.fire({
        title: 'Notifications Disabled',
        text: 'You will no longer receive stock notifications for this product',
        icon: 'info',
        timer: 2000
      });
    } else {
      newNotifications = [...notifications, id];
      setIsNotifyEnabled(true);
      Swal.fire({
        title: 'Notifications Enabled',
        text: 'We will notify you when this product is back in stock',
        icon: 'success',
        timer: 2000
      });
    }
    
    localStorage.setItem('stockNotifications', JSON.stringify(newNotifications));
  };

  const showPriceHistory = () => {
    const historyHtml = priceHistory.map(item => 
      `<div class="flex justify-between py-2 border-b">
        <span>${item.date}</span>
        <span class="font-bold">${item.price} TK</span>
      </div>`
    ).join('');
    
    Swal.fire({
      title: 'Price History',
      html: `<div class="text-left">${historyHtml}</div>`,
      confirmButtonText: 'Close',
      width: 400
    });
  };

  const showSizeGuideModal = () => {
    Swal.fire({
      title: 'Size Guide',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-bold mb-2">Measurement Guide</h3>
            <ul class="space-y-1 text-sm">
              <li>• Measure yourself wearing light clothing</li>
              <li>• Use a soft measuring tape</li>
              <li>• Keep the tape snug but not tight</li>
            </ul>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2">Size</th>
                <th class="p-2">Chest (inches)</th>
                <th class="p-2">Length (inches)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="p-2">S</td><td class="p-2">36-38</td><td class="p-2">26-27</td></tr>
              <tr><td class="p-2">M</td><td class="p-2">38-40</td><td class="p-2">27-28</td></tr>
              <tr><td class="p-2">L</td><td class="p-2">40-42</td><td class="p-2">28-29</td></tr>
              <tr><td class="p-2">XL</td><td class="p-2">42-44</td><td class="p-2">29-30</td></tr>
            </tbody>
          </table>
        </div>
      `,
      confirmButtonText: 'Got it!',
      width: 500
    });
  };

  const requestCustomization = () => {
    Swal.fire({
      title: 'Request Customization',
      html: `
        <div class="text-left space-y-4">
          <textarea id="customization-request" class="w-full p-3 border rounded-lg" rows="4" placeholder="Describe your customization requirements..."></textarea>
          <input id="contact-info" class="w-full p-3 border rounded-lg" placeholder="Your contact information (phone/email)">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Send Request',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const request = (document.getElementById('customization-request') as HTMLTextAreaElement).value;
        const contact = (document.getElementById('contact-info') as HTMLInputElement).value;
        
        if (!request || !contact) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }
        
        return { request, contact };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Request Sent!',
          text: 'We will contact you within 24 hours regarding your customization request',
          icon: 'success',
          timer: 3000
        });
      }
    });
  };
  const getMaxQuantity = () => {
    if (!product) return 0;
    
    // If product has variants, check the selected variant's stock
    if (product.variants && product.variants.length > 0) {
      if (selectedVariant) {
        const variant = product.variants.find(v => v.color === selectedVariant);
        return variant?.stock || 0;
      }
      return 0; // No variant selected
    }
    
    // For products without variants, check the quantity field
    if (typeof product.quantity === 'number') {
      return product.quantity;
    }
    
    // For string quantities like "In Stock", "Pre-order", "Out of Stock"
    if (product.quantity === 'Out of Stock') {
      return 0;
    }
    
    // For "In Stock" or "Pre-order", assume available (return a reasonable number)
    return 999;
  };

  const getStockStatus = () => {
    if (!product) return { status: 'Out of Stock', color: 'red' };
    
    const maxQty = getMaxQuantity();
    
    if (maxQty === 0) {
      return { status: 'Out of Stock', color: 'red' };
    }
    
    if (product.quantity === 'Pre-order') {
      return { status: 'Pre-order Available', color: 'yellow' };
    }
    
    if (maxQty <= 3 && maxQty > 0) {
      return { status: `Only ${maxQty} left`, color: 'yellow' };
    }
    
    return { status: 'In Stock', color: 'green' };
  };

  const addToCart = () => {
    if (product) {
      if (product.variants && product.variants.length > 0 && !selectedVariant) {
        Swal.fire({
          title: 'Select Variant',
          text: 'Please select a color variant before adding to cart',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      const maxQty = getMaxQuantity();
      if (maxQty === 0) {
        Swal.fire({
          title: 'Out of Stock',
          text: 'This item is currently out of stock',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      if (quantity > maxQty && maxQty !== 999) {
        Swal.fire({
          title: 'Invalid Quantity',
          text: `Maximum available quantity is ${maxQty}`,
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const cartItem = {
        ...product,
        selectedVariant,
        quantity,
        selected: true
      };

      const isProductInCart = existingCart.some((item: any) => 
        item.id === product.id && item.selectedVariant === selectedVariant
      );

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
      
      if (product.quantity === 'Pre-order') {
        Swal.fire({
          title: 'Pre-order Payment Required',
          html: `
            <p>To confirm your pre-order, please send 25% advance payment to:</p>
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
    }
  };

  const handleBuyNow = () => {
    addToCart();
    navigate('/checkout');
  };

  const calculatePreOrderAdvance = () => {
    if (product && product.quantity === 'Pre-order') {
      const productTotal = product.price * quantity;
      const deliveryFee = productTotal >= 2000 ? 0 : 120;
      const totalAmount = productTotal + deliveryFee;
      const advanceAmount = Math.ceil(totalAmount * 0.25); // 25% advance, rounded up
      return {
        productTotal,
        deliveryFee,
        totalAmount,
        advanceAmount,
        isFreeDelivery: deliveryFee === 0
      };
    }
    return null;
  };

  const handleRecommendationClick = (productId: string) => {
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const maxQty = getMaxQuantity();
  const stockStatus = getStockStatus();
  const isOutOfStock = maxQty === 0;
  const preOrderInfo = calculatePreOrderAdvance();

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 mb-6"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-white relative">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            <button
              onClick={shareProduct}
              className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white/100 dark:hover:bg-gray-700/100 transition-all"
            >
              <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setSelectedImage(product.imageUrl)}
              className={`aspect-square rounded-lg overflow-hidden ${
                selectedImage === product.imageUrl ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </button>
            {product.additionalImages?.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className={`aspect-square rounded-lg overflow-hidden ${
                  selectedImage === image ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{product.price} TK</p>
          
          {/* Delivery Estimation */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Estimated Delivery
            </h3>
            <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
              {product.quantity === 'Pre-order' ? (
                <>
                  <p className="font-medium">25-35 working days</p>
                  <p>Expected delivery: {deliveryDate.min} - {deliveryDate.max}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ⏰ Pre-order items require longer processing time
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">2-3 working days</p>
                  <p>Expected delivery: {deliveryDate.min} - {deliveryDate.max}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    🚀 Fast delivery for in-stock items
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              stockStatus.color === 'red' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : stockStatus.color === 'yellow'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {stockStatus.status}
            </div>
          </div>

          {/* Pre-order Payment Notice */}
          {preOrderInfo && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Pre-order Payment Required
              </h3>
              <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                <div className="flex justify-between">
                  <span>Product Total ({quantity} × {product.price} TK):</span>
                  <span className="font-medium">{preOrderInfo.productTotal} TK</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className={`font-medium ${preOrderInfo.isFreeDelivery ? 'text-green-600' : ''}`}>
                    {preOrderInfo.isFreeDelivery ? 'FREE' : `${preOrderInfo.deliveryFee} TK`}
                  </span>
                </div>
                {preOrderInfo.isFreeDelivery && (
                  <div className="text-green-600 text-xs">
                    🎉 Free delivery on orders over 2000 TK!
                  </div>
                )}
                <div className="flex justify-between border-t border-yellow-300 dark:border-yellow-700 pt-2">
                  <span>Total Amount:</span>
                  <span className="font-medium">{preOrderInfo.totalAmount} TK</span>
                </div>
                <div className="flex justify-between bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded">
                  <span className="font-semibold">25% Advance Payment:</span>
                  <span className="font-bold text-lg">{preOrderInfo.advanceAmount} TK</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-800/30 rounded border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Payment Instructions:</strong><br />
                  Send <strong>{preOrderInfo.advanceAmount} TK</strong> to bKash: <strong>01722786111</strong><br />
                  Include your order number as reference when sending payment.
                </p>
              </div>
            </div>
          )}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
          </div>

          {product.variants && product.variants.length > 0 ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Select Color
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => handleVariantChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Choose a color</option>
                {product.variants.map((variant, index) => (
                  <option key={index} value={variant.color} disabled={variant.stock === 0}>
                    {variant.color} {variant.stock === 0 ? '(Out of Stock)' : `(${variant.stock} available)`}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Quantity Selector */}
          {!isOutOfStock && maxQty !== 999 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {[...Array(Math.min(maxQty, 10))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Additional Features */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={showSizeGuideModal}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Package className="h-4 w-4 text-white" />
              
          <span className="text-sm font-bold text-white">Size Guide</span>

            </button>
            <button
              onClick={requestCustomization}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Customize</span>
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={addToCart}
              disabled={isOutOfStock}
              className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center space-x-2"
            >
              <ShoppingCart size={20} />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              Buy Now
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={shareProduct}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share Product</span>
            </button>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>Ask Question</span>
              </div>
              <div className="flex items-center space-x-1">
                <Gift className="h-4 w-4" />
                <span>Gift Wrap Available</span>
              </div>
            </div>
          </div>
          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex flex-col items-center text-center">
              <Shield className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">100% Secure Payment</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <HeadphonesIcon className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Support</span>
            </div>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => handleRecommendationClick(rec.id)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square">
                  <img
                    src={rec.imageUrl}
                    alt={rec.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{rec.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold">{rec.price} TK</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Reviews Section */}
      {productReviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <Star className="h-6 w-6 mr-2 text-yellow-400" />
            Customer Reviews ({productReviews.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <User className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white">{review.buyerName}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">{review.purchaseDate}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-gray-600 dark:text-gray-300 italic">{review.reviewText}</p>
                </div>
                
                {review.images && review.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {review.images.slice(0, 3).map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            // Show image in popup
                            Swal.fire({
                              imageUrl: image,
                              imageAlt: `Review image ${index + 1}`,
                              showConfirmButton: false,
                              showCloseButton: true,
                              customClass: {
                                image: 'max-h-96 object-contain'
                              }
                            });
                          }}
                        />
                      </div>
                    ))}
                    {review.images.length > 3 && (
                      <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          +{review.images.length - 3} more
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;