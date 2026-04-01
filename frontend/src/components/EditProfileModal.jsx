import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Upload, Save, MapPin, Instagram, Youtube, Globe, AlertCircle } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, currentProfile, onProfileUpdate }) => {
    const { user, login } = useAuth(); // Need login to update Context user data

    // Form State
    const [bio, setBio] = useState('');
    const [city, setCity] = useState('');
    const [stateLoc, setStateLoc] = useState('');
    const [country, setCountry] = useState('');
    const [craftStory, setCraftStory] = useState('');
    const [categories, setCategories] = useState([]);

    // Social Links
    const [instagram, setInstagram] = useState('');
    const [youtube, setYoutube] = useState('');
    const [website, setWebsite] = useState('');

    // Portfolio Images
    const [portfolioFiles, setPortfolioFiles] = useState([]);
    const [portfolioPreviews, setPortfolioPreviews] = useState([]);
    const [existingPortfolio, setExistingPortfolio] = useState([]);

    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);
    const [error, setError] = useState(null);

    const CRAFT_OPTIONS = ['Pottery', 'Handloom', 'Jewelry', 'Bamboo Craft', 'Painting', 'Textile Art', 'Wood Carving', 'Other'];

    useEffect(() => {
        if (currentProfile) {
            setBio(currentProfile.bio || '');
            setCity(currentProfile.location?.city || '');
            setStateLoc(currentProfile.location?.state || '');
            setCountry(currentProfile.location?.country || '');
            setCraftStory(currentProfile.craftStory || '');
            setCategories(currentProfile.craftCategories || []);
            setInstagram(currentProfile.socialLinks?.instagram || '');
            setYoutube(currentProfile.socialLinks?.youtube || '');
            setWebsite(currentProfile.socialLinks?.website || '');
            setExistingPortfolio(currentProfile.portfolio || []);
        }
    }, [currentProfile]);

    const handleCategoryToggle = (cat) => {
        if (categories.includes(cat)) {
            setCategories(categories.filter(c => c !== cat));
        } else {
            setCategories([...categories, cat]);
        }
    };

    const handlePortfolioChange = (e) => {
        const files = Array.from(e.target.files);
        // Calculate how many more we can add (max 5 total)
        const currentTotalLength = existingPortfolio.length + files.length;

        if (currentTotalLength > 5) {
            alert('You can only have up to 5 portfolio images in total.');
            return;
        }

        setPortfolioFiles([...portfolioFiles, ...files]);

        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPortfolioPreviews([...portfolioPreviews, ...newPreviews]);
    };

    const removeNewPreview = (index) => {
        const newFiles = [...portfolioFiles];
        newFiles.splice(index, 1);
        setPortfolioFiles(newFiles);

        const newPreviews = [...portfolioPreviews];
        newPreviews.splice(index, 1);
        setPortfolioPreviews(newPreviews);
    };

    const handleGenerateStory = async () => {
        if (!categories.length || !city || !stateLoc || !country) {
            alert('Please select categories and set your location first to help the AI!');
            return;
        }
        setIsGeneratingStory(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('http://localhost:5000/api/ai/artisan-story', {
                name: user.name,
                categories,
                location: { city, state: stateLoc, country }
            }, config);
            setCraftStory(data.story);
        } catch (err) {
            console.error("Story generation failed", err);
            setError("Failed to generate story. Please try again.");
        } finally {
            setIsGeneratingStory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            // 1. Update text fields
            const textData = {
                bio,
                location: { city, state: stateLoc, country },
                craftCategories: categories,
                socialLinks: { instagram, website, youtube },
                craftStory
            };

            const { data: updatedUser } = await axios.put('http://localhost:5000/api/users/profile', textData, config);

            // 2. Upload new portfolio images if any
            let finalUser = updatedUser;
            if (portfolioFiles.length > 0) {
                const formData = new FormData();
                portfolioFiles.forEach(file => {
                    formData.append('images', file);
                });

                const uploadConfig = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${user.token}`
                    }
                };

                const { data: portfolioData } = await axios.post('http://localhost:5000/api/users/profile/portfolio', formData, uploadConfig);
                finalUser.portfolio = portfolioData.portfolio;
            }

            // Update Auth Context & Parent State
            // Note: Since 'login' expects the full user obj including token, we must preserve it.
            login({ ...finalUser, token: user.token });

            if (onProfileUpdate) {
                onProfileUpdate(finalUser);
            }
            onClose();

        } catch (err) {
            console.error("Profile update error", err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/80">
                    <h2 className="text-2xl font-black text-[#3E2723]">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition p-2 rounded-full hover:bg-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    )}

                    <form id="profileForm" onSubmit={handleSubmit} className="space-y-8">
                        {/* Bio Section */}
                        <section>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Short Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={200}
                                placeholder="e.g. I am Meera, a rural artisan from Rajasthan specializing in handmade bamboo baskets..."
                                className="w-full border-gray-300 rounded-xl focus:ring-[#3E2723] focus:border-[#3E2723] p-4 text-gray-700 resize-none h-28 bg-gray-50"
                            />
                            <p className="text-right text-xs text-gray-500 mt-1">{bio.length}/200 characters</p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Location Section */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2"><MapPin className="w-4 h-4 text-gray-500" /> Location Location</h3>
                                <div>
                                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="w-full border-gray-300 rounded-lg p-3 text-sm focus:ring-[#3E2723] focus:border-[#3E2723] bg-gray-50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" value={stateLoc} onChange={e => setStateLoc(e.target.value)} placeholder="State" className="w-full border-gray-300 rounded-lg p-3 text-sm focus:ring-[#3E2723] focus:border-[#3E2723] bg-gray-50" />
                                    <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" className="w-full border-gray-300 rounded-lg p-3 text-sm focus:ring-[#3E2723] focus:border-[#3E2723] bg-gray-50" />
                                </div>
                            </section>

                            {/* Social Links Section */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Social Links</h3>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Instagram className="h-4 w-4 text-pink-500" />
                                    </div>
                                    <input type="url" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="Instagram URL" className="w-full pl-10 border-gray-300 rounded-lg p-3 text-sm focus:ring-[#3E2723] focus:border-[#3E2723] bg-gray-50" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Youtube className="h-4 w-4 text-red-500" />
                                    </div>
                                    <input type="url" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="YouTube URL" className="w-full pl-10 border-gray-300 rounded-lg p-3 text-sm focus:ring-[#3E2723] focus:border-[#3E2723] bg-gray-50" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="Personal Website URL" className="w-full pl-10 border-gray-300 rounded-lg p-3 text-sm focus:ring-[#3E2723] focus:border-[#3E2723] bg-gray-50" />
                                </div>
                            </section>
                        </div>

                        {/* Craft Categories */}
                        <section>
                            <label className="block text-sm font-bold text-gray-900 mb-3">Craft Categories / Skills</label>
                            <div className="flex flex-wrap gap-2">
                                {CRAFT_OPTIONS.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleCategoryToggle(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${categories.includes(cat)
                                                ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-md'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-orange-50 hover:border-orange-200'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Craft Story */}
                        <section className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-bold text-gray-900">The Story Behind the Craft</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateStory}
                                    disabled={isGeneratingStory}
                                    className="flex items-center gap-2 bg-[#3E2723] text-white text-[10px] px-4 py-2 rounded-full font-bold shadow-sm hover:shadow-md transition transform hover:scale-105 disabled:opacity-50"
                                >
                                    <Sparkles className={`w-3 h-3 ${isGeneratingStory ? 'animate-spin' : ''}`} />
                                    {isGeneratingStory ? 'Weaving Magic...' : 'Magic Generate Story'}
                                </button>
                            </div>
                            <textarea
                                value={craftStory}
                                onChange={(e) => setCraftStory(e.target.value)}
                                placeholder="E.g. My family has been weaving bamboo baskets for three generations..."
                                className="w-full border-gray-300 rounded-xl focus:ring-[#3E2723] focus:border-[#3E2723] p-4 text-gray-800 h-40 bg-white/50 leading-relaxed text-sm"
                            />
                            <p className="mt-2 text-[10px] text-orange-800 italic">✨ AI Tip: Tell a story that connects your heritage to your craft.</p>
                        </section>

                        {/* Portfolio Images */}
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-bold text-gray-900">Portfolio Gallery (Max 5 images)</label>
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {existingPortfolio.length + portfolioFiles.length} / 5
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                {/* Currently saved images (Cannot delete easily in this mockup, just viewing) */}
                                {existingPortfolio.map((url, i) => (
                                    <div key={`existing-${i}`} className="aspect-square rounded-xl overflow-hidden border border-gray-200 relative group">
                                        <img src={url} alt="Portfolio" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold">Saved</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Newly added previews */}
                                {portfolioPreviews.map((url, i) => (
                                    <div key={`new-${i}`} className="aspect-square rounded-xl overflow-hidden border-2 border-[#3E2723] relative group">
                                        <img src={url} alt="New Portfolio Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewPreview(i)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <div className="absolute inset-x-0 bottom-0 bg-[#3E2723] text-white text-[10px] font-bold text-center py-1">
                                            New
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Button */}
                                {(existingPortfolio.length + portfolioFiles.length) < 5 && (
                                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-[#3E2723] hover:bg-orange-50 flex flex-col items-center justify-center cursor-pointer transition text-gray-500 hover:text-[#3E2723]">
                                        <Upload className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-bold">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handlePortfolioChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </section>
                    </form>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition">Cancel</button>
                    <button
                        type="submit"
                        form="profileForm"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-[#3E2723] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#5D4037] transition shadow-lg disabled:opacity-70"
                    >
                        {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
