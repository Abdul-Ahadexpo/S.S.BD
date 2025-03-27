import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Checkout() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    message: '',
    couponCode: ''
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      Swal.fire({
        title: 'Empty Cart',
        text: 'Please add products to your cart before checking out.',
        icon: 'warning',
        confirmButtonText: 'Go to Shop'
      }).then(() => {
        navigate('/');
      });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
      Swal.fire({
        title: 'Empty Cart',
        text: 'Please add products to your cart before checking out.',
        icon: 'warning',
        confirmButtonText: 'Go to Shop'
      }).then(() => {
        navigate('/');
      });
      return;
    }
    
    const orderData = {
      access_key: "78bafe1f-05fd-4f4a-bd3b-c12ec189a7e7",
      Coupon_code: formData.couponCode,
      message: formData.message,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      email: formData.email,
      cartItems: Object.values(
        cart.reduce((acc: any, item: any) => {
          if (acc[item.name]) {
            acc[item.name].quantity += item.quantity || 1;
            acc[item.name].totalPrice += item.price * (item.quantity || 1);
          } else {
            acc[item.name] = {
              name: item.name,
              price: item.price,
              quantity: item.quantity || 1,
              totalPrice: item.price * (item.quantity || 1),
            };
          }
          return acc;
        }, {})
      ).map((item: any) => {
        return `${item.quantity}ta \n${item.name}\nPrice: BDT ${item.price}\nTotal: BDT ${item.totalPrice.toFixed(2)}`;
      }).join("\n\n")
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        localStorage.removeItem('cart');
        setFormData({
          name: '',
          phone: '',
          address: '',
          email: '',
          message: '',
          couponCode: ''
        });
        
        Swal.fire({
          title: 'Success!',
          text: `Thank you for your order, ${formData.name}! It will be confirmed.`,
          icon: 'success'
        }).then(() => {
          navigate('/');
        });
      } else {
        throw new Error("Failed to submit your order.");
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to submit order. Please try again.',
        icon: 'error'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Checkout</h1>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Message (Optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Coupon Code (Optional)</label>
            <input
              type="text"
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
