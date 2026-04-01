import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, MapPin, Sparkles, Truck } from 'lucide-react';
import { io } from 'socket.io-client';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTrackingId, setActiveTrackingId] = useState(null);
    const [courierLoc, setCourierLoc] = useState(null);
    const [socket, setSocket] = useState(null);
    const [insights, setInsights] = useState({}); // { orderId: { message, etaDays, loading } }

    const fetchInsight = useCallback(async (order) => {
        setInsights(prev => ({ ...prev, [order._id]: { loading: true } }));
        try {
            const { data } = await axios.post('http://localhost:5000/api/ai/order-insight', {
                items: order.orderItems.map(i => ({ name: i.name, qty: i.qty })),
                status: order.status || 'Processing',
                city: order.shippingAddress?.city || '',
                country: order.shippingAddress?.country || '',
                orderDate: order.createdAt
            });
            setInsights(prev => ({ ...prev, [order._id]: { ...data, loading: false } }));
        } catch {
            setInsights(prev => ({ ...prev, [order._id]: { loading: false, message: null } }));
        }
    }, []);

    // Socket Initialization
    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('courier_location_update', (data) => {
            if (data.orderId === activeTrackingId) {
                setCourierLoc({ lat: data.lat, lng: data.lng, status: data.status, time: data.timestamp });
            }
        });

        return () => newSocket.close();
    }, [activeTrackingId]);

    const trackOrder = (orderId) => {
        if (activeTrackingId === orderId) {
            // Toggle off
            setActiveTrackingId(null);
            setCourierLoc(null);
            if (socket) socket.emit('leave_order_room', orderId); // Custom opt-out if needed
        } else {
            // Join new room
            setActiveTrackingId(orderId);
            setCourierLoc(null); // Reset until first ping
            if (socket) {
                socket.emit('join_order_room', orderId);
            }
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-[#3E2723] mb-4">Please log in to view your orders</h2>
            </div>
        );
    }

    if (loading) return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-[#3E2723] mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
                    <p className="text-gray-500 mb-6">Looks like you haven't made your first purchase.</p>
                    <a href="/" className="btn-primary inline-flex items-center">
                        Start Shopping
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-[#EFEBE9] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D7CCC8]/50">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Order Placed</p>
                                    <p className="font-bold text-[#3E2723]">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total</p>
                                    <p className="font-bold text-[#3E2723]">${order.totalPrice.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Order #</p>
                                    <p className="font-mono text-sm text-[#3E2723]">{order._id}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-bold">
                                    <CheckCircle className="w-4 h-4" /> Paid
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="font-bold text-lg mb-4 text-[#3E2723]">Items in your order:</h3>
                                <ul className="divide-y divide-gray-100">
                                    {order.orderItems.map((item) => (
                                        <li key={item._id} className="py-4 flex gap-4 items-center">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-bold text-gray-900">{item.name}</p>
                                                <p className="text-gray-500 text-sm">Qty: {item.qty}</p>
                                            </div>
                                            <div className="font-bold text-gray-900">
                                                ${(item.price * item.qty).toFixed(2)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <p>Your items are being processed for shipping to <strong>{order.shippingAddress.city}, {order.shippingAddress.country}</strong>.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {!insights[order._id] && (
                                        <button
                                            onClick={() => fetchInsight(order)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow hover:bg-indigo-700 transition"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" /> AI Delivery Insight
                                        </button>
                                    )}
                                    <button
                                        onClick={() => trackOrder(order._id)}
                                        className={`px-4 py-2 font-bold rounded-xl text-sm transition shadow-sm border ${activeTrackingId === order._id ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'bg-white text-[#3E2723] border-[#3E2723] hover:bg-gray-100'}`}
                                    >
                                        {activeTrackingId === order._id ? 'Close Map' : 'Track Package Live'}
                                    </button>
                                </div>
                            </div>

                            {/* AI Order Insight Card */}
                            {insights[order._id] && (
                                <div className="px-6 pb-4 pt-2">
                                    {insights[order._id].loading ? (
                                        <div className="flex items-center gap-2 text-indigo-500 text-sm animate-pulse py-2">
                                            <Sparkles className="w-4 h-4" /> Generating delivery insight…
                                        </div>
                                    ) : insights[order._id].message ? (
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4 flex items-start gap-3">
                                            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow shrink-0">
                                                <Truck className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Delivery Insight</span>
                                                    {insights[order._id].etaDays && (
                                                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                                                            ETA: {insights[order._id].etaDays}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed italic">"{insights[order._id].message}"</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* Live Tracking Map Section */}
                            {activeTrackingId === order._id && (
                                <div className="p-6 bg-[#EFEBE9]/40 border-t border-gray-200 animate-fade-in relative overflow-hidden">
                                    <h4 className="font-bold text-[#3E2723] flex items-center gap-2 mb-4">
                                        <MapPin className="w-5 h-5 text-red-500 animate-bounce" />
                                        Live Courier Location
                                    </h4>

                                    {courierLoc ? (
                                        <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500 font-semibold block mb-1">Status</span>
                                                    <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                                                        {courierLoc.status}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-semibold block mb-1">Last Updated</span>
                                                    <span className="font-bold text-gray-800">
                                                        {new Date(courierLoc.time).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-semibold block mb-1">Live Lat</span>
                                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                        {courierLoc.lat.toFixed(5)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-semibold block mb-1">Live Lng</span>
                                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                        {courierLoc.lng.toFixed(5)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Mock Map UI */}
                                            <div className="mt-4 h-48 bg-gray-200 rounded-lg relative overflow-hidden border border-gray-300 flex items-center justify-center">
                                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
                                                <div className="absolute w-full h-full animate-pulse bg-blue-500/10"></div>
                                                <MapPin className="text-red-600 w-10 h-10 absolute z-10 drop-shadow-lg" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                                                <span className="z-10 bg-white/90 backdrop-blur font-bold px-3 py-1 rounded-full text-xs shadow-md border border-gray-200 mt-14 text-gray-700">
                                                    Courier is nearby ({courierLoc.lat.toFixed(2)}, {courierLoc.lng.toFixed(2)})
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                            <p className="text-sm text-gray-500 font-bold">Connecting to GPS satellite...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
