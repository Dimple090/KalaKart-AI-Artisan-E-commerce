import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, Lock, ShoppingBag, Leaf, Wind, Zap, Sparkles, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';
import { apiUrl } from '../lib/api';

const Cart = () => {
    const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);
    const tax = (totalPrice * 0.18).toFixed(2); // 18% GST mock
    const shipping = totalPrice > 500 ? 0 : 50; // Free shipping over 500
    const finalTotal = (parseFloat(totalPrice) + parseFloat(tax) + shipping).toFixed(2);

    const [impactLoading, setImpactLoading] = useState(false);
    const [ecoReport, setEcoReport] = useState(null);
    const [bundleData, setBundleData] = useState(null);
    const [bundleLoading, setBundleLoading] = useState(false);

    // Auto-fetch bundles when cart has items
    useEffect(() => {
        if (cartItems.length === 0) { setBundleData(null); return; }
        const timer = setTimeout(async () => {
            setBundleLoading(true);
            try {
                const { data } = await axios.post(apiUrl('/api/ai/bundle-advisor'), {
                    cartItems: cartItems.map(i => ({ _id: i._id, name: i.name, category: i.category }))
                });
                if (data.bundles?.length > 0) setBundleData(data);
            } catch {
                // Silent fail: bundle suggestion is non-critical.
            } finally {
                setBundleLoading(false);
            }
        }, 1500); // Small delay to avoid immediate API hit
        return () => clearTimeout(timer);
    }, [cartItems.length]); // eslint-disable-line

    const calculateImpact = async () => {
        if (cartItems.length === 0) return;
        setImpactLoading(true);
        try {
            const totals = cartItems.reduce((acc, item) => ({
                material: acc.material + (item.ecoScore?.material || 70),
                carbon: acc.carbon + (item.ecoScore?.carbon || 60),
                recycling: acc.recycling + (item.ecoScore?.recycling || 80)
            }), { material: 0, carbon: 0, recycling: 0 });

            const avgScores = {
                material: Math.round(totals.material / cartItems.length),
                carbon: Math.round(totals.carbon / cartItems.length),
                recycling: Math.round(totals.recycling / cartItems.length)
            };

            const { data } = await axios.post(apiUrl('/api/ai/impact'), { scores: avgScores });
            setEcoReport({ ...avgScores, message: data.message });
        } catch (error) {
            console.error("Impact calculation failed:", error);
        } finally {
            setImpactLoading(false);
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        setIsPaymentOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Your cart is empty</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Looks like you haven't added any handmade treasures yet.</p>
                    <Link to="/" className="btn-primary inline-flex items-center justify-center">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Cart Items List */}
                    <div className="lg:w-2/3 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="w-32 h-32 mx-auto sm:w-24 sm:h-24 sm:mx-0 shrink-0 overflow-hidden rounded-xl border border-gray-200">
                                    <img src={item.imageUrl} alt={`${item.name} in cart`} loading="lazy" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-lg font-bold text-[#3E2723]">{item.name}</h3>
                                    <p className="text-sm text-[#8D6E63]">{item.category}</p>
                                    <p className="text-[#3E2723] font-bold mt-1">Rs. {item.price}</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-200 rounded-full bg-gray-50">
                                        <button
                                            onClick={() => addToCart(item, -1)}
                                            className="p-2 text-gray-600 hover:text-primary transition hover:bg-white rounded-full m-1"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center font-semibold text-slate-700">{item.qty}</span>
                                        <button
                                            onClick={() => addToCart(item, 1)}
                                            className="p-2 text-gray-600 hover:text-primary transition hover:bg-white rounded-full m-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 focus:ring-2 focus:ring-red-400 rounded-full transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <button onClick={clearCart} className="text-red-500 text-sm font-semibold hover:underline hover:text-red-600 transition">Clear Entire Cart</button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>Rs. {totalPrice}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Tax (18% GST estimate)</span>
                                    <span>Rs. {tax}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? "text-green-600 font-bold" : ""}>
                                        {shipping === 0 ? "Free" : `Rs. ${shipping}`}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-900">Total</span>
                                    <span className="text-3xl font-extrabold gradient-text">Rs. {finalTotal}</span>
                                </div>
                            </div>

                            {/* AI Bundle Advisor */}
                            {(bundleLoading || bundleData) && (
                                <div className="mb-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4 overflow-hidden">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-amber-600" />
                                        <h3 className="font-bold text-xs text-amber-800 uppercase tracking-wider">Complete the Collection</h3>
                                    </div>
                                    {bundleLoading && (
                                        <p className="text-xs text-amber-700 animate-pulse">Finding the perfect pairings...</p>
                                    )}
                                    {bundleData && !bundleLoading && (
                                        <>
                                            {bundleData.reason && (
                                                <p className="text-[11px] text-amber-800 italic mb-3 leading-relaxed">"{bundleData.reason}"</p>
                                            )}
                                            <div className="space-y-2">
                                                {bundleData.bundles.map(product => (
                                                    <div key={product._id} className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-amber-100 shadow-sm">
                                                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                                                            <p className="text-[10px] text-gray-500">{product.category}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            <span className="text-xs font-black text-[#3E2723]">Rs. {product.price}</span>
                                                            <button
                                                                onClick={() => addToCart(product)}
                                                                className="flex items-center gap-1 bg-[#3E2723] text-white text-[9px] font-bold px-2 py-1 rounded-full hover:bg-[#5D4037] transition"
                                                            >
                                                                <ShoppingCart className="w-2.5 h-2.5" /> Add
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Eco Impact Tracker */}
                            <div className="bg-green-50/50 rounded-2xl p-5 border border-green-100 relative overflow-hidden group">
                                <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform">
                                    <Leaf className="w-16 h-16 text-green-600 rotate-12" />
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Leaf className="w-4 h-4 text-green-600" />
                                    <h3 className="font-bold text-xs text-green-800 uppercase tracking-wider">Planet Impact</h3>
                                </div>

                                {!ecoReport ? (
                                    <button 
                                        onClick={calculateImpact}
                                        disabled={impactLoading}
                                        className="w-full py-2.5 bg-white border border-green-200 text-green-700 text-xs font-bold rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2"
                                    >
                                        {impactLoading ? 'Analyzing...' : <><Sparkles className="w-3.5 h-3.5" /> Calculate My Impact</>}
                                    </button>
                                ) : (
                                    <div className="space-y-3 animate-fade-in">
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center">
                                                <Wind className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                                                <p className="text-[10px] text-gray-500 font-medium">Carbon</p>
                                                <p className="text-xs font-bold text-slate-800">{ecoReport.carbon}%</p>
                                            </div>
                                            <div className="text-center border-x border-green-200">
                                                <Zap className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                                                <p className="text-[10px] text-gray-500 font-medium">Purity</p>
                                                <p className="text-xs font-bold text-slate-800">{ecoReport.material}%</p>
                                            </div>
                                            <div className="text-center">
                                                <Leaf className="w-4 h-4 text-green-500 mx-auto mb-1" />
                                                <p className="text-[10px] text-gray-500 font-medium">Green</p>
                                                <p className="text-xs font-bold text-slate-800">{ecoReport.recycling}%</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-white relative">
                                            <p className="text-[11px] text-green-800 italic leading-relaxed font-serif">
                                                "{ecoReport.message}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full btn-primary flex items-center justify-center gap-2 mt-8"
                            >
                                Proceed to Checkout <ArrowRight className="w-5 h-5" />
                            </button>

                            <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" /> Secure Checkout
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                totalAmount={finalTotal}
            />
        </div>
    );
};

export default Cart;
