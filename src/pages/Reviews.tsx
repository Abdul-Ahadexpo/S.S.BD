import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Calendar, User } from 'lucide-react';

interface Review {
  id: string;
  buyerName: string;
  productName: string;
  reviewText: string;
  purchaseDate: string;
  images: string[];
}

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const reviewsRef = ref(db, 'reviews');
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reviewsList = Object.entries(data).map(([id, review]) => ({
          id,
          ...(review as Omit<Review, 'id'>)
        }));
        setReviews(reviewsList);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Customer Reviews</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-gray-800 dark:text-white">{review.buyerName}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{review.purchaseDate}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{review.productName}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{review.reviewText}</p>
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reviews;