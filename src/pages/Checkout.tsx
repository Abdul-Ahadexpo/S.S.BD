import React, { useState } from 'react';
import Swal from 'sweetalert2';

function Checkout() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    message: '',
    couponCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
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
        Swal.fire({
          title: 'Success!',
          text: `Thank you for your order, ${formData.name}! It will be confirmed.`,
          icon: 'success'
        });
        localStorage.removeItem('cart');
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
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Coupon Code (Optional)</label>
            <input
              type="text"
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;