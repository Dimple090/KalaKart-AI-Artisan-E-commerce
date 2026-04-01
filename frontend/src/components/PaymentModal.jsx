import { useState, useEffect } from 'react';
import { CheckCircle, Loader2, X, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PaymentModal = ({ isOpen, onClose, totalAmount }) => {
    const [step, setStep] = useState('summary'); // summary, processing, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const { clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setStep('summary');
            setErrorMessage('');
        }
    }, [isOpen]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setStep('processing');
        setErrorMessage('');

        try {
            if (!user) {
                throw new Error("Please log in to initiate payment.");
            }

            const res = await loadRazorpayScript();
            if (!res) {
                throw new Error("Razorpay SDK failed to load. Are you online?");
            }

            // 1. Create Order
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data: order } = await axios.post(
                'http://localhost:5000/api/payment/order',
                { amount: totalAmount },
                config
            );

            // 2. Open Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Frontend key
                amount: order.amount,
                currency: order.currency,
                name: "KalaKart Web App",
                description: "Purchase of Handmade Goods",
                image: "/vite.svg", // Replace with logo
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await axios.post(
                            'http://localhost:5000/api/payment/verify',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            config
                        );

                        setStep('success');
                        setTimeout(() => {
                            clearCart();
                            onClose();
                            navigate('/order-success');
                        }, 2000);

                    } catch (verifyError) {
                        setErrorMessage("Payment verification failed. Please contact support.");
                        setStep('error');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: "9999999999", // Mock contact for now
                },
                notes: {
                    address: "Razorpay Corporate Office",
                },
                theme: {
                    color: "#7c3aed", // Purple-600 to match theme
                },
                modal: {
                    ondismiss: function () {
                        setStep('summary');
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Payment Error:", error);
            setErrorMessage(error.response?.data?.message || error.message || "Something went wrong.");
            setStep('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <span className="text-white font-bold italic text-lg">R</span>
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 block text-lg">Razorpay Secure</span>
                            <span className="text-xs text-slate-500 font-medium">Trusted Payment Gateway</span>
                        </div>
                    </div>
                    {step !== 'processing' && step !== 'success' && (
                        <button onClick={onClose} className="bg-white p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 'summary' && (
                        <div className="space-y-6">
                            <div className="text-center py-4">
                                <p className="text-slate-500 text-sm uppercase tracking-widest font-bold mb-2">Total Payable Amount</p>
                                <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">₹{totalAmount}</h2>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
                                <CreditCard className="w-6 h-6 text-blue-600 mt-1" />
                                <div>
                                    <p className="font-bold text-slate-800 text-sm mb-1">Secure Transaction</p>
                                    <p className="text-xs text-blue-600 leading-relaxed">
                                        Your payment is processed securely by Razorpay. We do not store your card details.
                                    </p>
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-red-600 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {errorMessage}
                                </div>
                            )}

                            <button
                                onClick={handlePayment}
                                disabled={!user}
                                className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Lock className="w-5 h-5" /> {user ? "Pay Now" : "Login to Pay"}
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-10">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Initiating Payment...</h3>
                            <p className="text-slate-500">Please verify the payment in the Razorpay popup.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-10">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                            <p className="text-slate-500">Redirecting to your order summary...</p>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <X className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Failed</h3>
                            <p className="text-slate-500 mb-6">{errorMessage || "The transaction could not be completed."}</p>
                            <button
                                onClick={() => setStep('summary')}
                                className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> 256-bit SSL Encrypted Payment
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
