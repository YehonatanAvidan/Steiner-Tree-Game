const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const resetButton = document.getElementById('resetButton');
const N = 10; // Number of random points
let points = [];
let totalLength = 0;
let isDrawing = false;
let lastPoint = null;

function generateRandomPoints() {
    points = [];
    for (let i = 0; i < N; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        points.push({ x, y });
    }
}

function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function distanceBetweenPoints(p1, p2) {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

function drawLine(p1, p2) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let clickedPoint = null;
    points.forEach(point => {
        if (Math.abs(point.x - clickX) < 10 && Math.abs(point.y - clickY) < 10) {
            clickedPoint = point;
        }
    });

    if (clickedPoint) {
        if (lastPoint) {
            drawLine(lastPoint, clickedPoint);
            totalLength += distanceBetweenPoints(lastPoint, clickedPoint);
            scoreElement.textContent = `Total Length: ${totalLength.toFixed(2)}`;
        }
        lastPoint = clickedPoint;
    }
}

function resetGame() {
    totalLength = 0;
    lastPoint = null;
    scoreElement.textContent = `Total Length: 0`;
    generateRandomPoints();
    drawPoints();
}

canvas.addEventListener('click', handleCanvasClick);
resetButton.addEventListener('click', resetGame);

// Initialize the game
resetGame();
