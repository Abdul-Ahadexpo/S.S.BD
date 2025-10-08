import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Auto-focus on keypress for desktop only (not mobile)
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only on desktop (screen width > 640px) and not touch devices
      if (window.innerWidth <= 640 || 'ontouchstart' in window) return;
      
      // Don't interfere if user is already typing in an input/textarea
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      // Don't interfere with keyboard shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      // Don't interfere with special keys
      if (e.key.length > 1 && !['Backspace', 'Delete'].includes(e.key)) return;

      // Focus the input and let the character be typed
      if (inputRef.current && !disabled) {
        inputRef.current.focus();
        
        // If it's a printable character, add it to the input
        if (e.key.length === 1) {
          setMessage(prev => prev + e.key);
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-slate-900 via-slate-800/95 to-slate-800/90 backdrop-blur-xl border-t border-slate-700/50 p-6 shadow-2xl md:left-80">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-end space-x-4 p-4">
              {/* Attachment button */}
              <button
                type="button"
                className="text-slate-400 hover:text-slate-300 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                disabled={disabled}
              >
                <Paperclip size={20} />
              </button>
              
              {/* Input field */}
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message SenTorial AI..."
                  disabled={disabled}
                  className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-base py-2"
                  style={{ fontSize: '16px' }}
                />
              </div>
              
              {/* Emoji button */}
              <button
                type="button"
                className="text-slate-400 hover:text-slate-300 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                disabled={disabled}
              >
                <Smile size={20} />
              </button>
              
              {/* Send button */}
              <button
                type="submit"
                disabled={disabled || !message.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
        
        {/* Footer info */}
        <div className="flex items-center justify-center mt-4 text-slate-500 text-xs space-x-4">
          <span>SenTorial AI can make mistakes. Consider checking important information.</span>
        </div>
        
        {/* Typing indicator - now positioned above input */}
        {disabled && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 rounded-2xl px-6 py-3 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-slate-300 text-sm font-medium">SenTorial AI is thinking...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}