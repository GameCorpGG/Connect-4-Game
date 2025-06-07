let currentPlayer = 'player';
let gameActive = false;
let gameEnded = false;
let mode = null; // Track the game mode
let inputLocked = false; // Tracks if player input is allowed

async function initGame(selectedMode) {
    mode = selectedMode; // Set the mode ('normal' or 'challenging')
    gameActive = true;

    // Show/hide buttons
    document.getElementById('normal-mode-button').style.display = "none";
    document.getElementById('challenging-mode-button').style.display = "none";
    document.getElementById('reset-button').style.display = "inline-block";
    document.getElementById('menu-button').style.display = "inline-block"; // Show the Menu button

    if (mode === 'challenging') {
        document.getElementById('status').textContent = "AI's turn...";
        const response = await fetch("http://localhost:5000/reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ mode })
        });
        const data = await response.json();
        await renderBoard(data.robot_move);
        if (data.robot_move !== null) {
            document.getElementById('status').textContent = "Your turn!";
            currentPlayer = 'player';
        } else {
            document.getElementById('status').textContent = "Your turn!";
        }
    } else {
        await resetGame();
        document.getElementById('status').textContent = "Your turn!";
        currentPlayer = 'player';
    }
}


async function renderBoard(robotMoveCol = null) {
    const response = await fetch("http://localhost:5000/get_board");
    const data = await response.json();
    const board = data.board;

    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = ''; // Clear the board
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

            // Allow click handling only if game is active
            if (gameActive) {
                cell.onclick = () => handlePlayerMove(col);
            }

            boardDiv.appendChild(cell);
        }
    }
}

function placeToken(playerType, col) {
    const boardDiv = document.getElementById('board');
    const cells = Array.from(boardDiv.children);

    // Find the first empty cell in the column (bottom to top)
    for (let i = cells.length - 1; i >= 0; i--) {
        const cell = cells[i];
        if (cell.dataset.col == col && !cell.classList.contains('player') && !cell.classList.contains('robot')) {
            cell.classList.add(playerType === 'player' ? 'player' : 'robot');
            break;
        }
    }
}



async function handlePlayerMove(col) {
    if (!gameActive || currentPlayer !== 'player') return;
	inputLocked = true;
    // Immediately render the player's move
    placeToken('player', col);

    // Send the move to the backend
    const response = await fetch("http://localhost:5000/move", {
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

    // Check the game status after the player's move
    await checkStatus();

    // If the game is still active, let the AI make its move
    if (gameActive && data.robot_move !== null) {
        currentPlayer = 'robot';
        document.getElementById('status').textContent = "AI's turn...";
        setTimeout(async () => {
            placeToken('robot', data.robot_move);
            await checkStatus(); // Check the game status after rendering AI's move
            if (gameActive) {
                currentPlayer = 'player';
                document.getElementById('status').textContent = "Your turn!";
            }
			inputLocked = false;
        }, 500); // Add slight delay for AI's move rendering
    }
	else{
		inputLocked = false;
	}
}



// Update aiMove
async function aiMove() {
    if (!gameActive) return;

    await renderBoard();
setTimeout(async () => {
            placeToken('robot', data.robot_move);
            await checkStatus(); // Check the game status after rendering AI's move
            if (gameActive) {
                currentPlayer = 'player';
                document.getElementById('status').textContent = "Your turn!";
            }
        }, 100); // Add slight delay for AI's move rendering
    await checkStatus();

    currentPlayer = 'player';
    document.getElementById('status').textContent = "Your turn!";
}


function displayWinner(winner) {
    gameActive = false;
	gameEnded = true;
    const status = document.getElementById('status');
    document.body.classList.remove('player-win', 'robot-win', 'tie-game'); // Remove existing outcome classes

    if (winner === 'player') {
        document.body.classList.add('player-win');
        status.textContent = "You win!";
    } else if (winner === 'robot') {
        document.body.classList.add('robot-win');
        status.textContent = "AI wins!";
    } else if (winner === 'tie') {
        document.body.classList.add('tie-game');
        status.textContent = "It's a tie!";
    }
}


async function resetGame() {
    gameActive = true;
    currentPlayer = 'player'; // Ensure player starts first in normal mode
    document.body.classList.remove('player-win', 'robot-win', 'tie-game');
    document.getElementById('status').textContent = "Resetting game...";

    const response = await fetch("http://localhost:5000/reset", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode }),
    });

    const data = await response.json();

    await renderBoard(data.robot_move);

    if (mode === 'challenging' && data.robot_move !== null) {
        // Challenging mode: AI moves first
        document.getElementById('status').textContent = "Your turn!";
        currentPlayer = 'player';
    } else {
        // Normal mode: Player moves first
        document.getElementById('status').textContent = "Your turn!";
        currentPlayer = 'player';
    }
}



async function checkStatus() {
    const response = await fetch("http://localhost:5000/status", {
        method: "GET"
    });
    const data = await response.json();
	setTimeout(() => {
		if (data.win_x) {
			displayWinner('robot');
		} else if (data.win_o) {
			displayWinner('player');
		} else if (data.tie) {
			displayWinner('tie');
		}
	}, 1000);
}



function showMenu() {
    // Reset game state
    gameActive = false;
    mode = null;

    // Show mode selection buttons
    document.getElementById('normal-mode-button').style.display = "inline-block";
    document.getElementById('challenging-mode-button').style.display = "inline-block";

    // Hide other buttons and clear board
    document.getElementById('reset-button').style.display = "none";
    document.getElementById('menu-button').style.display = "none";
    document.getElementById('board').innerHTML = '';
    document.getElementById('status').textContent = "Select a game mode to begin!";
}


// Event listeners for mode buttons and reset
document.getElementById('normal-mode-button').addEventListener('click', () => initGame('normal'));
document.getElementById('challenging-mode-button').addEventListener('click', () => initGame('challenging'));
document.getElementById('reset-button').addEventListener('click', resetGame);
document.getElementById('menu-button').addEventListener('click', showMenu);

