import React, { useEffect, useRef } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
}

export function ChatWindow({ messages }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-850 to-slate-800 p-4 pt-20 pb-40 md:ml-80"
      style={{ 
        height: '100vh', 
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full animate-fade-in">
            <div className="text-center max-w-2xl mx-auto px-4">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-slate-600/20 animate-bounce-in">
                <div className="relative mb-8">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-2xl w-fit mx-auto shadow-xl">
                    <Bot size={32} className="text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 p-1 rounded-full">
                    <Sparkles size={16} className="text-white" />
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Welcome to SenTorial AI
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed mb-8">
                  Your premium AI assistant for SenTorial. I'm here to help with products, orders, and any questions you have!
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
                    <span className="text-purple-400">🕯️</span>
                    <span className="text-slate-300">Product Expert</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                    <span className="text-blue-400">🧮</span>
                    <span className="text-slate-300">Smart Calculator</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
                    <span className="text-green-400">🔗</span>
                    <span className="text-slate-300">Site Navigator</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4">
                    <span className="text-yellow-400">🧠</span>
                    <span className="text-slate-300">Always Learning</span>
                  </div>
                </div>
                
                <div className="mt-8 text-slate-500 text-sm">
                  <p>Start a conversation by typing a message below</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}