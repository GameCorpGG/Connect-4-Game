# app.py

from flask import Flask, render_template, jsonify, request
from connect_n import ConnectN
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for handling cross-origin requests (if necessary)

game = ConnectN(rows=6, cols=7, connect_n=4)

# Route to serve the game page
@app.route("/")
def index():
    return render_template("index.html", board=game.get_board())  # This will serve the index.html file from the templates folder

# Route to get the current game board state
@app.route("/get_board", methods=["GET"])
def get_board():
    return jsonify({"board": game.get_board()})

# Route to make a move (user)
@app.route("/move", methods=["POST"])
def make_move():
    data = request.json
    col = data.get("column")
    player = data.get("player")

    if player == 'O':  # User's move
        if not game.drop_piece(col, 'O'):
            return jsonify({"error": "Invalid move"}), 400
        win = game.check_win('O')
        is_full = game.is_full()
        if win or is_full:
            return jsonify({
                "board": game.get_board(),
                "win": win,
                "tie": is_full and not win,
                "robot_move": None
            })
        # AI's turn
        ai_col = game.robot_move()
        win = game.check_win('X')
        is_full = game.is_full()
        return jsonify({
            "board": game.get_board(),
            "win": win,
            "tie": is_full and not win,
            "robot_move": ai_col
        })
    else:
        return jsonify({"error": "Invalid player"}), 400

@app.route("/reset", methods=["POST"])
def reset_game():
    global game
    game = ConnectN(rows=6, cols=7, connect_n=4)

    mode = request.json.get('mode', 'challenging')  # Default to challenging mode
    ai_col = None

    if mode == 'challenging':
        # AI makes the first move in challenging mode
        ai_col = game.robot_move()

    return jsonify({
        "message": "Game reset",
        "board": game.get_board(),
        "robot_move": ai_col
    })
# Route to get the current game status
@app.route("/status", methods=["GET"])
def get_status():
    win_x = game.check_win('X')
    win_o = game.check_win('O')
    tie = game.is_full()
    return jsonify({
        "win_x": win_x,
        "win_o": win_o,
        "tie": tie
    })

if __name__ == "__main__":
    app.run(debug=True)
