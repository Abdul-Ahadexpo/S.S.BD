import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, update, onValue, set, get, remove } from 'firebase/database';
import { db } from '../firebase';
import { 
  Package, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Download,
  Search,
  Link,
  ExternalLink,
  Building,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
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
  quantity: string | number;
  category: string;
  variants?: ProductVariant[];
  additionalImages?: string[];
  isExclusive?: boolean;
}

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
}

interface Review {
  id: string;
  buyerName: string;
  productName: string;
  reviewText: string;
  purchaseDate: string;
  images: string[];
  linkedProductId?: string;
  timestamp?: number;
}

interface FooterInfo {
  companyName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
}

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [footerInfo, setFooterInfo] = useState<FooterInfo>({
    companyName: 'Sentorial',
    description: 'Your trusted partner for premium quality products',
    email: 'sentorialbd@gmail.com',
    phone: '+880 1234-567890',
    address: '123 Business Street, Dhaka, Bangladesh',
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: ''
    }
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedProductForLinking, setSelectedProductForLinking] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    quantity: '',
    category: '',
    variants: [],
    additionalImages: [],
    isExclusive: false
  });

  const [newReview, setNewReview] = useState<Omit<Review, 'id'>>({
    buyerName: '',
    productName: '',
    reviewText: '',
    purchaseDate: '',
    images: [],
    linkedProductId: '',
    timestamp: Date.now()
  });

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('employeeAuth');
    if (!isAuthenticated) {
      navigate('/employee/login');
    }
  }, [navigate]);

  // Load data from Firebase
  useEffect(() => {
    // Load products
    const productsRef = ref(db, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const productsList = Object.entries(productsData).map(([id, product]) => ({
          id,
          ...(product as Omit<Product, 'id'>)
        }));
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    });

    // Load reviews
    const reviewsRef = ref(db, 'reviews');
    const unsubscribeReviews = onValue(reviewsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reviewsData = snapshot.val();
        const reviewsList = Object.entries(reviewsData).map(([id, review]) => ({
          id,
          ...(review as Omit<Review, 'id'>)
        }));
        setReviews(reviewsList);
      } else {
        setReviews([]);
      }
    });

    // Load footer info
    const footerRef = ref(db, 'footerData');
    const unsubscribeFooter = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        const footerData = snapshot.val();
        setFooterInfo(prev => ({ ...prev, ...footerData }));
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeReviews();
      unsubscribeFooter();
    };
  }, []);

  // Product management functions
  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price) {
      try {
        const productsRef = ref(db, 'products');
        await push(productsRef, {
          ...newProduct,
          createdAt: Date.now()
        });
        
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          imageUrl: '',
          quantity: '',
          category: '',
          variants: [],
          additionalImages: [],
          isExclusive: false
        });
        setShowProductForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Product added successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to add product',
          icon: 'error'
        });
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: product.quantity,
      category: product.category,
      variants: product.variants || [],
      additionalImages: product.additionalImages || [],
      isExclusive: product.isExclusive || false
    });
    setShowProductForm(true);
  };

  const handleUpdateProduct = async () => {
    if (editingProduct && newProduct.name && newProduct.price) {
      try {
        const productRef = ref(db, `products/${editingProduct.id}`);
        await update(productRef, {
          ...newProduct,
          updatedAt: Date.now()
        });
        
        setEditingProduct(null);
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          imageUrl: '',
          quantity: '',
          category: '',
          variants: [],
          additionalImages: [],
          isExclusive: false
        });
        setShowProductForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Product updated successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update product',
          icon: 'error'
        });
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the product',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const productRef = ref(db, `products/${id}`);
        await remove(productRef);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Product has been deleted',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete product',
          icon: 'error'
        });
      }
    }
  };

  // Review management functions
  const handleAddReview = async () => {
    if (newReview.buyerName && newReview.reviewText) {
      try {
        const reviewsRef = ref(db, 'reviews');
        await push(reviewsRef, {
          ...newReview,
          linkedProductId: selectedProductId || null,
          timestamp: Date.now()
        });
        
        setNewReview({
          buyerName: '',
          productName: '',
          reviewText: '',
          purchaseDate: '',
          images: [],
          linkedProductId: '',
          timestamp: Date.now()
        });
        setSelectedProductId('');
        setSearchTerm('');
        setShowReviewForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Review added successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to add review',
          icon: 'error'
        });
      }
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setNewReview({
      buyerName: review.buyerName,
      productName: review.productName,
      reviewText: review.reviewText,
      purchaseDate: review.purchaseDate,
      images: review.images || [],
      linkedProductId: review.linkedProductId || '',
      timestamp: review.timestamp || Date.now()
    });
    setSelectedProductId(review.linkedProductId || '');
    if (review.linkedProductId) {
      const linkedProduct = products.find(p => p.id === review.linkedProductId);
      setSearchTerm(linkedProduct?.name || '');
    }
    setShowReviewForm(true);
  };

  const handleUpdateReview = async () => {
    if (editingReview && newReview.buyerName && newReview.reviewText) {
      try {
        const reviewRef = ref(db, `reviews/${editingReview.id}`);
        await update(reviewRef, {
          ...newReview,
          linkedProductId: selectedProductId || null,
          updatedAt: Date.now()
        });
        
        setEditingReview(null);
        setNewReview({
          buyerName: '',
          productName: '',
          reviewText: '',
          purchaseDate: '',
          images: [],
          linkedProductId: '',
          timestamp: Date.now()
        });
        setSelectedProductId('');
        setSearchTerm('');
        setShowReviewForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Review updated successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update review',
          icon: 'error'
        });
      }
    }
  };

  const handleDeleteReview = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the review',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const reviewRef = ref(db, `reviews/${id}`);
        await remove(reviewRef);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Review has been deleted',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete review',
          icon: 'error'
        });
      }
    }
  };

  // Quick link functionality
  const handleQuickLink = (product: Product) => {
    setSelectedProductForLinking(product);
    setShowLinkModal(true);
  };

  const handleLinkReviewToProduct = async (reviewId: string) => {
    if (selectedProductForLinking) {
      try {
        const reviewRef = ref(db, `reviews/${reviewId}`);
        await update(reviewRef, {
          linkedProductId: selectedProductForLinking.id,
          updatedAt: Date.now()
        });
        
        setShowLinkModal(false);
        setSelectedProductForLinking(null);
        
        Swal.fire({
          title: 'Success!',
          text: 'Review linked to product successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to link review to product',
          icon: 'error'
        });
      }
    }
  };

  // Save footer info to Firebase
  const handleSaveFooterInfo = async () => {
    try {
      const footerRef = ref(db, 'footerData');
      await set(footerRef, footerInfo);
      
      Swal.fire({
        title: 'Success!',
        text: 'Footer information saved successfully',
        icon: 'success',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to save footer information',
        icon: 'error'
      });
    }
  };

  // Get linked product for a review
  const getLinkedProduct = (linkedProductId?: string) => {
    if (!linkedProductId) return null;
    return products.find(p => p.id === linkedProductId) || null;
  };

  // Filter products for search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unlinked reviews for quick linking
  const unlinkedReviews = reviews.filter(r => !r.linkedProductId);

  const renderProductsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Products Management</h2>
        <button
          onClick={() => setShowProductForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Quick Link Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Link Reviews</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {products.slice(0, 6).map(product => (
            <div key={product.id} className="flex-shrink-0 w-48 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-24 object-cover rounded mb-2"
              />
              <h4 className="font-medium text-sm text-gray-800 dark:text-white truncate">{product.name}</h4>
              <p className="text-blue-600 font-semibold text-sm">{product.price} TK</p>
              <button
                onClick={() => handleQuickLink(product)}
                className="w-full mt-2 bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700 flex items-center justify-center gap-1"
              >
                <Link className="w-3 h-3" />
                Link Review
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-lg object-cover" src={product.imageUrl} alt={product.name} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                        {product.isExclusive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Exclusive
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.price} TK</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReviewsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Reviews Management</h2>
        <button
          onClick={() => setShowReviewForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Linked Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reviews.map(review => {
                const linkedProduct = getLinkedProduct(review.linkedProductId);
                return (
                  <tr key={review.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{review.buyerName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{review.purchaseDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{review.reviewText}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {linkedProduct ? (
                        <div className="flex items-center">
                          <img className="h-8 w-8 rounded object-cover mr-2" src={linkedProduct.imageUrl} alt={linkedProduct.name} />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-24">{linkedProduct.name}</div>
                            <div className="text-sm text-blue-600">{linkedProduct.price} TK</div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not Linked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFooterTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Footer Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Company Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
              <input
                type="text"
                value={footerInfo.companyName}
                onChange={(e) => setFooterInfo({...footerInfo, companyName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Description</label>
              <textarea
                value={footerInfo.description}
                onChange={(e) => setFooterInfo({...footerInfo, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter company description"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={footerInfo.email}
                onChange={(e) => setFooterInfo({...footerInfo, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                value={footerInfo.phone}
                onChange={(e) => setFooterInfo({...footerInfo, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="+880 1234-567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <textarea
                value={footerInfo.address}
                onChange={(e) => setFooterInfo({...footerInfo, address: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="123 Business Street, City, Country"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook URL
              </label>
              <input
                type="url"
                value={footerInfo.socialLinks.facebook}
                onChange={(e) => setFooterInfo({...footerInfo, socialLinks: {...footerInfo.socialLinks, facebook: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                Instagram URL
              </label>
              <input
                type="url"
                value={footerInfo.socialLinks.instagram}
                onChange={(e) => setFooterInfo({...footerInfo, socialLinks: {...footerInfo.socialLinks, instagram: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://instagram.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" />
                YouTube URL
              </label>
              <input
                type="url"
                value={footerInfo.socialLinks.youtube}
                onChange={(e) => setFooterInfo({...footerInfo, socialLinks: {...footerInfo.socialLinks, youtube: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveFooterInfo}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Footer Information
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage products, reviews, and site content</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'products', name: 'Products', icon: Package },
              { id: 'reviews', name: 'Reviews', icon: MessageSquare },
              { id: 'footer', name: 'Footer', icon: Building }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'reviews' && renderReviewsTab()}
        {activeTab === 'footer' && renderFooterTab()}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    setNewProduct({
                      name: '',
                      description: '',
                      price: 0,
                      imageUrl: '',
                      quantity: '',
                      category: '',
                      variants: [],
                      additionalImages: [],
                      isExclusive: false
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (TK)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <input
                    type="text"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 10, Pre-order, Out of Stock"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter product category"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="exclusive"
                    checked={newProduct.isExclusive}
                    onChange={(e) => setNewProduct({...newProduct, isExclusive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="exclusive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Exclusive Product
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    setNewProduct({
                      name: '',
                      description: '',
                      price: 0,
                      imageUrl: '',
                      quantity: '',
                      category: '',
                      variants: [],
                      additionalImages: [],
                      isExclusive: false
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingReview ? 'Edit Review' : 'Add New Review'}
                </h3>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setNewReview({
                      buyerName: '',
                      productName: '',
                      reviewText: '',
                      purchaseDate: '',
                      images: [],
                      linkedProductId: '',
                      timestamp: Date.now()
                    });
                    setSelectedProductId('');
                    setSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buyer Name</label>
                  <input
                    type="text"
                    value={newReview.buyerName}
                    onChange={(e) => setNewReview({...newReview, buyerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter buyer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newReview.productName}
                    onChange={(e) => setNewReview({...newReview, productName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Text</label>
                  <textarea
                    value={newReview.reviewText}
                    onChange={(e) => setNewReview({...newReview, reviewText: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter review text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={newReview.purchaseDate}
                    onChange={(e) => setNewReview({...newReview, purchaseDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Product Search and Link */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link to Product (Optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                      placeholder="Search products to link..."
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>

                  {/* Product Dropdown */}
                  {showProductDropdown && filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredProducts.slice(0, 5).map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setSelectedProductId(product.id);
                            setSearchTerm(product.name);
                            setShowProductDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3 ${
                            selectedProductId === product.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                          }`}
                        >
                          <img src={product.imageUrl} alt={product.name} className="w-8 h-8 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</div>
                            <div className="text-sm text-blue-600">{product.price} TK</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Product Display */}
                  {selectedProductId && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          Linked to: {products.find(p => p.id === selectedProductId)?.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductId('');
                          setSearchTerm('');
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingReview ? handleUpdateReview : handleAddReview}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingReview ? 'Update Review' : 'Add Review'}
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setNewReview({
                      buyerName: '',
                      productName: '',
                      reviewText: '',
                      purchaseDate: '',
                      images: [],
                      linkedProductId: '',
                      timestamp: Date.now()
                    });
                    setSelectedProductId('');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Link Modal */}
        {showLinkModal && selectedProductForLinking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Link Review to {selectedProductForLinking.name}
                </h3>
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedProductForLinking(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <img 
                  src={selectedProductForLinking.imageUrl} 
                  alt={selectedProductForLinking.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select a review to link to this product:
                </p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {unlinkedReviews.length > 0 ? (
                  unlinkedReviews.map(review => (
                    <button
                      key={review.id}
                      onClick={() => handleLinkReviewToProduct(review.id)}
                      className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{review.buyerName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{review.reviewText}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{review.purchaseDate}</div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No unlinked reviews available
                  </p>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedProductForLinking(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
