import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, Clock, BookOpen, Scissors, ChevronRight, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { apiUrl } from '../lib/api';

const SavedIdeas = () => {
    const [savedIdeas, setSavedIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedIdea, setExpandedIdea] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchSavedIdeas = async () => {
            if (!user) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(apiUrl('/api/ai/saved-ideas'), config);
                setSavedIdeas(data);
            } catch (err) {
                console.error('Error fetching saved ideas:', err);
                setError('Failed to load your saved ideas.');
            } finally {
                setLoading(false);
            }
        };

        fetchSavedIdeas();
    }, [user]);

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // prevent expanding the card when deleting
        if (!window.confirm("Are you sure you want to remove this saved idea?")) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(apiUrl(`/api/ai/saved-ideas/${id}`), config);
            setSavedIdeas(savedIdeas.filter(idea => idea._id !== id));
            if (expandedIdea?._id === id) setExpandedIdea(null);
        } catch (err) {
            console.error('Error deleting idea:', err);
            alert('Failed to delete idea.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D6E63]"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] py-20 px-4 text-center">
                <h1 className="text-3xl font-black text-[#3E2723] mb-4">Saved AI Ideas</h1>
                <p className="text-gray-600 mb-8">Please log in to view and save your favorite AI-generated craft tutorials.</p>
                <Link to="/login" className="bg-[#3E2723] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-[#5D4037] transition">
                    Log In
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl font-black text-[#3E2723] flex items-center gap-3">
                            <Bookmark className="w-8 h-8 text-[#8D6E63]" />
                            My Saved Ideas
                        </h1>
                        <p className="text-gray-600 mt-2">Your personal collection of magical AI craft tutorials.</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <Link
                            to="/craft-tutorial"
                            className="bg-white border-2 border-[#8D6E63] text-[#8D6E63] font-bold px-6 py-2.5 rounded-full hover:bg-[#8D6E63] hover:text-white transition shadow-sm flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" /> Generate New Idea
                        </Link>
                    </motion.div>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-8 font-bold">{error}</div>}

                {savedIdeas.length === 0 && !error ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Scissors className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">No saved ideas yet!</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Head over to the AI Craft Generator, create something amazing, and click "Save Idea" to build your collection.
                        </p>
                        <Link to="/craft-tutorial" className="bg-[#3E2723] text-white font-bold px-8 py-3 rounded-full shadow hover:-translate-y-1 transition inline-flex items-center gap-2">
                            <Sparkles className="w-5 h-5" /> Start Creating
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {savedIdeas.map((idea, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={idea._id}
                                className={`bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 ${expandedIdea?._id === idea._id ? 'ring-2 ring-[#8D6E63] shadow-xl' : 'hover:shadow-xl hover:-translate-y-1'}`}
                                onClick={() => setExpandedIdea(expandedIdea?._id === idea._id ? null : idea)}
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="inline-block px-3 py-1 bg-[#EFEBE9] text-[#5D4037] text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                                                {idea.skillLevel}
                                            </span>
                                            <h2 className="text-2xl font-black text-[#3E2723] leading-tight mb-2">{idea.craftName}</h2>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, idea._id)}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                                            title="Remove saved idea"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm font-semibold text-gray-500 mb-6">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <Clock className="w-4 h-4 text-[#8D6E63]" /> {idea.estimatedTime}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <BookOpen className="w-4 h-4 text-[#8D6E63]" /> {idea.materialsRequired.length} Materials
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedIdea?._id === idea._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-gray-100 bg-[#FAFAFA]"
                                        >
                                            <div className="p-6 md:p-8 space-y-8">
                                                {/* Materials List */}
                                                <div>
                                                    <h4 className="font-bold text-[#3E2723] mb-3 flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-[#8D6E63]" /> Required Materials
                                                    </h4>
                                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                                                        {idea.materialsRequired.map((mat, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#8D6E63] shrink-0" />
                                                                {mat}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Steps */}
                                                <div>
                                                    <h4 className="font-bold text-[#3E2723] mb-4 flex items-center gap-2">
                                                        <Scissors className="w-4 h-4 text-[#8D6E63]" /> Instructions
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {idea.steps.map((step, i) => (
                                                            <div key={i} className="flex gap-4 group">
                                                                <div className="w-6 h-6 rounded-full bg-[#EFEBE9] text-[#8D6E63] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                                    {i + 1}
                                                                </div>
                                                                <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
                                    <span className="text-sm font-bold text-[#8D6E63] group-hover:text-[#3E2723] transition flex items-center justify-center gap-1">
                                        {expandedIdea?._id === idea._id ? 'Close details' : 'View full tutorial'} <ChevronRight className={`w-4 h-4 transition-transform ${expandedIdea?._id === idea._id ? 'rotate-90' : ''}`} />
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedIdeas;
