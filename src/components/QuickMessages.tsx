import React, { useState, useEffect } from 'react';
import { Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { chatService } from '../services/chatService';

interface QuickMessagesProps {
  onSendMessage: (message: string) => void;
}

export function QuickMessages({ onSendMessage }: QuickMessagesProps) {
  const [quickMessages, setQuickMessages] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = chatService.onQuickMessagesChange(setQuickMessages);
    return unsubscribe;
  }, []);

  if (quickMessages.length === 0) return null;

  const visibleMessages = isExpanded ? quickMessages : quickMessages.slice(0, 3);

  return (
    <div className="fixed bottom-28 left-0 right-0 z-20 px-6 animate-slide-in md:left-80">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1.5 rounded-lg">
                <Zap size={14} className="text-white" />
              </div>
              <span className="text-white text-sm font-semibold">Quick Actions</span>
            </div>
            {quickMessages.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-400 hover:text-white transition-all duration-200 bg-slate-700/50 rounded-lg p-1.5"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {visibleMessages.map((message, index) => (
              <button
                key={index}
                onClick={() => onSendMessage(message)}
                className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 text-purple-200 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all duration-300 border border-purple-500/20 hover:border-purple-400/40 animate-scale-in flex items-center shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="truncate">{message}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}