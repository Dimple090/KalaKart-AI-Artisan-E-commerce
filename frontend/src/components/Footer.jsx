import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Info */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white mb-4">KalaKart</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Empowering local artisans to share their unique creations with the world.
                            Discover the beauty of handmade craftsmanship.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" aria-label="Visit KalaKart on Facebook" className="text-gray-400 hover:text-[#EFEBE9] transition transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] rounded-sm">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" aria-label="Visit KalaKart on Twitter" className="text-gray-400 hover:text-[#EFEBE9] transition transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] rounded-sm">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" aria-label="Visit KalaKart on Instagram" className="text-gray-400 hover:text-[#EFEBE9] transition transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] rounded-sm">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-primary transition">Home</Link></li>
                            <li><Link to="/#products" className="hover:text-primary transition">Shop</Link></li>
                            <li><Link to="/dashboard" className="hover:text-primary transition">Sell Your Art</Link></li>
                            <li><Link to="/login" className="hover:text-primary transition">Login</Link></li>
                            <li><Link to="/register" className="hover:text-primary transition">Register</Link></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Customer Care</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/cart" className="hover:text-primary transition">My Cart</Link></li>
                            <li><a href="#" className="hover:text-primary transition">Order Tracking</a></li>
                            <li><a href="#" className="hover:text-primary transition">FAQ</a></li>
                            <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Contact Us</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>123 Artisan Street, Creative Hub,<br /> New Delhi, India 110001</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>support@kalakart.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} KalaKart. All rights reserved. Made with ❤️ for Artisans.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
