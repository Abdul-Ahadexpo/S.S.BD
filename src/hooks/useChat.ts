import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { Message, Chat } from '../types';
import { ChatStorageService } from '../services/chatStorageService';

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTeachModal, setShowTeachModal] = useState(false);
  const [lastUnknownQuestion, setLastUnknownQuestion] = useState('');

  useEffect(() => {
    // Initialize default responses and load chats
    chatService.initializeDefaultResponses();
    loadChats();
  }, []);

  const loadChats = () => {
    const loadedChats = ChatStorageService.getChats();
    const activeChat = ChatStorageService.getActiveChat();
    setChats(loadedChats);
    setActiveChat(activeChat);
  };

  const createNewChat = () => {
    if (chats.length >= 4) return;
    const newChat = ChatStorageService.createNewChat();
    loadChats();
  };

  const selectChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      ChatStorageService.setActiveChat(chatId);
      setActiveChat(chat);
    }
  };

  const deleteChat = (chatId: string) => {
    ChatStorageService.deleteChat(chatId);
    loadChats();
  };
  const sendMessage = async (text: string) => {
    if (!activeChat) return;
    
    setIsLoading(true);
    
    try {
      // Create user message
      const userMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        sender: 'user',
        timestamp: Date.now()
      };
      
      // Add to chat
      ChatStorageService.addMessageToChat(activeChat.id, userMessage);
      
      // Get bot response
      const botResponse = await chatService.getBotResponse(text);
      
      // Check if it's an unknown response
      if (botResponse.includes("I don't know how to answer that now")) {
        setLastUnknownQuestion(text);
        setShowTeachModal(true);
      }
      
      // Send bot message after a short delay for better UX
      setTimeout(async () => {
        const botMessage: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: botResponse,
          sender: 'bot',
          timestamp: Date.now()
        };
        
        ChatStorageService.addMessageToChat(activeChat.id, botMessage);
        loadChats(); // Refresh to show new messages
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleTeachBot = async (question: string, answer: string) => {
    await chatService.addResponse(question, answer);
    setShowTeachModal(false);
    setLastUnknownQuestion('');
  };

  return {
    chats,
    activeChat,
    messages: activeChat?.messages || [],
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    isLoading,
    showTeachModal,
    lastUnknownQuestion,
    onCloseTeachModal: () => setShowTeachModal(false),
    onTeachBot: handleTeachBot
  };
}