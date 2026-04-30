import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';

function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="text-[#3E2723] font-bold bg-white/80 px-4 py-2 rounded-full backdrop-blur shadow-sm whitespace-nowrap">
                {progress.toFixed(0)}% loaded
            </div>
        </Html>
    );
}

const GLTFModel = ({ url }) => {
    const { scene } = useGLTF(url);
    // Center the model roughly
    return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
};

const FallbackModel = () => {
    return (
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <torusKnotGeometry args={[0.8, 0.25, 128, 32]} />
            <meshStandardMaterial color="#8D6E63" metalness={0.6} roughness={0.3} />
        </mesh>
    );
};

const ModelViewer = ({ modelUrl }) => {
    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 relative">
            <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} />
                
                <Suspense fallback={<Loader />}>
                    {modelUrl ? <GLTFModel url={modelUrl} /> : <FallbackModel />}
                    <Environment preset="city" />
                    {/* Shadow catcher */}
                    <ContactShadows position={[0, -1.2, 0]} opacity={0.6} scale={10} blur={2} far={4} />
                </Suspense>
                
                <OrbitControls 
                    autoRotate 
                    autoRotateSpeed={1.5} 
                    enableZoom={true} 
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                    makeDefault 
                />
            </Canvas>
        </div>
    );
};

export default ModelViewer;
