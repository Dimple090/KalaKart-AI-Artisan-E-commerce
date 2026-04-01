import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Video, Mic, MicOff, VideoOff, Users, PhoneOff, Send, User as UserIcon, Sparkles, ScrollText, X as CloseIcon } from 'lucide-react';
import axios from 'axios';

const LiveStream = () => {
    const { id } = useParams(); // artisan ID or room ID
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stream, setStream] = useState(null);
    const [viewers, setViewers] = useState(0);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const [scriptLoading, setScriptLoading] = useState(false);
    const [generatedScript, setGeneratedScript] = useState('');
    const [showTeleprompter, setShowTeleprompter] = useState(false);
    const [artisanProducts, setArtisanProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null); // For viewers
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const peerConnectionsRef = useRef({}); // Store RTCPeerConnections mapped by viewer socket ID
    const streamRef = useRef(null); // Fix stale closures for the stream!

    const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        console.log("[LiveStream] Connecting to Socket.io...");
        // Connect to signaling server
        socketRef.current = io('http://localhost:5000');
        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log(`[LiveStream] Connected to server as: ${socket.id}`);
            socket.emit('join_stream', id);
        });

        const isBroadcaster = user.role === 'artisan' && user._id === id;

        // Broadcaster handles new viewers
        socket.on('viewer_joined', async (viewerId) => {
            console.log(`[LiveStream] Viewer joined: ${viewerId}`);
            if (isBroadcaster && streamRef.current) {
                console.log(`[LiveStream] Creating offer for new viewer: ${viewerId}`);
                setViewers((prev) => prev + 1);
                const pc = createPeerConnection(viewerId, true);
                peerConnectionsRef.current[viewerId] = pc;
                streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current));
            }
        });

        // Viewer handles broadcaster coming online (if viewer joined early)
        socket.on('broadcaster_online', (broadcasterId) => {
            console.log(`[LiveStream] Broadcaster came online (${broadcasterId}). Requesting stream...`);
            if (!isBroadcaster) {
                // Re-join stream to trigger viewer_joined on backend, so broadcaster sees us and creates an offer
                socket.emit('join_stream', id);
            }
        });

        socket.on('viewer_left', (viewerId) => {
            if (peerConnectionsRef.current[viewerId]) {
                console.log(`[LiveStream] Viewer left: ${viewerId}`);
                setViewers((prev) => Math.max(0, prev - 1));
                peerConnectionsRef.current[viewerId].close();
                delete peerConnectionsRef.current[viewerId];
            }
        });

        // WebRTC Signaling
        socket.on('webrtc_offer', async ({ sdp, broadcaster }) => {
            console.log(`[LiveStream] Received WEBRTC OFFER from ${broadcaster}`);
            if (!isBroadcaster) {
                const pc = createPeerConnection(broadcaster, false);
                peerConnectionsRef.current[broadcaster] = pc;
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', { target: broadcaster, sdp: pc.localDescription });
                console.log(`[LiveStream] Sent WEBRTC ANSWER back to ${broadcaster}`);
            }
        });

        socket.on('webrtc_answer', async ({ sdp, viewer }) => {
            console.log(`[LiveStream] Received WEBRTC ANSWER from ${viewer}`);
            if (isBroadcaster && peerConnectionsRef.current[viewer]) {
                await peerConnectionsRef.current[viewer].setRemoteDescription(new RTCSessionDescription(sdp));
            }
        });

        socket.on('webrtc_ice_candidate', async ({ candidate, sender }) => {
            if (peerConnectionsRef.current[sender]) {
                try {
                    await peerConnectionsRef.current[sender].addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding received ice candidate", e);
                }
            }
        });

        // Chat Handlers
        socket.on('receive_message', (data) => {
            console.log(`[LiveStream] Received Chat Message:`, data);
            setMessages((prev) => [...prev, data]);
        });

        // Fetch Artisan Products for Scripting
        if (isBroadcaster) {
            axios.get('http://localhost:5000/api/products')
                .then(({ data }) => {
                    const myProducts = data.filter(p => p.user === user._id);
                    setArtisanProducts(myProducts);
                    if (myProducts.length > 0) setSelectedProduct(myProducts[0]);
                })
                .catch(err => console.error("Error fetching products for script:", err));
        }

        return () => {
            if (socket) socket.disconnect();
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
            Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
        };
    }, [id, user, navigate]);

    // Ensure we keep the ref synced with state
    useEffect(() => {
        streamRef.current = stream;
        if (localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
        }
    }, [stream]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim() || !socketRef.current) return;

        console.log(`[LiveStream] Sending message to room ${id}:`, chatMessage);
        socketRef.current.emit('send_message', {
            roomId: id,
            message: chatMessage,
            user: { name: user.name, role: user.role }
        });
        
        setChatMessage('');
    };

    const createPeerConnection = (targetId, isOffer) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('webrtc_ice_candidate', { target: targetId, candidate: event.candidate });
            }
        };

        if (!isOffer) {
            // Viewing mode: receiving incoming streams
            pc.ontrack = (event) => {
                console.log("[LiveStream] Received Remote Video Track!");
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
        } else {
            pc.onnegotiationneeded = async () => {
                try {
                    console.log(`[LiveStream] Negotiation needed for ${targetId}. Creating offer...`);
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socketRef.current.emit('webrtc_offer', { target: targetId, sdp: pc.localDescription });
                } catch (err) {
                    console.error("Error during negotiation", err);
                }
            };
        }

        return pc;
    };

    const startBroadcast = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            setIsBroadcasting(true);
            
            // Notify the room that stream has started so waiting viewers can connect
            if (socketRef.current) {
                console.log("[LiveStream] Broadcasting stream_started event");
                socketRef.current.emit('stream_started', id);
            }
        } catch (error) {
            console.error('Error accessing media devices', error);
            alert('Could not access camera/microphone');
        }
    };

    const toggleAudio = () => {
        if (streamRef.current) {
            const isEnabled = streamRef.current.getAudioTracks()[0].enabled;
            streamRef.current.getAudioTracks()[0].enabled = !isEnabled;
            setAudioEnabled(!isEnabled);
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            const isEnabled = streamRef.current.getVideoTracks()[0].enabled;
            streamRef.current.getVideoTracks()[0].enabled = !isEnabled;
            setVideoEnabled(!isEnabled);
        }
    };

    const endStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsBroadcasting(false);
        }
        Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
        peerConnectionsRef.current = {};
        navigate('/dashboard'); // Go back
    };

    const handleGenerateScript = async () => {
        if (!selectedProduct) return;
        setScriptLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.post('http://localhost:5000/api/ai/live-script', {
                productName: selectedProduct.name,
                description: selectedProduct.description,
                ecoScore: selectedProduct.ecoScore
            }, config);
            setGeneratedScript(data.script);
            setShowTeleprompter(true);
        } catch (error) {
            console.error("Script generation failed:", error);
            alert("Failed to generate script.");
        } finally {
            setScriptLoading(false);
        }
    };


    return (
        <div className="max-w-[90rem] mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
                
                {/* Left Column: Video Broadcast */}
                <div className="flex-[2] bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative flex flex-col h-[600px]">
                    {/* Header */}
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="bg-red-600 animate-pulse text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 tracking-widest uppercase shadow-lg">
                                    <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
                                </span>
                                <span className="text-white/80 font-medium text-sm drop-shadow-md">
                                    Artisan Studio
                                </span>
                            </div>
                        </div>
                        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-300" />
                            <span className="text-white text-sm font-bold">{viewers} Watching</span>
                        </div>
                    </div>

                    {/* Video Area */}
                    <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center relative">
                        {isArtisanOwner ? (
                            <>
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted // Mute local playback to prevent echo
                                    className={`w-full h-full object-cover ${!stream && 'hidden'}`}
                                />
                                {!stream && (
                                    <div className="text-center p-8">
                                        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold text-white mb-4">Ready to showcase your craft?</h2>
                                        <button onClick={startBroadcast} className="btn-primary animate-bounce shadow-lg shadow-purple-900/50">
                                            Go Live Now
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className={`w-full h-full object-cover ${!remoteVideoRef.current?.srcObject && 'hidden'}`}
                                />
                                {!remoteVideoRef.current?.srcObject && (
                                    <div className="text-center animate-pulse p-8">
                                        <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium text-lg mb-2">Waiting for Artisan's stream...</p>
                                        <p className="text-sm text-gray-500 max-w-sm mx-auto">Heads up: If the artisan is already live, please **refresh this page** to connect.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Broadcaster Controls Floor */}
                    {isArtisanOwner && isBroadcasting && (
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-3xl flex items-center gap-6 shadow-2xl">
                            <button onClick={toggleAudio} className={`p-4 rounded-full transition ${audioEnabled ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-500 text-white shadow-lg shadow-red-500/50 hover:bg-red-600'}`}>
                                {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                            </button>
                            <button onClick={toggleVideo} className={`p-4 rounded-full transition ${videoEnabled ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-500 text-white shadow-lg shadow-red-500/50 hover:bg-red-600'}`}>
                                {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                            </button>
                            <div className="w-px h-10 bg-white/20 mx-2"></div>
                            
                            {/* AI Scripting Button */}
                            <button 
                                onClick={handleGenerateScript} 
                                disabled={scriptLoading || artisanProducts.length === 0}
                                className="bg-amber-500 hover:bg-amber-600 text-[#3E2723] p-4 rounded-full shadow-lg shadow-amber-500/50 transition transform hover:scale-105 flex items-center gap-2 group relative"
                            >
                                <Sparkles className={`w-6 h-6 ${scriptLoading ? 'animate-spin' : ''}`} />
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-500 text-[#3E2723] text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Generate AI Script</span>
                            </button>

                            <div className="w-px h-10 bg-white/20 mx-2"></div>
                            <button onClick={endStream} className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg shadow-red-600/50 transition transform hover:scale-105">
                                <PhoneOff className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                    {/* Teleprompter Overlay */}
                    {showTeleprompter && isArtisanOwner && (
                        <div className="absolute top-24 left-6 right-6 bottom-24 bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl z-20 flex flex-col p-8 animate-fade-in shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <ScrollText className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-amber-400 font-bold uppercase tracking-widest text-xs">AI Live Teleprompter</h3>
                                </div>
                                <button onClick={() => setShowTeleprompter(false)} className="text-white/60 hover:text-white">
                                    <CloseIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                <p className="text-white text-xl md:text-2xl font-medium leading-relaxed font-serif whitespace-pre-wrap">
                                    {generatedScript}
                                </p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/10 flex justify-center">
                                <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-tighter">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                    Broadcast Assist Active
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Live Chat Box */}
                <div className="flex-[1] bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 flex-shrink-0">
                        <div>
                            <h3 className="font-bold text-[#3E2723] text-xl">Live Chat</h3>
                            <p className="text-gray-500 text-sm">Say hello to the artisan and viewers!</p>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-2 mb-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.user.name === user.name ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-end gap-2 max-w-[90%]">
                                        {msg.user.name !== user.name && (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                                <UserIcon className="w-4 h-4 text-gray-500" />
                                            </div>
                                        )}
                                        <div className={`px-4 py-2.5 rounded-2xl ${msg.user.name === user.name ? 'bg-[#3E2723] text-white rounded-br-none' : 'bg-[#EFEBE9] text-[#3E2723] rounded-bl-none'}`}>
                                            {msg.user.role === 'artisan' && msg.user.name !== user.name && (
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8D6E63] block mb-0.5">Artisan</span>
                                            )}
                                            <p className="text-sm font-medium leading-snug">{msg.message}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {msg.user.name === user.name ? 'You' : msg.user.name} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    {/* Added pb-12 so the purple chatbot floating bubble avoids overlapping the Send button! */}
                    <div className="pt-2 border-t border-gray-100 pb-16 flex-shrink-0">
                        <form onSubmit={handleSendMessage} className="relative mt-2">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] text-sm transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!chatMessage.trim()}
                                className="absolute right-2 top-2 p-2 bg-[#3E2723] hover:bg-[#5D4037] text-white rounded-xl disabled:bg-gray-300 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveStream;
