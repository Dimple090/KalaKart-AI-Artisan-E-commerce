import { useState, useEffect } from 'react';
import { Gift, Sparkles, Send, ArrowRight, Heart, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GiftFinder = () => {
    const [persona, setPersona] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const handleFindGifts = async (e) => {
        e.preventDefault();
        if (!persona.trim()) return;

        setLoading(true);
        setResults(null);
        try {
            const { data } = await axios.post('http://localhost:5000/api/ai/gift-finder', { persona });
            setResults(data);
        } catch (error) {
            console.error("Gift finder error:", error);
            alert("Our gift concierge is currently perfecting their recommendations. Please try again in a moment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF9] pt-12 pb-24">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto px-4 text-center mb-16">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold mb-6 tracking-widest uppercase"
                >
                    <Gift className="w-3.5 h-3.5" /> AI Gift Concierge
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-black text-[#3E2723] mb-6 leading-tight"
                >
                    Find the Perfect <span className="italic font-serif text-[#8D6E63]">Handmade</span> Treasure.
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-gray-600 max-w-2xl mx-auto"
                >
                    Describe the person you're gifting for, and our AI will curate a selection of one-of-a-kind artisan crafts just for them.
                </motion.p>
            </div>

            {/* Input Section */}
            <div className="max-w-3xl mx-auto px-4 mb-20">
                <form onSubmit={handleFindGifts} className="relative">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/5 p-2 border border-amber-100 flex items-center gap-4">
                        <div className="flex-1 px-4">
                            <textarea
                                value={persona}
                                onChange={(e) => setPersona(e.target.value)}
                                placeholder="e.g. My mother who loves gardening, soft textures, and anything related to old-world heritage..."
                                className="w-full py-4 bg-transparent border-none focus:ring-0 text-gray-800 placeholder:text-gray-400 resize-none h-24 font-medium"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading || !persona.trim()}
                            className="bg-[#3E2723] hover:bg-[#2D1B15] text-white p-6 rounded-2xl shadow-xl shadow-[#3E2723]/20 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 group shrink-0"
                        >
                            {loading ? (
                                <Sparkles className="w-6 h-6 animate-spin text-amber-300" />
                            ) : (
                                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            )}
                        </button>
                    </div>
                    {/* Floating accents */}
                    <div className="absolute -top-10 -left-10 w-20 h-20 bg-amber-200/20 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>
                </form>
            </div>

            {/* Results Section */}
            <div className="max-w-6xl mx-auto px-4">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20"
                        >
                            <div className="inline-block relative">
                                <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
                                <div className="absolute inset-0 animate-ping opacity-20">
                                    <Sparkles className="w-16 h-16 text-amber-400" />
                                </div>
                            </div>
                            <p className="mt-8 text-xl font-serif text-[#3E2723] italic">"Consulting with our master artisans..."</p>
                        </motion.div>
                    ) : results ? (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            {/* Reasoning Card */}
                            <div className="max-w-3xl mx-auto bg-white/40 backdrop-blur-md border border-white p-8 rounded-[2rem] text-center shadow-sm">
                                <p className="text-xl text-[#3E2723] font-serif italic leading-relaxed">
                                    "{results.reasoning}"
                                </p>
                            </div>

                            {/* Product Carousel/Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {results.products.map((product, idx) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 group flex flex-col h-full"
                                    >
                                        <div className="aspect-[4/5] relative overflow-hidden">
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#3E2723]">
                                                    {product.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#3E2723] mb-2">{product.name}</h3>
                                                <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{product.description}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                                <span className="text-2xl font-black text-[#3E2723]">₹{product.price}</span>
                                                <Link to={`/product/${product._id}`} className="p-3 bg-[#EFEBE9] hover:bg-[#3E2723] hover:text-white rounded-full transition-colors group/btn">
                                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="text-center pt-8">
                                <button onClick={() => setResults(null)} className="text-[#8D6E63] font-bold text-sm underline underline-offset-8 hover:text-[#3E2723] transition-colors">
                                    Try another search
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center opacity-40 py-20 grayscale scale-90">
                            <Gift className="w-24 h-24 mx-auto mb-4 text-[#D7CCC8]" />
                            <p className="text-lg font-serif italic text-[#3E2723]">Waiting for your inspiration...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GiftFinder;
