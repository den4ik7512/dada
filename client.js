const socket = io("https://твоя-игра-сервер.com"); // замени на твой URL

const roomId = localStorage.getItem('roomId');
const isCreator = localStorage.getItem('creator');
document.getElementById('creatorInfo').textContent = isCreator === 'yes' 
  ? "Вы создатель комнаты" 
  : "Присоединились к комнате";

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');

// Проверка победы
function checkWinner(board) {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8], // горизонтали
        [0,3,6],[1,4,7],[2,5,8], // вертикали
        [0,4,8],[2,4,6]          // диагонали
    ];
    for(const [a,b,c] of lines){
        if(board[a] && board[a] === board[b] && board[a] === board[c]){
            return [board[a], [a,b,c]]; // победитель и линия
        }
    }
    if(board.every(cell => cell)) return ['draw', []]; // ничья
    return null;
}

// Обновление поля
socket.on('updateBoard', room => {
    boardEl.querySelectorAll('.cell').forEach((cell, idx) => {
        cell.textContent = room.board[idx] || '';
        cell.style.background = '#111'; // сброс подсветки
    });
    
    const result = checkWinner(room.board);
    if(result){
        if(result[0] === 'draw'){
            statusEl.textContent = 'Ничья!';
        } else {
            statusEl.textContent = `Победитель: ${result[0]}`;
            // подсветка линии победителя
            result[1].forEach(idx => {
                boardEl.querySelector(`.cell[data-index='${idx}']`).style.background = '#6cff6c';
            });
        }
    } else {
        statusEl.textContent = `Ход: ${room.turn}`;
    }
});

socket.on('waiting', msg => { statusEl.textContent = msg; });
socket.on('startGame', room => { statusEl.textContent = `Игра началась! Ход: ${room.turn}`; });

// Клик по ячейке
boardEl.addEventListener('click', e => {
    if(e.target.classList.contains('cell')){
        const index = e.target.dataset.index;
        socket.emit('makeMove', { roomId, index });
    }
});
