const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('./'));

const players = new Map();

io.on('connection', (socket) => {
    console.log('Player connected');

    // Assign player number (1 or 2)
    const playerNumber = players.size + 1;
    if (playerNumber <= 2) {
        players.set(socket.id, playerNumber);
        socket.emit('player-number', playerNumber);
    }

    socket.on('player-update', (data) => {
        socket.broadcast.emit('opponent-update', data);
    });

    socket.on('disconnect', () => {
        players.delete(socket.id);
        console.log('Player disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 