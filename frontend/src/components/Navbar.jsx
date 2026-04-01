import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, X, Heart, Mic, Sparkles, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { cartItems } = useCart();
    const { wishlist } = useWishlist();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Your browser doesn't support speech recognition.");
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            navigate(`/?search=${transcript}`);
        };

        recognition.start();
    };

    // Sticky Navbar Effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim()) {
            navigate(`/?search=${query}`);
        } else {
            navigate('/');
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20' : 'bg-transparent py-4'}`}
        >
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/" className="text-2xl font-black tracking-tighter text-[#3E2723] hover:opacity-80 transition">
                        KalaKart
                    </Link>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
                        <input
                            type="text"
                            aria-label="Search products"
                            placeholder="Search for handmade treasures..."
                            className={`w-full px-4 py-2 pl-10 pr-10 rounded-full border focus:outline-none focus:ring-2 focus:ring-[#8D6E63] transition-all ${scrolled ? 'bg-[#EFEBE9] border-gray-200' : 'bg-white/90 border-transparent shadow-lg'}`}
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#8D6E63] transition" />
                        <button
                            onClick={startListening}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#8D6E63]'}`}
                            title="Voice Search"
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className={`font-bold transition hover:text-[#8D6E63] ${scrolled ? 'text-[#3E2723]' : 'text-gray-800'}`}>Home</Link>
                        <Link to="/craft-tutorial" className={`font-bold transition hover:text-[#8D6E63] flex items-center gap-1 ${scrolled ? 'text-[#3E2723]' : 'text-gray-800'}`}><Sparkles className="w-4 h-4 text-[#8D6E63]" /> AI Ideas</Link>
                        <Link to="/gifts" className={`font-bold transition hover:text-[#8D6E63] flex items-center gap-1 ${scrolled ? 'text-[#3E2723]' : 'text-gray-800'}`}><Gift className="w-4 h-4 text-amber-600" /> Gift Finder</Link>
                        <Link to="/dashboard" className={`font-bold transition hover:text-[#8D6E63] ${scrolled ? 'text-[#3E2723]' : 'text-gray-800'}`}>Sell Art</Link>

                        <div className="flex items-center space-x-6">
                            <Link to="/wishlist" className="relative group">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`p-2 rounded-full transition ${scrolled ? 'hover:bg-purple-50' : 'bg-white/40 hover:bg-white/80'}`}
                                >
                                    <Heart className={`w-6 h-6 ${scrolled ? 'text-gray-700' : 'text-gray-800'}`} />
                                    {wishlist.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce shadow-md">
                                            {wishlist.length}
                                        </span>
                                    )}
                                </motion.div>
                            </Link>

                            <Link to="/cart" className="relative group">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`p-2 rounded-full transition ${scrolled ? 'hover:bg-purple-50' : 'bg-white/40 hover:bg-white/80'}`}
                                >
                                    <ShoppingCart className={`w-6 h-6 ${scrolled ? 'text-gray-700' : 'text-gray-800'}`} />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#3E2723] text-[#EFEBE9] text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce shadow-[0_4px_10px_rgba(62,39,35,0.3)]">
                                            {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                        </span>
                                    )}
                                </motion.div>
                            </Link>

                            {user ? (
                                <div className="relative group">
                                    <button aria-label="User menu" className="flex items-center gap-2 font-semibold text-gray-700 hover:text-[#8D6E63] transition rounded-full focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:ring-offset-2">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#3E2723] text-[#EFEBE9] flex items-center justify-center font-bold shadow-md border-2 border-white">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                    </button>
                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50 border border-white/20">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <Link to={`/profile/${user._id}`} className="block px-4 py-2 text-sm text-[#3E2723] hover:bg-[#EFEBE9] font-medium transition">My Profile</Link>
                                        <Link to="/saved-ideas" className="block px-4 py-2 text-sm text-[#3E2723] hover:bg-[#EFEBE9] font-medium transition">My Saved Ideas</Link>
                                        <Link to="/dashboard" className="block px-4 py-2 text-sm text-[#3E2723] hover:bg-[#EFEBE9] font-medium transition">Dashboard</Link>
                                        <Link to="/orders" className="block px-4 py-2 text-sm text-[#3E2723] hover:bg-[#EFEBE9] font-medium transition">My Orders</Link>
                                        <button onClick={() => { logout(); navigate('/login'); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition mt-1">Logout</button>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="bg-[#3E2723] text-[#EFEBE9] px-6 py-2.5 rounded-full font-bold shadow-lg shadow-[#3E2723]/25 hover:shadow-xl hover:shadow-[#3E2723]/35 hover:scale-105 transition-all">
                                    Login / Register
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button aria-label="Toggle mobile menu" className="md:hidden text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl shadow-xl py-4 px-4 flex flex-col gap-4 border-t border-gray-100 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto"
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    aria-label="Search products"
                                    placeholder="Search..."
                                    className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border bg-[#EFEBE9] border-transparent focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <button
                                    onClick={startListening}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#8D6E63]'}`}
                                    title="Voice Search"
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                            </div>
                            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-[#3E2723] hover:text-[#8D6E63] font-bold border-b border-gray-100">Home</Link>
                            <Link to="/craft-tutorial" onClick={() => setIsOpen(false)} className="py-2 text-[#3E2723] hover:text-[#8D6E63] font-bold border-b border-gray-100 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#8D6E63]" /> AI Craft Ideas</Link>
                            <Link to="/gifts" onClick={() => setIsOpen(false)} className="py-2 text-[#3E2723] hover:text-[#8D6E63] font-bold border-b border-gray-100 flex items-center gap-2"><Gift className="w-5 h-5 text-amber-600" /> Gift Finder</Link>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block py-2 text-[#3E2723] hover:text-[#8D6E63] font-bold border-b border-gray-100">Sell Art</Link>
                            <Link to="/wishlist" onClick={() => setIsOpen(false)} className="block py-2 text-[#3E2723] hover:text-[#8D6E63] font-bold border-b border-gray-100 flex justify-between">
                                Wishlist <span className="bg-[#8D6E63] text-[#EFEBE9] text-xs rounded-full px-2 py-0.5">{wishlist.length}</span>
                            </Link>
                            <Link to="/cart" onClick={() => setIsOpen(false)} className="block py-2 text-[#3E2723] hover:text-[#8D6E63] font-bold border-b border-gray-100 flex justify-between">
                                Cart <span className="bg-[#3E2723] text-[#EFEBE9] text-xs rounded-full px-2 py-0.5">{cartItems.length}</span>
                            </Link>

                            {user ? (
                                <>
                                    <div className="py-2 text-sm text-gray-500 font-bold border-b border-gray-100">Signed in as {user.name}</div>
                                    <Link to={`/profile/${user._id}`} onClick={() => setIsOpen(false)} className="block py-2 text-[#3E2723] hover:text-[#8D6E63] font-bold border-b border-gray-100">My Profile</Link>
                                    <Link to="/saved-ideas" onClick={() => setIsOpen(false)} className="block py-2 text-[#3E2723] hover:text-[#8D6E63] font-bold border-b border-gray-100">My Saved Ideas</Link>
                                    <Link to="/orders" onClick={() => setIsOpen(false)} className="block py-2 text-[#3E2723] hover:text-[#8D6E63] font-bold border-b border-gray-100">My Orders</Link>
                                    <button onClick={() => { logout(); setIsOpen(false); navigate('/login'); }} className="block py-2 text-red-600 font-bold">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2 text-[#3E2723] font-bold">Login / Register</Link>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
};

export default Navbar;
