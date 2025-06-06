import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { ShoppingCart, ArrowLeft, Clock, Shield, Truck, HeadphonesIcon, Share2 } from 'lucide-react';
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
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
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
      }
    };

    fetchProduct();
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
    }
  };

  const getDeliveryEstimate = () => {
    if (product) {
      if (product.quantity === 'Pre-order') {
        return '25-35 days';
      } else if (product.quantity === 'Out of Stock') {
        return null;
      } else {
        return '3-5 days';
      }
    }
    return null;
  };

  const shareProduct = () => {
    const url = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(url);
    Swal.fire({
      title: 'Link Copied!',
      text: 'Product link has been copied to clipboard',
      icon: 'success',
      timer: 1500
    });
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

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const cartItem = {
        ...product,
        selectedVariant,
        quantity: 1
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
      
      Swal.fire({
        title: 'Success!',
        text: 'Product added to cart',
        icon: 'success',
        timer: 1500
      });
    }
  };

  const handleBuyNow = () => {
    addToCart();
    navigate('/checkout');
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const deliveryEstimate = getDeliveryEstimate();
  const isPreOrder = product.quantity === 'Pre-order';
  const isOutOfStock = product.quantity === 'Out of Stock';

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
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
          
          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOutOfStock 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : isPreOrder
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {isOutOfStock ? 'Out of Stock' : isPreOrder ? 'Pre-order' : 'In Stock'}
            </div>
          </div>

          {/* Delivery Estimate */}
          {deliveryEstimate && (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <Clock size={20} />
              <span>Estimated delivery: {deliveryEstimate}</span>
            </div>
          )}

          {/* Pre-order Notice */}
          {isPreOrder && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded">
              <p className="font-bold text-yellow-800 dark:text-yellow-200">
                Pre-order requires 25% advance payment
              </p>
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
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Status: {typeof product.quantity === 'number' ? `${product.quantity} in stock` : product.quantity}
            </p>
          )}

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
                onClick={() => navigate(`/product/${rec.id}`)}
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
    </div>
  );
}

export default ProductDetails;
