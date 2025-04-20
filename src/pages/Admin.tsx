import React, { useState, useEffect } from 'react';
import { ref, push, remove, update, get } from 'firebase/database';
import { db } from '../firebase';
import { Trash2, Plus, Star, Tag, Edit, X, Link as LinkIcon } from 'lucide-react';
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

interface FooterContent {
  address: string;
  phone: string;
  email: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  quickLinks: Array<{
    title: string;
    url: string;
  }>;
}

interface CartAd {
  id: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'categories' | 'footer' | 'ads'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cartAds, setCartAds] = useState<CartAd[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<string | null>(null);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    additionalImages: ['', ''],
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
  const [newCategory, setNewCategory] = useState('');
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [footerContent, setFooterContent] = useState<FooterContent>({
    address: '',
    phone: '',
    email: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    quickLinks: []
  });
  const [newQuickLink, setNewQuickLink] = useState({ title: '', url: '' });
  const [cartAd, setCartAd] = useState<CartAd>({
    id: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
      loadCategories();
      loadReviews();
      loadFooterContent();
      loadCartAds();
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

  const loadFooterContent = async () => {
    const footerRef = ref(db, 'footer');
    const snapshot = await get(footerRef);
    if (snapshot.exists()) {
      setFooterContent(snapshot.val());
    }
  };

  const loadCartAds = async () => {
    const adsRef = ref(db, 'cartAds');
    const snapshot = await get(adsRef);
    if (snapshot.exists()) {
      const adsData = snapshot.val();
      const adsArray = Object.entries(adsData).map(([id, data]) => ({
        id,
        ...(data as Omit<CartAd, 'id'>)
      }));
      setCartAds(adsArray);
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
        additionalImages: ['', ''],
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

  const handleFooterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const footerRef = ref(db, 'footer');
      await update(footerRef, footerContent);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Footer content updated successfully',
        background: '#1f2937',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update footer content',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const handleCartAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        const adRef = ref(db, `cartAds/${editingAd}`);
        await update(adRef, cartAd);
        setEditingAd(null);
      } else {
        const adsRef = ref(db, 'cartAds');
        await push(adsRef, cartAd);
      }
      
      setCartAd({
        id: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true
      });
      
      await loadCartAds();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editingAd ? 'Ad updated successfully' : 'Ad added successfully',
        background: '#1f2937',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: editingAd ? 'Failed to update ad' : 'Failed to add ad',
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
      additionalImages: productToEdit.additionalImages || ['', ''],
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

  const handleDeleteAd = async (adId: string) => {
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
        await loadCartAds();

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Ad has been deleted.',
          background: '#1f2937',
          color: '#fff'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete ad',
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const addQuickLink = () => {
    if (newQuickLink.title && newQuickLink.url) {
      setFooterContent({
        ...footerContent,
        quickLinks: [...footerContent.quickLinks, newQuickLink]
      });
      setNewQuickLink({ title: '', url: '' });
    }
  };

  const removeQuickLink = (index: number) => {
    const newQuickLinks = [...footerContent.quickLinks];
    newQuickLinks.splice(index, 1);
    setFooterContent({ ...footerContent, quickLinks: newQuickLinks });
  };

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
          onClick={() => setActiveTab('footer')}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'footer'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          Manage Footer
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
            activeTab === 'ads'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          Cart Ads
        </button>
      </div>

      {activeTab === 'products' && (
        <>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Additional Images URLs</label>
                  {product.additionalImages.map((url, index) => (
                    <input
                      key={index}
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newImages = [...product.additionalImages];
                        newImages[index] = e.target.value;
                        setProduct({ ...product, additionalImages: newImages });
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-2"
                      placeholder={`Additional Image ${index + 1} URL`}
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
                          additionalImages: ['', ''],
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
                {products.map((product) => (
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

      {activeTab === 'footer' && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Footer Management</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <form onSubmit={handleFooterSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Address</label>
                  <input
                    type="text"
                    value={footerContent.address}
                    onChange={(e) => setFooterContent({ ...footerContent, address: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Phone</label>
                  <input
                    type="text"
                    value={footerContent.phone}
                    onChange={(e) => setFooterContent({ ...footerContent, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email</label>
                <input
                  type="email"
                  value={footerContent.email}
                  onChange={(e) => setFooterContent({ ...footerContent, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Facebook URL</label>
                  <input
                    type="url"
                    value={footerContent.socialLinks.facebook}
                    onChange={(e) => setFooterContent({
                      ...footerContent,
                      socialLinks: { ...footerContent.socialLinks, facebook: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={footerContent.socialLinks.instagram}
                    onChange={(e) => setFooterContent({
                      ...footerContent,
                      socialLinks: { ...footerContent.socialLinks, instagram: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Twitter URL</label>
                  <input
                    type="url"
                    value={footerContent.socialLinks.twitter}
                    onChange={(e) => setFooterContent({
                      ...footerContent,
                      socialLinks: { ...footerContent.socialLinks, twitter: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Quick Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Link Title"
                    value={newQuickLink.title}
                    onChange={(e) => setNewQuickLink({ ...newQuickLink, title: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder="Link URL"
                    value={newQuickLink.url}
                    onChange={(e) => setNewQuickLink({ ...newQuickLink, url: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={addQuickLink}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-4"
                >
                  Add Quick Link
                </button>
                <div className="space-y-2">
                  {footerContent.quickLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                      <div>
                        <span className="font-medium dark:text-white">{link.title}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{link.url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuickLink(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Update Footer
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">
            {editingAd ? 'Edit Cart Ad' : 'Add Cart Ad'}
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <form onSubmit={handleCartAdSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Image URL</label>
                <input
                  type="url"
                  value={cartAd.imageUrl}
                  onChange={(e) => setCartAd({ ...cartAd, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Link URL</label>
                <input
                  type="url"
                  value={cartAd.linkUrl}
                  onChange={(e) => setCartAd({ ...cartAd, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={cartAd.isActive}
                  onChange={(e) => setCartAd({ ...cartAd, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                  Active
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  {editingAd ? 'Update Ad' : 'Add Ad'}
                </button>
                {editingAd && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAd(null);
                      setCartAd({
                        id: '',
                        imageUrl: '',
                        linkUrl: '',
                        isActive: true
                      });
                    }}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Current Ads</h2>
            <div className="grid grid-cols-1 gap-6">
              {cartAds.map((ad) => (
                <div key={ad.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={ad.imageUrl}
                        alt="Ad"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <a
                            href={ad.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                          >
                            {ad.linkUrl}
                          </a>
                        </div>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-sm ${
                          ad.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ad.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setCartAd(ad);
                          setEditingAd(ad.id);
                        }}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
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
