import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import StatsSection from '../components/StatsSection';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ArrowRight, Star, Search, Sparkles, Gift, Heart, ShoppingBag, UserCheck } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// Dummy products for fallback
const imagesForDummy = {
  "Jewelry": "/images/kundan_jewelry.png",
  "Pottery": "/images/blue_pottery.png",
  "Home Decor": "/images/dhokra_elephant.png",
  "Textiles": "/images/banarasi_saree.png",
  "Painting": "/images/dhokra_elephant.png" // Fallback
};

const dummyProducts = Array.from({ length: 8 }).map((_, i) => {
  const category = ["Jewelry", "Pottery", "Home Decor", "Textiles"][i % 4];
  return {
    _id: `dummy-${i + 1}`,
    name: `Premium ${category} Piece`,
    description: "An authentic, verified handcrafted artifact showcasing traditional Indian heritage.",
    price: Math.floor(Math.random() * 5000 + 1000).toFixed(2),
    category: category,
    imageUrl: imagesForDummy[category],
    stock: 10,
    artisan: { name: "Local Master Artisan" }
  };
});

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Feature States
  const [category, setCategory] = useState('All');
  const [sortType, setSortType] = useState('default');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [forYouData, setForYouData] = useState(null);

  const { user } = useAuth();
  const { wishlist } = useWishlist();

  // Fetch personalized feed for logged-in users
  useEffect(() => {
    if (!user || !user.token) return;
    const wishlistCategories = [...new Set(wishlist.map(i => i.category).filter(Boolean))];
    // We only run if there's some preference signal
    if (wishlistCategories.length === 0) return;
    const timer = setTimeout(async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.post('http://localhost:5000/api/ai/personalized-feed',
          { wishlistCategories, orderCategories: [] }, config);
        if (data.products?.length > 0) setForYouData(data);
      } catch { /* silent fail */ }
    }, 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, wishlist.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        // Use dummy data if API returns empty
        setProducts(data.length > 0 ? data : dummyProducts);
      } catch {
        setProducts(dummyProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...products];

    // 1. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // 2. Category Filter
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    // 3. Sorting
    if (sortType === 'lowToHigh') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortType === 'highToLow') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [products, searchQuery, category, sortType]);

  const handleAISearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setAiSearching(true);
    setAiSearchActive(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/search', { query: searchQuery });
      
      // semantic filtering
      let results = [...products];
      
      if (data.category && data.category !== 'All') {
        setCategory(data.category);
        results = results.filter(p => p.category === data.category);
      }

      if (data.keywords && data.keywords.length > 0) {
        results = results.filter(p => 
          data.keywords.some(k => 
            p.name.toLowerCase().includes(k.toLowerCase()) || 
            p.description.toLowerCase().includes(k.toLowerCase())
          )
        );
      }
      
      setFilteredProducts(results);
    } catch (error) {
      console.error("AI Search failed", error);
    } finally {
      setAiSearching(false);
    }
  };

  const categories = ['All', 'Jewelry', 'Pottery', 'Home Decor', 'Textiles', 'Painting'];

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#d7ccc8]/40 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#bcaaa4]/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-[#efebe9]/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:w-1/2 space-y-8 text-center lg:text-left"
            >

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.15] text-[#3E2723] tracking-tight">
                Discover <br />
                <span className="gradient-text">Handmade</span> Magic.
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Shop unique, sustainable, and handcrafted treasures directly from India's finest master artisans.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary flex items-center gap-2"
                >
                  Explore Products <ArrowRight className="w-5 h-5" />
                </motion.button>
                {user?.role === 'artisan' ? (
                  <Link to="/dashboard">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary">
                      Artisan Dashboard
                    </motion.button>
                  </Link>
                ) : user ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    className="btn-secondary"
                    onClick={async () => {
                      try {
                        const config = { headers: { Authorization: `Bearer ${user.token}` } };
                        const { data } = await axios.put('http://localhost:5000/api/users/profile', { role: 'artisan' }, config);
                        const updatedUser = { ...data, token: user.token };
                        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                        window.location.href = '/dashboard';
                      } catch (err) {
                        console.error('Failed to upgrade to seller', err);
                        alert('Could not upgrade to seller. Please try again.');
                      }
                    }}
                  >
                    Become a Seller
                  </motion.button>
                ) : (
                  <Link to="/register?role=artisan">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary">
                      Become a Seller
                    </motion.button>
                  </Link>
                )}
              </div>

              <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 opacity-80">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt={`Customer avatar ${i}`} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#3E2723] text-lg">10k+</p>
                  <p className="text-[#8D6E63] text-sm">Happy Customers</p>
                </div>
              </div>
            </motion.div>

            {/* Right Image Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/50">
                <img
                  src="https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="A pottery artisan showcasing a handmade piece"
                  fetchPriority="high"
                  className="w-full h-auto object-cover transform hover:scale-105 transition duration-700"
                />

                {/* Floating Glass Card */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-8 left-8 right-8 glass-card p-4 flex items-center gap-5"
                >
                  <div className="w-14 h-14 bg-[#3E2723] rounded-full flex items-center justify-center text-[#EFEBE9] shadow-lg shadow-[#3E2723]/25">
                    <Star className="w-7 h-7 fill-[#EFEBE9]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3E2723] text-lg">Featured Artisan</h3>
                    <p className="text-slate-600">Ramesh Gupta • Pottery Master</p>
                  </div>
                </motion.div>
              </div>

              {/* Decor Elements */}
              <div className="absolute top-10 -right-10 w-24 h-24 bg-[#EFEBE9] rounded-full blur-2xl opacity-40 animate-pulse border border-[#8D6E63]/20"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#D7CCC8] rounded-full blur-3xl opacity-40"></div>
            </motion.div>

          </div>
        </div>
      </section>

      <StatsSection />

      {/* AI For You Section */}
      {forYouData && (
        <section className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-[#3E2723] to-[#5D4037] rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-400 text-[#3E2723] p-1.5 rounded-lg">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest">Curated For You</span>
            </div>
            {forYouData.greeting && (
              <p className="text-white/80 text-sm mb-6 italic max-w-xl">✨ {forYouData.greeting}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {forYouData.products.map(product => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="group bg-white/10 backdrop-blur rounded-2xl overflow-hidden hover:bg-white/20 transition-all border border-white/10"
                >
                  <div className="h-32 overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  </div>
                  <div className="p-3">
                    <p className="text-white font-bold text-xs truncate">{product.name}</p>
                    <p className="text-amber-300 text-xs font-black mt-0.5">₹{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Filter & Grid */}
      <section id="products" className="scroll-mt-24 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex-1 w-full max-w-xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchParams({ search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                placeholder="Search creations... or try AI Search ✨"
                className="block w-full pl-12 pr-24 py-4 bg-white/50 backdrop-blur-xl border-2 border-transparent focus:border-[#3E2723]/20 rounded-[1.5rem] text-[#3E2723] placeholder-gray-400 shadow-xl shadow-[#3E2723]/5 transition-all outline-none"
              />
              <button
                onClick={handleAISearch}
                disabled={aiSearching || !searchQuery.trim()}
                className={`absolute inset-y-2 right-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all
                  ${aiSearching ? 'bg-amber-100 text-amber-700' : 'bg-[#3E2723] text-white hover:bg-[#2D1B15] shadow-lg shadow-[#3E2723]/20'}`}
              >
                {aiSearching ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Search</span>
                  </>
                )}
              </button>
            </div>
            {aiSearchActive && !aiSearching && (
              <p className="text-[10px] text-amber-600 mt-2 ml-4 flex items-center gap-1 font-bold animate-fade-in">
                <Sparkles className="w-2.5 h-2.5" /> Semantically filtered by KalaKart AI
                <button onClick={() => {setAiSearchActive(false); setSearchParams({}); setCategory('All');}} className="ml-2 underline hover:text-amber-800">Clear</button>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center bg-white/40 backdrop-blur-md p-2 rounded-2xl shadow-[0_4px_16px_rgba(62,39,35,0.05)] border border-white/50">
            {/* Category Filter */}
            <div className="flex items-center space-x-2 px-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-slate-700 font-bold cursor-pointer py-1 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="w-px h-6 bg-gray-200"></div>

            {/* Sort */}
            <div className="flex items-center space-x-2 px-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-500" />
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer py-1"
              >
                <option value="default">Newest First</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Curating collection...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#EFEBE9]/50 rounded-xl border border-dashed border-[#D7CCC8]">
            <p className="text-2xl font-bold text-gray-400">No products found</p>
            <p className="text-gray-500">Try adjusting your filters</p>
            <button onClick={() => { setCategory('All'); setSearchParams({}); }} className="mt-4 text-primary underline">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}
      </section>

      {/* Gift Finder CTA */}
      <section className="py-20 bg-[#3E2723] overflow-hidden relative rounded-[3rem] my-12 mx-4">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
              <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-200 text-xs font-bold mb-8 tracking-widest uppercase"
              >
                  <Gift className="w-4 h-4" /> The Art of Gifting
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Struggling to find the perfect gift?</h2>
              <p className="text-amber-50/70 text-lg mb-10 max-w-2xl mx-auto">
                  Our AI Gift Concierge uses the wisdom of our artisan community to match your loved ones with the one-of-a-kind treasures they'll cherish forever.
              </p>
              <Link to="/gifts" className="btn-primary bg-amber-500 text-[#3E2723] hover:bg-amber-400 group border-none">
                  Try AI Gift Finder <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
          </div>
      </section>

      {/* Meet Our Artisans Section */}
      <section id="artisans" className="scroll-mt-24 py-12 bg-transparent rounded-3xl px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#3E2723]">Meet Our Master Artisans</h2>
          <p className="text-gray-500 mt-2">The hands and hearts behind your favorite creations.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { id: 1, name: "Ramesh Gupta", title: "Pottery Master", quote: "I put my soul into every piece of clay I mold.", img: 21 },
            { id: 2, name: "Anjali Desai", title: "Textile Weaver", quote: "Every thread tells a story of our heritage.", img: 32 },
            { id: 3, name: "Vikram Singh", title: "Silversmith", quote: "Bringing raw metals to life through fire and passion.", img: 11 }
          ].map((artisan) => (
            <div key={artisan.id} className="glass-card p-6 text-center border-none shadow-sm hover:shadow-md transition-shadow">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden border-4 border-[#EFEBE9] shadow-sm">
                <img src={`https://i.pravatar.cc/150?img=${artisan.img}`} alt={artisan.name} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-xl text-[#3E2723]">{artisan.name}</h3>
              <p className="text-[#8D6E63] text-sm font-semibold uppercase">{artisan.title}</p>
              <p className="text-gray-500 text-sm mt-3">"{artisan.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="scroll-mt-24 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#3E2723]">Customer Love</h2>
          <p className="text-gray-500 mt-2">Hear from our happy community.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex text-yellow-400 mb-2">★★★★★</div>
            <p className="text-gray-700 italic mb-4">"The quality of the handmade jewelry I bought is unmatched. You can feel the love in the work."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden"><img src="https://i.pravatar.cc/150?img=5" alt="Priya Sharma Profile" loading="lazy" /></div>
              <div>
                <p className="font-bold text-sm">Priya Sharma</p>
                <p className="text-xs text-gray-500">Mumbai</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-8 border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex text-yellow-400 mb-2">★★★★★</div>
            <p className="text-gray-700 italic mb-4">"KalaKart made it so easy to find unique gifts for my family. Fast shipping and beautiful packaging!"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden"><img src="https://i.pravatar.cc/150?img=9" alt="Rahul Verma Profile" loading="lazy" /></div>
              <div>
                <p className="font-bold text-sm">Rahul Verma</p>
                <p className="text-xs text-gray-500">Bangalore</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
