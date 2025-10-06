import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { ArrowLeft, Flame, ShoppingCart, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

interface CandleMaterial {
  id: string;
  name: string;
  price: number;
  category: 'containers' | 'wicks' | 'wax' | 'addons';
  imageUrl?: string;
  isActive: boolean;
}

interface CandleOrder {
  container: CandleMaterial | null;
  wick: CandleMaterial | null;
  wax: CandleMaterial | null;
  addons: CandleMaterial[];
  customDescription: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

function CandleCustomizer() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<CandleMaterial[]>([]);
  const [candleOrder, setCandleOrder] = useState<CandleOrder>({
    container: null,
    wick: null,
    wax: null,
    addons: [],
    customDescription: '',
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    }
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load saved customer info
    const savedInfo = localStorage.getItem('userCheckoutInfo');
    if (savedInfo) {
      const parsedInfo = JSON.parse(savedInfo);
      setCandleOrder(prev => ({
        ...prev,
        customerInfo: {
          name: parsedInfo.name || '',
          email: parsedInfo.email || '',
          phone: parsedInfo.phone || '',
          address: parsedInfo.address || ''
        }
      }));
    }

    // Fetch candle materials from Firebase
    const materialsRef = ref(db, 'candleMaterials');
    const unsubscribe = onValue(materialsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const materialsList = Object.entries(data)
          .map(([id, material]) => ({
            id,
            ...(material as Omit<CandleMaterial, 'id'>)
          }))
          .filter(material => material.isActive);
        setMaterials(materialsList);
      }
    });

    return () => unsubscribe();
  }, []);

  const getMaterialsByCategory = (category: string) => {
    return materials.filter(material => material.category === category);
  };

  const handleMaterialSelect = (material: CandleMaterial, category: string) => {
    if (category === 'addons') {
      setCandleOrder(prev => ({
        ...prev,
        addons: prev.addons.find(addon => addon.id === material.id)
          ? prev.addons.filter(addon => addon.id !== material.id)
          : [...prev.addons, material]
      }));
    } else {
      setCandleOrder(prev => ({
        ...prev,
        [category]: material
      }));
    }
  };

  const calculateTotal = () => {
    let total = 0;
    if (candleOrder.container) total += candleOrder.container.price;
    if (candleOrder.wick) total += candleOrder.wick.price;
    if (candleOrder.wax) total += candleOrder.wax.price;
    candleOrder.addons.forEach(addon => total += addon.price);
    
    const deliveryCharge = total >= 2000 ? 0 : 120;
    return {
      subtotal: total,
      deliveryCharge,
      total: total + deliveryCharge
    };
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candleOrder.container || !candleOrder.wick || !candleOrder.wax) {
      Swal.fire({
        title: 'Incomplete Selection',
        text: 'Please select a container, wick, and wax type to proceed',
        icon: 'warning'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const timestamp = Date.now();
      const orderId = `CANDLE-${timestamp.toString(36)}`;
      const { subtotal, deliveryCharge, total } = calculateTotal();

      // Save customer info for future use
      localStorage.setItem('userCheckoutInfo', JSON.stringify(candleOrder.customerInfo));

      // Create order summary
      const orderSummary = {
        orderId,
        timestamp,
        type: 'Custom Candle Order',
        container: candleOrder.container,
        wick: candleOrder.wick,
        wax: candleOrder.wax,
        addons: candleOrder.addons,
        customDescription: candleOrder.customDescription,
        customerInfo: candleOrder.customerInfo,
        pricing: { subtotal, deliveryCharge, total }
      };

      // Send email notification
      const emailContent = `
CUSTOM CANDLE ORDER

Order ID: ${orderId}
Customer: ${candleOrder.customerInfo.name}
Email: ${candleOrder.customerInfo.email}
Phone: ${candleOrder.customerInfo.phone}

DELIVERY ADDRESS:
${candleOrder.customerInfo.address}

CANDLE SPECIFICATIONS:
Container: ${candleOrder.container.name} - ${candleOrder.container.price} TK
Wick: ${candleOrder.wick.name} - ${candleOrder.wick.price} TK
Wax: ${candleOrder.wax.name} - ${candleOrder.wax.price} TK

Add-ons:
${candleOrder.addons.map(addon => `• ${addon.name} - ${addon.price} TK`).join('\n')}

Custom Description:
${candleOrder.customDescription || 'No special instructions'}

PRICING BREAKDOWN:
Subtotal: ${subtotal} TK
Delivery Charge: ${deliveryCharge === 0 ? 'FREE (Order over 2000 TK)' : `${deliveryCharge} TK`}
Total Amount: ${total} TK

Thank you for your custom candle order!
For any queries, contact us at: spinstrike@gmail.com
      `;

      const emailData = {
        access_key: "78bafe1f-05fd-4f4a-bd3b-c12ec189a7e7",
        subject: `Custom Candle Order - ${orderId}`,
        from_name: "SenTorial Custom Candles",
        message: emailContent
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        // Save order to profile history
        const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
        const orderHistory = profileData.orderHistory || [];
        
        orderHistory.push({
          orderId,
          timestamp,
          items: [{
            name: `Custom Candle (${candleOrder.container.name}, ${candleOrder.wick.name}, ${candleOrder.wax.name})`,
            price: total,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1602874801006-e26c884e8e4e?w=400',
            selectedVariant: 'Custom'
          }],
          total,
          address: candleOrder.customerInfo.address,
          phone: candleOrder.customerInfo.phone,
          isGiftWrapped: false,
          deliveryCharge,
          status: 'Pending'
        });

        localStorage.setItem('profileData', JSON.stringify({
          ...profileData,
          name: candleOrder.customerInfo.name,
          email: candleOrder.customerInfo.email,
          phone: candleOrder.customerInfo.phone,
          address: candleOrder.customerInfo.address,
          orderHistory
        }));

        Swal.fire({
          title: 'Order Placed Successfully!',
          html: `
            <p>Thank you for your custom candle order!</p>
            <p class="mt-4">Your order ID is: <strong>${orderId}</strong></p>
            <p class="mt-2 text-sm">We will contact you within 24-48 hours to confirm details and provide a timeline.</p>
            <div class="mt-4 p-3 bg-yellow-100 rounded">
              <p class="text-sm"><strong>Pre-order Payment Required:</strong></p>
              <p class="text-sm">Please send 25% advance payment (${Math.ceil(total * 0.25)} TK) to bKash: 01722786111</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Great!'
        });

        // Reset form
        setCandleOrder({
          container: null,
          wick: null,
          wax: null,
          addons: [],
          customDescription: '',
          customerInfo: {
            name: '',
            email: '',
            phone: '',
            address: ''
          }
        });
        setShowCheckout(false);
      } else {
        throw new Error("Failed to submit order");
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to submit your order. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, deliveryCharge, total } = calculateTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 mb-6"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Home
      </button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center">
          <Flame className="mr-3 text-orange-500" size={40} />
          <i>Candarial~</i> Candle Designer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Create your perfect custom candle with our premium materials
        </p>
      </div>

      {!showCheckout ? (
        <div className="max-w-6xl mx-auto">
          {/* Containers Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
              <Sparkles className="mr-2 text-purple-500" />
              Containers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getMaterialsByCategory('containers').map((container) => (
                <motion.div
                  key={container.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMaterialSelect(container, 'container')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    candleOrder.container?.id === container.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  {container.imageUrl && (
                    <img
                      src={container.imageUrl}
                      alt={container.name}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-gray-800 dark:text-white">{container.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold">{container.price} TK</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Wicks Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Wicks</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getMaterialsByCategory('wicks').map((wick) => (
                <motion.div
                  key={wick.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMaterialSelect(wick, 'wick')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    candleOrder.wick?.id === wick.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  {wick.imageUrl && (
                    <img
                      src={wick.imageUrl}
                      alt={wick.name}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-gray-800 dark:text-white">{wick.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold">{wick.price} TK</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Wax Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Main Body Wax</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getMaterialsByCategory('wax').map((wax) => (
                <motion.div
                  key={wax.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMaterialSelect(wax, 'wax')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    candleOrder.wax?.id === wax.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  {wax.imageUrl && (
                    <img
                      src={wax.imageUrl}
                      alt={wax.name}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-gray-800 dark:text-white">{wax.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold">{wax.price} TK</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Add-ons (Optional)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getMaterialsByCategory('addons').map((addon) => (
                <motion.div
                  key={addon.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMaterialSelect(addon, 'addons')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    candleOrder.addons.find(a => a.id === addon.id)
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  {addon.imageUrl && (
                    <img
                      src={addon.imageUrl}
                      alt={addon.name}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-gray-800 dark:text-white">{addon.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold">{addon.price} TK</p>
                  {candleOrder.addons.find(a => a.id === addon.id) && (
                    <p className="text-green-600 text-sm font-medium">✓ Selected</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Custom Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Custom Description (scents are free)</h2>
            <textarea
              value={candleOrder.customDescription}
              onChange={(e) => setCandleOrder(prev => ({ ...prev, customDescription: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe how you want your candle to look, any special colors, scents, or design preferences..."
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Order Summary</h3>
            <div className="space-y-2 text-gray-800 dark:text-white">
              {candleOrder.container && (
                <div className="flex justify-between">
                  <span>Container: {candleOrder.container.name}</span>
                  <span>{candleOrder.container.price} TK</span>
                </div>
              )}
              {candleOrder.wick && (
                <div className="flex justify-between">
                  <span>Wick: {candleOrder.wick.name}</span>
                  <span>{candleOrder.wick.price} TK</span>
                </div>
              )}
              {candleOrder.wax && (
                <div className="flex justify-between">
                  <span>Wax: {candleOrder.wax.name}</span>
                  <span>{candleOrder.wax.price} TK</span>
                </div>
              )}
              {candleOrder.addons.map((addon) => (
                <div key={addon.id} className="flex justify-between">
                  <span>Add-on: {addon.name}</span>
                  <span>{addon.price} TK</span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{subtotal} TK</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `${deliveryCharge} TK`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                  <span>Total:</span>
                  <span>{total} TK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="text-center">
            <button
              onClick={() => setShowCheckout(true)}
              disabled={!candleOrder.container || !candleOrder.wick || !candleOrder.wax}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center space-x-2 mx-auto"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Proceed to Checkout</span>
            </button>
          </div>
        </div>
      ) : (
        /* Checkout Form */
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Complete Your Order</h2>
          
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={candleOrder.customerInfo.name}
                  onChange={(e) => setCandleOrder(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, name: e.target.value }
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={candleOrder.customerInfo.email}
                  onChange={(e) => setCandleOrder(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, email: e.target.value }
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={candleOrder.customerInfo.phone}
                  onChange={(e) => setCandleOrder(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, phone: e.target.value }
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Address *
                </label>
                <textarea
                  value={candleOrder.customerInfo.address}
                  onChange={(e) => setCandleOrder(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, address: e.target.value }
                  }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Pre-order Payment Required
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Please send 25% advance payment ({Math.ceil(total * 0.25)} TK) to bKash: 01722786111
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back to Design
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:bg-orange-400 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Place Custom Candle Order</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CandleCustomizer;
