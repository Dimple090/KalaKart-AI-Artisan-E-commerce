import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Upload, Trash2, Camera, Sun, Square, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';

const RoomVisualizer = ({ productImageUrl }) => {
    const [bgImage, setBgImage] = useState(null);
    const [brightness, setBrightness] = useState(100);
    const [shadow, setShadow] = useState(25);
    const [hasFrame, setHasFrame] = useState(false);
    const [showControls, setShowControls] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const tempUrl = URL.createObjectURL(file);
            setBgImage(tempUrl);
        }
    };

    const handleClear = () => {
        setBgImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setShowControls(false);
    };

    return (
        <div className="relative w-full h-[400px] md:h-[500px] bg-slate-100 rounded-3xl overflow-hidden border border-[#D7CCC8]/50 shadow-inner group flex flex-col items-center justify-center">
            {!bgImage ? (
                <div className="text-center p-6 flex flex-col items-center w-full h-full justify-center">
                    <div className="w-16 h-16 bg-[#EFEBE9] text-[#8D6E63] rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3E2723] mb-2">See it in your space</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
                        Upload a photo of your room to see exactly how this piece will fit on your wall. Drag, drop, and resize for a perfect fit.
                    </p>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#3E2723] text-white flex items-center gap-2 px-6 py-3 rounded-xl shadow-md hover:bg-[#2D1B15] hover:-translate-y-1 transition-all"
                    >
                        <ImageIcon className="w-5 h-5" />
                        <span className="font-bold">Upload Room Photo</span>
                    </button>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />
                </div>
            ) : (
                <div className="relative w-full h-full">
                    {/* Background Image */}
                    <img 
                        src={bgImage} 
                        alt="Your Room" 
                        className="w-full h-full object-cover"
                    />

                    {/* Draggable Product Image */}
                    <Rnd
                        default={{
                            x: window.innerWidth < 768 ? 50 : 150,
                            y: 50,
                            width: 180,
                            height: 250,
                        }}
                        minWidth={50}
                        minHeight={50}
                        bounds="parent"
                        lockAspectRatio={true}
                        className="group/rnd cursor-move z-10"
                    >
                        {/* Wrapper for the product to apply shadow and framing cleanly */}
                        <div 
                            className={`w-full h-full relative transition-all duration-300 ${hasFrame ? 'bg-[#FAFAFA] p-[4%] border-4 sm:border-8 border-[#3E2723]' : ''}`}
                            style={{ filter: `drop-shadow(0px ${(shadow/2)}px ${shadow}px rgba(0,0,0,0.5))` }}
                        >
                            <img 
                                src={productImageUrl} 
                                alt="Product Overlay" 
                                className={`w-full h-full object-cover pointer-events-none transition-all duration-100`}
                                style={{ filter: `brightness(${brightness}%) contrast(1.05)` }}
                            />
                        </div>
                        
                        {/* Interactive hint on hover over artwork */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover/rnd:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm hidden sm:block">
                            Drag corners to resize
                        </div>
                    </Rnd>

                    {/* Controls Overlay */}
                    <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 z-50">
                        {/* Expanded Menu */}
                        {showControls && (
                            <div className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-2xl w-56 sm:w-64 border border-[#D7CCC8]/50 animate-fade-in origin-bottom-right">
                                <h4 className="text-xs font-extrabold text-[#3E2723] mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <SlidersHorizontal className="w-3.5 h-3.5" /> Realism Settings
                                </h4>
                                
                                <div className="mb-5">
                                    <label className="text-[10px] font-bold text-gray-500 flex justify-between mb-2">
                                        <span>Lighting Match</span>
                                        <span className="text-[#3E2723]">{brightness}%</span>
                                    </label>
                                    <input type="range" min="30" max="150" value={brightness} onChange={(e) => setBrightness(e.target.value)} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8D6E63]" />
                                </div>
                                
                                <div className="mb-5">
                                    <label className="text-[10px] font-bold text-gray-500 flex justify-between mb-2">
                                        <span>Wall Shadow Distance</span>
                                        <span className="text-[#3E2723]">{shadow}px</span>
                                    </label>
                                    <input type="range" min="0" max="50" value={shadow} onChange={(e) => setShadow(e.target.value)} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8D6E63]" />
                                </div>

                                <button 
                                    onClick={() => setHasFrame(!hasFrame)}
                                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${hasFrame ? 'bg-[#3E2723] text-white shadow-md' : 'bg-[#EFEBE9] text-[#8D6E63] hover:bg-[#D7CCC8]'}`}
                                >
                                    <Square className="w-4 h-4" /> {hasFrame ? 'Remove Dark Frame' : 'Add Canvas Frame'}
                                </button>
                            </div>
                        )}

                        {/* Core Floating Buttons */}
                        <div className="flex gap-2 sm:gap-3">
                            <button 
                                onClick={() => setShowControls(!showControls)}
                                className={`backdrop-blur p-2.5 sm:p-3 rounded-full shadow-lg transition-all ${showControls ? 'bg-[#3E2723] text-white' : 'bg-white/90 text-[#3E2723] hover:bg-white hover:scale-105'}`}
                                title="Adjust Lighting & Shadows"
                            >
                                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white/90 backdrop-blur text-[#3E2723] p-2.5 sm:p-3 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all"
                                title="Change Room Photo"
                            >
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button 
                                onClick={handleClear}
                                className="bg-red-500/90 backdrop-blur text-white p-2.5 sm:p-3 rounded-full shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
                                title="Remove Photo"
                            >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                    </div>
                    
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[#3E2723] text-[10px] sm:text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm pointer-events-none flex items-center gap-2 z-40">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Live AR Preview
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomVisualizer;
