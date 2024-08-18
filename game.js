<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steiner Tree Game</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
        }
        canvas {
            background-color: white;
            border: 1px solid #000;
        }
        #score, #timer {
            margin-top: 10px;
            font-size: 18px;
        }
        #resetButton {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        #difficultySelect {
            margin-top: 10px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div>
        <h1>Steiner Tree Game</h1>
        <canvas id="gameCanvas" width="500" height="500"></canvas>
        <div id="score">Total Length: 0 | Score: 0</div>
        <div id="timer">Time: 0s</div>
        <select id="difficultySelect">
            <option value="easy">Easy</option>
            <option value="medium" selected>Medium</option>
            <option value="hard">Hard</option>
        </select>
        <button id="resetButton">Reset Game</button>
    </div>
    <script src="game.js"></script>
</body>
</html>
