"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, TrendingUp, MapPin, Users, Clock, Zap, Menu, X, Maximize2, Minimize2, Settings, Moon, Sun } from 'lucide-react';

const FetiiChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hey there! I'm Fetii AI, your intelligent rideshare analytics assistant. I can help you understand movement trends, analyze rideshare patterns, and provide insights about Austin's transportation data. What would you like to know?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => { //@ts-ignore
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    "What are the peak rideshare hours in Austin?",
    "Show me popular pickup locations",
    "Analyze weekend vs weekday patterns",
    "What's the average ride duration?",
    "Which areas have the highest demand?"
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inputValue }),
      });

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response || data.answer || "I apologize, but I couldn't process your request at the moment. Please try again.",
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble connecting to my analytics engine. and try again.",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e:any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const ThinkingDots = () => (
    <div className="flex space-x-1 py-4">
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode 
      ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
      : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    } ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <div className={`sticky top-0 z-40 ${isDarkMode 
        ? 'bg-black/20 backdrop-blur-xl border-white/10' 
        : 'bg-white/20 backdrop-blur-xl border-black/10'
      } border-b transition-all duration-300`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 rounded-xl ${isDarkMode 
                ? 'hover:bg-white/10 text-white' 
                : 'hover:bg-black/10 text-black'
              } transition-all duration-200 hover:scale-105`}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Sparkles className="text-purple-400 animate-spin" size={24} style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="text-purple-400 opacity-20" size={24} />
                </div>
              </div>
              <h1 className={`text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent`}>
                Fetii AI Analytics
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl ${isDarkMode 
                ? 'hover:bg-white/10 text-white' 
                : 'hover:bg-black/10 text-black'
              } transition-all duration-200 hover:scale-105`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-2 rounded-xl ${isDarkMode 
                ? 'hover:bg-white/10 text-white' 
                : 'hover:bg-black/10 text-black'
              } transition-all duration-200 hover:scale-105`}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className={`h-screen p-6 ${isDarkMode 
            ? 'bg-black/20 backdrop-blur-xl border-white/10' 
            : 'bg-white/20 backdrop-blur-xl border-black/10'
          } border-r`}>
            <div className="space-y-6">
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Quick Insights
                </h3>
                <div className="space-y-2">
                  {[
                    { icon: TrendingUp, label: 'Peak Hours', value: '7-9 AM, 5-7 PM' },
                    { icon: MapPin, label: 'Top Location', value: 'Downtown Austin' },
                    { icon: Users, label: 'Active Riders', value: '2.3K' },
                    { icon: Clock, label: 'Avg Duration', value: '18 min' }
                  ].map((stat, i) => (
                    <div key={i} className={`p-3 rounded-xl ${isDarkMode 
                      ? 'bg-white/5 hover:bg-white/10' 
                      : 'bg-black/5 hover:bg-black/10'
                    } transition-all duration-200 hover:scale-105`}>
                      <div className="flex items-center space-x-2">
                        <stat.icon size={16} className="text-purple-400" />
                        <div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{stat.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
                  <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-600'
                    } shadow-lg`}>
                      {message.type === 'user' ? 
                        <Users size={18} className="text-white" /> : 
                        <Zap size={18} className="text-white animate-pulse" />
                      }
                    </div>
                    
                    {/* Message Content */}
                    <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-4 rounded-2xl ${
                        message.type === 'user'
                          ? isDarkMode 
                            ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/20 text-white' 
                            : 'bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200 text-black'
                          : isDarkMode
                            ? 'bg-white/5 backdrop-blur-sm border border-white/10 text-white'
                            : 'bg-white/80 backdrop-blur-sm border border-white/50 text-black'
                      } shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform`}>
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      </div>
                      <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-3xl mr-12">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                      <Zap size={18} className="text-white animate-pulse" />
                    </div>
                    <div className={`p-4 rounded-2xl ${isDarkMode
                      ? 'bg-white/5 backdrop-blur-sm border border-white/10'
                      : 'bg-white/80 backdrop-blur-sm border border-white/50'
                    } shadow-lg`}>
                      <ThinkingDots />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Try asking about:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(question)}
                    className={`px-4 py-2 rounded-xl text-sm ${isDarkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      : 'bg-white/50 hover:bg-white/70 text-black border border-white/50'
                    } transition-all duration-200 hover:scale-105 hover:shadow-lg backdrop-blur-sm`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-white/10">
            <div className={`relative ${isDarkMode 
              ? 'bg-white/10 backdrop-blur-xl border-white/20' 
              : 'bg-white/50 backdrop-blur-xl border-white/30'
            } border rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300`}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Fetii's rideshare data..."
                className={`w-full p-4 pr-14 bg-transparent ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-black placeholder-gray-600'} resize-none outline-none rounded-2xl min-h-[60px] max-h-[200px]`}
                rows={1}
                style={{ resize: 'none' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`absolute right-3 bottom-3 p-2 rounded-xl ${
                  inputValue.trim() && !isLoading
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-400' 
                      : 'bg-gray-200 text-gray-400'
                } transition-all duration-200`}
              >
                <Send size={18} className={inputValue.trim() && !isLoading ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FetiiChatbot;