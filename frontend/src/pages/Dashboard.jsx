import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Sparkles, X, Upload, Edit, Trash2, Leaf, Video, Check, AlertCircle, TrendingUp, Share2, Copy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import AccessDenied from './AccessDenied';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showAvatarGenerator, setShowAvatarGenerator] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [stock, setStock] = useState('');
    const [ecoMaterial, setEcoMaterial] = useState('');
    const [ecoCarbon, setEcoCarbon] = useState('');
    const [ecoRecycling, setEcoRecycling] = useState('');

    // AI State
    const [generating, setGenerating] = useState(false);
    const [predictingPrice, setPredictingPrice] = useState(false);
    const [priceSuggestion, setPriceSuggestion] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [strategyLoading, setStrategyLoading] = useState(false);
    const [strategyResult, setStrategyResult] = useState('');
    const [showStrategyModal, setShowStrategyModal] = useState(false);
    const [strategyProduct, setStrategyProduct] = useState(null);
    const [trendData, setTrendData] = useState(null);
    const [trendLoading, setTrendLoading] = useState(false);
    const [captionProduct, setCaptionProduct] = useState(null);
    const [captionData, setCaptionData] = useState(null);
    const [captionLoading, setCaptionLoading] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [generatingName, setGeneratingName] = useState(false);
    const [nameSuggestions, setNameSuggestions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products
                const { data: productData } = await axios.get(`http://localhost:5000/api/products`);
                // Assume we only want this artisan's products (simplified for demo, usually filtered on backend)
                const artisanProducts = productData.filter(p => p.artisan?._id === user._id || p.artisan === user._id);
                setProducts(artisanProducts);

                // Fetch Orders
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data: orderData } = await axios.get('http://localhost:5000/api/orders/artisan', config);
                setOrders(orderData);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            }
        };
        if (user) {
            fetchData();
            // Auto-fetch market trends for artisans
            setTrendLoading(true);
            axios.get('http://localhost:5000/api/ai/trend-forecast', {
                headers: { Authorization: `Bearer ${user.token}` }
            }).then(res => {
                if (res.data?.trends?.length > 0) setTrendData(res.data);
            }).catch(() => {}).finally(() => setTrendLoading(false));
        }
    }, [user]);

    const handleGenerateDescription = async () => {
        if (!name || !category) {
            alert('Please enter Name and Category first to help the AI!');
            return;
        }
        setGenerating(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/products/generate-description', {
                productName: name,
                category,
                keywords: 'handmade, organic, premium'
            });
            setDescription(data.description);
        } catch (error) {
            console.error(error);
            // Fallback for demo if backend fails
            setDescription(`(AI Generated) A stunning ${name} that captures the essence of ${category}. Carefully handcrafted using premium materials, this unique piece adds elegance and charm to any collection. Perfect for those who appreciate authentic artistry.`);
        } finally {
            setGenerating(false);
        }
    };

    const handlePredictPrice = async () => {
        if (!category || !ecoMaterial) {
            alert('Please enter Category and Material score to help the AI predict the price!');
            return;
        }
        setPredictingPrice(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('http://localhost:5000/api/ai/predict-price', {
                category,
                material_cost: parseInt(ecoMaterial) * 5 || 20, // rough mockup
                labor_hours: 5
            }, config);
            setPriceSuggestion(data);
            if (data.suggested_price) {
                setPrice(data.suggested_price);
            }
        } catch (error) {
            console.error("Price prediction failed", error);
            // Fallback for demo
            setPrice(85.50);
            setPriceSuggestion({
                suggested_price: 85.50,
                confidence: 0.9,
                breakdown: { base_cost: 35, category_premium: 120 }
            });
        } finally {
            setPredictingPrice(false);
        }
    };

    const handleGenerateName = async () => {
        if (!category) {
            alert('Please select a Category first!');
            return;
        }
        setGeneratingName(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('http://localhost:5000/api/ai/product-name', {
                category,
                description
            }, config);
            setNameSuggestions(data.suggestions);
        } catch (error) {
            console.error("Name generation failed", error);
            setNameSuggestions(['Artisan Treasure', 'Handcrafted Elegance', 'Heritage Piece']);
        } finally {
            setGeneratingName(false);
        }
    };

    const handleVerifyHandmade = async () => {
        if (!name || !description) {
            alert('Please provide a Product Name and Description first to verify authenticity.');
            return;
        }
        setVerifying(true);
        setVerificationResult(null);

        try {
            const { data } = await axios.post('http://localhost:5000/api/ai/verify-handmade', {
                product: name,
                description: description
            });

            setVerificationResult({
                isHandmadeVerified: data.verificationResult === 'Verified Handmade',
                handmadeAuthenticityScore: data.authenticityScore,
                handmadeReasoning: data.reasoning,
                fullData: data // optional, to display reasoning in the UI
            });
        } catch (error) {
            console.error('Verification failed', error);
            alert('Verification service is temporarily unavailable. You can still list the product.');
        } finally {
            setVerifying(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('category', category);
            formData.append('stock', stock);
            formData.append('ecoMaterial', ecoMaterial);
            formData.append('ecoCarbon', ecoCarbon);
            formData.append('ecoRecycling', ecoRecycling);
            formData.append('artisanId', user?._id);

            // Append Verification Data if it was processed
            if (verificationResult) {
                formData.append('isHandmadeVerified', verificationResult.isHandmadeVerified);
                formData.append('handmadeAuthenticityScore', verificationResult.handmadeAuthenticityScore);
                formData.append('handmadeReasoning', verificationResult.handmadeReasoning);
                if (verificationResult.fullData && verificationResult.fullData.keyObservations) {
                    formData.append('handmadeKeyObservations', JSON.stringify(verificationResult.fullData.keyObservations));
                }
            }

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                },
            };

            const { data } = await axios.post('http://localhost:5000/api/products', formData, config);

            setProducts([...products, data]);
            setShowAddForm(false);

            // Reset state
            setName(''); setDescription(''); setPrice(''); setCategory(''); setImageFile(null);
            setImagePreview(''); setStock(''); setEcoMaterial(''); setEcoCarbon(''); setEcoRecycling('');
            setVerificationResult(null);
        } catch (error) {
            console.error(error);
            alert('Failed to create product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
            };
            await axios.delete(`http://localhost:5000/api/products/${productId}`, config);
            setProducts(products.filter(p => p._id !== productId));
        } catch (error) {
            console.error("Delete failed:", error);
            alert('Failed to delete product. Please try again.');
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setCategory(product.category);
        setStock(product.stock);
        if (product.ecoScore) {
            setEcoMaterial(product.ecoScore.material);
            setEcoCarbon(product.ecoScore.carbon);
            setEcoRecycling(product.ecoScore.recycling);
        }
        setShowEditModal(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
            };
            const updatedData = {
                name,
                description,
                price: parseFloat(price),
                category,
                stock: parseInt(stock),
                ecoScore: {
                    material: parseInt(ecoMaterial),
                    carbon: parseInt(ecoCarbon),
                    recycling: parseInt(ecoRecycling)
                }
            };
            const { data } = await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, updatedData, config);
            setProducts(products.map(p => p._id === data._id ? data : p));
            setShowEditModal(false);
            setEditingProduct(null);
            alert('Product updated successfully!');
        } catch (error) {
            console.error("Update failed:", error);
            alert('Failed to update product');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
            };
            const { data } = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus }, config);
            setOrders(orders.map(o => o._id === data._id ? data : o));
            alert(`Order marked as ${newStatus}`);
        } catch (error) {
            console.error("Status update failed:", error);
            alert('Failed to update order status');
        }
    };

    const [photoTipsLoading, setPhotoTipsLoading] = useState(false);
    const [photoTips, setPhotoTips] = useState('');

    const handleGetSalesStrategy = async (product) => {
        setStrategyProduct(product);
        setStrategyLoading(true);
        setStrategyResult('');
        setShowStrategyModal(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('http://localhost:5000/api/ai/sales-strategy', {
                productName: product.name,
                description: product.description,
                price: product.price,
                category: product.category
            }, config);
            setStrategyResult(data.strategy);
        } catch (error) {
            console.error("Strategy failed:", error);
            setStrategyResult("Our consultant is currently unavailable. Please focus on your craft and try again later!");
        } finally {
            setStrategyLoading(false);
        }
    };

    const handleGetSocialCaption = async (product) => {
        setCaptionProduct(product);
        setCaptionData(null);
        setCaptionLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('http://localhost:5000/api/ai/social-caption', {
                productName: product.name,
                description: product.description,
                category: product.category,
                price: product.price
            }, config);
            setCaptionData(data);
        } catch {
            setCaptionData({ instagram: 'Could not generate. Try again.', twitter: 'Could not generate. Try again.' });
        } finally {
            setCaptionLoading(false);
        }
    };

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    if (!user || user.role !== 'artisan') {
        return <AccessDenied />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-6 border-b border-[#3E2723]/10">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Artisan Profile" className="w-20 h-20 rounded-full object-cover shadow-lg border-4 border-white" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white">
                                {user?.name?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#3E2723]">Seller Dashboard</h1>
                        <p className="text-[#8D6E63] mt-1 flex items-center gap-2">
                            Welcome back, {user?.name}!
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-6 md:mt-0">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'products' ? 'border-[#3E2723] text-[#3E2723]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        My Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'orders' ? 'border-[#3E2723] text-[#3E2723]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Received Orders
                    </button>
                </div>
                {activeTab === 'products' && (
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <Link
                            to={`/live/${user?._id}`}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-red-600/30"
                        >
                            <Video className="w-5 h-5 animate-pulse" /> Go Live
                        </Link>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 btn-primary"
                        >
                            <Plus className="w-5 h-5" /> Add New Product
                        </button>
                    </div>
                )}
            </div>

            {/* AI Market Intelligence Panel */}
            {trendData && (
                <div className="mb-8 bg-gradient-to-br from-[#FFF8E1] to-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-white/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Market Intelligence</h2>
                                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
                                    Seasonal Forecast: <span className="text-amber-900">{trendData.season}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-100/50 rounded-full border border-amber-200">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span className="text-[10px] font-black text-amber-800 uppercase tracking-tighter">AI Powered</span>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {trendData.trends.map((trend, idx) => (
                                <div key={idx} className="bg-white rounded-xl p-4 border border-amber-50 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{trend.emoji}</span>
                                            <h3 className="font-bold text-gray-900 group-hover:text-amber-800 transition-colors">{trend.category}</h3>
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                            trend.demand === 'High' ? 'bg-red-100 text-red-700' : 
                                            trend.demand === 'Growing' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {trend.demand} Demand
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                        {trend.insight}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Product Modal/Form */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-800">List a New Creation</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProduct} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-semibold text-gray-700">Product Name</label>
                                            <button
                                                type="button"
                                                onClick={handleGenerateName}
                                                disabled={generatingName || !category}
                                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:text-blue-800 disabled:opacity-30 transition"
                                            >
                                                <Sparkles className={`w-3 h-3 ${generatingName ? 'animate-spin' : ''}`} />
                                                Generate AI Name
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={name} 
                                                onChange={e => setName(e.target.value)} 
                                                className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border" 
                                                placeholder="e.g. Handmade Ceramic Vase" 
                                                required 
                                            />
                                            {nameSuggestions.length > 0 && (
                                                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-blue-100 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                                                    <div className="p-2 border-b border-blue-50 bg-blue-50/30 flex justify-between items-center">
                                                        <span className="text-[9px] font-bold text-blue-700 uppercase">AI Suggestions</span>
                                                        <button onClick={() => setNameSuggestions([])} className="text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
                                                    </div>
                                                    <div className="max-h-40 overflow-y-auto">
                                                        {nameSuggestions.map((suggestion, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => { setName(suggestion); setNameSuggestions([]); }}
                                                                className="w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 text-gray-700 transition"
                                                            >
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border" required>
                                            <option value="">Select Category</option>
                                            <option value="Jewelry">Jewelry</option>
                                            <option value="Pottery">Pottery</option>
                                            <option value="Textiles">Textiles</option>
                                            <option value="Home Decor">Home Decor</option>
                                            <option value="Painting">Painting</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
                                            <div className="flex gap-2">
                                                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border" placeholder="0.00" required />
                                                <button
                                                    type="button"
                                                    onClick={handlePredictPrice}
                                                    disabled={predictingPrice || !category}
                                                    title="AI Price Prediction"
                                                    className="bg-blue-100 text-blue-700 px-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center disabled:opacity-50"
                                                >
                                                    <Sparkles className={`w-4 h-4 ${predictingPrice ? 'animate-spin' : ''}`} />
                                                </button>
                                            </div>
                                            {priceSuggestion && (
                                                <p className="text-xs text-blue-600 mt-1 mt-1 flex items-center gap-1 font-medium">
                                                    <Sparkles className="w-3 h-3" />
                                                    AI suggests ${priceSuggestion.suggested_price.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                                            <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border" placeholder="1" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2 bg-green-50 p-4 rounded-xl border border-green-200 mt-4">
                                        <h3 className="font-bold text-green-800 flex items-center gap-2"><Leaf className="w-4 h-4" /> Sustainability Score</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-green-700 mb-1">Material (0-10)</label>
                                                <input type="number" min="0" max="10" value={ecoMaterial} onChange={e => setEcoMaterial(e.target.value)} className="w-full border-green-300 rounded-lg p-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-green-700 mb-1">Carbon (0-10)</label>
                                                <input type="number" min="0" max="10" value={ecoCarbon} onChange={e => setEcoCarbon(e.target.value)} className="w-full border-green-300 rounded-lg p-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-green-700 mb-1">Recycling (0-10)</label>
                                                <input type="number" min="0" max="10" value={ecoRecycling} onChange={e => setEcoRecycling(e.target.value)} className="w-full border-green-300 rounded-lg p-2 border" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Image</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2 border bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-[#3E2723] hover:file:bg-[#EFEBE9] cursor-pointer"
                                                required={!imageFile}
                                            />
                                        </div>
                                        {imagePreview && (
                                            <div className="space-y-3">
                                                <img src={imagePreview} alt="Product image preview" loading="lazy" className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-200" />
                                                <div className="bg-[#EFEBE9]/50 p-3 rounded-lg border border-[#D7CCC8] relative">
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleGetPhotoTips(imagePreview)}
                                                        disabled={photoTipsLoading}
                                                        className="w-full py-1.5 bg-[#3E2723] text-white text-[9px] font-bold rounded-md flex items-center justify-center gap-1.5 hover:bg-[#2D1B15] transition disabled:opacity-50"
                                                    >
                                                        {photoTipsLoading ? 'Analyzing...' : <><Sparkles className="w-2.5 h-2.5 text-amber-300" /> Get AI Photo Advice</>}
                                                    </button>
                                                    {photoTips && (
                                                        <div className="mt-2 text-[9px] text-[#3E2723] italic font-serif leading-relaxed animate-fade-in whitespace-pre-wrap px-1">
                                                            {photoTips}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 bg-[#EFEBE9] p-6 rounded-xl border border-[#D7CCC8]">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-[#3E2723]">Description</label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateDescription}
                                        disabled={generating}
                                        className="flex items-center gap-2 bg-[#3E2723] text-white text-xs px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        {generating ? 'Magic Generating...' : 'Generate with AI'}
                                    </button>
                                </div>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 p-3 border h-32 text-sm"
                                    placeholder="Describe your product manually or use our AI tool..."
                                    required
                                />
                                <p className="text-xs text-purple-600 italic">✨ Tip: Enter a name and category, then hit 'Generate with AI' to get an instant professional description!</p>
                            </div>

                            {/* Verification Section */}
                            <div className="space-y-4 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <label className="block text-sm font-bold text-blue-900">AI Authenticity Inspector</label>
                                        <p className="text-xs text-blue-700 mt-1">Verify your item as handmade to build buyer trust.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleVerifyHandmade}
                                        disabled={verifying || !name || !description}
                                        className="flex items-center gap-2 bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {verifying ? <Sparkles className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        {verifying ? 'Inspecting...' : 'Verify Handmade'}
                                    </button>
                                </div>

                                {verificationResult && (
                                    <div className={`p-4 rounded-xl border ${verificationResult.isHandmadeVerified ? 'bg-green-100 border-green-300' : 'bg-orange-100 border-orange-300'} animate-fade-in`}>
                                        <div className="flex items-start gap-3">
                                            {verificationResult.isHandmadeVerified ? (
                                                <Sparkles className="w-6 h-6 text-green-700 shrink-0 mt-0.5" />
                                            ) : (
                                                <AlertCircle className="w-6 h-6 text-orange-700 shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <h4 className={`font-bold text-lg ${verificationResult.isHandmadeVerified ? 'text-green-800' : 'text-orange-800'}`}>
                                                    {verificationResult.fullData?.verificationResult || (verificationResult.isHandmadeVerified ? 'Verified Handmade' : 'Verification Pending')}
                                                </h4>
                                                <p className={`text-sm mt-1 font-medium ${verificationResult.isHandmadeVerified ? 'text-green-900' : 'text-orange-900'}`}>
                                                    Authenticity Score: {verificationResult.handmadeAuthenticityScore}%
                                                </p>
                                                <p className="text-sm mt-2 text-gray-700 leading-relaxed bg-white/50 p-3 rounded-lg">
                                                    "{verificationResult.handmadeReasoning}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowAddForm(false)} className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="w-full py-3 rounded-xl bg-[#3E2723] text-white font-bold hover:bg-[#8D6E63] shadow-lg shadow-[#3E2723]/25 transition">Publish Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-800">Edit Your Creation</h2>
                            <button onClick={() => { setShowEditModal(false); setEditingProduct(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProduct} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border" placeholder="e.g. Handmade Ceramic Vase" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border" required>
                                            <option value="">Select Category</option>
                                            <option value="Jewelry">Jewelry</option>
                                            <option value="Pottery">Pottery</option>
                                            <option value="Textiles">Textiles</option>
                                            <option value="Home Decor">Home Decor</option>
                                            <option value="Painting">Painting</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
                                            <div className="flex gap-2">
                                                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border" placeholder="0.00" required />
                                                <button
                                                    type="button"
                                                    onClick={handlePredictPrice}
                                                    disabled={predictingPrice || !category}
                                                    title="AI Price Prediction"
                                                    className="bg-blue-100 text-blue-700 px-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center disabled:opacity-50"
                                                >
                                                    <Sparkles className={`w-4 h-4 ${predictingPrice ? 'animate-spin' : ''}`} />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                                            <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border" placeholder="1" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2 bg-green-50 p-4 rounded-xl border border-green-200 mt-4">
                                        <h3 className="font-bold text-green-800 flex items-center gap-2"><Leaf className="w-4 h-4" /> Sustainability Score</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <input type="number" min="0" max="10" value={ecoMaterial} onChange={e => setEcoMaterial(e.target.value)} className="w-full border-green-300 rounded-lg p-2 border" />
                                            </div>
                                            <div>
                                                <input type="number" min="0" max="10" value={ecoCarbon} onChange={e => setEcoCarbon(e.target.value)} className="w-full border-green-300 rounded-lg p-2 border" />
                                            </div>
                                            <div>
                                                <input type="number" min="0" max="10" value={ecoRecycling} onChange={e => setEcoRecycling(e.target.value)} className="w-full border-green-300 rounded-lg p-2 border" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                                        <img src={editingProduct.imageUrl} alt={name} className="w-full h-full object-cover" />
                                        <p className="absolute bottom-0 inset-x-0 text-[10px] text-center p-1 text-gray-500 bg-white/80">Image cannot be changed during quick edit</p>
                                    </div>

                                    <div className="bg-[#EFEBE9]/50 p-4 rounded-xl border border-[#D7CCC8] relative overflow-hidden">
                                        <button 
                                            type="button"
                                            onClick={() => handleGetPhotoTips(editingProduct.imageUrl)}
                                            disabled={photoTipsLoading}
                                            className="w-full py-2 bg-[#3E2723] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#2D1B15] transition disabled:opacity-50"
                                        >
                                            {photoTipsLoading ? 'Analyzing Lighting...' : <><Sparkles className="w-3 h-3 text-amber-300" /> Improve Photo with AI</>}
                                        </button>
                                        {photoTips && (
                                            <div className="mt-3 p-3 bg-white/70 rounded-lg text-[10px] text-[#3E2723] italic font-serif border border-white leading-relaxed animate-fade-in whitespace-pre-wrap">
                                                {photoTips}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 bg-[#EFEBE9] p-4 rounded-xl border border-[#D7CCC8]">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-bold text-[#3E2723]">AI Description</label>
                                            <button
                                                type="button"
                                                onClick={handleGenerateDescription}
                                                disabled={generating}
                                                className="bg-[#3E2723] text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-sm hover:shadow-md transition disabled:opacity-50"
                                            >
                                                {generating ? '...' : 'Re-generate'}
                                            </button>
                                        </div>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2 border h-32 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => { setShowEditModal(false); setEditingProduct(null); }} className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition">Update Details</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Dashboard Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2 bg-[#EFEBE9]/30 rounded-2xl border border-[#3E2723]/10 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#3E2723] mb-6">Sales Activity</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Mon', sales: 120 },
                                { name: 'Tue', sales: 250 },
                                { name: 'Wed', sales: 180 },
                                { name: 'Thu', sales: 300 },
                                { name: 'Fri', sales: 450 },
                                { name: 'Sat', sales: 380 },
                                { name: 'Sun', sales: 200 },
                            ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#8D6E63" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#8D6E63" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip cursor={{ fill: '#D7CCC8', opacity: 0.4 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', color: '#3E2723' }} />
                                <Bar dataKey="sales" fill="#3E2723" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex-1 flex flex-col justify-center">
                        <p className="text-gray-500 text-sm font-semibold mb-1">Total Revenue</p>
                        <p className="text-4xl font-black text-[#3E2723] mb-2">$1,250.00</p>
                        <span className="inline-flex max-w-max items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            +12% this month
                        </span>
                    </div>
                    <div className="bg-gradient-to-br from-[#3E2723] to-[#5D4037] rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center text-white">
                        <p className="text-white/80 text-sm font-medium mb-1">Active Listings</p>
                        <p className="text-4xl font-black mb-2">{products.length}</p>
                        <p className="text-sm font-medium text-white/90">Manage your inventory</p>
                    </div>
                </div>
            </div>

            {activeTab === 'products' ? (
                <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.length > 0 ? products.map(product => (
                            <div key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 group">
                                <div className="relative h-48 overflow-hidden">
                                    <img src={product.imageUrl} alt={`${product.name} product preview`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                </div>
                                <div className="p-4 flex flex-col h-full">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-primary font-bold">${product.price}</span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100/80">
                                        <button 
                                            onClick={() => handleGetSalesStrategy(product)}
                                            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition bg-blue-50 py-2.5 rounded-lg border border-blue-100 hover:border-blue-200"
                                        >
                                            <TrendingUp className="w-3.5 h-3.5" /> AI Growth Strategy
                                        </button>
                                        <button 
                                            onClick={() => handleGetSocialCaption(product)}
                                            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-pink-600 hover:text-pink-700 transition bg-pink-50 py-2.5 rounded-lg border border-pink-100 hover:border-pink-200"
                                        >
                                            <Share2 className="w-3.5 h-3.5" /> AI Social Captions
                                        </button>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleEditClick(product)}
                                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#3E2723] transition bg-gray-50 py-2 rounded-lg border border-gray-200 hover:border-gray-300"
                                            >
                                                <Edit className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="flex items-center justify-center text-red-400 hover:text-red-600 transition bg-red-50 p-2 rounded-lg border border-red-100 hover:border-red-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No products listed yet. Start selling today!</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Orders</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="p-4 font-semibold text-gray-600">Order ID</th>
                                            <th className="p-4 font-semibold text-gray-600">Date</th>
                                            <th className="p-4 font-semibold text-gray-600">Customer</th>
                                            <th className="p-4 font-semibold text-gray-600">Items (Yours)</th>
                                            <th className="p-4 font-semibold text-gray-600">Total Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map(order => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition">
                                                <td className="p-4 text-sm font-mono text-gray-600">{order._id.substring(0, 8)}...</td>
                                                <td className="p-4 text-sm text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 text-sm text-gray-800">{order.user?.name || 'Guest'}</td>
                                                <td className="p-4 text-sm text-gray-800">
                                                    {order.orderItems
                                                        .filter(item => item.product?.artisan === user._id)
                                                        .map(item => (
                                                            <div key={item._id} className="truncate max-w-[200px]" title={item.name}>
                                                                {item.qty}x {item.name}
                                                            </div>
                                                        ))}
                                                </td>
                                                <td className="p-4">
                                                    <select 
                                                        value={order.status || 'Paid'} 
                                                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-[#3E2723] cursor-pointer transition-colors shadow-sm
                                                            ${(order.status === 'Delivered') ? 'bg-green-100 text-green-700' : 
                                                              (order.status === 'Shipped') ? 'bg-blue-100 text-blue-700' : 
                                                              (order.status === 'Processing') ? 'bg-orange-100 text-orange-700' : 
                                                              'bg-purple-100 text-purple-700'}`}
                                                    >
                                                        <option value="Paid">Received (Paid)</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No orders received yet. Keep promoting your products!</p>
                            </div>
                        )}
                    </div>
                </>
            )}
            {/* Received Orders Table ... */}
            {/* AI Strategy Modal */}
            {showStrategyModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#3E2723]/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
                        <div className="bg-[#3E2723] p-8 text-white relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <button onClick={() => setShowStrategyModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition p-2 hover:bg-white/10 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                                    <TrendingUp className="w-8 h-8 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-amber-50 leading-tight">AI Sales Strategist</h2>
                                    <p className="text-amber-100/60 text-sm font-medium">Growth Analysis for "{strategyProduct?.name}"</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-[#FDFBF9]">
                            {strategyLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 border-4 border-[#3E2723]/10 border-t-amber-500 rounded-full animate-spin mb-6"></div>
                                    <h3 className="text-xl font-bold text-[#3E2723]">Consulting our retail experts...</h3>
                                    <p className="text-gray-500 text-sm mt-2">Gemini is analyzing market trends and your product narrative.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-slide-up">
                                    <div className="bg-white p-6 rounded-3xl border border-[#D7CCC8]/30 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-1 h-full bg-amber-500/20 group-hover:bg-amber-500 transition-all"></div>
                                        <h3 className="text-sm font-bold text-[#3E2723] uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-500" /> Professional Verdict
                                        </h3>
                                        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap italic font-serif">
                                            {strategyResult}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowStrategyModal(false)}
                                        className="w-full py-4 bg-[#3E2723] text-white font-bold rounded-2xl hover:bg-[#2D1B15] transition shadow-lg shadow-[#3E2723]/20 flex items-center justify-center gap-2"
                                    >
                                        Apply Insights <Check className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* AI Social Caption Modal */}
            {captionProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Share2 className="w-5 h-5 text-white" />
                                <div>
                                    <h2 className="text-white font-black text-lg">AI Social Captions</h2>
                                    <p className="text-pink-100 text-xs font-medium truncate max-w-[250px]">{captionProduct.name}</p>
                                </div>
                            </div>
                            <button onClick={() => { setCaptionProduct(null); setCaptionData(null); }} className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            {captionLoading && (
                                <div className="flex items-center gap-3 py-6 justify-center">
                                    <Sparkles className="w-5 h-5 text-pink-500 animate-spin" />
                                    <span className="text-gray-500 font-medium">Crafting captions for you…</span>
                                </div>
                            )}
                            {captionData && !captionLoading && (
                                <>
                                    {/* Instagram */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-sm text-gray-800 flex items-center gap-1.5">📸 Instagram</span>
                                            <button
                                                onClick={() => handleCopy(captionData.instagram, 'instagram')}
                                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition ${copiedField === 'instagram' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-700'}`}
                                            >
                                                {copiedField === 'instagram' ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                            </button>
                                        </div>
                                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                            {captionData.instagram}
                                        </div>
                                    </div>
                                    {/* Twitter / X */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-sm text-gray-800 flex items-center gap-1.5">𝕏 Twitter / X</span>
                                            <button
                                                onClick={() => handleCopy(captionData.twitter, 'twitter')}
                                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition ${copiedField === 'twitter' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                                            >
                                                {copiedField === 'twitter' ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                            </button>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100 text-sm text-gray-800 leading-relaxed">
                                            {captionData.twitter}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
