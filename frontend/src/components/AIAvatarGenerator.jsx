import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, CheckCircle, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AIAvatarGenerator = ({ isOpen, onClose }) => {
    const { updateUserAvatar } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        setGenerating(true);
        setGeneratedImageUrl(null);

        // Use Pollinations.ai (Free, no-auth image generation by URL)
        // Adding random seed to ensure unique generation on same prompt
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(prompt.trim() + ", beautiful highly detailed portrait avatar, vibrant colors, centered");
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=400&nologo=true&seed=${seed}`;

        const fallbackUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(prompt.trim())}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

        // Preload image to show loading state until it's ready
        const img = new Image();

        const timeoutId = setTimeout(() => {
            console.warn("Primary AI generator timed out. Using fallback.");
            img.src = fallbackUrl;
        }, 8000); // 8 second timeout before fallback

        img.src = url;
        img.onload = () => {
            clearTimeout(timeoutId);
            setGeneratedImageUrl(img.src);
            setGenerating(false);
        };
        img.onerror = () => {
            clearTimeout(timeoutId);
            if (img.src === url) {
                console.warn("Primary AI generator failed. Using fallback.");
                img.src = fallbackUrl;
            } else {
                setGenerating(false);
                alert("Failed to generate image. Please check your internet connection.");
            }
        };
    };

    const handleSaveProfilePicture = async () => {
        if (!generatedImageUrl) return;
        setSaving(true);
        try {
            await updateUserAvatar(generatedImageUrl);
            onClose(); // Close modal on success
        } catch (error) {
            alert("Failed to save avatar.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in relative">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-extrabold flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-purple-200" />
                            AI Avatar Studio
                        </h2>
                        <p className="text-purple-100 text-sm mt-1 opacity-90">Design your perfect KalaKart identity.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Describe your avatar:</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A talented female artisan weaving traditional baskets, warm lighting, watercolor style..."
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none h-24"
                    ></textarea>

                    <button
                        onClick={handleGenerate}
                        disabled={generating || !prompt.trim()}
                        className="w-full mt-4 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {generating ? (
                            <><RefreshCw className="w-5 h-5 animate-spin" /> Gathering Stardust...</>
                        ) : (
                            <><ImageIcon className="w-5 h-5" /> Generate Avatar</>
                        )}
                    </button>

                    {/* Preview Area */}
                    <div className="mt-6 flex flex-col items-center">
                        <div className={`w-40 h-40 rounded-full border-4 border-dashed flex items-center justify-center overflow-hidden transition-all shadow-inner ${generatedImageUrl ? 'border-purple-500 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                            {generatedImageUrl ? (
                                <img src={generatedImageUrl} alt="Generated Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-10 h-10 text-gray-300" />
                            )}
                        </div>

                        {generatedImageUrl && (
                            <button
                                onClick={handleSaveProfilePicture}
                                disabled={saving}
                                className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
                            >
                                {saving ? (
                                    <><RefreshCw className="w-5 h-5 animate-spin" /> Saving...</>
                                ) : (
                                    <><CheckCircle className="w-5 h-5" /> Set as Profile Picture</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAvatarGenerator;
