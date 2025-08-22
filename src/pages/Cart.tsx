import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, onValue, get, query, limitToFirst } from 'firebase/database';
import { db } from '../firebase';
import { Trash2, ExternalLink, Tag, Gift, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  selectedVariant?: string;
  selected: boolean;
}

interface CartAd {
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

interface Coupon {
  code: string;
  discount: number;
  isActive: boolean;
}

function Cart() {
  const [cart, setCart] = useState<Product[]>([]);
  const [cartAd, setCartAd] = useState<CartAd | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const navigate = useNavigate();
  const DELIVERY_CHARGE = 120;
  const GIFT_WRAP_CHARGE = 20;

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      // Ensure all cart items have a selected property
      const cartWithSelection = parsedCart.map((item: Product) => ({
        ...item,
        selected: item.selected ?? true
      }));
      setCart(cartWithSelection);
      localStorage.setItem('cart', JSON.stringify(cartWithSelection));
    }

    const giftWrap = localStorage.getItem('giftWrap');
    if (giftWrap) {
      setIsGiftWrapped(JSON.parse(giftWrap));
    }

    // Fetch product recommendations
    const productsRef = ref(db, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const productsList = Object.entries(productsData).map(([id, product]) => ({
          id,
          ...(product as Omit<Product, 'id'>)
        }));
        
        // Get random products for recommendations
        const shuffled = productsList.sort(() => Math.random() - 0.5);
        setRecommendations(shuffled.slice(0, 8));
      }
    });

    const cartAdsRef = ref(db, 'cartAds');
    const unsubscribeAds = onValue(cartAdsRef, (snapshot) => {
      if (snapshot.exists()) {
        const adsData = snapshot.val();
        const activeAds = Object.values(adsData as Record<string, CartAd>)
          .filter(ad => ad.isActive);
        if (activeAds.length > 0) {
          const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)];
          setCartAd(randomAd);
        }
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeAds();
    };
  }, []);

  const updateQuantity = (productId: string, variant: string | undefined, change: number) => {
    const newCart = cart.map(item => {
      if (item.id === productId && item.selectedVariant === variant) {
        const newQuantity = Math.max(1, (item.quantity || 1) + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const toggleItemSelection = (productId: string, variant?: string) => {
    const newCart = cart.map(item => {
      if (item.id === productId && item.selectedVariant === variant) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId: string, variant?: string) => {
    const newCart = cart.filter(item => !(item.id === productId && item.selectedVariant === variant));
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const applyCoupon = async () => {
    if (!couponCode) {
      Swal.fire({
        icon: 'warning',
        title: 'Enter Coupon Code',
        text: 'Please enter a coupon code to apply',
        background: '#1f2937',
        color: '#fff'
      });
      return;
    }

    const couponsRef = ref(db, 'coupons');
    const snapshot = await get(couponsRef);
    
    if (snapshot.exists()) {
      const couponsData = snapshot.val();
      const coupon = Object.values(couponsData as Record<string, Coupon>)
        .find(c => c.code === couponCode.toUpperCase() && c.isActive);

      if (coupon) {
        setAppliedCoupon(coupon);
        Swal.fire({
          icon: 'success',
          title: 'Coupon Applied!',
          text: `Discount of ${coupon.discount} TK has been applied`,
          background: '#1f2937',
          color: '#fff'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Coupon',
          text: 'The coupon code is invalid or inactive',
          background: '#1f2937',
          color: '#fff'
        });
      }
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleGiftWrapToggle = () => {
    const newValue = !isGiftWrapped;
    setIsGiftWrapped(newValue);
    localStorage.setItem('giftWrap', JSON.stringify(newValue));
  };

  const calculateTotal = () => {
    const selectedItems = cart.filter(item => item.selected);
    const subtotal = selectedItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const giftWrapFee = isGiftWrapped ? GIFT_WRAP_CHARGE : 0;
    const deliveryCharge = subtotal >= 2000 ? 0 : DELIVERY_CHARGE;
    const total = subtotal + deliveryCharge + giftWrapFee - discount;
    return {
      subtotal,
      discount,
      giftWrapFee,
      deliveryCharge,
      total: total < 0 ? 0 : total
    };
  };

  const { subtotal, discount, giftWrapFee, deliveryCharge, total } = calculateTotal();

  const handleCheckout = () => {
    const selectedItems = cart.filter(item => item.selected);
    if (selectedItems.length === 0) {
      Swal.fire({
        title: 'No Items Selected',
        text: 'Please select at least one item to checkout',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // Update cart to only include selected items
    localStorage.setItem('cart', JSON.stringify(selectedItems));
    navigate('/checkout');
  };

  const addRecommendationToCart = (product: Product) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = {
      ...product,
      quantity: 1,
      selected: true
    };

    const isProductInCart = existingCart.some((item: any) => item.id === product.id);

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
    setCart(newCart);
    
    Swal.fire({
      title: 'Success!',
      text: 'Product added to cart',
      icon: 'success',
      timer: 1500
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: "#D1D5DB" }}>
        Shopping Cart
      </h1>

      {cartAd && (
        <div className="mt-12 flex justify-center">
          <div className="w-[240px] sm:w-[280px] md:w-[320px] border rounded-lg shadow-lg bg-white p-4 text-center relative overflow-hidden">
            <button 
              onClick={() => setCartAd(null)} 
              className="absolute top-2 right-2 text-lg text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ❌
            </button>

            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Advertisement</p>
            <div className="border-t border-b border-gray-200 mb-2"></div>

            <a
              href={cartAd.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group relative"
            >
              <img 
                src={cartAd.imageUrl} 
                alt="Advertisement"
                className="w-full h-auto max-h-60 object-cover rounded-md transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 flex items-center justify-center">
                <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={20} />
              </div>
            </a>

            <p className="text-sm text-gray-600 mt-2">
              Discover amazing things!
            </p>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">Your cart is empty</p>
          
          {/* Recommendations for empty cart */}
          {recommendations.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Discover Our Products</h2>
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4 w-max">
                  {recommendations.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden w-64 flex-shrink-0 cursor-pointer hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
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
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{product.price} TK</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{product.category}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addRecommendationToCart(product);
                          }}
                          disabled={product.quantity === 'Out of Stock'}
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={`${item.id}-${item.selectedVariant}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center border-b py-4"
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItemSelection(item.id, item.selectedVariant)}
                      className="h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <Link to={`/product/${item.id}`} className="block">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-20 h-20 object-cover rounded hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    </Link>
                  </div>
                  <div className="flex-1 ml-4">
                    <Link 
                      to={`/product/${item.id}`} 
                      className="text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {item.name}
                    </Link>
                    {item.selectedVariant && (
                      <p className="text-gray-600">Color: {item.selectedVariant}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.selectedVariant, -1)}
                          className="p-1 rounded-full bg-gray-100 dark:bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Minus className="h-4 w-4" />
                        </motion.button>
                        <span className="w-8 text-center">{item.quantity || 1}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.selectedVariant, 1)}
                          className="p-1 rounded-full bg-gray-100 dark:bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Plus className="h-4 w-4" />
                        </motion.button>
                      </div>
                      <p className="text-gray-800">{item.price * (item.quantity || 1)} TK</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedVariant)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="mt-6 border-t pt-4">
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    disabled={appliedCoupon !== null}
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={removeCoupon}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="mt-2 flex items-center text-green-600">
                    <Tag className="h-4 w-4 mr-1" />
                    <span className="text-sm">Coupon applied: {appliedCoupon.discount} TK off</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGiftWrapped}
                    onChange={handleGiftWrapToggle}
                    className="form-checkbox h-5 w-5 text-blue-500"
                  />
                  <span className="flex items-center space-x-2">
                    <Gift className="h-5 w-5 text-pink-500" />
                    <span>Add Gift Wrapping (+20 TK)</span>
                  </span>
                </label>
              </div>

              <motion.div layout className="space-y-2">
                <motion.div 
                  className="flex justify-between text-lg font-semibold"
                  layout
                >
                  <span>Subtotal:</span>
                  <motion.span
                    key={subtotal}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {subtotal}TK
                  </motion.span>
                </motion.div>
                <motion.div 
                  className="flex justify-between text-lg font-semibold"
                  layout
                >
                  <span>Delivery Charge:</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `${deliveryCharge}TK`}
                  </span>
                </motion.div>
                {subtotal >= 2000 && deliveryCharge === 0 && (
                  <motion.div 
                    className="flex justify-between text-sm text-green-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                  >
                    <span>🎉 Free delivery on orders over 2000 TK!</span>
                    <span></span>
                  </motion.div>
                )}
                {giftWrapFee > 0 && (
                  <motion.div 
                    className="flex justify-between text-lg font-semibold text-pink-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                  >
                    <span>Gift Wrapping:</span>
                    <span>{giftWrapFee}TK</span>
                  </motion.div>
                )}
                {discount > 0 && (
                  <motion.div 
                    className="flex justify-between text-lg font-semibold text-green-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                  >
                    <span>Discount:</span>
                    <span>-{discount}TK</span>
                  </motion.div>
                )}
                <motion.div 
                  className="flex justify-between text-xl font-bold mt-4 pt-2 border-t"
                  layout
                >
                  <span>Total:</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {total}TK
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>
          </div>



   <div className="text-center">
            <motion.button
              onClick={handleCheckout}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Proceed to Checkout
            </motion.button>
          </div>




          


          
          {/* Recommendations for non-empty cart */}
          {recommendations.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">You might also like</h2>
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4 w-max">
                  {recommendations.slice(0, 6).map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden w-56 flex-shrink-0 cursor-pointer hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
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
                      <div className="p-3">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{product.price} TK</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addRecommendationToCart(product);
                          }}
                          disabled={product.quantity === 'Out of Stock'}
                          className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}


          
          
       
        </>
      )}
    </div>
  );
}

export default Cart;
