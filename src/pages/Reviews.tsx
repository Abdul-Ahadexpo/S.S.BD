import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { db } from '../firebase';
import { Calendar, User, Star, Search, X, Plus, Upload, Settings, CreditCard as Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface Review {
  id: string;
  buyerName: string;
  productName: string;
  reviewText: string;
  purchaseDate: string;
  images: string[];
  timestamp?: number;
}

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [userOrderedProducts, setUserOrderedProducts] = useState<string[]>([]);
  const [isCustomProductName, setIsCustomProductName] = useState(false);
  const [formData, setFormData] = useState({
    buyerName: '',
    productName: '',
    reviewText: '',
    purchaseDate: new Date().toISOString().split('T')[0], // Auto-set to today
    images: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load user's ordered products from local storage
    const loadUserOrderedProducts = () => {
      const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
      const orderHistory = profileData.orderHistory || [];
      
      // Extract unique product names from order history
      const productNames = new Set<string>();
      orderHistory.forEach((order: any) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            if (item.name) {
              productNames.add(item.name);
            }
          });
        }
      });
      
      // Check if the product name is in the user's order history
      setUserOrderedProducts(Array.from(productNames));
    };

    loadUserOrderedProducts();

    const reviewsRef = ref(db, 'reviews');
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reviewsList = Object.entries(data).map(([id, review]) => ({
          id,
          ...(review as Omit<Review, 'id'>)
        }));
        
        const sortedReviews = reviewsList.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          return Math.random() - 0.5;
        });
        
        setReviews(sortedReviews);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredReviews = reviews.filter(review => 
    (review.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (review.buyerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (review.reviewText || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, imageUrl]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    try {
      let reviewId;
      let reviewRef;

      if (editingReview) {
        // Update existing review
        reviewId = editingReview.id;
        reviewRef = ref(db, `reviews/${reviewId}`);
      } else {
        // Create new review
        const reviewsRef = ref(db, 'reviews');
        const newReviewRef = push(reviewsRef);
        reviewId = newReviewRef.key;
        reviewRef = newReviewRef;
      }

      const reviewData = {
        ...formData,
        id: reviewId,
        timestamp: editingReview ? editingReview.timestamp : Date.now()
      };

      await set(reviewRef, reviewData);

      // Send email notification only for new reviews
      if (!editingReview) {
        const emailData = {
          access_key: "78bafe1f-05fd-4f4a-bd3b-c12ec189a7e7",
          subject: `New Customer Review - ${formData.productName}`,
          from_name: "SenTorial Reviews",
          message: `
NEW CUSTOMER REVIEW SUBMITTED

Review Details:
- Customer Name: ${formData.buyerName}
- Product Name: ${formData.productName}
- Purchase Date: ${formData.purchaseDate}
- Review: ${formData.reviewText}

Images: ${formData.images.length} image(s) uploaded
Review ID: ${reviewId}

Time: ${new Date().toLocaleString()}
          `
        };

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }
      }

      Swal.fire({
        title: editingReview ? 'Review Updated!' : 'Review Submitted!',
        text: editingReview ? 'Your review has been updated successfully!' : 'Thank you for your review! It has been submitted successfully.',
        icon: 'success',
        confirmButtonText: 'Great!'
      });

      // Reset form
      setFormData({
        buyerName: '',
        productName: '',
        reviewText: '',
        purchaseDate: '',
        images: []
      });
      setEditingReview(null);
      setShowForm(false);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: editingReview ? 'Failed to update review. Please try again.' : 'Failed to submit your review. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
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
        text: 'You can now manage reviews',
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

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    // Check if the product name is in the user's order history
    const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
    const orderHistory = profileData.orderHistory || [];
    const productNames = new Set<string>();
    orderHistory.forEach((order: any) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (item.name) {
            productNames.add(item.name);
          }
        });
      }
    });
    const orderedProducts = Array.from(productNames);
    setIsCustomProductName(!orderedProducts.includes(review.productName));
    setFormData({
      buyerName: review.buyerName,
      productName: review.productName,
      reviewText: review.reviewText,
      purchaseDate: review.purchaseDate,
      images: review.images || []
    });
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId: string, productName: string) => {
    const result = await Swal.fire({
      title: 'Delete Review',
      text: `Are you sure you want to delete the review for "${productName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        const reviewRef = ref(db, `reviews/${reviewId}`);
        await remove(reviewRef);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Review has been deleted successfully',
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

  const showImagePopup = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Customer Reviews</h1>
      
      {/* Admin Button */}
      <div className="text-center mb-6">
        <button
          onClick={handleAdminLogin}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
        >
          <Settings className="h-4 w-4" />
          <span>Admin Panel</span>
        </button>
      </div>

      {/* Floating Add Review Button */}
      <motion.button
        onClick={() => setShowForm(true)}
        className="fixed bottom-32 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Add Review"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Search Bar */}
      <div className="max-w-sm sm:max-w-md mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search reviews by product or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-2.5 sm:left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
      </div>

      {/* Reviews Count */}
      <div className="text-center mb-4 sm:mb-6 px-2">
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Showing {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} 
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-blue-300" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white truncate">{review.buyerName}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full self-start sm:self-center">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">{review.purchaseDate}</span>
                </div>
              </div>
                
                {/* Admin Controls */}
                {isAdminAuthenticated && (
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id, review.productName)}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
                
              <div className="flex items-start space-x-2 mb-3 sm:mb-4">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white leading-tight">{review.productName}</h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 italic leading-relaxed">{review.reviewText}</p>
              </div>
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {review.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square cursor-pointer group rounded-lg overflow-hidden"
                      onClick={() => showImagePopup(image)}
                    >
                      <img
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Reviews Message */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4">
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
            {searchTerm ? 'No reviews found matching your search.' : 'No reviews available yet.'}
          </p>
        </div>
      )}

      {/* Image Popup */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-xs sm:max-w-2xl lg:max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-8 sm:-top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Review"
              className="w-full h-auto max-h-[70vh] sm:max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Review Submission Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {editingReview ? 'Edit Review' : 'Write a Review'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingReview(null);
                      setIsCustomProductName(false);
                      setFormData({
                        buyerName: '',
                        productName: '',
                        reviewText: '',
                        purchaseDate: new Date().toISOString().split('T')[0],
                        images: []
                      });
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={formData.buyerName}
                        onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Product Name *
                      </label>
                      {userOrderedProducts.length > 0 && !isCustomProductName ? (
                        <div className="space-y-2">
                          <select
                            value={formData.productName}
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                setIsCustomProductName(true);
                                setFormData({ ...formData, productName: '' });
                              } else {
                                setFormData({ ...formData, productName: e.target.value });
                              }
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select a product you've ordered</option>
                            {userOrderedProducts.map((productName, index) => (
                              <option key={index} value={productName}>
                                {productName}
                              </option>
                            ))}
                            <option value="custom">Other product (type manually)</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setIsCustomProductName(true)}
                            className="text-sm text-blue-500 hover:text-blue-600 underline"
                          >
                            Can't find your product? Click here to type manually
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formData.productName}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="Enter the product name"
                          />
                          {userOrderedProducts.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomProductName(false);
                                setFormData({ ...formData, productName: '' });
                              }}
                              className="text-sm text-blue-500 hover:text-blue-600 underline"
                            >
                              Select from your ordered products instead
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Purchase Date * (Auto-set to today)
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Date is automatically set to today. You can change it if needed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Your Review *
                    </label>
                    <textarea
                      value={formData.reviewText}
                      onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      required
                      placeholder="Share your experience with this product..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Product Images (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="review-image-upload"
                      />
                      <label
                        htmlFor="review-image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Click to upload images or drag and drop
                        </span>
                        <span className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB each
                        </span>
                      </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingReview(null);
                        setIsCustomProductName(false);
                        setIsCustomProductName(false);
                        setFormData({
                          buyerName: '',
                          productName: '',
                          reviewText: '',
                          purchaseDate: new Date().toISOString().split('T')[0],
                          images: []
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
                          <span>{editingReview ? 'Updating...' : 'Submitting...'}</span>
                        </>
                      ) : (
                        <span>{editingReview ? 'Update Review' : 'Submit Review'}</span>
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

export default Reviews;