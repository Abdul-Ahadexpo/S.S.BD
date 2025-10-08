import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, MessageCircle, Brain, Users, Download, Upload, CreditCard as Edit2, Save, Zap, Package, Database } from 'lucide-react';
import { chatService } from '../services/chatService';
import { FileService } from '../services/fileService';
import { FileUploadHelp } from './FileUploadHelp';
import { DataUploadHelp } from './DataUploadHelp';
import { BotResponse, UnknownQuestion, Message, ProductData, SiteData } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'responses' | 'unknown' | 'messages' | 'quick' | 'products' | 'data'>('responses');
  const [responses, setResponses] = useState<BotResponse>({});
  const [unknownQuestions, setUnknownQuestions] = useState<UnknownQuestion[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickMessages, setQuickMessages] = useState<string[]>([]);
  const [products, setProducts] = useState<{ [key: string]: ProductData }>({});
  const [siteData, setSiteData] = useState<{ [key: string]: SiteData }>({});
  const [newQuestion, setNewQuestion] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [newQuickMessage, setNewQuickMessage] = useState('');
  const [newProduct, setNewProduct] = useState<Omit<ProductData, 'id'>>({
    name: '',
    price: '',
    description: '',
    category: '',
    inStock: true,
    imageUrl: '',
    features: [],
    specifications: {}
  });
  const [newSiteData, setNewSiteData] = useState<Omit<SiteData, 'id' | 'lastUpdated'>>({
    title: '',
    content: '',
    category: 'general',
    tags: []
  });
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editResponseText, setEditResponseText] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribeResponses = chatService.onResponsesChange(setResponses);
    const unsubscribeUnknown = chatService.onUnknownQuestionsChange(setUnknownQuestions);
    const unsubscribeMessages = chatService.onMessagesChange(setMessages);
    const unsubscribeQuick = chatService.onQuickMessagesChange(setQuickMessages);

    return () => {
      unsubscribeResponses();
      unsubscribeUnknown();
      unsubscribeMessages();
      unsubscribeQuick();
    };
  }, [isOpen]);

  const handleAddResponse = async () => {
    if (newQuestion.trim() && newResponse.trim()) {
      await chatService.addResponse(newQuestion.trim(), newResponse.trim());
      setNewQuestion('');
      setNewResponse('');
    }
  };

  const handleAddQuickMessage = async () => {
    if (newQuickMessage.trim()) {
      await chatService.addQuickMessage(newQuickMessage.trim());
      setNewQuickMessage('');
    }
  };

  const handleDeleteQuickMessage = async (index: number) => {
    if (confirm('Are you sure you want to delete this quick message?')) {
      await chatService.deleteQuickMessage(index);
    }
  };

  const handleAddProduct = async () => {
    if (newProduct.name.trim() && newProduct.price.trim() && newProduct.description.trim() && newProduct.category.trim()) {
      await chatService.addProduct(newProduct);
      setNewProduct({
        name: '',
        price: '',
        description: '',
        category: '',
        inStock: true,
        imageUrl: '',
        features: [],
        specifications: {}
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await chatService.deleteProduct(id);
    }
  };

  const handleUploadProducts = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadError('');
      const products = await FileService.uploadProducts(file);
      await chatService.bulkUploadProducts(products);
      
      event.target.value = '';
      alert(`Successfully uploaded ${products.length} products!`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const handleAddSiteData = async () => {
    if (newSiteData.title.trim() && newSiteData.content.trim()) {
      await chatService.addSiteData(newSiteData);
      setNewSiteData({
        title: '',
        content: '',
        category: 'general',
        tags: []
      });
    }
  };

  const handleDeleteSiteData = async (id: string) => {
    if (confirm('Are you sure you want to delete this site data?')) {
      await chatService.deleteSiteData(id);
    }
  };

  const handleUploadSiteData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadError('');
      const data = await FileService.uploadSiteData(file);
      await chatService.bulkUploadSiteData(data);
      
      event.target.value = '';
      alert(`Successfully uploaded ${data.length} data items!`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const handleDeleteResponse = async (question: string) => {
    if (confirm('Are you sure you want to delete this response?')) {
      await chatService.deleteResponse(question);
    }
  };

  const handleEditResponse = (question: string, response: string) => {
    setEditingResponse(question);
    setEditQuestion(question);
    setEditResponseText(response);
  };

  const handleSaveEdit = async () => {
    if (editQuestion.trim() && editResponseText.trim() && editingResponse) {
      await chatService.updateResponse(editingResponse, editQuestion.trim(), editResponseText.trim());
      setEditingResponse(null);
      setEditQuestion('');
      setEditResponseText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingResponse(null);
    setEditQuestion('');
    setEditResponseText('');
  };

  const handleDownloadUnknown = () => {
    FileService.downloadUnknownQuestions(unknownQuestions);
  };

  const handleDownloadResponses = () => {
    FileService.downloadResponses(responses);
  };

  const handleUploadResponses = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadError('');
      const newResponses = await FileService.uploadResponses(file);
      await chatService.bulkAddResponses(newResponses);
      
      // Reset file input
      event.target.value = '';
      
      alert(`Successfully uploaded ${Object.keys(newResponses).length} responses!`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const handleTrainFromUnknown = async (question: string, response: string) => {
    await chatService.addResponse(question, response);
    await chatService.deleteUnknownQuestion(question);
  };

  const handleClearMessages = async () => {
    if (confirm('Are you sure you want to clear all messages?')) {
      await chatService.clearAllMessages();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50 animate-fade-in">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 md:p-6 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">Admin Panel</h2>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/40 p-1.5 md:p-2 rounded-full transition-all duration-200 hover-lift focus-ring"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('responses')}
            className={`flex-1 min-w-0 p-2 md:p-4 flex items-center justify-center space-x-1 md:space-x-2 transition-all duration-200 hover-lift ${
              activeTab === 'responses' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Brain size={16} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Responses</span>
          </button>
          <button
            onClick={() => setActiveTab('unknown')}
            className={`flex-1 min-w-0 p-2 md:p-4 flex items-center justify-center space-x-1 md:space-x-2 transition-all duration-200 hover-lift ${
              activeTab === 'unknown' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <MessageCircle size={16} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Unknown ({unknownQuestions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 min-w-0 p-2 md:p-4 flex items-center justify-center space-x-1 md:space-x-2 transition-all duration-200 hover-lift ${
              activeTab === 'messages' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Users size={16} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Messages ({messages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 min-w-0 p-2 md:p-4 flex items-center justify-center space-x-1 md:space-x-2 transition-all duration-200 hover-lift ${
              activeTab === 'quick' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Zap size={16} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Quick ({quickMessages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 min-w-0 p-2 md:p-4 flex items-center justify-center space-x-1 md:space-x-2 transition-all duration-200 hover-lift ${
              activeTab === 'products' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Package size={16} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Products</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 min-w-0 p-2 md:p-4 flex items-center justify-center space-x-1 md:space-x-2 transition-all duration-200 hover-lift ${
              activeTab === 'data' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Database size={16} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Site Data</span>
          </button>
        </div>

        <div className="p-3 md:p-6 overflow-y-auto max-h-[70vh] md:max-h-[60vh]">
          {activeTab === 'responses' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={handleDownloadResponses}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download size={16} />
                  <span>Download Responses</span>
                </button>
                <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer">
                  <Upload size={16} />
                  <span>Upload Responses</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleUploadResponses}
                    className="hidden"
                  />
                </label>
                <FileUploadHelp />
              </div>

              {uploadError && (
                <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
                  {uploadError}
                </div>
              )}

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Add New Response</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Question/Trigger"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <textarea
                    placeholder="Response"
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                    rows={4}
                  />
                  <button
                    onClick={handleAddResponse}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Response</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-semibold">Current Responses</h3>
                {Object.entries(responses).map(([question, response]) => (
                  <div key={question} className="bg-gray-800 rounded-lg p-4">
                    {editingResponse === question ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editQuestion}
                          onChange={(e) => setEditQuestion(e.target.value)}
                          className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="Question/Trigger"
                        />
                        <textarea
                          value={editResponseText}
                          onChange={(e) => setEditResponseText(e.target.value)}
                          className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                          placeholder="Response"
                          rows={4}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center space-x-1 transition-colors"
                          >
                            <Save size={14} />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-purple-300 font-medium">{question}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditResponse(question, response)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteResponse(question)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-300">{response}</p>
                        <div className="text-gray-300 whitespace-pre-wrap">{response}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'unknown' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold">Unknown Questions</h3>
                {unknownQuestions.length > 0 && (
                  <button
                    onClick={handleDownloadUnknown}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                  >
                    <Download size={14} />
                    <span>Download JSON</span>
                  </button>
                )}
              </div>
              {unknownQuestions.map((unknown) => (
                <UnknownQuestionCard
                  key={unknown.id}
                  unknown={unknown}
                  onTrain={handleTrainFromUnknown}
                  onDelete={() => chatService.deleteUnknownQuestion(unknown.id)}
                />
              ))}
              {unknownQuestions.length === 0 && (
                <p className="text-gray-400 text-center py-8">No unknown questions yet!</p>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold">All Messages</h3>
                <button
                  onClick={handleClearMessages}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Clear All</span>
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.sender === 'user' ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-gray-300 capitalize">{message.sender}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-white text-sm">{message.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quick' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Add Quick Message</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Quick message text"
                    value={newQuickMessage}
                    onChange={(e) => setNewQuickMessage(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddQuickMessage}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Quick Message</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-semibold">Current Quick Messages</h3>
                {quickMessages.map((message, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-white">{message}</span>
                    <button
                      onClick={() => handleDeleteQuickMessage(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {quickMessages.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No quick messages yet!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => FileService.downloadProducts(products)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download size={16} />
                  <span>Download Products</span>
                </button>
                <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer">
                  <Upload size={16} />
                  <span>Upload Products</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleUploadProducts}
                    className="hidden"
                  />
                </label>
                <DataUploadHelp type="products" />
              </div>

              {uploadError && (
                <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
                  {uploadError}
                </div>
              )}

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Add New Product</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Price (e.g., $24.99)"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <input
                    type="url"
                    placeholder="Image URL (optional)"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                    className="p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <textarea
                  placeholder="Product Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full mt-4 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                  rows={3}
                />
                <div className="flex items-center mt-4 space-x-4">
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={newProduct.inStock}
                      onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})}
                      className="rounded"
                    />
                    <span>In Stock</span>
                  </label>
                  <button
                    onClick={handleAddProduct}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-semibold">Current Products ({Object.keys(products).length})</h3>
                {Object.entries(products).map(([id, product]) => (
                  <div key={id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-purple-300 font-medium">{product.name}</span>
                          <span className="text-green-400 font-bold">{product.price}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            product.inStock ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-1">{product.category}</p>
                        <p className="text-gray-300 text-sm">{product.description}</p>
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded mt-2" />
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {Object.keys(products).length === 0 && (
                  <p className="text-gray-400 text-center py-8">No products added yet!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => FileService.downloadSiteData(siteData)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download size={16} />
                  <span>Download Site Data</span>
                </button>
                <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer">
                  <Upload size={16} />
                  <span>Upload Site Data</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleUploadSiteData}
                    className="hidden"
                  />
                </label>
                <DataUploadHelp type="siteData" />
              </div>

              {uploadError && (
                <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
                  {uploadError}
                </div>
              )}

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Add New Site Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newSiteData.title}
                    onChange={(e) => setNewSiteData({...newSiteData, title: e.target.value})}
                    className="p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <select
                    value={newSiteData.category}
                    onChange={(e) => setNewSiteData({...newSiteData, category: e.target.value as any})}
                    className="p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                    <option value="policy">Policy</option>
                    <option value="faq">FAQ</option>
                  </select>
                </div>
                <textarea
                  placeholder="Content"
                  value={newSiteData.content}
                  onChange={(e) => setNewSiteData({...newSiteData, content: e.target.value})}
                  className="w-full mt-4 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                  rows={4}
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={newSiteData.tags.join(', ')}
                  onChange={(e) => setNewSiteData({...newSiteData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                  className="w-full mt-4 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleAddSiteData}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Site Data</span>
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-semibold">Current Site Data ({Object.keys(siteData).length})</h3>
                {Object.entries(siteData).map(([id, data]) => (
                  <div key={id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-purple-300 font-medium">{data.title}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                            {data.category}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{data.content}</p>
                        {data.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {data.tags.map((tag, index) => (
                              <span key={index} className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteSiteData(id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {Object.keys(siteData).length === 0 && (
                  <p className="text-gray-400 text-center py-8">No site data added yet!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface UnknownQuestionCardProps {
  unknown: UnknownQuestion;
  onTrain: (question: string, response: string) => void;
  onDelete: () => void;
}

function UnknownQuestionCard({ unknown, onTrain, onDelete }: UnknownQuestionCardProps) {
  const [response, setResponse] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  const handleTrain = () => {
    if (response.trim()) {
      onTrain(unknown.question, response.trim());
      setResponse('');
      setIsTraining(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this unknown question?')) {
      onDelete();
    }
  };
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="text-white font-medium">{unknown.question}</p>
          <p className="text-gray-400 text-sm">
            Asked {unknown.count} time{unknown.count !== 1 ? 's' : ''} • {new Date(unknown.timestamp).toLocaleDateString()}
            {unknown.userID && <span> • User: {unknown.userID}</span>}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
            {unknown.count}
          </span>
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {isTraining ? (
        <div className="mt-3 space-y-3">
          <textarea
            placeholder="Type the response for this question..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleTrain}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Train
            </button>
            <button
              onClick={() => setIsTraining(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsTraining(true)}
          className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Brain size={16} />
          Train Response
        </button>
      )}
    </div>
  );
}