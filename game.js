// Connect-the-Dots Game v4.0

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const resetButton = document.getElementById('resetButton');
const N = 10; // Number of random points
const POINT_RADIUS = 15; // Large point size
const SNAP_DISTANCE = 20; // Distance to snap to existing points or line ends
let points = [];
let connections = [];
let totalLength = 0;
let isDragging = false;
let dragStart = null;
let dragEnd = null;

// Generate random points
function generateRandomPoints() {
    points = [];
    connections = [];
    for (let i = 0; i < N; i++) {
        const x = Math.random() * (canvas.width - 2 * POINT_RADIUS) + POINT_RADIUS;
        const y = Math.random() * (canvas.height - 2 * POINT_RADIUS) + POINT_RADIUS;
        points.push({ x, y, connected: false });
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
        ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = point.connected ? 'green' : 'blue';
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

// Calculate distance from a point to a line segment
function distanceToLineSegment(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
    }
    else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
    }
    else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// Find the closest valid starting point (dot or end of existing line)
function findClosestValidStart(point) {
    let closestStart = null;
    let minDistance = Infinity;
    
    // Check dots
    points.forEach(p => {
        const distance = distanceBetweenPoints(point, p);
        if (distance < minDistance && distance <= SNAP_DISTANCE) {
            minDistance = distance;
            closestStart = p;
        }
    });
    
    // Check existing line ends
    connections.forEach(conn => {
        const distanceToEnd = distanceBetweenPoints(point, conn.end);
        if (distanceToEnd < minDistance && distanceToEnd <= SNAP_DISTANCE) {
            minDistance = distanceToEnd;
            closestStart = conn.end;
        }
    });
    
    return closestStart;
}

// Add a new connection
function addConnection(start, end) {
    connections.push({ start, end });
    totalLength += distanceBetweenPoints(start, end);
    scoreElement.textContent = `Total Length: ${totalLength.toFixed(2)}`;
    
    // Check for dots near the new line and mark them as connected
    points.forEach(point => {
        if (distanceToLineSegment(point, start, end) <= POINT_RADIUS) {
            point.connected = true;
        }
    });
}

// Check if all points are connected
function checkAllConnected() {
    return points.every(point => point.connected);
}

// Handle mouse down event
function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const clickPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    
    dragStart = findClosestValidStart(clickPoint);
    if (dragStart) {
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
            if (checkAllConnected()) {
                setTimeout(() => {
                    alert(`Congratulations! You've connected all points. Total Length: ${totalLength.toFixed(2)}`);
                }, 100);
                canvas.removeEventListener('mousedown', handleMouseDown);
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseup', handleMouseUp);
            }
        }
        dragStart = null;
        dragEnd = null;
        draw();
    }
}

// Reset the game
function resetGame() {
    totalLength = 0;
    scoreElement.textContent = `Total Length: 0`;
    generateRandomPoints();
    connections = [];
    draw();
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
}

resetButton.addEventListener('click', resetGame);

// Initialize the game
resetGame();
