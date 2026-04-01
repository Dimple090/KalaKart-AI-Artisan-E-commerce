import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Send, X, Sparkles, User, Bot, Minimize2, Maximize2 } from 'lucide-react';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', parts: [{ text: "Greetings! I am the KalaKart AI Concierge. How may I help you discover the magic of artisan crafts today?" }] }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const location = useLocation();

    // Context Detection
    const isProductPage = location.pathname.startsWith('/product/');
    const currentProductId = isProductPage ? location.pathname.split('/')[2] : null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = { role: 'user', parts: [{ text: message }] };
        setChatHistory(prev => [...prev, userMsg]);
        const currentMessage = message;
        setMessage('');
        setLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/ai/chat', {
                message: currentMessage,
                history: chatHistory,
                productId: currentProductId
            });
            
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: data.message }] }]);
        } catch (error) {
            console.error("Chat error:", error);
            setChatHistory(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: "I'm having a small moment of reflection. Please try asking again in a moment!" }] 
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-[#3E2723] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-50 group border-4 border-white/20"
            >
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            </button>
        );
    }

    return (
        <div className={`fixed right-6 z-50 transition-all duration-300 ease-in-out shadow-2xl border border-[#D7CCC8]/30 overflow-hidden flex flex-col font-sans
            ${isMinimized ? 'bottom-6 w-72 h-14' : 'bottom-6 w-[380px] h-[550px] rounded-3xl bg-white'}`}>
            
            {/* Header */}
            <div className="bg-[#3E2723] p-4 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-white/10 p-1.5 rounded-lg border border-white/20">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight text-amber-50">AI Concierge</h3>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-[10px] text-amber-100/70 font-medium">Ready to assist</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition">
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-5 bg-[#FDFBF9] space-y-4">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                                    ${msg.role === 'user' ? 'bg-[#3E2723] text-white' : 'bg-amber-100 text-[#3E2723]'}`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm
                                    ${msg.role === 'user' 
                                        ? 'bg-[#EFEBE9] text-[#3E2723] rounded-tr-none border border-[#D7CCC8]/30' 
                                        : 'bg-white text-gray-700 rounded-tl-none border border-[#D7CCC8]/20 italic font-serif'}`}>
                                    {msg.parts[0].text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-2 text-gray-400 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[#D7CCC8]/30 shrink-0">
                        <div className="relative group">
                            <input 
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Whisper your request..."
                                className="w-full bg-[#FDFBF9] border border-[#D7CCC8]/50 rounded-2xl py-3.5 pl-4 pr-12 text-sm focus:ring-2 focus:ring-[#3E2723] focus:border-transparent transition-all outline-none"
                            />
                            <button 
                                type="submit"
                                disabled={loading || !message.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#3E2723] text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                <Send className="w-4.5 h-4.5" />
                            </button>
                        </div>
                        <p className="text-[9px] text-gray-400 text-center mt-3 font-medium tracking-wide">
                            Curated meticulously by KalaKart AI
                        </p>
                    </form>
                </>
            )}
        </div>
    );
};

export default AIChatbot;
