import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Sparkles, Float, Center } from '@react-three/drei';
import { Sun, Moon, Play, Pause, Trees, Monitor } from 'lucide-react';

const JewelryMesh = ({ color }) => (
    <group position={[0, 0.2, 0]}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            {/* Ring Base */}
            <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.5, 0.08, 64, 100]} />
                <meshStandardMaterial color={color || "#FFD700"} roughness={0.05} metalness={1} />
            </mesh>
            {/* Gemstone */}
            <mesh castShadow position={[0, 0.5, 0]}>
                <octahedronGeometry args={[0.2, 0]} />
                <meshPhysicalMaterial color="#ffffff" transmission={0.9} thickness={0.5} roughness={0} ior={1.5} />
            </mesh>
        </Float>
    </group>
);

const PotteryMesh = ({ color }) => (
    <group position={[0, -0.6, 0]}>
        <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.4, 1.2, 64]} />
            <meshStandardMaterial color={color || "#D2691E"} roughness={0.8} metalness={0.05} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.15, 0.3, 0.3, 64]} />
            <meshStandardMaterial color={color || "#D2691E"} roughness={0.8} metalness={0.05} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.17, 0.04, 32, 64]} />
            <meshStandardMaterial color={color || "#D2691E"} roughness={0.8} metalness={0.05} />
        </mesh>
    </group>
);

const DecorMesh = ({ color }) => (
    <group position={[0, 0, 0]}>
        <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
            <mesh castShadow receiveShadow>
                <icosahedronGeometry args={[0.6, 0]} />
                <meshStandardMaterial color={color || "#4682B4"} roughness={0.3} metalness={0.7} wireframe={true} />
            </mesh>
            <mesh castShadow receiveShadow>
                <icosahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial color={color || "#ffffff"} roughness={0.1} metalness={0.9} />
            </mesh>
        </Float>
    </group>
);

const DefaultMesh = ({ color }) => (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh castShadow receiveShadow>
            <torusKnotGeometry args={[0.4, 0.12, 128, 32]} />
            <meshStandardMaterial color={color || "#8D6E63"} roughness={0.2} metalness={0.8} />
        </mesh>
    </Float>
);

const DynamicModel = ({ category, color }) => {
    switch (category) {
        case 'Jewelry': return <JewelryMesh color={color} />;
        case 'Pottery': return <PotteryMesh color={color} />;
        case 'Home Decor': 
        case 'Art': return <DecorMesh color={color} />;
        default: return <DefaultMesh color={color} />;
    }
};

const ARViewer = ({ category }) => {
    const [envPreset, setEnvPreset] = useState('city');
    const [autoRotate, setAutoRotate] = useState(true);

    const getModelColor = () => {
        switch (category) {
            case 'Jewelry': return '#FFD700'; // Gold
            case 'Pottery': return '#D2691E'; // Clay/Terra
            case 'Textiles': return '#FF69B4'; // Pink
            case 'Home Decor': return '#4682B4'; // Steel Blue
            case 'Art': return '#8A2BE2'; // Violet
            default: return '#8D6E63'; // Default Brown
        }
    };

    const environments = [
        { id: 'city', name: 'Studio', icon: <Monitor className="w-3 h-3" /> },
        { id: 'sunset', name: 'Sunset', icon: <Sun className="w-3 h-3" /> },
        { id: 'forest', name: 'Forest', icon: <Trees className="w-3 h-3" /> },
        { id: 'night', name: 'Night', icon: <Moon className="w-3 h-3" /> }
    ];

    return (
        <div className="relative w-full h-[500px] bg-gradient-to-br from-slate-50 to-gray-200 rounded-3xl overflow-hidden shadow-inner group">
            
            <Canvas shadows camera={{ position: [0, 0, 2.5], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <spotLight position={[10, 10, 10]} intensity={1.5} angle={0.15} penumbra={1} castShadow shadow-mapSize={[1024, 1024]} />
                
                <Center>
                    <DynamicModel category={category} color={getModelColor()} />
                </Center>
                
                {/* Magical sparkle particles */}
                <Sparkles count={80} scale={3} size={2} speed={0.4} opacity={0.3} color={getModelColor()} />

                <ContactShadows position={[0, -0.8, 0]} opacity={0.7} scale={5} blur={2.5} far={2} resolution={512} color="#000000" />
                <Environment preset={envPreset} background blur={0.8} />
                <OrbitControls makeDefault autoRotate={autoRotate} autoRotateSpeed={1.5} enableZoom={true} minDistance={1.5} maxDistance={5} />
            </Canvas>

            {/* Top Interactive Hint */}
            <div className="absolute top-5 left-5 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black text-[#3E2723] shadow-md border border-white">
                Interactive 3D Replica
            </div>

            {/* Right Side UI Controls */}
            <div className="absolute top-5 right-5 flex flex-col gap-2">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-2 flex flex-col gap-2">
                    {environments.map(env => (
                        <button
                            key={env.id}
                            onClick={() => setEnvPreset(env.id)}
                            title={`Lighting: ${env.name}`}
                            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${envPreset === env.id ? 'bg-[#3E2723] text-white shadow-md transform scale-105' : 'bg-gray-100/50 text-gray-500 hover:bg-gray-200'}`}
                        >
                            {env.icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-bold text-[#3E2723] shadow-lg border border-white/50 hover:bg-white hover:scale-105 transition-all"
                >
                    {autoRotate ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    {autoRotate ? 'Pause Rotation' : 'Spin Mode'}
                </button>
            </div>
            
            <div className="absolute bottom-5 right-5 text-[10px] font-bold text-gray-800/60 uppercase tracking-widest text-right pointer-events-none drop-shadow-sm">
                Scroll to Zoom<br />Drag to Inspect
            </div>
        </div>
    );
};

export default ARViewer;
