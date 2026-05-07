import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

const Register = () => {
    const [searchParams] = useSearchParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(searchParams.get('role') || 'buyer');
    const [showPassword, setShowPassword] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password, role);
            navigate('/');
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full flex bg-white rounded-3xl shadow-xl flex-row-reverse">
                {/* Illustration Section */}
                <div className="hidden md:block w-1/2 bg-[#D7CCC8] p-12 text-[#3E2723] relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <h2 className="text-4xl font-extrabold mb-6 relative z-10 text-[#3E2723]">Start Your Journey</h2>
                    <p className="text-[#3E2723]/80 text-lg relative z-10 font-bold">
                        Whether you are an artisan or an admirer, find your place in our creative world.
                    </p>
                    <div className="mt-12 relative z-10 flex justify-center">
                        <div className="w-full max-w-xs glass-card p-6 border border-white/40 shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#3E2723]"></div>
                                <div className="h-3 bg-[#3E2723]/30 w-24 rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 bg-[#3E2723]/20 w-full rounded"></div>
                                <div className="h-2 bg-[#3E2723]/20 w-5/6 rounded"></div>
                                <div className="h-2 bg-[#3E2723]/20 w-4/6 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="w-full md:w-1/2 p-10 md:p-12 relative bg-[#EFEBE9]/30 backdrop-blur-sm border-r border-[#D7CCC8]/50">
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#BCAAA4]/40 rounded-full blur-3xl pointer-events-none"></div>

                    <h2 className="text-3xl font-bold text-[#3E2723] mb-2 relative z-10">Create Account</h2>
                    <p className="text-[#8D6E63] mb-8 relative z-10">It's free and takes less than a minute.</p>

                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100"><span className="font-bold">Error:</span> {error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative z-10">
                            <label className="block text-sm font-medium text-[#3E2723] mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-[#8D6E63]" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-3 border border-[#D7CCC8]/80 bg-white/70 rounded-xl focus:ring-[#8D6E63] focus:border-[#8D6E63] transition relative z-10"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative z-10">
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

                        <div className="relative z-10">
                            <label className="block text-sm font-medium text-[#3E2723] mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-[#8D6E63]" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full pl-10 pr-10 py-3 border border-[#D7CCC8]/80 bg-white/70 rounded-xl focus:ring-[#8D6E63] focus:border-[#8D6E63] transition relative z-10"
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

                        <div className="relative z-10">
                            <label className="block text-sm font-medium text-[#3E2723] mb-2">I want to...</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${role === 'buyer' ? 'border-[#3E2723] bg-[#EFEBE9] text-[#3E2723] shadow-md' : 'border-[#D7CCC8]/50 bg-white/50 hover:border-[#D7CCC8]'}`}
                                    onClick={() => setRole('buyer')}
                                >
                                    <div className="font-bold">Buy Art</div>
                                    <div className="text-xs text-[#8D6E63] mt-1">Support Artists</div>
                                </div>
                                <div
                                    className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${role === 'artisan' ? 'border-[#8D6E63] bg-[#BCAAA4]/20 text-[#3E2723] shadow-md' : 'border-[#D7CCC8]/50 bg-white/50 hover:border-[#D7CCC8]'}`}
                                    onClick={() => setRole('artisan')}
                                >
                                    <div className="font-bold">Sell Art</div>
                                    <div className="text-xs text-[#8D6E63] mt-1">Grow Business</div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 mt-6 btn-primary relative z-10 flex justify-center items-center ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-[#8D6E63] font-medium relative z-10">
                        Already have an account? <Link to="/login" className="font-bold text-[#3E2723] hover:underline transition">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
