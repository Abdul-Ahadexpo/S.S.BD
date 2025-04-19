import React from 'react';
import { HelpCircle } from 'lucide-react';
import Swal from 'sweetalert2';

function HelpGuide() {
  const showGuide = () => {
    Swal.fire({
      title: 'How to Use Spin Strike',
      html: `
        <div class="text-left space-y-4">
          <div>
            <h3 class="text-lg font-bold mb-2">Ordering Process:</h3>
            <ol class="list-decimal list-inside space-y-2">
              <li>Browse products and select your desired items</li>
              <li>Choose color variants if available</li>
              <li>Add items to your cart</li>
              <li>Review your cart and proceed to checkout</li>
              <li>Fill in your delivery information</li>
              <li>Apply any coupon codes if available</li>
              <li>Place your order</li>
            </ol>
          </div>
          
          <div>
            <h3 class="text-lg font-bold mb-2">Pre-order Information:</h3>
            <ul class="list-disc list-inside space-y-2">
              <li>Pre-order requires 60% advance payment</li>
              <li>Send payment to bKash: 01722786111</li>
              <li>Include your order number in the payment reference</li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-lg font-bold mb-2">Delivery Information:</h3>
            <ul class="list-disc list-inside space-y-2">
              <li>Standard delivery time: 3-5 working days</li>
              <li>Delivery charge: 120 TK</li>
              <li>Free delivery on orders above 2000 TK</li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-lg font-bold mb-2">Need Help?</h3>
            <p>Contact us through:</p>
            <ul class="list-disc list-inside space-y-2">
              <li>Phone: 01722786111</li>
              <li>Email: support@spinstrike.com</li>
              <li>Facebook Messenger</li>
            </ul>
          </div>
        </div>
      `,
      width: 600,
      confirmButtonText: 'Got it!',
      showCloseButton: true,
      customClass: {
        container: 'help-guide-modal'
      }
    });
  };

  return (
    <button
      onClick={showGuide}
      className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
      aria-label="Help Guide"
    >
      <HelpCircle className="h-6 w-6" />
    </button>
  );
}

export default HelpGuide;