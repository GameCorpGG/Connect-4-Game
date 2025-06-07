let connectN;
let currentPlayer = 'player';

async function initGame() {
    const nInput = document.getElementById('connect-n-input').value;
    connectN = parseInt(nInput) || 4;

    if (isNaN(connectN) || connectN < 3 || connectN > 10) {
        alert("Please enter a valid number between 3 and 10.");
        return;
    }

    currentPlayer = 'player';
    document.getElementById('status').textContent = "Your turn!";
    await resetGame();
    await renderBoard();
}

async function renderBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';

    const response = await fetch("/get_board");
    const data = await response.json();
    const board = data.board;

    boardDiv.style.gridTemplateColumns = `repeat(${board[0].length}, 60px)`;

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (board[row][col] === 'O') {
                cell.classList.add('player');
            } else if (board[row][col] === 'X') {
                cell.classList.add('robot');
            }

            cell.onclick = () => handlePlayerMove(col);
            boardDiv.appendChild(cell);
        }
    }
}

async function handlePlayerMove(col) {
    if (currentPlayer !== 'player') return;

    const response = await fetch("/move", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            column: col,
            player: 'O'
        })
    });
    const data = await response.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    await renderBoard();

    if (data.win) {
        displayWinner('player');
        return;
    } else if (data.tie) {
        document.getElementById('status').textContent = "It's a tie!";
        return;
    }

    currentPlayer = 'robot';
    document.getElementById('status').textContent = "Robot's turn";
    setTimeout(robotMove, 500);
}

async function robotMove() {
    const response = await fetch("/move", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            column: null,
            player: 'X'
        })
    });
    const data = await response.json();

    await renderBoard();

    if (data.win) {
        displayWinner('robot');
    } else if (data.tie) {
        document.getElementById('status').textContent = "It's a tie!";
    } else {
        currentPlayer = 'player';
        document.getElementById('status').textContent = "Your turn!";
    }
}

function displayWinner(winner) {
    const gameContainer = document.getElementById('game-container');
    if (winner === 'player') {
        gameContainer.classList.add('player-win');
        document.getElementById('status').textContent = "You win!";
    } else if (winner === 'robot') {
        gameContainer.classList.add('robot-win');
        document.getElementById('status').textContent = "Robot wins!";
    }
}

async function resetGame() {
    const response = await fetch("/reset", {
        method: "POST"
    });
    const data = await response.json();
    document.getElementById('status').textContent = data.message;
}

// Event listeners for game start and reset
document.getElementById('start-game-button').addEventListener('click', initGame);
document.getElementById('reset-button').addEventListener('click', initGame);
