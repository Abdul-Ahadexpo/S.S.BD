import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ChatWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-20 right-4 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle Chat"
      >
        <AnimatePresence mode="wait">
          {isChatOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Iframe Container */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-4 z-40 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            style={{
              // Responsive positioning and sizing
              bottom: window.innerWidth <= 768 ? '90px' : '90px',
              top: window.innerWidth <= 768 ? '80px' : 'auto',
              width: window.innerWidth <= 768 ? 'calc(100vw - 32px)' : '450px',
              height: window.innerWidth <= 768 ? 'calc(100vh - 160px)' : '600px',
              maxWidth: window.innerWidth <= 768 ? 'none' : '450px',
              maxHeight: window.innerWidth <= 768 ? 'none' : '600px',
            }}
          >
            {/* Chat Header */}
            <div className="bg-green-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">SenTorial Support</h3>
                  <p className="text-xs text-green-100">We're here to help!</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Iframe */}
            <iframe
              src="https://sentorial-chat.vercel.app/"
              className="w-full border-none bg-white"
              title="SenTorial Chat Support"
              style={{ 
                height: window.innerWidth <= 768 ? 'calc(100% - 72px)' : 'calc(100% - 72px)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={toggleChat}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;