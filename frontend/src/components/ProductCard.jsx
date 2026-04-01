import { ShoppingCart, Heart, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product._id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -8 }}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden bg-gray-100">
                <img
                    src={product.imageUrl}
                    alt={`${product.name} handcrafted item`}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                />

                {/* Overlay Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product);
                        }}
                        aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        className={`p-2 rounded-full shadow-md transition outline-none focus:ring-2 focus:ring-red-500 tooltip ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white hover:bg-gray-50 text-gray-500 hover:text-red-500'}`}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                        }}
                        aria-label="Quick add to cart"
                        className="p-2 bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-[#EFEBE9] outline-none focus:ring-2 focus:ring-[#8D6E63] transition tooltip"
                        title="Quick Add"
                    >
                        <ShoppingCart className="w-5 h-5 text-[#3E2723]" />
                    </button>
                </div>

                {product.stock < 5 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                        Only {product.stock} left!
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest bg-[#EFEBE9] px-2 py-1 rounded-sm">{product.category}</p>
                        {product.isHandmadeVerified && (
                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-sm border border-green-100" title={`Authenticity Score: ${product.handmadeAuthenticityScore}%`}>
                                <Sparkles className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-bold text-green-700">Verified Handmade</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100 ml-auto">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-500" />
                            <span className="text-xs font-bold text-gray-700">4.8</span>
                        </div>
                    </div>

                    <Link to={`/product/${product._id}`} className="block">
                        <h3 className="font-bold text-lg text-[#3E2723] mb-2 truncate group-hover:text-[#8D6E63] transition-colors">{product.name}</h3>
                    </Link>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <span className="text-xl font-extrabold text-[#3E2723]">${product.price}</span>
                    <button
                        onClick={() => addToCart(product)}
                        className="btn-primary py-2.5 px-5 text-sm"
                    >
                        <ShoppingCart className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>
        </motion.div >
    );
};

export default ProductCard;
