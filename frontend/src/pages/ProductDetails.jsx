import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingCart, Heart, ArrowLeft, Truck, ShieldCheck, Leaf, MessageCircle, Send, Sparkles, Box, Image as ImageIcon, Camera, Volume2, VolumeX, ArrowRight, X, Search, ListChecks, Check, Trash2, Video } from 'lucide-react';
import ReviewSection from '../components/ReviewSection';
import ModelViewer from '../components/ModelViewer';
import TransparencyWidget from '../components/TransparencyWidget';
import CommissionModal from '../components/CommissionModal';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [activeMedia, setActiveMedia] = useState(0);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [recommendations, setRecommendations] = useState([]);
    const [showAuthenticityModal, setShowAuthenticityModal] = useState(false);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [qaQuestion, setQaQuestion] = useState('');
    const [qaHistory, setQaHistory] = useState([]);
    const [qaLoading, setQaLoading] = useState(false);

    // Mock reviews (since backend reviews aren't ready yet)
    // Mock reviews (since backend reviews aren't ready yet)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(data);
                setComments(data.comments || []);
                setLikes(data.likes || []);

                // If artisan has followers array
                if (data.artisan && data.artisan.followers) {
                    setFollowersCount(data.artisan.followers.length);
                    if (user) {
                        setIsFollowing(data.artisan.followers.includes(user._id));
                    }
                }
                // Fetch AI Recommendations
                try {
                    const aiRes = await axios.get(`http://localhost:5000/api/ai/recommendations/${id}`);
                    setRecommendations(aiRes.data.recommendations || []);
                } catch (aiErr) {
                    console.error("AI recommendations failed silently", aiErr);
                }

            } catch (error) {
                console.error("Error fetching product", error);
                setProduct({
                    _id: id,
                    name: "Authentic Banarasi Saree",
                    description: "This is a fallback placeholder. Displaying our handcrafted Banarasi Saree with intricate golden zari aesthetics.",
                    price: 8500.00,
                    imageUrl: "/images/banarasi_saree.png",
                    images: [
                        "/images/blue_pottery.png",
                        "/images/dhokra_elephant.png"
                    ],
                    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                    category: "Textiles",
                    stock: 5,
                    artisan: { name: "Meera Textiles" }
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleLikeToggle = async () => {
        if (!user) {
            alert("Please login to like this product");
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (likes.includes(user._id)) {
                const { data } = await axios.post(`http://localhost:5000/api/products/${id}/unlike`, {}, config);
                setLikes(data);
            } else {
                const { data } = await axios.post(`http://localhost:5000/api/products/${id}/like`, {}, config);
                setLikes(data);
            }
        } catch (error) {
            console.error("Like toggle failed", error);
        }
    };

    const handleFollowToggle = async () => {
        if (!user) {
            alert("Please login to follow artisans");
            return;
        }
        if (!product || !product.artisan || !product.artisan._id) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (isFollowing) {
                await axios.post(`http://localhost:5000/api/users/${product.artisan._id}/unfollow`, {}, config);
                setIsFollowing(false);
                setFollowersCount(prev => prev - 1);
            } else {
                await axios.post(`http://localhost:5000/api/users/${product.artisan._id}/follow`, {}, config);
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
            }
        } catch (error) {
            console.error("Follow toggle failed", error);
        }
    };

    const [artisanStory, setArtisanStory] = useState(null);
    const [generatingStory, setGeneratingStory] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [stylingAdvice, setStylingAdvice] = useState(null);
    const [stylingLoading, setStylingLoading] = useState(false);

    const fetchStylingAdvice = async (p) => {
        if (!p) return;
        setStylingLoading(true);
        try {
            const { data } = await axios.post(`http://localhost:5000/api/ai/styling-advice/${id}`, {
                productName: p.name,
                description: p.description,
                category: p.category,
                price: p.price
            });
            setStylingAdvice(data);
        } catch (error) {
            console.error("Styling advice failed", error);
        } finally {
            setStylingLoading(false);
        }
    };

    useEffect(() => {
        if (product) {
            fetchStylingAdvice(product);
        }
    }, [product?._id]);

    const handleRevealStory = async () => {
        if (artisanStory) return; // Already generated
        setGeneratingStory(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/ai/story-behind-craft', {
                product: product.name,
                description: product.description,
                artisanName: product.artisan?.name,
                // Passing a generic location to prompt since we don't have location in artisan schema yet
                artisanLocation: 'their local community'
            });
            setArtisanStory(data);
        } catch (error) {
            console.error("Failed to fetch story", error);
            setArtisanStory({
                story: "Every piece in our artisan collection carries a unique heritage, crafted with care and dedication by talented local creators.",
                culturalSignificance: "Rooted in generations of traditional techniques.",
                emotions: ["Authentic", "Warmth", "Nostalgia"]
            });
        } finally {
            setGeneratingStory(false);
        }
    };

    const toggleSpeech = () => {
        if (!artisanStory) return;
        
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            const textToSpeak = `${artisanStory.story}. ${artisanStory.culturalSignificance || ''}`;
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
        
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
            };
            await axios.delete(`http://localhost:5000/api/products/${id}`, config);
            navigate('/');
        } catch (error) {
            console.error("Delete failed:", error);
            alert('Failed to delete product. Please try again.');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please login to comment");
            return;
        }
        if (!commentText.trim()) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`http://localhost:5000/api/products/${id}/comment`, { text: commentText }, config);
            setComments(data);
            setCommentText("");
        } catch (error) {
            console.error("Adding comment failed", error);
        }
    };

    const handleQaSubmit = async (q) => {
        const questionText = q || qaQuestion;
        if (!questionText.trim()) return;
        setQaHistory(prev => [...prev, { q: questionText, a: null, loading: true }]);
        setQaQuestion('');
        setQaLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/ai/product-qa', {
                question: questionText,
                productName: product?.name,
                description: product?.description,
                category: product?.category,
                price: product?.price
            });
            setQaHistory(prev => prev.map((item, i) =>
                i === prev.length - 1 ? { q: questionText, a: data.answer, loading: false } : item
            ));
        } catch {
            setQaHistory(prev => prev.map((item, i) =>
                i === prev.length - 1 ? { q: questionText, a: 'Our advisor is unavailable right now.', loading: false } : item
            ));
        } finally {
            setQaLoading(false);
        }
    };

    const mediaItems = [];
    if (product) {
        if (product.imageUrl) mediaItems.push({ type: 'image', url: product.imageUrl });
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => mediaItems.push({ type: 'image', url: img }));
        }
        if (product.videoUrl) mediaItems.push({ type: 'video', url: product.videoUrl });
        if (product.modelUrl) mediaItems.push({ type: '3d', url: product.modelUrl });
    }

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('viewMode') === '3d' && mediaItems.length > 0) {
            const threeDIndex = mediaItems.findIndex(item => item.type === '3d');
            if (threeDIndex !== -1) {
                setActiveMedia(threeDIndex);
            }
        }
    }, [location.search, mediaItems.length]);

    if (loading) return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/" className="inline-flex items-center text-[#8D6E63] hover:text-[#3E2723] mb-8 transition font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Visual Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-lg border border-gray-200 group relative">
                        {mediaItems.length > 0 && mediaItems[activeMedia]?.type === 'video' ? (
                            mediaItems[activeMedia].url.includes('youtube.com') || mediaItems[activeMedia].url.includes('youtu.be') ? (
                                <iframe 
                                    className="w-full h-full object-cover"
                                    src={(() => {
                                        const url = mediaItems[activeMedia].url;
                                        if (url.includes('embed/')) return url;
                                        let videoId = '';
                                        if (url.includes('v=')) {
                                            videoId = url.split('v=')[1].split('&')[0];
                                        } else if (url.includes('youtu.be/')) {
                                            videoId = url.split('youtu.be/')[1].split('?')[0];
                                        } else {
                                            const matches = url.match(/(?:\/v\/|shorts\/|embed\/|youtu\.be\/|\/watch\?v=|\/watch\?.+&v=)([^#&?]*)/);
                                            if (matches && matches[1]) videoId = matches[1];
                                        }
                                        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                                    })()}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video 
                                    src={mediaItems[activeMedia].url} 
                                    className="w-full h-full object-cover"
                                    autoPlay 
                                    loop 
                                    muted 
                                    controls
                                />
                            )
                        ) : mediaItems.length > 0 && mediaItems[activeMedia]?.type === '3d' ? (
                            <ModelViewer modelUrl={mediaItems[activeMedia].url} />
                        ) : (
                            <img 
                                src={mediaItems.length > 0 ? mediaItems[activeMedia].url : 'https://picsum.photos/seed/placeholder/600/600'} 
                                alt={product?.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                            />
                        )}
                        {mediaItems.length > 0 && mediaItems[activeMedia]?.type === 'video' && (
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" /> Artisan Video
                            </div>
                        )}
                    </div>
                    {/* Thumbnails */}
                    {mediaItems.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            {mediaItems.map((media, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setActiveMedia(idx)}
                                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeMedia === idx ? 'border-[#3E2723] shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    {media.type === 'video' ? (
                                        <>
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 transition-colors hover:bg-black/10">
                                                <div className="bg-white/90 p-1.5 rounded-full shadow-sm">
                                                    <Video className="w-5 h-5 text-[#3E2723]" />
                                                </div>
                                            </div>
                                            {media.url && (media.url.includes('youtube.com') || media.url.includes('youtu.be')) ? (
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                    <Video className="w-6 h-6 text-white/50" />
                                                </div>
                                            ) : (
                                                <video src={media.url} className="w-full h-full object-cover" />
                                            )}
                                        </>
                                    ) : media.type === '3d' ? (
                                        <>
                                            <div className="absolute inset-0 bg-[#EFEBE9]/80 flex items-center justify-center z-10 transition-colors hover:bg-[#EFEBE9]/60">
                                                <div className="bg-white/90 p-1.5 rounded-full shadow-sm">
                                                    <Box className="w-5 h-5 text-[#3E2723]" />
                                                </div>
                                            </div>
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <Box className="w-6 h-6 text-gray-400" />
                                            </div>
                                        </>
                                    ) : (
                                        <img src={media.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center space-x-2 text-sm text-[#8D6E63] mb-2">
                            <span className="bg-[#EFEBE9] text-[#8D6E63] px-2 py-1 rounded-md font-bold uppercase tracking-wider text-xs border border-[#D7CCC8]/50">{product.category}</span>
                            <span>•</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">By {product.artisan?.name || "Verified Artisan"}</span>
                                {product.artisan && product.artisan._id !== user?._id && (
                                    <button
                                        onClick={handleFollowToggle}
                                        className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${isFollowing ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                                {product.artisan && product.artisan._id !== user?._id && (
                                    <button
                                        onClick={() => setShowCommissionModal(true)}
                                        className="text-xs px-3 py-1 rounded-full font-bold transition-all bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-sm border border-amber-200/50 flex items-center gap-1.5 ml-2"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Request Commission
                                    </button>
                                )}
                            </div>
                        </div>

                        {product.isHandmadeVerified && (
                            <button 
                                onClick={() => setShowAuthenticityModal(true)}
                                className="flex items-center gap-3 mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-3.5 rounded-2xl shadow-sm w-max group hover:shadow-lg hover:-translate-y-0.5 transition-all text-left"
                            >
                                <div className="bg-green-100 p-2.5 rounded-xl group-hover:bg-green-200 transition-colors shadow-inner">
                                    <Sparkles className="w-6 h-6 text-green-700" />
                                </div>
                                <div className="pr-4">
                                    <p className="text-base font-black text-green-900 tracking-tight">Verified Handmade by KalaKart AI</p>
                                    <p className="text-xs font-bold text-green-700/80 group-hover:text-green-800 flex items-center gap-1.5 mt-1 transition-colors">
                                        Click to view Authenticity Report <ArrowRight className="w-3.5 h-3.5" />
                                    </p>
                                </div>
                            </button>
                        )}
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-[#3E2723] mb-4 tracking-tight">{product.name}</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-3xl font-extrabold text-[#3E2723]">₹{product.price}</span>
                            <div className="flex items-center bg-[#EFEBE9] px-2 py-1 rounded-lg border border-[#D7CCC8]/50">
                                <Star className={`w-5 h-5 ${(product.rating && product.rating > 0) ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`} />
                                <span className="ml-1 text-[#3E2723] font-bold">
                                    {(product.rating && product.rating > 0) ? product.rating.toFixed(1) : 'No Rating'}
                                    <span className="text-[#8D6E63] font-normal"> ({product.numReviews || 0} reviews)</span>
                                </span>
                            </div>
                        </div>
                        
                        <TransparencyWidget price={product.price} transparency={product.transparency} />
                    </div>

                    <p className="text-slate-600 text-lg leading-relaxed">
                        {product.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                        <button
                            onClick={() => addToCart(product)}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-5 h-5" /> Add to Cart
                        </button>
                        <button
                            onClick={handleLikeToggle}
                            className={`flex-none p-4 rounded-2xl flex items-center justify-center transition-all ${likes.includes(user?._id) ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200' : 'btn-secondary'}`}
                        >
                            <Heart className={`w-6 h-6 ${likes.includes(user?._id) ? 'fill-red-500 text-red-500' : ''}`} />
                            <span className="ml-2 font-bold">{likes.length}</span>
                        </button>

                        {user?._id === product.artisan?._id && (
                            <button
                                onClick={handleDelete}
                                className="flex-none p-4 rounded-2xl flex items-center justify-center transition-all bg-red-50 text-red-500 hover:bg-red-600 hover:text-white border border-red-200 shadow-sm"
                                title="Delete Product"
                            >
                                <Trash2 className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-[#8D6E63]">
                        <div className="flex items-center gap-2 p-3 bg-[#EFEBE9] rounded-xl border border-[#D7CCC8]/50 text-[#3E2723] font-bold shadow-sm">
                            <Truck className="w-5 h-5" />
                            <span>Free Shipping over ₹1000</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-[#EFEBE9] rounded-xl border border-[#D7CCC8]/50 text-[#3E2723] font-bold shadow-sm">
                            <ShieldCheck className="w-5 h-5" />
                            <span>Authenticity Guaranteed</span>
                        </div>
                    </div>

                    {product.ecoScore && product.ecoScore.total > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 text-green-800 font-bold shadow-sm">
                            <Leaf className="w-5 h-5 text-green-600" />
                            <span>Eco Score: {product.ecoScore.total}/30</span>
                            <div className="flex gap-2 ml-auto text-xs font-normal">
                                <span title="Material">M: {product.ecoScore.material}</span>
                                <span title="Carbon">C: {product.ecoScore.carbon}</span>
                                <span title="Recycle">R: {product.ecoScore.recycling}</span>
                            </div>
                        </div>
                    )}

                    {/* AI Stylist Tip Section */}
                    {stylingAdvice && (
                        <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/30 rounded-full blur-2xl -mr-8 -mt-8"></div>
                            <div className="flex items-center gap-3 mb-3 shrink-0">
                                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-black text-indigo-950 tracking-tight">AI Stylist's Tip</h3>
                            </div>
                            <p className="text-indigo-900/80 text-sm leading-relaxed font-medium italic mb-4">
                                "{stylingAdvice.tip}"
                            </p>
                            {stylingAdvice.pairings && (
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-indigo-200/50">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 w-full mb-1">Pairs beautifully with:</span>
                                    {stylingAdvice.pairings.map((pair, idx) => (
                                        <span key={idx} className="bg-white px-3 py-1 rounded-full text-[11px] font-bold text-indigo-700 border border-indigo-100 shadow-sm">
                                            {pair}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Story Behind the Craft Section */}
                    <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-amber-300/40 transition-colors" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-xl text-white shadow-md shadow-amber-500/30">
                                <Star className="w-5 h-5 fill-white" />
                            </div>
                            <h3 className="text-xl font-extrabold text-amber-950 tracking-tight">Story Behind the Craft</h3>
                        </div>

                        {!artisanStory && (
                            <div className="relative z-10">
                                <p className="text-sm text-amber-800/80 mb-4 font-medium italic">Discover the inspiration, materials, and heritage encoded within this piece.</p>
                                <button
                                    onClick={handleRevealStory}
                                    disabled={generatingStory}
                                    className="flex items-center gap-2 bg-amber-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-amber-950 hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                                >
                                    {generatingStory ? (
                                        <>
                                            <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
                                            <span>Unveiling Story...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                                            <span>Reveal the Artisan's Story</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {artisanStory && (
                            <div className="relative z-10 animate-fade-in flex flex-col gap-4">
                                {/* Emotion Badges */}
                                {artisanStory.emotions && (
                                    <div className="flex flex-wrap gap-2">
                                        {artisanStory.emotions.map((emotion, idx) => (
                                            <span key={idx} className="bg-amber-100/90 text-amber-800 border border-amber-200/60 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase shadow-sm">
                                                {emotion}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="bg-white/60 p-5 rounded-2xl border border-white/60 shadow-inner backdrop-blur-md relative">
                                    {/* Play Audio Button */}
                                    <button 
                                        onClick={toggleSpeech}
                                        className={`absolute top-4 right-4 p-2.5 rounded-full transition-all shadow-sm ${isPlaying ? 'bg-amber-600 text-white animate-pulse shadow-md' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                                        title={isPlaying ? "Stop Audio" : "Listen to the Story"}
                                    >
                                        {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    </button>
                                    
                                    <p className="text-base text-amber-950 leading-relaxed font-semibold pr-12">
                                        "{artisanStory.story || artisanStory}"
                                    </p>
                                    
                                    {artisanStory.culturalSignificance && (
                                        <div className="mt-4 pt-4 border-t border-amber-800/10">
                                            <p className="text-xs sm:text-sm text-amber-800 italic leading-relaxed">
                                                <span className="font-extrabold not-italic text-amber-900 mr-1.5 uppercase tracking-wide text-[10px] bg-amber-200/50 px-2 py-0.5 rounded">Cultural Root:</span> 
                                                {artisanStory.culturalSignificance}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Community Comments Section */}
                    <div className="pt-8 border-t border-gray-100">
                        <h3 className="text-2xl font-bold text-[#3E2723] mb-6 flex items-center gap-2"><MessageCircle className="w-6 h-6" /> Community Discussions ({comments.length})</h3>

                        <form onSubmit={handleCommentSubmit} className="mb-8 flex gap-3">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Ask a question or share your thoughts..."
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] text-sm"
                            />
                            <button type="submit" className="bg-[#3E2723] text-white px-5 rounded-xl hover:bg-[#5D4037] transition flex items-center justify-center">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>

                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {comments.slice().reverse().map((comment, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-sm text-[#3E2723]">{comment.name}</span>
                                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{comment.text}</p>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <p className="text-center text-sm text-gray-400 italic py-4">Be the first to start a discussion about this creation!</p>
                            )}
                        </div>
                    </div>

                    <ReviewSection productId={product._id} />
                </div>
            </div>

            {/* AI Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="mt-24 pt-12 border-t border-[#D7CCC8]/50">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-[#3E2723]">You might also love</h2>
                            <p className="text-[#8D6E63] text-sm mt-1 font-medium">Curated by KalaKart AI matching engine</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {recommendations.map(rec => (
                            <Link to={`/product/${rec.id || (rec._id ? rec._id : '')}`} key={rec.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-[#EFEBE9]">
                                <div className="aspect-square bg-[#EFEBE9] relative overflow-hidden">
                                    <img src={`https://picsum.photos/seed/${rec.id}/400/400`} alt={rec.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[#3E2723] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                        {rec.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-[#3E2723] text-lg mb-2 truncate group-hover:text-purple-700 transition-colors">{rec.name}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-extrabold text-[#3E2723]">₹{rec.price}</span>
                                        <button className="bg-[#EFEBE9] text-[#3E2723] p-2.5 rounded-xl group-hover:bg-[#3E2723] group-hover:text-white transition-colors shadow-sm">
                                            <ShoppingCart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Authenticity Modal */}
            {showAuthenticityModal && product && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative border border-green-100" onClick={(e) => e.stopPropagation()}>
                        {/* Header Banner */}
                        <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-400/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />
                            
                            <button onClick={() => setShowAuthenticityModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="bg-white p-3.5 rounded-2xl shadow-xl">
                                    <ShieldCheck className="w-10 h-10 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">Authenticity Report</h2>
                                    <p className="text-green-100 text-sm font-medium opacity-90 tracking-wide mt-1">INSPECTED BY KALAKART AI ENGINE</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8 bg-[#FAFAFA] max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Score Row */}
                            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Confidence Score</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="text-5xl font-black text-green-600">{product.handmadeAuthenticityScore}%</div>
                                        <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border border-green-200 shadow-sm">High Match</div>
                                    </div>
                                </div>
                                <div className="hidden sm:block text-right">
                                    <div className="w-20 h-20 rounded-full border-[6px] border-green-50 flex items-center justify-center relative shadow-inner">
                                        <svg className="w-20 h-20 absolute -top-1.5 -left-1.5 transform -rotate-90">
                                            <circle cx="40" cy="40" r="37" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="232.4" strokeDashoffset={232.4 - (232.4 * product.handmadeAuthenticityScore) / 100} className="transition-all duration-1000 ease-out" />
                                        </svg>
                                        <Sparkles className="w-8 h-8 text-green-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Reasoning */}
                            <div>
                                <h3 className="text-lg font-black text-[#3E2723] mb-4 flex items-center gap-2">
                                    <Search className="w-5 h-5 text-[#8D6E63]" /> AI Findings Overview
                                </h3>
                                <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                                    <p className="text-gray-700 leading-relaxed font-medium">"{product.handmadeReasoning}"</p>
                                </div>
                            </div>

                            {/* Bullet Observations */}
                            {product.handmadeKeyObservations && product.handmadeKeyObservations.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-black text-[#3E2723] mb-4 flex items-center gap-2">
                                        <ListChecks className="w-5 h-5 text-[#8D6E63]" /> Specific Human Marks Detected
                                    </h3>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm">
                                        <ul className="space-y-4">
                                            {product.handmadeKeyObservations.map((obs, idx) => (
                                                <li key={idx} className="flex items-start gap-4">
                                                    <div className="mt-0.5 bg-green-100 p-1.5 rounded-full text-green-600 shrink-0 shadow-sm">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-gray-700 font-medium text-sm leading-relaxed">{obs}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Product Q&A Panel */}
            <div className="mt-10 max-w-3xl mx-auto px-4 pb-12">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-indigo-100 flex items-center gap-3 bg-white/60 backdrop-blur">
                        <div className="bg-indigo-600 text-white p-2 rounded-xl shadow">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-lg">Ask the AI Advisor</h3>
                            <p className="text-xs text-indigo-600 font-semibold">Get expert answers about this product instantly</p>
                        </div>
                    </div>
                    <div className="p-5">
                        {/* Quick Questions */}
                        {qaHistory.length === 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['Is this suitable as a gift?', 'How do I care for this?', 'Can it be customised?', 'What materials are used?'].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => handleQaSubmit(q)}
                                        disabled={qaLoading}
                                        className="text-xs bg-white border border-indigo-200 text-indigo-700 font-bold px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition disabled:opacity-50 shadow-sm"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                        {/* Q&A History */}
                        {qaHistory.length > 0 && (
                            <div className="space-y-4 mb-4 max-h-56 overflow-y-auto pr-1">
                                {qaHistory.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-end mb-1">
                                            <span className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-xs font-medium">{item.q}</span>
                                        </div>
                                        <div className="flex justify-start">
                                            {item.loading ? (
                                                <span className="bg-white border border-indigo-100 text-indigo-400 text-xs px-4 py-2 rounded-2xl rounded-bl-sm italic animate-pulse shadow-sm">Thinking…</span>
                                            ) : (
                                                <span className="bg-white border border-indigo-100 text-gray-700 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-xs leading-relaxed shadow-sm">{item.a}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={qaQuestion}
                                onChange={e => setQaQuestion(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleQaSubmit()}
                                placeholder="Ask anything about this product…"
                                disabled={qaLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white placeholder-gray-400 disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleQaSubmit()}
                                disabled={qaLoading || !qaQuestion.trim()}
                                className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <CommissionModal 
                isOpen={showCommissionModal} 
                onClose={() => setShowCommissionModal(false)} 
                artisan={product.artisan} 
            />
        </div>
    );
};

export default ProductDetails;
