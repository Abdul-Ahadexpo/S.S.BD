import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../firebase';
import { Trash2, ExternalLink, Tag, Gift } from 'lucide-react';
import Swal from 'sweetalert2';

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

    const cartAdsRef = ref(db, 'cartAds');
    const unsubscribe = onValue(cartAdsRef, (snapshot) => {
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

    return () => unsubscribe();
  }, []);

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
    const total = subtotal + DELIVERY_CHARGE + giftWrapFee - discount;
    return {
      subtotal,
      discount,
      giftWrapFee,
      total: total < 0 ? 0 : total
    };
  };

  const { subtotal, discount, giftWrapFee, total } = calculateTotal();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

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
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            {cart.map((item) => (
              <div key={`${item.id}-${item.selectedVariant}`} className="flex items-center border-b py-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItemSelection(item.id, item.selectedVariant)}
                    className="h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded"
                  />
                </div>
                <div className="flex-1 ml-4">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.selectedVariant && (
                    <p className="text-gray-600">Color: {item.selectedVariant}</p>
                  )}
                  <p className="text-gray-600">Quantity: {item.quantity || 1}</p>
                  <p className="text-gray-800">{item.price}TK</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id, item.selectedVariant)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            ))}

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

              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>{subtotal}TK</span>
              </div>
              <div className="flex justify-between text-lg font-semibold mt-2">
                <span>Delivery Charge:</span>
                <span>{DELIVERY_CHARGE}TK</span>
              </div>
              {giftWrapFee > 0 && (
                <div className="flex justify-between text-lg font-semibold mt-2 text-pink-600">
                  <span>Gift Wrapping:</span>
                  <span>{giftWrapFee}TK</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-lg font-semibold mt-2 text-green-600">
                  <span>Discount:</span>
                  <span>-{discount}TK</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold mt-4">
                <span>Total:</span>
                <span>{total}TK</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={handleCheckout}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
