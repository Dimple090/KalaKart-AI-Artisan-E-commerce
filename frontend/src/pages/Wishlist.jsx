import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Heart, Sparkles, Wand2, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '../lib/api';

const Wishlist = () => {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [styleData, setStyleData] = useState(null);
    const [styleLoading, setStyleLoading] = useState(false);
    const [styleError, setStyleError] = useState('');
    const [styleOpen, setStyleOpen] = useState(false);

    const handleStyleMatch = async () => {
        if (wishlist.length === 0) return;
        setStyleLoading(true);
        setStyleError('');
        setStyleOpen(true);
        try {
            const { data } = await axios.post(apiUrl('/api/ai/style-match'), {
                wishlistItems: wishlist.map(i => ({ _id: i._id, name: i.name, category: i.category, price: i.price }))
            });
            setStyleData(data);
        } catch (err) {
            console.error(err);
            setStyleError('Style curator is unavailable right now. Try again soon!');
        } finally {
            setStyleLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold text-[#3E2723] flex items-center gap-2">
                    <Heart className="w-8 h-8 text-[#8D6E63] fill-current" /> My Wishlist
                    {wishlist.length > 0 && (
                        <span className="ml-2 text-sm font-bold bg-[#EFEBE9] text-[#5D4037] px-3 py-1 rounded-full">
                            {wishlist.length} items
                        </span>
                    )}
                </h1>
                {wishlist.length >= 1 && (
                    <button
                        onClick={handleStyleMatch}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <Wand2 className="w-4 h-4" />
                        Discover My Style DNA
                    </button>
                )}
            </div>

            {/* AI Style DNA Panel */}
            <AnimatePresence>
                {styleOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="mb-10 bg-gradient-to-br from-purple-50 via-indigo-50 to-white rounded-3xl border border-purple-200 shadow-xl shadow-purple-100 overflow-hidden"
                    >
                        <div className="p-6 border-b border-purple-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-600 text-white p-2 rounded-xl shadow">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-purple-500 uppercase tracking-widest">AI Style Curator</p>
                                    {styleData?.styleLabel && (
                                        <h2 className="text-xl font-black text-gray-900">
                                            Your Aesthetic: <span className="text-purple-700">{styleData.styleLabel}</span>
                                        </h2>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setStyleOpen(false)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {styleLoading && (
                                <div className="flex items-center gap-4 py-4">
                                    <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
                                    <p className="text-gray-500 font-medium text-sm">Analysing your taste profile…</p>
                                </div>
                            )}
                            {styleError && <p className="text-red-500 text-sm font-medium">{styleError}</p>}
                            {styleData?.products?.length > 0 && !styleLoading && (
                                <>
                                    <p className="text-sm text-gray-500 mb-4 font-medium">Curated picks that match your vibe:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {styleData.products.map(product => (
                                            <Link
                                                key={product._id}
                                                to={`/product/${product._id}`}
                                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
                                            >
                                                <div className="relative h-40 overflow-hidden">
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                                    <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        AI Pick
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h3 className="font-bold text-gray-900 truncate text-sm">{product.name}</h3>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-gray-500">{product.category}</span>
                                                        <span className="font-black text-[#3E2723] text-sm">₹{product.price}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {wishlist.length === 0 ? (
                <div className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#3E2723]/5 border border-white/50 max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-[#EFEBE9] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Heart className="w-10 h-10 text-[#8D6E63]" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-[#3E2723] mb-3">Your wishlist is empty</h2>
                    <p className="text-[#8D6E63] mb-8 max-w-md mx-auto">Heart items you love to save them for later. Start exploring our unique collection!</p>
                    <Link to="/" className="btn-primary inline-flex items-center justify-center">
                        Start Exploring
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlist.map((item) => (
                        <motion.div
                            key={item._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                        >
                            <div className="relative h-48 overflow-hidden rounded-xl bg-gray-100 mb-4">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out" />
                                <button
                                    onClick={() => removeFromWishlist(item._id)}
                                    className="absolute top-2 right-2 p-2 bg-white/60 backdrop-blur-md rounded-full text-red-400 hover:text-red-500 hover:bg-red-50 transition border border-white/40 shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <Link to={`/product/${item._id}`}>
                                <h3 className="font-bold text-[#3E2723] truncate mb-1 hover:underline">{item.name}</h3>
                            </Link>
                            <p className="text-sm text-[#8D6E63] mb-3">{item.category}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="font-extrabold text-lg text-[#3E2723]">₹{item.price}</span>
                                <button
                                    onClick={() => addToCart(item)}
                                    className="p-2.5 bg-[#EFEBE9] text-[#3E2723] rounded-full hover:bg-[#8D6E63] hover:text-white transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#3E2723] outline-none"
                                    title="Move to Cart"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
