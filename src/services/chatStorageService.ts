import { Chat, Message } from '../types';

export class ChatStorageService {
  private static readonly STORAGE_KEY = 'sentorial_chats';
  private static readonly ACTIVE_CHAT_KEY = 'sentorial_active_chat';
  private static readonly MAX_CHATS = 4;

  static getChats(): Chat[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading chats:', error);
      return [];
    }
  }

  static saveChats(chats: Chat[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }

  static createNewChat(): Chat {
    const chats = this.getChats();
    const chatNumber = chats.length + 1;
    
    const newChat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `New Chat ${chatNumber}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Limit to MAX_CHATS
    if (chats.length >= this.MAX_CHATS) {
      chats.shift(); // Remove oldest chat
    }

    chats.push(newChat);
    this.saveChats(chats);
    this.setActiveChat(newChat.id);
    
    return newChat;
  }

  static getActiveChat(): Chat | null {
    const chats = this.getChats();
    const activeChatId = localStorage.getItem(this.ACTIVE_CHAT_KEY);
    
    if (activeChatId) {
      const activeChat = chats.find(chat => chat.id === activeChatId);
      if (activeChat) return activeChat;
    }

    // If no active chat or not found, create first chat
    if (chats.length === 0) {
      return this.createNewChat();
    }

    // Set first chat as active
    this.setActiveChat(chats[0].id);
    return chats[0];
  }

  static setActiveChat(chatId: string): void {
    localStorage.setItem(this.ACTIVE_CHAT_KEY, chatId);
  }

  static updateChat(chatId: string, updates: Partial<Chat>): void {
    const chats = this.getChats();
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
      chats[chatIndex] = { ...chats[chatIndex], ...updates, updatedAt: Date.now() };
      this.saveChats(chats);
    }
  }

  static deleteChat(chatId: string): void {
    const chats = this.getChats();
    const filteredChats = chats.filter(chat => chat.id !== chatId);
    this.saveChats(filteredChats);

    // If deleted chat was active, set another as active
    const activeChatId = localStorage.getItem(this.ACTIVE_CHAT_KEY);
    if (activeChatId === chatId) {
      if (filteredChats.length > 0) {
        this.setActiveChat(filteredChats[0].id);
      } else {
        localStorage.removeItem(this.ACTIVE_CHAT_KEY);
      }
    }
  }

  static addMessageToChat(chatId: string, message: Message): void {
    const chats = this.getChats();
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
      chats[chatIndex].messages.push(message);
      chats[chatIndex].updatedAt = Date.now();
      
      // Auto-generate title from first user message
      if (chats[chatIndex].messages.length === 2 && message.sender === 'bot') {
        const firstUserMessage = chats[chatIndex].messages.find(m => m.sender === 'user');
        if (firstUserMessage) {
          chats[chatIndex].title = this.generateChatTitle(firstUserMessage.text);
        }
      }
      
      this.saveChats(chats);
    }
  }

  private static generateChatTitle(firstMessage: string): string {
    // Generate a title from the first message (max 30 chars)
    const title = firstMessage.trim().slice(0, 30);
    return title.length < firstMessage.trim().length ? title + '...' : title;
  }

  static clearAllChats(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ACTIVE_CHAT_KEY);
  }
}