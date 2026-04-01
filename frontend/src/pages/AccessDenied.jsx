import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

const AccessDenied = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-red-100 p-6 rounded-full mb-6 animate-pulse">
                <Lock className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-600 max-w-md mb-8">
                This area is restricted to Artisans only. Join our community of creators to access these features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    to="/register"
                    className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg"
                >
                    Become an Artisan
                </Link>
                <Link
                    to="/"
                    className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default AccessDenied;
