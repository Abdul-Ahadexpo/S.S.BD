import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { TeachBotModal } from './components/TeachBotModal';
import { useChat } from './hooks/useChat';
import { QuickMessages } from './components/QuickMessages';

function App() {
  const { 
    chats,
    activeChat,
    messages, 
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage, 
    isLoading, 
    showTeachModal, 
    lastUnknownQuestion, 
    onCloseTeachModal, 
    onTeachBot 
  } = useChat();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAdminLogin = () => {
    setShowAdminLogin(false);
    setShowAdminPanel(true);
  };

  const handleAdminClick = () => {
    setShowAdminLogin(true);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex bg-slate-900 overflow-hidden">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={selectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onAdminClick={handleAdminClick}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatHeader 
          activeChat={activeChat}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <ChatWindow messages={messages} />
        
        <QuickMessages onSendMessage={sendMessage} />
        
        <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
      </div>

      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
      />

      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />

      <TeachBotModal
        isOpen={showTeachModal}
        question={lastUnknownQuestion}
        onClose={onCloseTeachModal}
        onTeach={onTeachBot}
      />

      {isLoading && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce-in backdrop-blur-xl border border-purple-500/30 md:left-[calc(50%+160px)]">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-base font-medium">AI is thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;