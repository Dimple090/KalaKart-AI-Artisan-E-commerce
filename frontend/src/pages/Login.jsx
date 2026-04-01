import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            // Toast notification would go here
            navigate('/');
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full flex bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Illustration Section */}
                <div className="hidden md:block w-1/2 bg-[#D7CCC8] p-12 text-[#3E2723] relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <h2 className="text-4xl font-extrabold mb-6 relative z-10 text-[#3E2723]">Welcome Back!</h2>
                    <p className="text-[#3E2723]/80 text-lg relative z-10 font-medium">
                        Join our community of artisans and art lovers. Discover unique handmade treasures today.
                    </p>
                    <div className="mt-12 relative z-10 flex justify-center">
                        <div className="glass-card p-6 border border-white/40 transform -rotate-3 hover:rotate-0 transition duration-500 shadow-xl">
                            <div className="text-center text-[#3E2723]">
                                <p className="font-bold text-2xl">350+</p>
                                <p className="text-sm font-semibold uppercase tracking-wider">Artisans</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="w-full md:w-1/2 p-10 md:p-12 relative overflow-hidden bg-[#EFEBE9]/30 backdrop-blur-sm">
                    {/* Soft Decor Blob */}
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#BCAAA4]/40 rounded-full blur-3xl pointer-events-none"></div>

                    <h2 className="text-3xl font-bold text-[#3E2723] mb-2 relative z-10">Sign In</h2>
                    <p className="text-[#8D6E63] mb-8 relative z-10">Please enter your details to continue.</p>

                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100"><span className="font-bold">Error:</span> {error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#3E2723] mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-[#8D6E63]" />
                                </div>
                                <input
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-3 border border-[#D7CCC8]/80 bg-white/70 rounded-xl focus:ring-[#8D6E63] focus:border-[#8D6E63] transition relative z-10"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#3E2723] mb-1">Password</label>
                            <div className="relative z-10">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-[#8D6E63]" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full pl-10 pr-10 py-3 border border-[#D7CCC8]/80 bg-white/70 rounded-xl focus:ring-[#8D6E63] focus:border-[#8D6E63] transition"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm relative z-10">
                            <label className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-[#3E2723] focus:ring-[#3E2723] border-gray-300 rounded" />
                                <span className="ml-2 text-[#8D6E63]">Remember me</span>
                            </label>
                            <a href="#" className="font-bold text-[#8D6E63] hover:text-[#3E2723]">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 mt-4 btn-primary relative z-10 flex justify-center items-center ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative z-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#D7CCC8]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#EFEBE9] text-[#8D6E63]">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 relative z-10">
                            <button className="w-full inline-flex justify-center items-center py-3 px-4 border border-[#3E2723]/20 bg-white rounded-xl shadow-[0_4px_10px_rgba(62,39,35,0.05)] text-sm font-bold text-[#3E2723] hover:bg-[#EFEBE9] transition-all">
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-[#8D6E63] font-medium relative z-10">
                        Don't have an account? <Link to="/register" className="font-bold text-[#3E2723] hover:text-[#8D6E63] underline">Sign up now</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
