import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Award, ChevronLeft, Link as LinkIcon, Instagram, Youtube, Globe, Edit2 } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import { apiUrl } from '../lib/api';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch Profile
                const { data: profileData } = await axios.get(apiUrl(`/api/users/${id}`));
                setProfile(profileData);

                // Fetch Artisan's Products
                const { data: productsData } = await axios.get(apiUrl(`/api/products/artisan/${id}`));
                setProducts(productsData);

                if (currentUser) {
                    if (currentUser._id === id) {
                        setIsOwner(true);
                    } else if (currentUser.following?.includes(id)) {
                        setIsFollowing(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [id, currentUser]);

    const handleFollowToggle = async () => {
        if (!currentUser) return alert('Please login to follow artisans.');

        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            if (isFollowing) {
                await axios.post(apiUrl(`/api/users/${id}/unfollow`), {}, config);
                setIsFollowing(false);
            } else {
                await axios.post(apiUrl(`/api/users/${id}/follow`), {}, config);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Error toggling follow status", error);
            alert(error.response?.data?.message || 'Error occurred');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3E2723]"></div></div>;
    if (!profile) return <div className="text-center py-20 text-gray-500 text-xl font-bold">Profile not found</div>;

    const hasProfileImage = Boolean(profile.profileImage);
    const hasBio = Boolean(profile.bio && profile.bio.length > 0);
    const hasPortfolio = Boolean(profile.portfolio && profile.portfolio.length >= 3);
    const isVerified = hasProfileImage && hasBio && hasPortfolio;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-orange-100 to-amber-50"></div>
                <div className="px-8 pb-8 flex flex-col sm:flex-row gap-6 relative -mt-16 sm:-mt-20">

                    {/* DP */}
                    <div className="relative shrink-0">
                        {profile.profileImage ? (
                            <img src={profile.profileImage} alt={profile.name} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg bg-white" />
                        ) : (
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#3E2723] to-[#8D6E63] text-white flex items-center justify-center font-bold text-5xl border-4 border-white shadow-lg">
                                {profile.name.charAt(0)}
                            </div>
                        )}
                        {isVerified && (
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Verified Artisan">
                                <Award className="w-6 h-6" />
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="pt-2 sm:pt-24 flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 flex items-center flex-wrap gap-2">
                                    {profile.name}
                                    {isVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider"><Star className="w-3 h-3 fill-green-700" /> Verified Artisan</span>}
                                    {profile.artisanRating > 0 && (
                                        <span className="text-sm bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full font-extrabold flex items-center gap-1 shadow-sm border border-yellow-200">
                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                            {profile.artisanRating.toFixed(1)} <span className="font-medium text-xs text-yellow-700 ml-1">({profile.totalReviews} Reviews)</span>
                                        </span>
                                    )}
                                </h1>

                                {profile.location?.city ? (
                                    <p className="text-gray-500 flex items-center gap-1.5 mt-2 font-medium">
                                        <MapPin className="w-4 h-4" />
                                        {profile.location.city}, {profile.location.state} {profile.location.country}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 flex items-center gap-1.5 mt-2 text-sm italic">
                                        <MapPin className="w-4 h-4" /> Location not set
                                    </p>
                                )}

                                {profile.craftCategories && profile.craftCategories.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {profile.craftCategories.map(cat => (
                                            <span key={cat} className="bg-orange-50 text-orange-800 border border-orange-200 px-3 py-1 rounded-lg text-xs font-bold">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {isOwner ? (
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center justify-center gap-2 bg-[#3E2723] hover:bg-[#5D4037] text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollowToggle}
                                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition shadow-md border-2 ${isFollowing
                                        ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                                        : 'bg-[#8D6E63] text-white border-[#8D6E63] hover:bg-[#70584F]'
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow Artisan'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Left Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">About Me</h3>
                        {profile.bio ? (
                            <p className="text-gray-600 leading-relaxed text-sm">{profile.bio}</p>
                        ) : (
                            <p className="text-gray-400 italic text-sm">This artisan hasn't written a bio yet.</p>
                        )}
                    </div>

                    {profile.socialLinks && (profile.socialLinks.instagram || profile.socialLinks.website || profile.socialLinks.youtube) && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Connect</h3>
                            <div className="space-y-3">
                                {profile.socialLinks.instagram && (
                                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-pink-600 transition font-medium text-sm">
                                        <div className="bg-gray-50 p-2 rounded-lg text-pink-600"><Instagram className="w-4 h-4" /></div> Instagram
                                    </a>
                                )}
                                {profile.socialLinks.youtube && (
                                    <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-red-600 transition font-medium text-sm">
                                        <div className="bg-gray-50 p-2 rounded-lg text-red-600"><Youtube className="w-4 h-4" /></div> YouTube
                                    </a>
                                )}
                                {profile.socialLinks.website && (
                                    <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition font-medium text-sm">
                                        <div className="bg-gray-50 p-2 rounded-lg text-blue-600"><Globe className="w-4 h-4" /></div> Website
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">

                    {profile.craftStory && (
                        <div className="bg-orange-50/50 rounded-2xl border border-orange-100 p-8 relative overflow-hidden">
                            <h3 className="text-2xl font-black text-[#3E2723] mb-4 font-serif">The Story Behind the Craft</h3>
                            <p className="text-gray-700 leading-loose relative z-10 text-lg">
                                "{profile.craftStory}"
                            </p>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Portfolio Gallery</h3>
                            <span className="text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                {profile.portfolio ? profile.portfolio.length : 0} / 5 Images
                            </span>
                        </div>

                        {profile.portfolio && profile.portfolio.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {profile.portfolio.map((imgUrl, index) => (
                                    <div key={index} className="aspect-square rounded-xl overflow-hidden group relative">
                                        <img src={imgUrl} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium pb-2">No portfolio images uploaded yet.</p>
                                {isOwner && <p className="text-sm text-gray-400">Upload at least 3 images to earn your Verified Artisan badge!</p>}
                            </div>
                        )}
                    </div>

                    {/* Crafts for Sale Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Crafts for Sale</h3>
                            <span className="text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                {products.length} Products
                            </span>
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <Link key={product._id} to={`/product/${product._id}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            {product.stock <= 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-white/90 text-red-600 font-bold px-4 py-2 rounded-full text-sm shadow-lg">Sold Out</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-[#3E2723] transition-colors">{product.name}</h3>
                                                <span className="font-black text-[#5D4037] text-lg whitespace-nowrap">₹{product.price.toLocaleString('en-IN')}</span>
                                            </div>
                                            <span className="inline-block px-2 py-1 bg-orange-50 text-orange-800 text-xs font-bold rounded-lg self-start mt-auto">{product.category}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium pb-2">No products listed for sale yet.</p>
                                {isOwner && (
                                    <Link to="/dashboard" className="text-sm text-[#8D6E63] font-bold hover:underline">
                                        Go to Seller Dashboard to add products!
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentProfile={profile}
                onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)}
            />
        </div>
    );
};

export default Profile;
