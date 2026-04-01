import { Users, ShoppingBag, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';

const StatsSection = () => {
    const stats = [
        { icon: <ShoppingBag className="w-8 h-8 text-[#8D6E63]" />, value: 1200, label: "Handmade Products", link: "/#products" },
        { icon: <Users className="w-8 h-8 text-[#8D6E63]" />, value: 350, label: "Verified Artisans", link: "/#artisans" },
        { icon: <MapPin className="w-8 h-8 text-[#8D6E63]" />, value: 25, label: "Cities Covered", link: "/#map" },
        { icon: <Star className="w-8 h-8 text-yellow-500" />, value: 4.8, isDecimal: true, label: "Average Rating", link: "/#reviews" },
    ];

    return (
        <section className="bg-white/50 backdrop-blur-sm py-12 rounded-2xl shadow-sm border border-white/60 my-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-[#3E2723]">Trusted by Artisans & Customers Across India</h2>
                <p className="text-gray-500 mt-2">Connecting creativity with appreciation.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
                {stats.map((stat, index) => (
                    <Link to={stat.link} key={index} className="flex flex-col items-center text-center space-y-3 p-4 hover:bg-[#EFEBE9]/50 rounded-xl transition duration-300 transform hover:scale-105 cursor-pointer group border border-transparent hover:border-[#D7CCC8] hover:shadow-lg">
                        <div className="bg-[#EFEBE9] p-4 rounded-full mb-2 group-hover:bg-[#D7CCC8]/50 transition">
                            {stat.icon}
                        </div>
                        <h3 className="text-4xl font-extrabold text-[#3E2723]">
                            <CountUp end={stat.value} duration={2.5} decimals={stat.isDecimal ? 1 : 0} suffix="+" />
                        </h3>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default StatsSection;
