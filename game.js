let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let connections = [];
let points = [];
let connectedGraph = [];
let totalLength = 0;
let initialScore = 100;
let bestScore = null;
let previousScore = null;
let isDrawing = false;
let currentLine = null;

function generateRandomPoints() {
    // Example logic to generate random points
    points = [];
    for (let i = 0; i < 10; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        points.push({ x: x, y: y, isIntermediate: false });
    }
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw points
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = connectedGraph.includes(point) ? 'green' : 'black';
        ctx.fill();
        ctx.stroke();
    });

    // Draw connections
    connections.forEach(connection => {
        ctx.beginPath();
        ctx.moveTo(connection.start.x, connection.start.y);
        ctx.lineTo(connection.end.x, connection.end.y);
        ctx.strokeStyle = 'black';
        ctx.stroke();
    });

    if (currentLine) {
        ctx.beginPath();
        ctx.moveTo(currentLine.start.x, currentLine.start.y);
        ctx.lineTo(currentLine.end.x, currentLine.end.y);
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Score: ${(initialScore - totalLength).toFixed(2)}`;
}

function updateBestScoreDisplay() {
    if (bestScore !== null) {
        const bestScoreElement = document.getElementById('bestScore');
        bestScoreElement.style.display = 'block'; // Show the Best Score view
        bestScoreElement.textContent = `Best Score: ${bestScore.toFixed(2)}`;
    }
}

function handleMouseDown(event) {
    let x = event.offsetX;
    let y = event.offsetY;
    let startPoint = getPointAt(x, y);

    if (startPoint) {
        currentLine = { start: startPoint, end: { x: x, y: y } };
        isDrawing = true;
    }
}

function handleMouseMove(event) {
    if (!isDrawing) return;

    let x = event.offsetX;
    let y = event.offsetY;
    currentLine.end = { x: x, y: y };
    draw();
}

function handleMouseUp(event) {
    if (!isDrawing) return;
    
    let x = event.offsetX;
    let y = event.offsetY;
    let endPoint = getPointAt(x, y);

    if (endPoint && currentLine.start !== endPoint) {
        currentLine.end = endPoint;
        connections.push({ start: currentLine.start, end: currentLine.end });
        totalLength += calculateDistance(currentLine.start, currentLine.end);

        updateScore();

        if (!connectedGraph.includes(currentLine.start)) {
            connectedGraph.push(currentLine.start);
            currentLine.start.isIntermediate = true;
        }
        if (!connectedGraph.includes(currentLine.end)) {
            connectedGraph.push(currentLine.end);
            currentLine.end.isIntermediate = true;
        }

        checkGameEnd();
    }

    currentLine = null;
    isDrawing = false;
    draw();
}

function getPointAt(x, y) {
    return points.find(point => calculateDistance({ x, y }, point) < 10);
}

function calculateDistance(pointA, pointB) {
    return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
}

function resetGame(newPosition = true) {
    if (newPosition) {
        generateRandomPoints();
        bestScore = null; // Reset best score for a new random position
        document.getElementById('bestScore').style.display = 'none'; // Hide Best Score view
    }

    connections = [];
    connectedGraph = [];
    totalLength = 0;

    draw();
    updateScore();
    updateBestScoreDisplay();

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
}

function checkGameEnd() {
    if (points.filter(p => !p.isIntermediate).every(point => connectedGraph.includes(point))) {
        setTimeout(() => {
            const finalScore = initialScore - totalLength;
            previousScore = finalScore;

            if (bestScore === null || finalScore > bestScore) {
                bestScore = finalScore;
            }

            const retry = confirm(`Congratulations! You've connected all points. Final Score: ${finalScore.toFixed(2)}\nDo you want to retry?`);
            
            if (retry) {
                resetGame(false); // Retry with the same initial position
            } else {
                resetGame(true); // Start a new game with a random position
            }
        }, 100);
        
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
    }
}

// Start the game initially with a random position
resetGame();
