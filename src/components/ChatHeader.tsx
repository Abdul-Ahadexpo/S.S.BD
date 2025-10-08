import React from 'react';
import { Bot, Menu } from 'lucide-react';
import { Chat } from '../types';

interface ChatHeaderProps {
  activeChat: Chat | null;
  onToggleSidebar: () => void;
}

export function ChatHeader({ activeChat, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-slate-800/95 backdrop-blur-xl text-white p-4 shadow-lg border-b border-slate-700/50 md:left-80">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden bg-slate-700/50 hover:bg-slate-600/50 p-2 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
            <Bot size={20} className="text-white" />
          </div>
          
          <div>
            <h1 className="font-bold text-lg text-white">
              {activeChat?.title || 'SenTorial AI'}
            </h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400 text-sm">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {activeChat && (
            <div className="hidden sm:flex items-center space-x-2 text-slate-400 text-sm">
              <span>{activeChat.messages.length} messages</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}