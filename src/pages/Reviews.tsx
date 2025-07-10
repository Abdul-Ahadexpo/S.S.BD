import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Calendar, User, Star, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

interface Review {
  id: string;
  buyerName: string;
  productName: string;
  reviewText: string;
  purchaseDate: string;
  images: string[];
  timestamp?: number; // Add timestamp for sorting
}

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const reviewsRef = ref(db, 'reviews');
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reviewsList = Object.entries(data).map(([id, review]) => ({
          id,
          ...(review as Omit<Review, 'id'>)
        }));
        
        // Sort reviews by timestamp (most recent first) or by purchase date if no timestamp
        const sortedReviews = reviewsList.sort((a, b) => {
          // If both have timestamps, use them
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          
          // If no timestamps, try to parse purchase dates
          const dateA = new Date(a.purchaseDate).getTime();
          const dateB = new Date(b.purchaseDate).getTime();
          
          // If dates are valid, use them
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateB - dateA;
          }
          
          // Fallback to string comparison of purchase dates
          return b.purchaseDate.localeCompare(a.purchaseDate);
        });
        
        setReviews(sortedReviews);
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter reviews based on search term
  const filteredReviews = reviews.filter(review => 
    (review.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (review.buyerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (review.reviewText || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showImagePopup = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Customer Reviews</h1>
      
      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search reviews by product or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Reviews Count */}
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} 
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-white">{review.buyerName}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{review.purchaseDate}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{review.productName}</h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-gray-600 dark:text-gray-300 italic">{review.reviewText}</p>
              </div>
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {review.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square cursor-pointer group"
                      onClick={() => showImagePopup(image)}
                    >
                      <img
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 rounded-lg" />
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
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchTerm ? 'No reviews found matching your search.' : 'No reviews available yet.'}
          </p>
        </div>
      )}

      {/* Image Popup */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Review"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;