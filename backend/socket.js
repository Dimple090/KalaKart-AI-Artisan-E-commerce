const socketIo = require('socket.io');

const initSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow both common local origins
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] New connection: ${socket.id}`);

        /* ============================
           Real-Time Order Tracking
           ============================ */
        socket.on('join_order_room', (orderId) => {
            const roomName = `order_${orderId}`;
            socket.join(roomName);
            console.log(`[Order] Socket ${socket.id} joined ${roomName}`);
            // ... (rest of order tracking logic)
        });

        /* ============================
           Artisan WebRTC Live Streaming
           ============================ */

        socket.on('join_stream', (roomId) => {
            const roomName = `stream_${roomId}`;
            socket.join(roomName);
            const clients = io.sockets.adapter.rooms.get(roomName);
            console.log(`[Stream] User ${socket.id} joined ${roomName}. Total: ${clients ? clients.size : 0}`);

            // Notify others in the room
            socket.to(roomName).emit('viewer_joined', socket.id);
        });

        // Track when artisan starts their stream to notify waiting viewers
        socket.on('stream_started', (roomId) => {
            const roomName = `stream_${roomId}`;
            console.log(`[Stream] Artisan started stream in ${roomName}`);
            // Tell everyone in the room to re-sync/request stream
            socket.to(roomName).emit('broadcaster_online', socket.id);
        });

        // WebRTC Signaling
        socket.on('webrtc_offer', (event) => {
            socket.to(event.target).emit('webrtc_offer', {
                sdp: event.sdp,
                broadcaster: socket.id
            });
        });

        socket.on('webrtc_answer', (event) => {
            socket.to(event.target).emit('webrtc_answer', {
                sdp: event.sdp,
                viewer: socket.id
            });
        });

        socket.on('webrtc_ice_candidate', (event) => {
            socket.to(event.target).emit('webrtc_ice_candidate', {
                candidate: event.candidate,
                sender: socket.id
            });
        });

        // Live Chat
        socket.on('send_message', (data) => {
            const { roomId, message, user } = data;
            const roomName = `stream_${roomId}`;
            console.log(`[Chat] Message in ${roomName} from ${user.name}`);
            
            io.to(roomName).emit('receive_message', {
                message,
                user,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = initSocket;
