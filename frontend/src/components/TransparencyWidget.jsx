import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, PieChart as PieChartIcon } from 'lucide-react';

const TransparencyWidget = ({ price, transparency }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!transparency || (transparency.materialCost === 0 && transparency.laborCost === 0)) {
        return null;
    }

    const materialCost = transparency.materialCost || 0;
    const laborCost = transparency.laborCost || 0;
    const platformFee = price * 0.10; // 10% platform fee
    const profit = Math.max(0, price - materialCost - laborCost - platformFee);

    const items = [
        { label: 'Artisan Profit', value: profit, color: 'bg-emerald-500', text: 'text-emerald-700' },
        { label: 'Materials', value: materialCost, color: 'bg-amber-400', text: 'text-amber-700' },
        { label: 'Labor', value: laborCost, color: 'bg-blue-400', text: 'text-blue-700' },
        { label: 'Platform Fee (10%)', value: platformFee, color: 'bg-gray-300', text: 'text-gray-600' },
    ].filter(item => item.value > 0);

    const total = items.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="mt-6 mb-8">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm font-bold text-[#8D6E63] hover:text-[#3E2723] transition-colors"
            >
                <PieChartIcon className="w-5 h-5" />
                Radical Transparency: See Where Your Money Goes
                <Info className="w-4 h-4 ml-1 opacity-70" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4"
                    >
                        <div className="bg-white border border-[#D7CCC8]/60 rounded-2xl p-5 shadow-sm">
                            <h4 className="text-sm font-black text-[#3E2723] mb-4">Pricing Breakdown</h4>
                            
                            {/* Stacked Bar */}
                            <div className="w-full h-4 rounded-full flex overflow-hidden mb-5 bg-gray-100 shadow-inner">
                                {items.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                                        style={{ width: `${(item.value / total) * 100}%` }}
                                        title={`${item.label}: ₹${item.value.toFixed(2)}`}
                                    />
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/80 border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`} />
                                            <span className="font-semibold text-gray-700">{item.label}</span>
                                        </div>
                                        <span className={`font-black ${item.text}`}>₹{item.value.toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium italic leading-relaxed">
                                We believe in empowering artisans through radical transparency. 
                                By shopping here, you ensure fair compensation directly to the creators.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TransparencyWidget;
