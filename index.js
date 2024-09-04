// server.js
const express = require('express');
const { ExpressPeerServer } = require('peer');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

const peerServer = ExpressPeerServer(server, {
    debug: true,
    allow_discovery: true
});

let connectedPeers = new Set();

peerServer.on('connection', (peerId) => {
    connectedPeers.add(peerId.getId());
    io.emit('peer-list-update', Array.from(connectedPeers));
});

peerServer.on('disconnect', (peerId) => {
    connectedPeers.delete(peerId.getId());
    io.emit('peer-list-update', Array.from(connectedPeers));
});

app.use('/peerjs', peerServer);

io.on('connection', (socket) => {
    socket.emit('peer-list-update', Array.from(connectedPeers));

    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
