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
  Youtube,
  Image as ImageIcon,
  Tag,
  Gift,
  Monitor,
  Eye,
  EyeOff
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
  createdAt?: number;
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

interface Coupon {
  id: string;
  code: string;
  discount: number;
  isActive: boolean;
}

interface CartAd {
  id: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [cartAds, setCartAds] = useState<CartAd[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [footerInfo, setFooterInfo] = useState<FooterInfo>({
    companyName: 'SenTorial',
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
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingCartAd, setEditingCartAd] = useState<CartAd | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [showProductForm, setShowProductForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showCartAdForm, setShowCartAdForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const [selectedProductForLinking, setSelectedProductForLinking] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

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

  const [newBanner, setNewBanner] = useState<Omit<Banner, 'id'>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true
  });

  const [newCoupon, setNewCoupon] = useState<Omit<Coupon, 'id'>>({
    code: '',
    discount: 0,
    isActive: true
  });

  const [newCartAd, setNewCartAd] = useState<Omit<CartAd, 'id'>>({
    imageUrl: '',
    linkUrl: '',
    isActive: true
  });

  const [newCategory, setNewCategory] = useState<Omit<Category, 'id'>>({
    name: ''
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

    // Load banners
    const bannersRef = ref(db, 'banners');
    const unsubscribeBanners = onValue(bannersRef, (snapshot) => {
      if (snapshot.exists()) {
        const bannersData = snapshot.val();
        const bannersList = Object.entries(bannersData).map(([id, banner]) => ({
          id,
          ...(banner as Omit<Banner, 'id'>)
        }));
        setBanners(bannersList);
      } else {
        setBanners([]);
      }
    });

    // Load coupons
    const couponsRef = ref(db, 'coupons');
    const unsubscribeCoupons = onValue(couponsRef, (snapshot) => {
      if (snapshot.exists()) {
        const couponsData = snapshot.val();
        const couponsList = Object.entries(couponsData).map(([id, coupon]) => ({
          id,
          ...(coupon as Omit<Coupon, 'id'>)
        }));
        setCoupons(couponsList);
      } else {
        setCoupons([]);
      }
    });

    // Load cart ads
    const cartAdsRef = ref(db, 'cartAds');
    const unsubscribeCartAds = onValue(cartAdsRef, (snapshot) => {
      if (snapshot.exists()) {
        const cartAdsData = snapshot.val();
        const cartAdsList = Object.entries(cartAdsData).map(([id, cartAd]) => ({
          id,
          ...(cartAd as Omit<CartAd, 'id'>)
        }));
        setCartAds(cartAdsList);
      } else {
        setCartAds([]);
      }
    });

    // Load categories
    const categoriesRef = ref(db, 'categories');
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const categoriesList = Object.entries(categoriesData).map(([id, category]) => ({
          id,
          ...(category as Omit<Category, 'id'>)
        }));
        setCategories(categoriesList);
      } else {
        setCategories([]);
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
      unsubscribeBanners();
      unsubscribeCoupons();
      unsubscribeCartAds();
      unsubscribeCategories();
      unsubscribeFooter();
    };
  }, []);

