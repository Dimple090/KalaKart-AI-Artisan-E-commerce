import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
    const [orderId] = useState(() => Math.floor(Math.random() * 100000));

    useEffect(() => {
        // Fire confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8">Thank you for supporting local artisans. Your handmade treasures will be on their way soon.</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Order ID:</span>
                        <span className="font-mono font-bold text-gray-800">#ORD-{orderId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Estimated Delivery:</span>
                        <span className="font-bold text-gray-800">5-7 Business Days</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link to="/dashboard" className="block w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
                        View Order Status
                    </Link>
                    <Link to="/" className="block w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <ShoppingBag className="w-5 h-5" /> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
