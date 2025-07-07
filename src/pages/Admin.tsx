import React, { useState, useEffect } from 'react';
import { ref, push, remove, update, get } from 'firebase/database';
import { db } from '../firebase';
import { Trash2, Plus, Star, Tag, Edit, X, Search, Ticket } from 'lucide-react';
import Swal from 'sweetalert2';

interface ProductVariant {
  color: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  additionalImages: string[];
  quantity: string;
  category: string;
  variants?: ProductVariant[];
  createdAt: number;
}

interface Review {
  id: string;
  buyerName: string;
  productName: string;
  reviewText: string;
  purchaseDate: string;
  images: string[];
}

interface Category {
  id: string;
  name: string;
}

interface Advertisement {
  id: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  isActive: boolean;
}

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'categories' | 'ads' | 'coupons'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    additionalImages: ['', '', ''],
    quantity: '',
    category: '',
    variants: [] as ProductVariant[],
    createdAt: Date.now()
  });
  const [newVariant, setNewVariant] = useState({ color: '', stock: 0 });
  const [review, setReview] = useState<Review>({
    id: '',
    buyerName: '',
    productName: '',
    reviewText: '',
    purchaseDate: '',
    images: []
  });
  const [advertisement, setAdvertisement] = useState<Omit<Advertisement, 'id'>>({
    imageUrl: '',
    linkUrl: '',
    isActive: true
  });
  const [coupon, setCoupon] = useState<Omit<Coupon, 'id'>>({
    code: '',
    discount: 0,
    isActive: true
  });
  const [newCategory, setNewCategory] = useState('');
  const [editedCategoryName, setEditedCategoryName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
      loadCategories();
      loadReviews();
      loadAdvertisements();
      loadCoupons();
    }
  }, [isAuthenticated]);

  const loadProducts = async () => {
    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);
    if (snapshot.exists()) {
      const productsData = snapshot.val();
      const productsArray = Object.entries(productsData).map(([id, data]) => ({
        id,
        ...(data as Omit<Product, 'id'>)
      })).sort((a, b) => b.createdAt - a.createdAt);
      setProducts(productsArray);
    }
  };

  const loadCategories = async () => {
    const categoriesRef = ref(db, 'categories');
    const snapshot = await get(categoriesRef);
    if (snapshot.exists()) {
      const categoriesData = snapshot.val();
      const categoriesArray = Object.entries(categoriesData).map(([id, data]) => ({
        id,
        ...(data as Omit<Category, 'id'>)
      }));
      setCategories(categoriesArray);
    }
  };

  const loadReviews = async () => {
    const reviewsRef = ref(db, 'reviews');
    const snapshot = await get(reviewsRef);
    if (snapshot.exists()) {
      const reviewsData = snapshot.val();
      const reviewsArray = Object.entries(reviewsData).map(([id, data]) => ({
        id,
        ...(data as Omit<Review, 'id'>)
      }));
      setReviews(reviewsArray);
    }
  };

  const loadAdvertisements = async () => {
    const adsRef = ref(db, 'cartAds');
    const snapshot = await get(adsRef);
    if (snapshot.exists()) {
      const adsData = snapshot.val();
      const adsArray = Object.entries(adsData).map(([id, data]) => ({
        id,
        ...(data as Omit<Advertisement, 'id'>)
      }));
      setAdvertisements(adsArray);
    }
  };

  const loadCoupons = async () => {
    const couponsRef = ref(db, 'coupons');
    const snapshot = await get(couponsRef);
    if (snapshot.exists()) {
      const couponsData = snapshot.val();
      const couponsArray = Object.entries(couponsData).map(([id, data]) => ({
        id,
        ...(data as Omit<Coupon, 'id'>)
      }));
      setCoupons(couponsArray);
    }
  };

  const authenticate = async () => {
    const { value: password } = await Swal.fire({
      title: 'Admin Authentication',
      input: 'password',
      inputLabel: 'Password',
      inputPlaceholder: 'Enter admin password',
      showCancelButton: true,
      background: '#1f2937',
      color: '#fff'
    });

    if (password === 'Niharuka1829') {
      setIsAuthenticated(true);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Incorrect password',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const addVariant = () => {
    if (newVariant.color && newVariant.stock > 0) {
      setProduct({
        ...product,
        variants: [...(product.variants || []), newVariant]
      });
      setNewVariant({ color: '', stock: 0 });
    }
  };

  const removeVariant = (index: number) => {
    const newVariants = [...(product.variants || [])];
    newVariants.splice(index, 1);
    setProduct({ ...product, variants: newVariants });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...product,
        additionalImages: product.additionalImages.filter(url => url.trim() !== ''),
        createdAt: Date.now()
      };

      if (editingProduct) {
        const productRef = ref(db, `products/${editingProduct}`);
        await update(productRef, productData);
        setEditingProduct(null);
      } else {
        const productsRef = ref(db, 'products');
        await push(productsRef, productData);
      }
      
      setProduct({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        additionalImages: ['', '', ''],
        quantity: '',
        category: '',
        variants: [],
        createdAt: Date.now()
      });

      await loadProducts();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editingProduct ? 'Product updated successfully' : 'Product added successfully',
        background: '#1f2937',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: editingProduct ? 'Failed to update product' : 'Failed to add product',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (review.images.length > 3 || review.images.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please provide 1-3 images for the review',
        background: '#1f2937',
        color: '#fff'
      });
      return;
    }

    try {
      if (editingReview) {
        const reviewRef = ref(db, `reviews/${editingReview}`);
        await update(reviewRef, {
          buyerName: review.buyerName,
          productName: review.productName,
          reviewText: review.reviewText,
          purchaseDate: review.purchaseDate,
          images: review.images
        });
        setEditingReview(null);
      } else {
        const reviewsRef = ref(db, 'reviews');
        await push(reviewsRef, review);
      }
      
      setReview({
        id: '',
        buyerName: '',
        productName: '',
        reviewText: '',
        purchaseDate: '',
        images: []
      });

      await loadReviews();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editingReview ? 'Review updated successfully' : 'Review added successfully',
        background: '#1f2937',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: editingReview ? 'Failed to update review' : 'Failed to add review',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        const categoryRef = ref(db, `categories/${editingCategory}`);
        await update(categoryRef, { name: editedCategoryName });
        setEditingCategory(null);
        setEditedCategoryName('');
      } else {
        const categoriesRef = ref(db, 'categories');
        await push(categoriesRef, { name: newCategory });
        setNewCategory('');
      }
      
      await loadCategories();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editingCategory ? 'Category updated successfully' : 'Category added successfully',
        background: '#1f2937',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: editingCategory ? 'Failed to update category' : 'Failed to add category',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleAdvertisementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAd) {
        const adRef = ref(db, `cartAds/${editingAd}`);
        await update(adRef, advertisement);
        setEditingAd(null);
      } else {
        const adsRef = ref(db, 'cartAds');
        await push(adsRef, advertisement);
      }
      
      setAdvertisement({
        imageUrl: '',
        linkUrl: '',
        isActive: true
      });

      await loadAdvertisements();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editingAd ? 'Advertisement updated successfully' : 'Advertisement added successfully',
        background: '#1f2937',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: editingAd ? 'Failed to update advertisement' : 'Failed to add advertisement',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCoupon) {
        const couponRef = ref(db, `coupons/${editingCoupon}`);
        await update(couponRef, coupon);
        setEditingCoupon(null);
      } else {
        const couponsRef = ref(db, 'coupons');
        await push(couponsRef, coupon);
      }
      
      setCoupon({
        code: '',
        discount: 0,
        isActive: true
      });

      await loadCoupons();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editingCoupon ? 'Coupon updated successfully' : 'Coupon added successfully',
        background: '#1f2937',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: editingCoupon ? 'Failed to update coupon' : 'Failed to add coupon',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleEditProduct = (productToEdit: Product) => {
    setProduct({
      name: productToEdit.name,
      description: productToEdit.description,
      price: productToEdit.price,
      imageUrl: productToEdit.imageUrl,
      additionalImages: productToEdit.additionalImages || ['', '', ''],
      quantity: productToEdit.quantity,
      category: productToEdit.category,
      variants: productToEdit.variants || [],
      createdAt: productToEdit.createdAt
    });
    setEditingProduct(productToEdit.id);
  };

  const handleEditReview = (reviewToEdit: Review) => {
    setReview(reviewToEdit);
    setEditingReview(reviewToEdit.id);
  };

  const handleEditCategory = (category: Category) => {
    setEditedCategoryName(category.name);
    setEditingCategory(category.id);
  };

  const handleEditAdvertisement = (ad: Advertisement) => {
    setAdvertisement({
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      isActive: ad.isActive
    });
    setEditingAd(ad.id);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setCoupon({
      code: coupon.code,
      discount: coupon.discount,
      isActive: coupon.isActive
    });
    setEditingCoupon(coupon.id);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        background: '#1f2937',
        color: '#fff'
      });

      if (result.isConfirmed) {
        const productRef = ref(db, `products/${productId}`);
        await remove(productRef);
        await loadProducts();

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Product has been deleted.',
          background: '#1f2937',
          color: '#fff'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete product',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        background: '#1f2937',
        color: '#fff'
      });

      if (result.isConfirmed) {
        const reviewRef = ref(db, `reviews/${reviewId}`);
        await remove(reviewRef);
        await loadReviews();

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Review has been deleted.',
          background: '#1f2937',
          color: '#fff'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete review',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        background: '#1f2937',
        color: '#fff'
      });

      if (result.isConfirmed) {
        const categoryRef = ref(db, `categories/${categoryId}`);
        await remove(categoryRef);
        await loadCategories();

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Category has been deleted.',
          background: '#1f2937',
          color: '#fff'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete category',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleDeleteAdvertisement = async (adId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        background: '#1f2937',
        color: '#fff'
      });

      if (result.isConfirmed) {
        const adRef = ref(db, `cartAds/${adId}`);
        await remove(adRef);
        await loadAdvertisements();

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Advertisement has been deleted.',
          background: '#1f2937',
          color: '#fff'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete advertisement',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        background: '#1f2937',
        color: '#fff'
      });

      if (result.isConfirmed) {
        const couponRef = ref(db, `coupons/${couponId}`);
        await remove(couponRef);
        await loadCoupons();

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Coupon has been deleted.',
          background: '#1f2937',
          color: '#fff'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete coupon',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <button
          onClick={authenticate}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-lg"
        >
          Login as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'products'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          <Plus className="inline-block mr-2" size={20} />
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'categories'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          <Tag className="inline-block mr-2" size={20} />
          Manage Categories
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'reviews'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          <Star className="inline-block mr-2" size={20} />
          Manage Reviews
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'ads'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          <Plus className="inline-block mr-2" size={20} />
          Manage Ads
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'coupons'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          <Ticket className="inline-block mr-2" size={20} />
          Manage Coupons
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h1>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => setProduct({ ...product, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Price</label>
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Description</label>
                  <textarea
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Main Image URL</label>
                  <input
                    type="url"
                    value={product.imageUrl}
                    onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Additional Image URLs (Optional)</label>
                  {[0, 1, 2].map((index) => (
                    <input
                      key={index}
                      type="url"
                      placeholder={`Additional Image URL ${index + 1}`}
                      value={product.additionalImages[index] || ''}
                      onChange={(e) => {
                        const newImages = [...product.additionalImages];
                        newImages[index] = e.target.value;
                        setProduct({ ...product, additionalImages: newImages });
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Category</label>
                  <select
                    value={product.category}
                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Quantity</label>
                  <select
                    value={product.quantity}
                    onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select quantity status</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Pre-order">Pre-order</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">Product Variants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Color"
                      value={newVariant.color}
                      onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={newVariant.stock || ''}
                      onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-4"
                  >
                    Add Variant
                  </button>
                  <div className="space-y-2">
                    {product.variants?.map((variant, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                        <span className="dark:text-white">
                          {variant.color} - Stock: {variant.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-lg"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setProduct({
                          name: '',
                          description: '',
                          price: 0,
                          imageUrl: '',
                          additionalImages: ['', '', ''],
                          quantity: '',
                          category: '',
                          variants: [],
                          createdAt: Date.now()
                        });
                      }}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-lg"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Current Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-md">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">{product.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{product.price} TK</p>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Stock: {product.quantity}</p>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Category: {product.category}</p>
                    {product.variants && product.variants.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 dark:text-white">Variants:</h4>
                        <div className="space-y-1">
                          {product.variants.map((variant, index) => (
                            <p key={index} className="text-sm text-gray-500 dark:text-gray-400">
                              {variant.color} - Stock: {variant.stock}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                      >
                        <Edit className="mr-2" size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                      >
                        <Trash2 className="mr-2" size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Category Management</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {editingCategory ? 'Edit Category Name' : 'New Category Name'}
                </label>
                <input
                  type="text"
                  value={editingCategory ? editedCategoryName : newCategory}
                  onChange={(e) => editingCategory ? setEditedCategoryName(e.target.value) : setNewCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-lg"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setEditedCategoryName('');
                    }}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Current Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <span className="text-lg font-medium dark:text-white">{category.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">
            {editingReview ? 'Edit Review' : 'Add Customer Review'}
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Buyer Name</label>
                  <input
                    type="text"
                    value={review.buyerName}
                    onChange={(e) => setReview({ ...review, buyerName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={review.productName}
                    onChange={(e) => setReview({ ...review, productName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Review Text</label>
                <textarea
                  value={review.reviewText}
                  onChange={(e) => setReview({ ...review, reviewText: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={review.purchaseDate}
                  onChange={(e) => setReview({ ...review, purchaseDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Review Images (1-3 required)</label>
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    type="url"
                    placeholder={`Image URL ${index + 1}`}
                    value={review.images[index] || ''}
                    onChange={(e) => {
                      const newImages = [...review.images];
                      if (e.target.value) {
                        newImages[index] = e.target.value;
                      } else {
                        newImages.splice(index, 1);
                      }
                      setReview({ ...review, images: newImages.filter(Boolean) });
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required={index === 0}
                  />
                ))}
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-lg"
                >
                  {editingReview ? 'Update Review' : 'Add Review'}
                </button>
                {editingReview && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReview(null);
                      setReview({
                        id: '',
                        buyerName: '',
                        productName: '',
                        reviewText: '',
                        purchaseDate: '',
                        images: []
                      });
                    }}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Current Reviews</h2>
            <div className="grid grid-cols-1 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white">{review.productName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {review.buyerName} on {review.purchaseDate}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{review.reviewText}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">
            {editingAd ? 'Edit Advertisement' : 'Add New Advertisement'}
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <form onSubmit={handleAdvertisementSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Image URL</label>
                <input
                  type="url"
                  value={advertisement.imageUrl}
                  onChange={(e) => setAdvertisement({ ...advertisement, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Link URL</label>
                <input
                  type="url"
                  value={advertisement.linkUrl}
                  onChange={(e) => setAdvertisement({ ...advertisement, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={advertisement.isActive}
                  onChange={(e) => setAdvertisement({ ...advertisement, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                  Active
                </label>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-lg"
                >
                  {editingAd ? 'Update Advertisement' : 'Add Advertisement'}
                </button>
                {editingAd && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAd(null);
                      setAdvertisement({
                        imageUrl: '',
                        linkUrl: '',
                        isActive: true
                      });
                    }}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Current Advertisements</h2>
            <div className="grid grid-cols-1 gap-6">
              {advertisements.map((ad) => (
                <div key={ad.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <img src={ad.imageUrl} alt="Advertisement" className="w-full h-40 object-cover rounded-lg mb-4" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{ad.linkUrl}</p>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          ad.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {ad.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditAdvertisement(ad)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteAdvertisement(ad.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">
            {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <form onSubmit={handleCouponSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={coupon.code}
                  onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Discount Amount (TK)</label>
                <input
                  type="number"
                  value={coupon.discount}
                  onChange={(e) => setCoupon({ ...coupon, discount: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={coupon.isActive}
                  onChange={(e) => setCoupon({ ...coupon, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="couponActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                  Active
                </label>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-lg"
                >
                  {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
                </button>
                {editingCoupon && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCoupon(null);
                      setCoupon({
                        code: '',
                        discount: 0,
                        isActive: true
                      });
                    }}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Current Coupons</h2>
            <div className="grid grid-cols-1 gap-6">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white">{coupon.code}</h3>
                      <p className="text-gray-600 dark:text-gray-300">Discount: {coupon.discount} TK</p>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          coupon.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;