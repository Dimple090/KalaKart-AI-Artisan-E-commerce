import React, { useState } from 'react';
import { X, Sparkles, Wand2, RefreshCw, Check, Download } from 'lucide-react';
import axios from 'axios';
import { apiUrl } from '../lib/api';

const AvatarGenerator = ({ isOpen, onClose, user }) => {
    const [craftType, setCraftType] = useState('Ceramics');
    const [style, setStyle] = useState('Traditional Oil Painting');
    const [loading, setLoading] = useState(false);
    const [avatarPrompt, setAvatarPrompt] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.post(apiUrl('/api/ai/generate-avatar-prompt'), {
                craftType,
                style
            }, config);
            
            setAvatarPrompt(data.prompt);
            
            // In a real app, we would send this prompt to an image gen API like DALL-E or Midjourney.
            // For this demo, we'll use a high-quality placeholder that matches the prompt's theme.
            // We'll simulate a delay for the "generation" effect.
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Seeded images for demo based on craft type
            const demoAvatars = {
                'Ceramics': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400',
                'Textiles': 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&q=80&w=400',
                'Woodwork': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=400',
                'Jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400',
                'Painting': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400'
            };
            
            setAvatarUrl(demoAvatars[craftType] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400');
            
        } catch (error) {
            console.error("Avatar generation failed:", error);
            alert("Failed to generate craft identity. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3E2723]/60 backdrop-blur-xl animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20 flex flex-col md:flex-row h-[600px]">
                {/* Left Side: Controls */}
                <div className="md:w-1/2 p-8 md:p-12 border-r border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-amber-100 rounded-2xl text-amber-700">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-[#3E2723]">Craft Identity AI</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-[#3E2723] mb-3 uppercase tracking-widest">Select Your Craft</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Ceramics', 'Textiles', 'Woodwork', 'Jewelry', 'Painting'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCraftType(c)}
                                            className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${craftType === c ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-white hover:border-amber-200'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#3E2723] mb-3 uppercase tracking-widest">Artistic Style</label>
                                <select 
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                                >
                                    <option>Traditional Oil Painting</option>
                                    <option>Vintage Indian Lithograph</option>
                                    <option>Modern Minimalist Sketch</option>
                                    <option>Vibrant Watercolor</option>
                                    <option>Cyberpunk Artisan</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black rounded-2xl shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {loading ? 'GENERATING IDENTITY...' : 'CREATE MY AVATAR'}
                    </button>
                </div>

                {/* Right Side: Result */}
                <div className="md:w-1/2 bg-[#FDFBF9] relative flex flex-col items-center justify-center p-8 overflow-hidden">
                    <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-[#3E2723] transition p-2 hover:bg-white/50 rounded-full z-10">
                        <X className="w-6 h-6" />
                    </button>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    {avatarUrl ? (
                        <div className="relative animate-scale-in">
                            <div className="w-64 h-64 md:w-80 md:h-80 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
                                <img src={avatarUrl} alt="Generated Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button className="p-3 bg-white rounded-full text-[#3E2723] hover:scale-110 transition shadow-lg">
                                        <Download className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-8 text-center">
                                <h3 className="text-xl font-black text-[#3E2723] mb-2 uppercase tracking-tight">Identity Created</h3>
                                <p className="text-xs text-amber-800 font-bold bg-amber-100 px-4 py-1.5 rounded-full inline-block border border-amber-200">
                                    {craftType} • {style}
                                </p>
                                <button 
                                    className="block w-full mt-6 py-3 px-6 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition flex items-center justify-center gap-2"
                                    onClick={() => alert("Identity saved to profile!")}
                                >
                                    <Check className="w-5 h-5" /> Use as Profile Picture
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center max-w-xs">
                            <div className="w-48 h-48 rounded-[2.5rem] bg-white border-2 border-dashed border-amber-200 flex items-center justify-center mb-6 mx-auto">
                                <Sparkles className="w-12 h-12 text-amber-200 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-[#3E2723] mb-3">Your Digital Craft Persona</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Select your craft and style to generate a unique AI avatar that represents your artistic heritage.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
                                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-amber-500 animate-pulse" />
                            </div>
                            <h3 className="mt-8 text-xl font-black text-[#3E2723] uppercase tracking-tighter">Painting with AI...</h3>
                            <p className="mt-2 text-sm text-gray-600 italic">"{avatarPrompt || `Imagining a ${style.toLowerCase()} world for a ${craftType.toLowerCase()} master.`}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AvatarGenerator;
