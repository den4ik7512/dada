const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

let rooms = {};

io.on('connection', socket => {
    console.log('Игрок подключился:', socket.id);

    socket.on('joinRoom', roomId => {
        socket.join(roomId);
        if(!rooms[roomId]) rooms[roomId] = { players: [], board: Array(9).fill(null), turn: 'X' };
        if(!rooms[roomId].players.includes(socket.id)) rooms[roomId].players.push(socket.id);

        if(rooms[roomId].players.length === 2){
            io.to(roomId).emit('startGame', rooms[roomId]);
        } else {
            socket.emit('waiting', 'Ожидание второго игрока...');
        }

        socket.emit('updateBoard', rooms[roomId]);
    });

    socket.on('makeMove', ({roomId, index}) => {
        const room = rooms[roomId];
        if(!room || room.board[index]) return;
        room.board[index] = room.turn;
        room.turn = room.turn === 'X' ? 'O' : 'X';
        io.to(roomId).emit('updateBoard', room);
    });

    socket.on('disconnect', () => {
        for(let roomId in rooms){
            rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);
            if(rooms[roomId].players.length === 0) delete rooms[roomId];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Сервер работает на порту ${PORT}`));
