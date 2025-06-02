import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Truck, HeadphonesIcon, Gift } from 'lucide-react';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [cart, setCart] = useState<any[]>([]);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [orderTimestamp, setOrderTimestamp] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Load cart items
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartItems);
    
    // Load gift wrap preference
    const giftWrap = localStorage.getItem('giftWrap');
    if (giftWrap) {
      setIsGiftWrapped(JSON.parse(giftWrap));
    }

    // Load saved user info
    const savedInfo = localStorage.getItem('userCheckoutInfo');
    if (savedInfo) {
      const parsedInfo = JSON.parse(savedInfo);
      setFormData(prev => ({
        ...prev,
        name: parsedInfo.name || '',
        phone: parsedInfo.phone || '',
        address: parsedInfo.address || '',
        email: parsedInfo.email || ''
      }));
    }

    if (cartItems.length === 0) {
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

  const generateReceipt = async () => {
    const receiptElement = document.createElement('div');
    receiptElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="text-align: center; color: #2563eb;">Spin Strike - Order Receipt</h2>
        <p style="text-align: center; color: #666;">Order #${orderId}</p>
        <hr style="margin: 20px 0;" />
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937;">Customer Details</h3>
          <p>Name: ${formData.name}</p>
          <p>Phone: ${formData.phone}</p>
          <p>Address: ${formData.address}</p>
          <p>Email: ${formData.email}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937;">Order Details</h3>
          ${cart.map(item => `
            <div style="margin-bottom: 10px;">
              <p style="margin: 0;">${item.name} ${item.selectedVariant ? `(${item.selectedVariant})` : ''}</p>
              <p style="margin: 0; color: #666;">Quantity: ${item.quantity} × ${item.price} TK</p>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>${cart.reduce((total, item) => total + (item.price * item.quantity), 0)} TK</span>
          </p>
          <p style="display: flex; justify-content: space-between;">
            <span>Delivery Charge:</span>
            <span>120 TK</span>
          </p>
          ${isGiftWrapped ? `
            <p style="display: flex; justify-content: space-between;">
              <span>Gift Wrapping:</span>
              <span>20 TK</span>
            </p>
          ` : ''}
          <p style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px;">
            <span>Total:</span>
            <span>${cart.reduce((total, item) => total + (item.price * item.quantity), 0) + 120 + (isGiftWrapped ? 20 : 0)} TK</span>
          </p>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Thank you for shopping with Spin Strike!</p>
          <p>For any queries, contact us at: spinstrikebd@gmail.com</p>
        </div>
      </div>
    `;

    document.body.appendChild(receiptElement);
    
    try {
      const canvas = await html2canvas(receiptElement);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`spin-strike-receipt-${orderId}.pdf`);
    } finally {
      document.body.removeChild(receiptElement);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    // Save user info for future use
    localStorage.setItem('userCheckoutInfo', JSON.stringify({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      email: formData.email
    }));

    const hasPreOrder = cart.some(item => item.quantity === 'Pre-order');
    if (hasPreOrder) {
      await Swal.fire({
        title: 'Pre-order Payment Required',
        html: `
          <p>To pre-order, you need to send 25% of the total payment in advance to this Bkash number:</p>
          <p class="text-xl font-bold mt-4">01722786111</p>
        `,
        icon: 'info',
        confirmButtonText: 'Proceed'
      });
    }
    
    const timestamp = Date.now();
    const generatedOrderId = `SS-${timestamp.toString(36)}`;
    setOrderId(generatedOrderId);
    setOrderTimestamp(timestamp);
    
    const orderData = {
      access_key: "78bafe1f-05fd-4f4a-bd3b-c12ec189a7e7",
      orderId: generatedOrderId,
      timestamp: timestamp,
      isGiftWrapped: isGiftWrapped,
      Coupon_code: formData.couponCode,
      message: formData.message,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      email: formData.email,
      cartItems: Object.values(
        cart.reduce((acc: any, item: any) => {
          const key = `${item.name}${item.selectedVariant ? ` - ${item.selectedVariant}` : ''}`;
          if (acc[key]) {
            acc[key].quantity += item.quantity || 1;
            acc[key].totalPrice += item.price * (item.quantity || 1);
          } else {
            acc[key] = {
              name: item.name,
              variant: item.selectedVariant,
              price: item.price,
              quantity: item.quantity || 1,
              totalPrice: item.price * (item.quantity || 1),
            };
          }
          return acc;
        }, {})
      ).map((item: any) => {
        return `${item.quantity}x ${item.name}${item.variant ? ` (${item.variant})` : ''}\nPrice: BDT ${item.price}\nTotal: BDT ${item.totalPrice.toFixed(2)}`;
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
        localStorage.removeItem('giftWrap');
        
        await generateReceipt();

        Swal.fire({
          title: 'Order Placed Successfully!',
          html: `
            <p>Thank you for your order, ${formData.name}!</p>
            <p class="mt-4">Your order ID is: <strong>${generatedOrderId}</strong></p>
            <p class="mt-2 text-sm">You can modify your order within the next 10 minutes.</p>
          `,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Go to Home',
          cancelButtonText: 'Modify Order'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/');
          } else {
            // Show modify order options
            Swal.fire({
              title: 'Modify Order',
              html: `
                <div class="space-y-4">
                  <button class="w-full bg-blue-500 text-white px-4 py-2 rounded" onclick="window.modifyAddress()">
                    Edit Address
                  </button>
                  <button class="w-full bg-red-500 text-white px-4 py-2 rounded" onclick="window.cancelOrder()">
                    Cancel Order
                  </button>
                  <button class="w-full bg-green-500 text-white px-4 py-2 rounded" onclick="window.addMoreProducts()">
                    Add More Products
                  </button>
                </div>
              `,
              showConfirmButton: false,
              showCloseButton: true,
              didOpen: () => {
                // Add window functions for the buttons
                (window as any).modifyAddress = () => {
                  Swal.close();
                  // Handle address modification
                };
                (window as any).cancelOrder = () => {
                  Swal.close();
                  // Handle order cancellation
                };
                (window as any).addMoreProducts = () => {
                  navigate('/');
                };
              }
            });
          }
        });

        setFormData({
          name: '',
          phone: '',
          address: '',
          email: '',
          message: '',
          couponCode: ''
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

  const hasPreOrder = cart.some(item => item.quantity === 'Pre-order');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Checkout</h1>
      
      {/* Trust Badges */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="grid grid-cols-3 gap-4 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
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

      {/* Delivery Time Notice */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Delivery Information</h3>
          <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
            <li>Standard delivery time: 3-5 working days</li>
            <li>Delivery time for "Pre-Order": 25-35 working days</li>
            <li>Delivery charge: 120 TK</li>
            <li>Free delivery on orders above 2000 TK</li>
          </ul>
        </div>
      </div>

      {/* Pre-order Notice */}
      {hasPreOrder && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded">
            <p className="font-bold text-yellow-800 dark:text-yellow-200">
              Pre-order items require 25% advance payment
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 mt-1">
              Please send the payment to bKash: 01722786111
            </p>
          </div>
        </div>
      )}

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

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isGiftWrapped}
                onChange={(e) => setIsGiftWrapped(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-500"
              />
              
              <span className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-pink-500" />
                <span>Add Gift Wrapping (+20 TK)</span>
              </span>
            </label>
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
