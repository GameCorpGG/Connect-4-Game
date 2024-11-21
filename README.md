<-README->

This is a simple implementation of a connect-4 game created using Python, HTML, CSS and JS. A Flask server was set up to handle the frontend to backend calls.

Connect Four is a game in which the players choose a color and then take turns dropping colored tokens into a six-row, seven-column vertically suspended grid. The pieces fall straight down, occupying the lowest available space within the column. The objective of the game is to be the first to form a horizontal, vertical, or diagonal line of four of one's own tokens.

In this game the player plays against an AI in two modes:
1) Player-first Mode in which the player starts their move
2) AI-first Mode in which the AI starts first and the player has to follow

This is done because Connect 4 is a solved game and the player that plays first has a higher chance of winning if they play perfectly, while a perfect second player can only at most draw against a perfect first player.

For Running the code:

- Keep the CSS and JS files in a folder named static folder
- Keep the HTML file in a folder named templates folder
- Keep the app.py file in the same folder as the static and templates folder
- Run the app.py flask program
- Run the HTML file by opening it on the browser after ensuring that the flask code(app.py) is running
