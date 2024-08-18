// Connect-the-Dots Game v5.9

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const resetButton = document.getElementById('resetButton');
const N = 10; // Number of random points
const POINT_RADIUS = 15; // Large point size
const SMALL_POINT_RADIUS = POINT_RADIUS / 2; // Size of endpoint dots
const SNAP_DISTANCE = POINT_RADIUS * 1.5; // Distance to snap to points
let points = [];
let connections = [];
let totalLength = 0;
let isDragging = false;
let dragStart = null;
let dragEnd = null;
let connectedGraph = []; // List to track connected points

// New variables for additional features
let startTime;
let timerInterval;
let bestScore = Infinity;
let difficulty = 'medium'; // 'easy', 'medium', 'hard'

// Generate random points
function generateRandomPoints() {
    points = [];
    connections = [];
    const minDistance = POINT_RADIUS * 2; // Minimum distance between points to avoid overlap

    while (points.length < N) {
        const x = Math.random() * (canvas.width - 2 * POINT_RADIUS) + POINT_RADIUS;
        const y = Math.random() * (canvas.height - 2 * POINT_RADIUS) + POINT_RADIUS;
        const newPoint = { x, y, id: points.length, isIntermediate: false };

        // Check if the new point is too close to any existing point
        const isTooClose = points.some(p => distanceBetweenPoints(p, newPoint) < minDistance);
        
        if (!isTooClose) {
            points.push(newPoint);
        }
    }
}

// Draw all points and connections
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    connections.forEach(conn => {
        ctx.beginPath();
        ctx.moveTo(conn.start.x, conn.start.y);
        ctx.lineTo(conn.end.x, conn.end.y);
        ctx.stroke();
    });

    // Draw points
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.isIntermediate ? SMALL_POINT_RADIUS : POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = connectedGraph.includes(point) ? 'green' : (point.isIntermediate ? 'black' : 'blue');
        ctx.fill();
    });

    // Draw drag line
    if (isDragging && dragStart && dragEnd) {
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragEnd.x, dragEnd.y);
        ctx.stroke();
    }
}

// Calculate distance between two points
function distanceBetweenPoints(p1, p2) {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

// Find the closest point within snap distance
function findClosestPoint(point) {
    let closestPoint = null;
    let minDistance = Infinity;

    points.forEach(p => {
        const distance = distanceBetweenPoints(point, p);
        if (distance < minDistance && distance <= SNAP_DISTANCE) {
            minDistance = distance;
            closestPoint = p;
        }
    });

    return closestPoint;
}

// Add a new connection
function addConnection(start, end) {
    const snappedEnd = findClosestPoint(end) || end;
    let endPoint;

    if (snappedEnd === end) {
        // Create a new intermediate point
        endPoint = { x: end.x, y: end.y, id: points.length, isIntermediate: true };
        points.push(endPoint);
    } else {
        endPoint = snappedEnd;
    }

    connections.push({ start, end: endPoint });
    totalLength += distanceBetweenPoints(start, endPoint);
    updateScore();

    // Update connectedGraph
    if (connectedGraph.includes(start)) {
        if (!connectedGraph.includes(endPoint)) {
            connectedGraph.push(endPoint);
        }
    } else if (connectedGraph.includes(endPoint)) {
        connectedGraph.push(start);
    }

    updateConnectedGraph();
    checkGameEnd();
}

// Update the connected graph
function updateConnectedGraph() {
    let changed;
    do {
        changed = false;
        connections.forEach(conn => {
            if (connectedGraph.includes(conn.start) && !connectedGraph.includes(conn.end)) {
                connectedGraph.push(conn.end);
                changed = true;
            } else if (connectedGraph.includes(conn.end) && !connectedGraph.includes(conn.start)) {
                connectedGraph.push(conn.start);
                changed = true;
            }
        });
    } while (changed);
}

// Check if the game has ended
function checkGameEnd() {
    if (points.every(point => connectedGraph.includes(point))) {
        stopTimer();
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const currentScore = calculateScore(totalLength, timeTaken);
        
        if (currentScore < bestScore) {
            bestScore = currentScore;
            localStorage.setItem('bestScore', bestScore);
        }
        
        setTimeout(() => {
            alert(`Congratulations! You've connected all points.\nTotal Length: ${totalLength.toFixed(2)}\nTime: ${timeTaken} seconds\nScore: ${currentScore}\nBest Score: ${bestScore}`);
        }, 100);
        
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
    }
}

// Handle mouse down event
function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const clickPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    // Only start dragging if the clicked point is on an existing point
    const closestPoint = findClosestPoint(clickPoint);
    if (closestPoint && distanceBetweenPoints(clickPoint, closestPoint) <= POINT_RADIUS) {
        if (connectedGraph.length === 0) {
            connectedGraph.push(closestPoint); // Add the first point to connectedGraph
        }
        dragStart = closestPoint;
        isDragging = true;
    }
}

// Handle mouse move event
function handleMouseMove(event) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        dragEnd = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        draw();
    }
}

// Handle mouse up event
function handleMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        if (dragStart && dragEnd) {
            addConnection(dragStart, dragEnd);
        }
        dragStart = null;
        dragEnd = null;
        draw();
    }
}

// Reset the game
function resetGame() {
    totalLength = 0;
    connectedGraph = []; // Reset connected graph
    generateRandomPoints();
    connections = [];
    draw();
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    startTimer();
    updateScore();
}

// Initialize the game
function init() {
    generateRandomPoints();
    draw();
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    resetButton.addEventListener('click', resetGame);
    
    // Load best score from localStorage
    bestScore = parseInt(localStorage.getItem('bestScore')) || Infinity;
    
    // Set up difficulty selection
    const difficultySelect = document.getElementById('difficultySelect');
    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
        resetGame();
    });
    
    startTimer();
}

// New function to start the timer
function startTimer() {
    startTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

// New function to stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// New function to update the timer display
function updateTimer() {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent = `Time: ${timeElapsed}s`;
}

// New function to update the score display
function updateScore() {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const currentScore = calculateScore(totalLength, timeElapsed);
    scoreElement.textContent = `Total Length: ${totalLength.toFixed(2)} | Score: ${currentScore}`;
}

// New function to calculate the score based on total length and time
function calculateScore(length, time) {
    let difficultyFactor;
    switch (difficulty) {
        case 'easy':
            difficultyFactor = 0.8;
            break;
        case 'hard':
            difficultyFactor = 1.2;
            break;
        default:
            difficultyFactor = 1;
    }
    return Math.round((length * 10 + time) * difficultyFactor);
}

// Start the game
init();
