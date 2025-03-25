import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

function Cart() {
  const [cart, setCart] = useState<Product[]>([]);
  const navigate = useNavigate();
  const DELIVERY_CHARGE = 120;

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    return subtotal + DELIVERY_CHARGE;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center border-b py-4">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 ml-4">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity || 1}</p>
                  <p className="text-gray-800">{item.price}TK</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            ))}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>{calculateTotal() - DELIVERY_CHARGE}TK</span>
              </div>
              <div className="flex justify-between text-lg font-semibold mt-2">
                <span>Delivery Charge:</span>
                <span>{DELIVERY_CHARGE}TK</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4">
                <span>Total:</span>
                <span>{calculateTotal()}TK</span>
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
