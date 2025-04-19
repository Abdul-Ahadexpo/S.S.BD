import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Trash2, ExternalLink } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  selectedVariant?: string;
}

interface CartAd {
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

function Cart() {
  const [cart, setCart] = useState<Product[]>([]);
  const [cartAd, setCartAd] = useState<CartAd | null>(null);
  const navigate = useNavigate();
  const DELIVERY_CHARGE = 120;

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load active cart ad
    const cartAdsRef = ref(db, 'cartAds');
    const unsubscribe = onValue(cartAdsRef, (snapshot) => {
      if (snapshot.exists()) {
        const adsData = snapshot.val();
        const activeAds = Object.values(adsData as Record<string, CartAd>)
          .filter(ad => ad.isActive);
        if (activeAds.length > 0) {
          // Randomly select one active ad
          const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)];
          setCartAd(randomAd);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const removeFromCart = (productId: string, variant?: string) => {
    const newCart = cart.filter(item => !(item.id === productId && item.selectedVariant === variant));
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    return {
      subtotal,
      total: subtotal + DELIVERY_CHARGE
    };
  };

  const { subtotal, total } = calculateTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      
      
    {cartAd && (
  <div className="mt-12 flex justify-center">
    <div className="w-60 border rounded-md shadow-sm bg-white p-2 text-center">
      <p className="text-xs text-gray-500 mb-1 font-medium">Advertisement</p>
      <a
        href={cartAd.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group relative"
      >
        <img 
          src={cartAd.imageUrl} 
          alt="Advertisement"
          className="w-full h-auto object-cover rounded transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 flex items-center justify-center">
          <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={20} />
        </div>
      </a>
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
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded"
                />
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
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>{subtotal}TK</span>
              </div>
              <div className="flex justify-between text-lg font-semibold mt-2">
                <span>Delivery Charge:</span>
                <span>{DELIVERY_CHARGE}TK</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4">
                <span>Total:</span>
                <span>{total}TK</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={() => navigate('/checkout')}
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
