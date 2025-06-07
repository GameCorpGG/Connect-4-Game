# connect_n.py

import math
import random

class ConnectN:
    def __init__(self, rows=6, cols=7, connect_n=4):
        self.rows = rows
        self.cols = cols
        self.connect_n = connect_n
        self.board = [[' ' for _ in range(cols)] for _ in range(rows)]
        self.current_player = 'X'  # AI is 'X', Player is 'O'

    def get_board(self):
        return self.board

    def drop_piece(self, col, piece):
        for row in reversed(range(self.rows)):
            if self.board[row][col] == ' ':
                self.board[row][col] = piece
                return True
        return False

    def check_win(self, piece):
        # Check horizontal, vertical, and diagonal (both directions)
        for r in range(self.rows):
            for c in range(self.cols):
                if self.board[r][c] != piece:
                    continue
                # Check horizontally
                if c + self.connect_n <= self.cols and all(self.board[r][c + i] == piece for i in range(self.connect_n)):
                    return True
                # Check vertically
                if r + self.connect_n <= self.rows and all(self.board[r + i][c] == piece for i in range(self.connect_n)):
                    return True
                # Check positively sloped diagonal
                if r + self.connect_n <= self.rows and c + self.connect_n <= self.cols and all(self.board[r + i][c + i] == piece for i in range(self.connect_n)):
                    return True
                # Check negatively sloped diagonal
                if r - self.connect_n >= -1 and c + self.connect_n <= self.cols and all(self.board[r - i][c + i] == piece for i in range(self.connect_n)):
                    return True
        return False

    def is_full(self):
        return all(self.board[0][col] != ' ' for col in range(self.cols))

    def get_valid_locations(self):
        return [col for col in range(self.cols) if self.board[0][col] == ' ']

    def minimax(self, depth, alpha, beta, maximizingPlayer):
        valid_locations = self.get_valid_locations()
        is_terminal = self.check_win('X') or self.check_win('O') or self.is_full()
        if depth == 0 or is_terminal:
            if is_terminal:
                if self.check_win('X'):
                    return (None, 100000000000000)
                elif self.check_win('O'):
                    return (None, -10000000000000)
                else:  # Game is over, no more valid moves
                    return (None, 0)
            else:  # Depth is zero
                return (None, self.score_position('X'))
        if maximizingPlayer:
            value = -math.inf
            best_col = random.choice(valid_locations)
            for col in valid_locations:
                row = self.get_next_open_row(col)
                self.board[row][col] = 'X'
                new_score = self.minimax(depth-1, alpha, beta, False)[1]
                self.board[row][col] = ' '
                if new_score > value:
                    value = new_score
                    best_col = col
                alpha = max(alpha, value)
                if alpha >= beta:
                    break
            return best_col, value
        else:  # Minimizing player
            value = math.inf
            best_col = random.choice(valid_locations)
            for col in valid_locations:
                row = self.get_next_open_row(col)
                self.board[row][col] = 'O'
                new_score = self.minimax(depth-1, alpha, beta, True)[1]
                self.board[row][col] = ' '
                if new_score < value:
                    value = new_score
                    best_col = col
                beta = min(beta, value)
                if alpha >= beta:
                    break
            return best_col, value

    def score_position(self, piece):
        score = 0
        center_array = [self.board[r][self.cols//2] for r in range(self.rows)]
        center_count = center_array.count(piece)
        score += center_count * 3

        # Score Horizontal
        for r in range(self.rows):
            row_array = self.board[r]
            for c in range(self.cols - 3):
                window = row_array[c:c + 4]
                score += self.evaluate_window(window, piece)

        # Score Vertical
        for c in range(self.cols):
            col_array = [self.board[r][c] for r in range(self.rows)]
            for r in range(self.rows - 3):
                window = col_array[r:r + 4]
                score += self.evaluate_window(window, piece)

        # Score positive sloped diagonals
        for r in range(self.rows - 3):
            for c in range(self.cols - 3):
                window = [self.board[r + i][c + i] for i in range(4)]
                score += self.evaluate_window(window, piece)

        # Score negative sloped diagonals
        for r in range(3, self.rows):
            for c in range(self.cols - 3):
                window = [self.board[r - i][c + i] for i in range(4)]
                score += self.evaluate_window(window, piece)

        return score

    def evaluate_window(self, window, piece):
        score = 0
        opp_piece = 'O' if piece == 'X' else 'X'

        if window.count(piece) == 4:
            score += 100
        elif window.count(piece) == 3 and window.count(' ') == 1:
            score += 5
        elif window.count(piece) == 2 and window.count(' ') == 2:
            score += 2

        if window.count(opp_piece) == 3 and window.count(' ') == 1:
            score -= 4

        return score

    def get_next_open_row(self, col):
        for r in reversed(range(self.rows)):
            if self.board[r][col] == ' ':
                return r

    def robot_move(self):
        # Implement Minimax with a depth of 5 for optimal play
        col, minimax_score = self.minimax(depth=1, alpha=-math.inf, beta=math.inf, maximizingPlayer=True)
        if col is None:
            # If no valid moves, return None
            return None
        self.drop_piece(col, 'X')
        return col

    def simulate_move(self, col, piece):
        for row in reversed(range(self.rows)):
            if self.board[row][col] == ' ':
                self.board[row][col] = piece
                return row, col
        return None, None

    def undo_move(self, col):
        for row in range(self.rows):
            if self.board[row][col] != ' ':
                self.board[row][col] = ' '
                break
