import { useState, useEffect } from 'react';
import { Star, User, Sparkles, ThumbsUp, Meh, ThumbsDown } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SentimentIcon = ({ sentiment }) => {
    if (sentiment === 'positive') return <ThumbsUp className="w-5 h-5 text-green-600" />;
    if (sentiment === 'negative') return <ThumbsDown className="w-5 h-5 text-red-500" />;
    return <Meh className="w-5 h-5 text-amber-500" />;
};

const sentimentStyles = {
    positive: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', label: 'Highly Recommended' },
    mixed: { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', label: 'Generally Positive' },
    negative: { bg: 'from-red-50 to-rose-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', label: 'Mixed Feedback' },
};

const ReviewSection = ({ productId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [aiVerdict, setAiVerdict] = useState(null);
    const [verdictLoading, setVerdictLoading] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!productId) return;
            try {
                const { data } = await axios.get(`http://localhost:5000/api/reviews/${productId}`);
                setReviews(data);

                // Fetch AI verdict silently if there are 2+ reviews
                if (data.length >= 2) {
                    setVerdictLoading(true);
                    try {
                        const { data: verdictData } = await axios.get(`http://localhost:5000/api/ai/review-summary/${productId}`);
                        if (verdictData.verdict) setAiVerdict(verdictData);
                    } catch {
                        // Silent fail — AI verdict is non-critical
                    } finally {
                        setVerdictLoading(false);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
                setFetchError("Could not load reviews.");
            }
        };
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("You must be logged in to post a review.");
            return;
        }
        setIsSubmitting(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`http://localhost:5000/api/reviews/${productId}`, newReview, config);
            const postedReview = { ...data.review, user: { name: user.name } };
            setReviews([postedReview, ...reviews]);
            setNewReview({ rating: 5, comment: '' });
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to post review. You might have already reviewed this product.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const styles = sentimentStyles[aiVerdict?.sentiment] || sentimentStyles.positive;

    return (
        <div className="pt-8 mt-8 border-t border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>

            {/* AI Community Verdict Card */}
            {verdictLoading && (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-6 flex items-center gap-3 animate-pulse">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <p className="text-gray-400 text-sm font-medium">AI is reading the reviews…</p>
                </div>
            )}
            {aiVerdict && !verdictLoading && (
                <div className={`bg-gradient-to-r ${styles.bg} rounded-2xl border ${styles.border} p-5 mb-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-10 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full -translate-y-8 translate-x-8" />
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="bg-white rounded-xl p-2 shadow-sm">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="text-xs font-black text-purple-700 uppercase tracking-widest">AI Community Verdict</span>
                                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
                                    <SentimentIcon sentiment={aiVerdict.sentiment} />
                                    {styles.label}
                                </span>
                                <span className="text-xs font-bold text-gray-500 ml-auto">★ {aiVerdict.avgRating}/5</span>
                            </div>
                            <p className="text-gray-800 text-sm leading-relaxed font-medium italic">"{aiVerdict.verdict}"</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Review Form */}
            {user ? (
                <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4">Write a Review</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Rating:</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${newReview.rating >= star ? 'text-yellow-400 bg-white shadow-sm' : 'text-gray-300'}`}
                                    >
                                        <Star className="w-5 h-5 fill-current" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                placeholder="Share your experience..."
                                required
                                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary text-sm px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Review'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100 text-center">
                    <p className="text-gray-600">Please <a href="/login" className="text-primary font-bold underline">log in</a> to write a review.</p>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {fetchError && <p className="text-red-500 text-sm">{fetchError}</p>}
                {reviews.length === 0 && !fetchError && <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>}
                {reviews.map(review => (
                    <div key={review._id || review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#EFEBE9] rounded-full flex items-center justify-center border border-[#D7CCC8]">
                                    <User className="w-5 h-5 text-[#8D6E63]" />
                                </div>
                                <span className="font-bold text-[#3E2723]">{review.user?.name || review.user}</span>
                            </div>
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed">"{review.comment}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewSection;