  // Image upload function
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', '46c28b1b4faf5b8c3c6b6e8b7e4c7f8a'); // ImgBB API key

    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      throw new Error('Failed to upload image to ImgBB');
    }
  };

  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    setUploadingImage(true);
    try {
      const imageUrl = await uploadImageToImgBB(file);
      callback(imageUrl);
      Swal.fire({
        title: 'Success!',
        text: 'Image uploaded successfully',
        icon: 'success',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to upload image',
        icon: 'error'
      });
    } finally {
      setUploadingImage(false);
    }
  };

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

  // Banner management functions
  const handleAddBanner = async () => {
    if (newBanner.imageUrl) {
      try {
        const bannersRef = ref(db, 'banners');
        await push(bannersRef, {
          ...newBanner,
          createdAt: Date.now()
        });
        
        setNewBanner({
          title: '',
          subtitle: '',
          imageUrl: '',
          linkUrl: '',
          isActive: true
        });
        setShowBannerForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Banner added successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to add banner',
          icon: 'error'
        });
      }
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setNewBanner({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      isActive: banner.isActive
    });
    setShowBannerForm(true);
  };

  const handleUpdateBanner = async () => {
    if (editingBanner && newBanner.imageUrl) {
      try {
        const bannerRef = ref(db, `banners/${editingBanner.id}`);
        await update(bannerRef, {
          ...newBanner,
          updatedAt: Date.now()
        });
        
        setEditingBanner(null);
        setNewBanner({
          title: '',
          subtitle: '',
          imageUrl: '',
          linkUrl: '',
          isActive: true
        });
        setShowBannerForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Banner updated successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update banner',
          icon: 'error'
        });
      }
    }
  };

  const handleDeleteBanner = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the banner',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const bannerRef = ref(db, `banners/${id}`);
        await remove(bannerRef);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Banner has been deleted',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete banner',
          icon: 'error'
        });
      }
    }
  };

  // Coupon management functions
  const handleAddCoupon = async () => {
    if (newCoupon.code && newCoupon.discount) {
      try {
        const couponsRef = ref(db, 'coupons');
        await push(couponsRef, {
          ...newCoupon,
          code: newCoupon.code.toUpperCase(),
          createdAt: Date.now()
        });
        
        setNewCoupon({
          code: '',
          discount: 0,
          isActive: true
        });
        setShowCouponForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Coupon added successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to add coupon',
          icon: 'error'
        });
      }
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      code: coupon.code,
      discount: coupon.discount,
      isActive: coupon.isActive
    });
    setShowCouponForm(true);
  };

  const handleUpdateCoupon = async () => {
    if (editingCoupon && newCoupon.code && newCoupon.discount) {
      try {
        const couponRef = ref(db, `coupons/${editingCoupon.id}`);
        await update(couponRef, {
          ...newCoupon,
          code: newCoupon.code.toUpperCase(),
          updatedAt: Date.now()
        });
        
        setEditingCoupon(null);
        setNewCoupon({
          code: '',
          discount: 0,
          isActive: true
        });
        setShowCouponForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Coupon updated successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update coupon',
          icon: 'error'
        });
      }
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the coupon',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const couponRef = ref(db, `coupons/${id}`);
        await remove(couponRef);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Coupon has been deleted',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete coupon',
          icon: 'error'
        });
      }
    }
  };

  // Cart Ad management functions
  const handleAddCartAd = async () => {
    if (newCartAd.imageUrl) {
      try {
        const cartAdsRef = ref(db, 'cartAds');
        await push(cartAdsRef, {
          ...newCartAd,
          createdAt: Date.now()
        });
        
        setNewCartAd({
          imageUrl: '',
          linkUrl: '',
          isActive: true
        });
        setShowCartAdForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Cart ad added successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to add cart ad',
          icon: 'error'
        });
      }
    }
  };

  const handleEditCartAd = (cartAd: CartAd) => {
    setEditingCartAd(cartAd);
    setNewCartAd({
      imageUrl: cartAd.imageUrl,
      linkUrl: cartAd.linkUrl,
      isActive: cartAd.isActive
    });
    setShowCartAdForm(true);
  };

  const handleUpdateCartAd = async () => {
    if (editingCartAd && newCartAd.imageUrl) {
      try {
        const cartAdRef = ref(db, `cartAds/${editingCartAd.id}`);
        await update(cartAdRef, {
          ...newCartAd,
          updatedAt: Date.now()
        });
        
        setEditingCartAd(null);
        setNewCartAd({
          imageUrl: '',
          linkUrl: '',
          isActive: true
        });
        setShowCartAdForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Cart ad updated successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update cart ad',
          icon: 'error'
        });
      }
    }
  };

  const handleDeleteCartAd = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the cart ad',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const cartAdRef = ref(db, `cartAds/${id}`);
        await remove(cartAdRef);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Cart ad has been deleted',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete cart ad',
          icon: 'error'
        });
      }
    }
  };

  // Category management functions
  const handleAddCategory = async () => {
    if (newCategory.name) {
      try {
        const categoriesRef = ref(db, 'categories');
        await push(categoriesRef, {
          ...newCategory,
          createdAt: Date.now()
        });
        
        setNewCategory({
          name: ''
        });
        setShowCategoryForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Category added successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to add category',
          icon: 'error'
        });
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name
    });
    setShowCategoryForm(true);
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && newCategory.name) {
      try {
        const categoryRef = ref(db, `categories/${editingCategory.id}`);
        await update(categoryRef, {
          ...newCategory,
          updatedAt: Date.now()
        });
        
        setEditingCategory(null);
        setNewCategory({
          name: ''
        });
        setShowCategoryForm(false);
        
        Swal.fire({
          title: 'Success!',
          text: 'Category updated successfully',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update category',
          icon: 'error'
        });
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the category',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const categoryRef = ref(db, `categories/${id}`);
        await remove(categoryRef);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Category has been deleted',
          icon: 'success',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete category',
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Link Status</th>
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Linked to Product
                        </span>
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

  const renderBannersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Banners Management</h2>
        <button
          onClick={() => setShowBannerForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <img 
              src={banner.imageUrl} 
              alt={banner.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{banner.title || 'Untitled'}</h3>
                <div className="flex items-center gap-1">
                  {banner.isActive ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              {banner.subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{banner.subtitle}</p>
              )}
              {banner.linkUrl && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-3 truncate">
                  Link: {banner.linkUrl}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditBanner(banner)}
                  className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCouponsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Coupons Management</h2>
        <button
          onClick={() => setShowCouponForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {coupons.map(coupon => (
                <tr key={coupon.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{coupon.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{coupon.discount} TK</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      coupon.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditCoupon(coupon)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
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

  const renderCartAdsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cart Ads Management</h2>
        <button
          onClick={() => setShowCartAdForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Cart Ad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cartAds.map(cartAd => (
          <div key={cartAd.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <img 
              src={cartAd.imageUrl} 
              alt="Cart Ad"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cart Advertisement</h3>
                <div className="flex items-center gap-1">
                  {cartAd.isActive ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              {cartAd.linkUrl && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-3 truncate">
                  Link: {cartAd.linkUrl}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCartAd(cartAd)}
                  className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCartAd(cartAd.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categories Management</h2>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Products Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map(category => {
                const productCount = products.filter(p => p.category === category.name).length;
                return (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{productCount} products</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
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
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { id: 'products', name: 'Products', icon: Package },
              { id: 'reviews', name: 'Reviews', icon: MessageSquare },
              { id: 'banners', name: 'Banners', icon: Monitor },
              { id: 'coupons', name: 'Coupons', icon: Tag },
              { id: 'cartads', name: 'Cart Ads', icon: Gift },
              { id: 'categories', name: 'Categories', icon: BarChart3 },
              { id: 'footer', name: 'Footer', icon: Building }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
        {activeTab === 'banners' && renderBannersTab()}
        {activeTab === 'coupons' && renderCouponsTab()}
        {activeTab === 'cartads' && renderCartAdsTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Main Image</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                    <label className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 cursor-pointer flex items-center gap-1">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, (url) => {
                              setNewProduct({...newProduct, imageUrl: url});
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
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
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
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
                  disabled={uploadingImage}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
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

                {/* Review Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Images</label>
                  <div className="space-y-2">
                    {newReview.images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => {
                            const newImages = [...newReview.images];
                            newImages[index] = e.target.value;
                            setNewReview({...newReview, images: newImages});
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="https://example.com/image.jpg"
                        />
                        <label className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 cursor-pointer flex items-center gap-1">
                          <Upload className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingImage}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, (url) => {
                                  const newImages = [...newReview.images];
                                  newImages[index] = url;
                                  setNewReview({...newReview, images: newImages});
                                });
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = newReview.images.filter((_, i) => i !== index);
                            setNewReview({...newReview, images: newImages});
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNewReview({...newReview, images: [...newReview.images, '']})}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Image
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingReview ? handleUpdateReview : handleAddReview}
                  disabled={uploadingImage}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
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

        {/* Banner Form Modal */}
        {showBannerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h3>
                <button
                  onClick={() => {
                    setShowBannerForm(false);
                    setEditingBanner(null);
                    setNewBanner({
                      title: '',
                      subtitle: '',
                      imageUrl: '',
                      linkUrl: '',
                      isActive: true
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter banner title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={newBanner.subtitle}
                    onChange={(e) => setNewBanner({...newBanner, subtitle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter banner subtitle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Image</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newBanner.imageUrl}
                      onChange={(e) => setNewBanner({...newBanner, imageUrl: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/banner.jpg"
                    />
                    <label className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 cursor-pointer flex items-center gap-1">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, (url) => {
                              setNewBanner({...newBanner, imageUrl: url});
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link URL (Optional)</label>
                  <input
                    type="url"
                    value={newBanner.linkUrl}
                    onChange={(e) => setNewBanner({...newBanner, linkUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="bannerActive"
                    checked={newBanner.isActive}
                    onChange={(e) => setNewBanner({...newBanner, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="bannerActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Active Banner
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingBanner ? handleUpdateBanner : handleAddBanner}
                  disabled={uploadingImage}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingBanner ? 'Update Banner' : 'Add Banner'}
                </button>
                <button
                  onClick={() => {
                    setShowBannerForm(false);
                    setEditingBanner(null);
                    setNewBanner({
                      title: '',
                      subtitle: '',
                      imageUrl: '',
                      linkUrl: '',
                      isActive: true
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

        {/* Coupon Form Modal */}
        {showCouponForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                </h3>
                <button
                  onClick={() => {
                    setShowCouponForm(false);
                    setEditingCoupon(null);
                    setNewCoupon({
                      code: '',
                      discount: 0,
                      isActive: true
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="SAVE20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Amount (TK)</label>
                  <input
                    type="number"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({...newCoupon, discount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="100"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="couponActive"
                    checked={newCoupon.isActive}
                    onChange={(e) => setNewCoupon({...newCoupon, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="couponActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Active Coupon
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingCoupon ? handleUpdateCoupon : handleAddCoupon}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
                </button>
                <button
                  onClick={() => {
                    setShowCouponForm(false);
                    setEditingCoupon(null);
                    setNewCoupon({
                      code: '',
                      discount: 0,
                      isActive: true
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

        {/* Cart Ad Form Modal */}
        {showCartAdForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingCartAd ? 'Edit Cart Ad' : 'Add New Cart Ad'}
                </h3>
                <button
                  onClick={() => {
                    setShowCartAdForm(false);
                    setEditingCartAd(null);
                    setNewCartAd({
                      imageUrl: '',
                      linkUrl: '',
                      isActive: true
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Image</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newCartAd.imageUrl}
                      onChange={(e) => setNewCartAd({...newCartAd, imageUrl: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/ad.jpg"
                    />
                    <label className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 cursor-pointer flex items-center gap-1">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, (url) => {
                              setNewCartAd({...newCartAd, imageUrl: url});
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link URL</label>
                  <input
                    type="url"
                    value={newCartAd.linkUrl}
                    onChange={(e) => setNewCartAd({...newCartAd, linkUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cartAdActive"
                    checked={newCartAd.isActive}
                    onChange={(e) => setNewCartAd({...newCartAd, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="cartAdActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Active Cart Ad
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingCartAd ? handleUpdateCartAd : handleAddCartAd}
                  disabled={uploadingImage}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingCartAd ? 'Update Cart Ad' : 'Add Cart Ad'}
                </button>
                <button
                  onClick={() => {
                    setShowCartAdForm(false);
                    setEditingCartAd(null);
                    setNewCartAd({
                      imageUrl: '',
                      linkUrl: '',
                      isActive: true
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

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setNewCategory({
                      name: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category name"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setNewCategory({
                      name: ''
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
