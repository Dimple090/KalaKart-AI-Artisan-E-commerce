import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Image as ImageIcon, Send, Loader2 } from 'lucide-react';

const CommissionModal = ({ isOpen, onClose, artisan }) => {
    const { user } = useAuth();
    const [requestDetails, setRequestDetails] = useState('');
    const [referenceImage, setReferenceImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImage(reader.result);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to request a commission.');
            return;
        }
        if (!requestDetails.trim()) return;

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/commissions', {
                artisanId: artisan._id,
                requestDetails,
                referenceImage
            }, config);
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setRequestDetails('');
                setReferenceImage(null);
                setImagePreview('');
                onClose();
            }, 3000);
        } catch (error) {
            console.error('Commission Error:', error);
            alert('Failed to submit commission request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#D7CCC8]/50 flex justify-between items-center bg-[#EFEBE9]/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#3E2723] text-[#EFEBE9] p-2 rounded-xl">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#3E2723]">Bespoke Commission</h2>
                            <p className="text-xs font-bold text-[#8D6E63]">Request a custom piece from {artisan?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#8D6E63] hover:bg-[#D7CCC8]/50 p-2 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {success ? (
                        <div className="text-center py-12 animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-black text-[#3E2723] mb-2">Request Sent!</h3>
                            <p className="text-[#8D6E63]">
                                Our AI is analyzing your request to provide the artisan with a complexity estimate in Indian Rupees (₹). 
                                {artisan?.name} will review it and get back to you with a final quote.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-[#3E2723] mb-2">Describe Your Vision</label>
                                <textarea
                                    value={requestDetails}
                                    onChange={(e) => setRequestDetails(e.target.value)}
                                    placeholder="Example: I would like a custom 12-inch ceramic vase with a deep blue glaze, inspired by the ocean. My budget is around ₹4,000..."
                                    className="w-full h-32 p-4 rounded-xl border border-[#D7CCC8] focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent resize-none bg-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#3E2723] mb-2">Reference Image (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="referenceImage"
                                        />
                                        <label 
                                            htmlFor="referenceImage"
                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#D7CCC8] rounded-xl cursor-pointer hover:bg-[#EFEBE9]/50 transition-colors"
                                        >
                                            <ImageIcon className="w-6 h-6 text-[#8D6E63] mb-1" />
                                            <span className="text-sm font-semibold text-[#8D6E63]">Click to upload</span>
                                        </label>
                                    </div>
                                    {imagePreview && (
                                        <div className="relative w-24 h-24 rounded-xl border border-[#D7CCC8] overflow-hidden">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => { setReferenceImage(null); setImagePreview(''); }}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !requestDetails.trim()}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                                {loading ? 'Analyzing Request...' : 'Submit to Artisan'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommissionModal;
