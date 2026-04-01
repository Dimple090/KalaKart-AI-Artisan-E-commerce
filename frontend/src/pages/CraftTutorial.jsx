import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Scissors, Clock, BookOpen, Lightbulb, TrendingUp, Loader2, Bookmark, Check, MessageSquare, Tag, Recycle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CraftTutorial = () => {
    const [materials, setMaterials] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [mode, setMode] = useState('tutorial'); // 'tutorial', 'ideas', 'feedback', or 'waste'

    // Additional state for "waste" mode
    const [quantity, setQuantity] = useState('');
    const [condition, setCondition] = useState('');

    const { user } = useAuth();

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (mode === 'waste') {
            if (!materials.trim() || !quantity.trim() || !condition.trim()) {
                setError('Please provide material, quantity, and condition.');
                return;
            }
        } else if (!materials.trim()) {
            setError(mode === 'tutorial' ? 'Please enter some materials.' : 'Please enter a description.');
            return;
        }

        setError('');
        setLoading(true);
        setResult(null);
        setSaved(false);

        try {
            let endpoint = 'http://localhost:5000/api/ai/craft-tutorial';
            let payload = { materials };

            if (mode === 'ideas') {
                endpoint = 'http://localhost:5000/api/ai/material-finder';
                payload = { material: materials };
            } else if (mode === 'feedback') {
                endpoint = 'http://localhost:5000/api/ai/craft-feedback';
                payload = { creation: materials };
            } else if (mode === 'waste') {
                endpoint = 'http://localhost:5000/api/ai/waste-listing';
                payload = { material: materials, quantity, condition };
            }

            const { data } = await axios.post(endpoint, payload);
            setResult(data);
        } catch (err) {
            console.error('Error generating:', err);
            setError(err.response?.data?.message || 'Failed to generate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveIdea = async () => {
        if (!user) {
            setError('Please login to save ideas.');
            return;
        }

        // Disable saving for 'ideas' and 'feedback' mode as the backend is set up to save full tutorials.
        if (mode !== 'tutorial') {
            setError('Saving is currently only supported for full tutorials.');
            return;
        }

        setSaving(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            await axios.post('http://localhost:5000/api/ai/save-idea', result, config);
            setSaved(true);
        } catch (err) {
            console.error('Error saving idea:', err);
            setError(err.response?.data?.message || 'Failed to save idea. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-[#3E2723] mb-4 flex items-center justify-center gap-3 tracking-tight">
                        <Sparkles className="w-10 h-10 text-[#8D6E63]" />
                        AI Craft Generator
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Turn waste materials, flowers, and everyday items into beautiful handmade treasures. Enter what you have, and our AI will design a complete tutorial for you!
                    </p>
                </motion.div>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-xl shadow-[#8D6E63]/10 p-6 md:p-8 mb-12 border border-[#8D6E63]/10"
                >
                    {/* Mode Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex bg-gray-100 rounded-full p-1 border border-gray-200 shadow-inner max-w-full overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => { setMode('tutorial'); setResult(null); setError(''); }}
                                className={`px-4 sm:px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${mode === 'tutorial'
                                    ? 'bg-white text-[#3E2723] shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <BookOpen className="w-4 h-4 hidden sm:block" />
                                Full Tutorial
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('ideas'); setResult(null); setError(''); }}
                                className={`px-4 sm:px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${mode === 'ideas'
                                    ? 'bg-white text-[#3E2723] shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Lightbulb className="w-4 h-4 hidden sm:block" />
                                Quick Ideas
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('feedback'); setResult(null); setError(''); }}
                                className={`px-4 sm:px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${mode === 'feedback'
                                    ? 'bg-white text-[#3E2723] shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4 hidden sm:block" />
                                Get Feedback
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('waste'); setResult(null); setError(''); }}
                                className={`px-4 sm:px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${mode === 'waste'
                                    ? 'bg-white text-[#3E2723] shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Recycle className="w-4 h-4 hidden sm:block" />
                                List Waste
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div>
                            <label htmlFor="materials" className="block text-sm font-bold text-gray-700 mb-2">
                                {mode === 'tutorial' && 'What materials do you have?'}
                                {mode === 'ideas' && 'Enter a material to find ideas for (e.g., Flowers)'}
                                {mode === 'feedback' && 'What did you create? Describe your finished craft!'}
                                {mode === 'waste' && 'What waste material are you listing?'}
                            </label>
                            <textarea
                                id="materials"
                                rows="3"
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all resize-none bg-gray-50/50"
                                placeholder={
                                    mode === 'tutorial' ? "e.g., plastic bottle, old thread, 5 beads, dry leaves..." :
                                        mode === 'ideas' ? "e.g., Flowers, Glass Bottles, Old Jeans" :
                                            mode === 'feedback' ? "e.g., Handmade Flower Necklace, Upcycled Denim Tote Bag" :
                                                "e.g., Transparent Plastic Bottles, Unused Cotton Fabric Scraps"
                                }
                                value={materials}
                                onChange={(e) => setMaterials(e.target.value)}
                            ></textarea>
                        </div>

                        {mode === 'waste' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-2">
                                        Quantity
                                    </label>
                                    <input
                                        type="text"
                                        id="quantity"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all bg-gray-50/50"
                                        placeholder="e.g., 20 pieces, 5 kg"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="condition" className="block text-sm font-bold text-gray-700 mb-2">
                                        Condition
                                    </label>
                                    <input
                                        type="text"
                                        id="condition"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all bg-gray-50/50"
                                        placeholder="e.g., Clean and washed, Slightly wrinkled"
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-red-500 text-sm font-bold animate-pulse">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Conjuring Magic...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    Generate Craft Idea
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Results Section */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full"
                    >
                        {mode === 'tutorial' && !Array.isArray(result) && (
                            <div className="bg-white rounded-3xl shadow-2xl shadow-[#8D6E63]/20 overflow-hidden border border-[#8D6E63]/20">
                                {/* Header Banner */}
                                <div className="bg-gradient-to-br from-[#8D6E63] to-[#795548] p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Scissors className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase">
                                            {result.skillLevel} Level
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black mb-2">{result.craftName}</h2>
                                        <div className="flex items-center gap-2 text-white/90 font-medium">
                                            <Clock className="w-5 h-5" />
                                            Estimated time: {result.estimatedTime}
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    {user && (
                                        <div className="absolute top-8 right-8 z-10">
                                            <button
                                                onClick={handleSaveIdea}
                                                disabled={saving || saved}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 ${saved
                                                    ? 'bg-green-500 text-white cursor-default'
                                                    : 'bg-white text-[#3E2723] hover:bg-gray-100'
                                                    }`}
                                            >
                                                {saving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : saved ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Bookmark className="w-4 h-4" />
                                                )}
                                                {saved ? 'Saved to My Ideas' : 'Save Idea'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 grid md:grid-cols-3 gap-12">
                                    {/* Sidebar Options (Materials & Tips) */}
                                    <div className="md:col-span-1 space-y-8">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#3E2723] mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                                <BookOpen className="w-5 h-5 text-[#8D6E63]" />
                                                Materials
                                            </h3>
                                            <ul className="space-y-2">
                                                {result.materialsRequired?.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                                                        <div className="w-2 h-2 mt-2 rounded-full bg-[#8D6E63] shrink-0" />
                                                        <span className="leading-snug">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {result.creativeTip && (
                                            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 shadow-sm">
                                                <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2 uppercase tracking-wide">
                                                    <Lightbulb className="w-4 h-4" />
                                                    Creative Tip
                                                </h3>
                                                <p className="text-amber-900 text-sm leading-relaxed">
                                                    {result.creativeTip}
                                                </p>
                                            </div>
                                        )}

                                        {result.sellingIdea && (
                                            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 shadow-sm">
                                                <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2 uppercase tracking-wide">
                                                    <TrendingUp className="w-4 h-4" />
                                                    Selling Idea
                                                </h3>
                                                <p className="text-emerald-900 text-sm leading-relaxed">
                                                    {result.sellingIdea}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Content (Steps) */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-2xl font-black text-[#3E2723] mb-6 flex items-center gap-2">
                                            Step-by-Step Guide
                                        </h3>
                                        <div className="space-y-6">
                                            {result.steps?.map((step, idx) => (
                                                <div key={idx} className="flex group">
                                                    <div className="flex flex-col items-center mr-6">
                                                        <div className="w-10 h-10 rounded-full bg-[#EFEBE9] text-[#3E2723] flex items-center justify-center font-black group-hover:bg-[#8D6E63] group-hover:text-white transition-colors shrink-0 shadow-sm">
                                                            {idx + 1}
                                                        </div>
                                                        {idx !== result.steps.length - 1 && (
                                                            <div className="w-px h-full bg-gray-200 my-2" />
                                                        )}
                                                    </div>
                                                    <div className="pt-2 pb-6">
                                                        <p className="text-gray-700 text-lg leading-relaxed">{step}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {mode === 'ideas' && Array.isArray(result) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {result.map((idea, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white rounded-3xl p-6 shadow-xl shadow-[#8D6E63]/10 border border-[#8D6E63]/10 flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="mb-4">
                                            <div className="inline-block px-3 py-1 mb-3 bg-[#EFEBE9] text-[#8D6E63] rounded-full text-xs font-bold tracking-wider uppercase">
                                                {idea.skillLevel} Level
                                            </div>
                                            <h3 className="text-xl font-black text-[#3E2723] mb-2 leading-tight">{idea.craftName}</h3>
                                            <p className="text-gray-600 text-sm">{idea.description}</p>
                                        </div>
                                        <div className="mt-auto flex-1">
                                            <h4 className="text-sm font-bold text-[#3E2723] mb-2 flex items-center gap-1">
                                                <Scissors className="w-4 h-4 text-[#8D6E63]" /> Materials Needed
                                            </h4>
                                            <ul className="text-gray-600 text-sm space-y-1">
                                                {idea.materialsNeeded?.map((mat, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#8D6E63] shrink-0" />
                                                        <span className="leading-snug">{mat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {mode === 'feedback' && !Array.isArray(result) && result.appreciation && (
                            <div className="bg-white rounded-3xl shadow-2xl shadow-[#8D6E63]/20 overflow-hidden border border-[#8D6E63]/20">
                                {/* Appreciation Header Banner */}
                                <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <MessageSquare className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase">
                                            Community Feedback
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black mb-4 leading-tight">{result.appreciation}</h2>
                                    </div>
                                </div>

                                <div className="p-8 grid md:grid-cols-3 gap-12">
                                    {/* Sidebar Options (Pricing, Category, Tags) */}
                                    <div className="md:col-span-1 space-y-6">
                                        <div className="bg-green-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                                            <h3 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2 uppercase tracking-wide">
                                                <TrendingUp className="w-4 h-4" />
                                                Estimated Selling Price
                                            </h3>
                                            <p className="text-green-900 text-2xl font-black">{result.estimatedPrice}</p>
                                        </div>

                                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                                            <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2 uppercase tracking-wide">
                                                <BookOpen className="w-4 h-4" />
                                                Category Suggestion
                                            </h3>
                                            <p className="text-blue-900 font-bold">{result.category}</p>
                                        </div>

                                        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
                                            <h3 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                                <Tag className="w-4 h-4" />
                                                SEO Tags
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {result.tags?.map((tag, idx) => (
                                                    <span key={idx} className="bg-white text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Content (Improvement Suggestions) */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-2xl font-black text-[#3E2723] mb-6 flex items-center gap-2">
                                            <Lightbulb className="w-6 h-6 text-[#8D6E63]" />
                                            Tips for Improvement
                                        </h3>
                                        <div className="space-y-4">
                                            {result.suggestions?.map((suggestion, idx) => (
                                                <div key={idx} className="flex group bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                                    <div className="flex flex-col items-center mr-4">
                                                        <div className="w-8 h-8 rounded-full bg-[#EFEBE9] text-[#3E2723] flex items-center justify-center font-black group-hover:bg-[#8D6E63] group-hover:text-white transition-colors shrink-0 shadow-sm text-sm">
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                    <div className="pt-1">
                                                        <p className="text-gray-700 leading-relaxed">{suggestion}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {mode === 'waste' && !Array.isArray(result) && result.materialName && (
                            <div className="bg-white rounded-3xl shadow-2xl shadow-[#8D6E63]/20 overflow-hidden border border-[#8D6E63]/20">
                                {/* Waste Header Banner */}
                                <div className="bg-gradient-to-br from-teal-600 to-cyan-800 p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Recycle className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase">
                                            Optimized Listing
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black mb-2 leading-tight">{result.materialName}</h2>
                                        <div className="flex items-center gap-4 text-white/90 font-medium">
                                            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {result.condition}</span>
                                            <span className="flex items-center gap-1"><Lightbulb className="w-4 h-4" /> {result.quantity}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 grid md:grid-cols-3 gap-12">
                                    {/* Sidebar Options (Pricing, Sustainability) */}
                                    <div className="md:col-span-1 space-y-6">
                                        <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100 shadow-sm">
                                            <h3 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2 uppercase tracking-wide">
                                                <TrendingUp className="w-4 h-4" />
                                                Suggested Price
                                            </h3>
                                            <p className="text-teal-900 text-2xl font-black">{result.suggestedPrice}</p>
                                        </div>

                                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 opacity-5">
                                                <Recycle className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                                            </div>
                                            <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2 uppercase tracking-wide relative z-10">
                                                <Recycle className="w-4 h-4" />
                                                Sustainability Note
                                            </h3>
                                            <p className="text-emerald-900 font-medium leading-relaxed relative z-10">
                                                {result.sustainabilityNote}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Main Content (Possible Uses) */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-2xl font-black text-[#3E2723] mb-6 flex items-center gap-2">
                                            <Sparkles className="w-6 h-6 text-[#8D6E63]" />
                                            Possible Craft Uses
                                        </h3>
                                        <p className="text-gray-600 mb-6 font-medium">Include these ideas in your listing description to attract more artisans!</p>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {result.possibleUses?.map((use, idx) => (
                                                <div key={idx} className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-[#8D6E63]/30 transition-colors">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-[#8D6E63] shrink-0" />
                                                    <p className="text-gray-800 font-medium leading-relaxed">{use}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div >
    );
};

export default CraftTutorial;
