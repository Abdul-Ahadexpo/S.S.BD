import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { db } from '../firebase';
import { ArrowLeft, Flame, ShoppingCart, Sparkles, Settings, Plus, Upload, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

interface CandleMaterial {
  id: string;
  name: string;
  price: number;
  category: 'containers' | 'wicks' | 'wax' | 'addons';
  imageUrl?: string;
  isActive: boolean;
}

interface CompatibilityRule {
  id: string;
  containerId: string;
  wickId: string;
  waxId: string;
  priceModifier: number; // Additional price or discount
  isCompatible: boolean;
  description?: string;
}

interface CandleOrder {
  container: CandleMaterial | null;
  wick: CandleMaterial | null;
  wax: CandleMaterial | null;
  addons: CandleMaterial[];
  customDescription: string;
  customImage?: string;
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
  const [compatibilityRules, setCompatibilityRules] = useState<CompatibilityRule[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showCompatibilityForm, setShowCompatibilityForm] = useState(false);
  const [editingRule, setEditingRule] = useState<CompatibilityRule | null>(null);
  const [candleOrder, setCandleOrder] = useState<CandleOrder>({
    container: null,
    wick: null,
    wax: null,
    addons: [],
    customDescription: '',
    customImage: undefined,
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    }
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compatibilityFormData, setCompatibilityFormData] = useState({
    containerId: '',
    wickId: '',
    waxId: '',
    priceModifier: 0,
    isCompatible: true,
    description: ''
  });

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

    // Fetch compatibility rules
    const rulesRef = ref(db, 'candleCompatibilityRules');
    const unsubscribeRules = onValue(rulesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rulesList = Object.entries(data)
          .map(([id, rule]) => ({
            id,
            ...(rule as Omit<CompatibilityRule, 'id'>)
          }));
        setCompatibilityRules(rulesList);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeRules();
    };
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

  const handleAdminLogin = async () => {
    const { value: password } = await Swal.fire({
      title: 'Admin Access',
      input: 'password',
      inputLabel: 'Enter admin password',
      inputPlaceholder: 'Password',
      showCancelButton: true,
      confirmButtonText: 'Login',
      cancelButtonText: 'Cancel'
    });

    if (password === '69') {
      setIsAdminAuthenticated(true);
      Swal.fire({
        title: 'Access Granted',
        text: 'You can now manage compatibility rules',
        icon: 'success',
        timer: 1500
      });
    } else if (password) {
      Swal.fire({
        title: 'Access Denied',
        text: 'Incorrect password',
        icon: 'error'
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setCandleOrder(prev => ({
          ...prev,
          customImage: imageUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCustomImage = () => {
    setCandleOrder(prev => ({
      ...prev,
      customImage: undefined
    }));
  };

  const getCurrentCompatibilityRule = () => {
    if (!candleOrder.container || !candleOrder.wick || !candleOrder.wax) {
      return null;
    }

    return compatibilityRules.find(rule => 
      rule.containerId === candleOrder.container!.id &&
      rule.wickId === candleOrder.wick!.id &&
      rule.waxId === candleOrder.wax!.id
    );
  };

  const getCompatibilityStatus = () => {
    const rule = getCurrentCompatibilityRule();
    if (!rule) {
      return { isCompatible: true, message: '', priceModifier: 0 };
    }
    
    return {
      isCompatible: rule.isCompatible,
      message: rule.description || '',
      priceModifier: rule.priceModifier
    };
  };

  const calculateTotal = () => {
    let total = 0;
    if (candleOrder.container) total += candleOrder.container.price;
    if (candleOrder.wick) total += candleOrder.wick.price;
    if (candleOrder.wax) total += candleOrder.wax.price;
    candleOrder.addons.forEach(addon => total += addon.price);
    
    // Apply compatibility rule price modifier
    const compatibility = getCompatibilityStatus();
    total += compatibility.priceModifier;
    
    const deliveryCharge = total >= 2000 ? 0 : 120;
    return {
      subtotal: total,
      deliveryCharge,
      total: total + deliveryCharge,
      priceModifier: compatibility.priceModifier
    };
  };

  const handleCompatibilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    try {
      let ruleId;
      let ruleRef;

      if (editingRule) {
        ruleId = editingRule.id;
        ruleRef = ref(db, `candleCompatibilityRules/${ruleId}`);
      } else {
        const rulesRef = ref(db, 'candleCompatibilityRules');
        const newRuleRef = push(rulesRef);
        ruleId = newRuleRef.key;
        ruleRef = newRuleRef;
      }

      const ruleData = {
        ...compatibilityFormData,
        id: ruleId
      };

      await set(ruleRef, ruleData);

      Swal.fire({
        title: editingRule ? 'Rule Updated!' : 'Rule Added!',
        text: editingRule ? 'Compatibility rule has been updated successfully!' : 'New compatibility rule has been added successfully!',
        icon: 'success',
        confirmButtonText: 'Great!'
      });

      // Reset form
      setCompatibilityFormData({
        containerId: '',
        wickId: '',
        waxId: '',
        priceModifier: 0,
        isCompatible: true,
        description: ''
      });
      setEditingRule(null);
      setShowCompatibilityForm(false);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: editingRule ? 'Failed to update rule. Please try again.' : 'Failed to add rule. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    const result = await Swal.fire({
      title: 'Delete Rule',
      text: 'Are you sure you want to delete this compatibility rule?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        const ruleRef = ref(db, `candleCompatibilityRules/${ruleId}`);
        await remove(ruleRef);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Compatibility rule has been deleted successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete rule',
          icon: 'error'
        });
      }
    }
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

    const compatibility = getCompatibilityStatus();
    if (!compatibility.isCompatible) {
      Swal.fire({
        title: 'Incompatible Selection',
        text: compatibility.message || 'The selected combination is not compatible. Please choose different materials.',
        icon: 'warning'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const timestamp = Date.now();
      const orderId = `CANDLE-${timestamp.toString(36)}`;
      const { subtotal, deliveryCharge, total, priceModifier } = calculateTotal();

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
        customImage: candleOrder.customImage,
        customerInfo: candleOrder.customerInfo,
        pricing: { subtotal, deliveryCharge, total, priceModifier }
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

${priceModifier !== 0 ? `Compatibility Price Adjustment: ${priceModifier > 0 ? '+' : ''}${priceModifier} TK\n` : ''}

Custom Description:
${candleOrder.customDescription || 'No special instructions'}

${candleOrder.customImage ? 'Custom Image: Uploaded by customer\n' : ''}

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
          customImage: undefined,
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

  const { subtotal, deliveryCharge, total, priceModifier } = calculateTotal();
  const compatibility = getCompatibilityStatus();

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
        <i className="text-white">Make Candles</i>
           <Flame className="ml-3 text-orange-500" size={40} />
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Create your perfect custom candle with our premium materials
        </p>
        
        {/* Admin Button */}
        <div className="mt-4">
          <button
            onClick={handleAdminLogin}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            <Settings className="h-4 w-4" />
            <span>Admin Panel</span>
          </button>
        </div>
      </div>

      {/* Admin Compatibility Rules Management */}
      {isAdminAuthenticated && (
        <div className="max-w-6xl mx-auto mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Compatibility Rules Management</h2>
            <button
              onClick={() => setShowCompatibilityForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Rule</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compatibilityRules.map((rule) => {
              const container = materials.find(m => m.id === rule.containerId);
              const wick = materials.find(m => m.id === rule.wickId);
              const wax = materials.find(m => m.id === rule.waxId);
              
              return (
                <div key={rule.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                        {container?.name} + {wick?.name} + {wax?.name}
                      </h3>
                      <p className={`text-sm font-medium ${
                        rule.isCompatible 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {rule.isCompatible ? '✓ Compatible' : '✗ Incompatible'}
                      </p>
                      {rule.priceModifier !== 0 && (
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                          {rule.priceModifier > 0 ? '+' : ''}{rule.priceModifier} TK
                        </p>
                      )}
                      {rule.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {rule.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setCompatibilityFormData({
                            containerId: rule.containerId,
                            wickId: rule.wickId,
                            waxId: rule.waxId,
                            priceModifier: rule.priceModifier,
                            isCompatible: rule.isCompatible,
                            description: rule.description || ''
                          });
                          setShowCompatibilityForm(true);
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!showCheckout ? (
        <div className="max-w-6xl mx-auto">
          {/* Compatibility Status */}
          {candleOrder.container && candleOrder.wick && candleOrder.wax && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              compatibility.isCompatible 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-red-500 bg-red-50 dark:bg-red-900/20'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  compatibility.isCompatible ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className={`font-semibold ${
                  compatibility.isCompatible 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {compatibility.isCompatible ? 'Compatible Selection' : 'Incompatible Selection'}
                </span>
              </div>
              {compatibility.message && (
                <p className={`mt-2 text-sm ${
                  compatibility.isCompatible 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {compatibility.message}
                </p>
              )}
              {compatibility.priceModifier !== 0 && (
                <p className="mt-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  Price adjustment: {compatibility.priceModifier > 0 ? '+' : ''}{compatibility.priceModifier} TK
                </p>
              )}
            </div>
          )}

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
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Custom Description</h2>
            <textarea
              value={candleOrder.customDescription}
              onChange={(e) => setCandleOrder(prev => ({ ...prev, customDescription: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe how you want your candle to look, any special colors, scents, or design preferences..."
            />
            
            {/* Custom Image Upload */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Reference Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="custom-image-upload"
                />
                <label
                  htmlFor="custom-image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    Upload a reference image to show how you want your candle to look
                  </span>
                </label>
              </div>

              {candleOrder.customImage && (
                <div className="mt-4 relative inline-block">
                  <img
                    src={candleOrder.customImage}
                    alt="Custom candle reference"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeCustomImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
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
                <div key={addon.id} className="flex justify-between text-gray-800 dark:text-white">
                  <span>Add-on: {addon.name}</span>
                  <span>{addon.price} TK</span>
                </div>
              ))}
              {priceModifier !== 0 && (
                <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium">
                  <span>Compatibility Adjustment:</span>
                  <span>{priceModifier > 0 ? '+' : ''}{priceModifier} TK</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between text-gray-800 dark:text-white">
                  <span>Subtotal:</span>
                  <span>{subtotal} TK</span>
                </div>
                <div className="flex justify-between text-gray-800 dark:text-white">
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
              disabled={!candleOrder.container || !candleOrder.wick || !candleOrder.wax || !compatibility.isCompatible}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center space-x-2 mx-auto disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>
                {!compatibility.isCompatible ? 'Incompatible Selection' : 'Proceed to Checkout'}
              </span>
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

      {/* Compatibility Rule Form Modal */}
      <AnimatePresence>
        {showCompatibilityForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCompatibilityForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {editingRule ? 'Edit Compatibility Rule' : 'Add Compatibility Rule'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCompatibilityForm(false);
                      setEditingRule(null);
                      setCompatibilityFormData({
                        containerId: '',
                        wickId: '',
                        waxId: '',
                        priceModifier: 0,
                        isCompatible: true,
                        description: ''
                      });
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                <form onSubmit={handleCompatibilitySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Container *
                    </label>
                    <select
                      value={compatibilityFormData.containerId}
                      onChange={(e) => setCompatibilityFormData({ ...compatibilityFormData, containerId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Container</option>
                      {getMaterialsByCategory('containers').map((container) => (
                        <option key={container.id} value={container.id}>
                          {container.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Wick *
                    </label>
                    <select
                      value={compatibilityFormData.wickId}
                      onChange={(e) => setCompatibilityFormData({ ...compatibilityFormData, wickId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Wick</option>
                      {getMaterialsByCategory('wicks').map((wick) => (
                        <option key={wick.id} value={wick.id}>
                          {wick.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Wax *
                    </label>
                    <select
                      value={compatibilityFormData.waxId}
                      onChange={(e) => setCompatibilityFormData({ ...compatibilityFormData, waxId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Wax</option>
                      {getMaterialsByCategory('wax').map((wax) => (
                        <option key={wax.id} value={wax.id}>
                          {wax.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Price Modifier (TK)
                    </label>
                    <input
                      type="number"
                      value={compatibilityFormData.priceModifier}
                      onChange={(e) => setCompatibilityFormData({ ...compatibilityFormData, priceModifier: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="0 for no change, positive for extra cost, negative for discount"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compatibilityFormData.isCompatible}
                        onChange={(e) => setCompatibilityFormData({ ...compatibilityFormData, isCompatible: e.target.checked })}
                        className="form-checkbox h-5 w-5 text-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-200">Compatible combination</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={compatibilityFormData.description}
                      onChange={(e) => setCompatibilityFormData({ ...compatibilityFormData, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Explain why this combination works or doesn't work..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCompatibilityForm(false);
                        setEditingRule(null);
                        setCompatibilityFormData({
                          containerId: '',
                          wickId: '',
                          waxId: '',
                          priceModifier: 0,
                          isCompatible: true,
                          description: ''
                        });
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-400 flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{editingRule ? 'Updating...' : 'Adding...'}</span>
                        </>
                      ) : (
                        <span>{editingRule ? 'Update Rule' : 'Add Rule'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CandleCustomizer;