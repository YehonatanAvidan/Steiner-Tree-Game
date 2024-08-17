const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const resetButton = document.getElementById('resetButton');
const N = 10; // Number of random points
const POINT_RADIUS = 8; // Increased point size
const SNAP_DISTANCE = 15; // Distance to snap to existing line ends
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
        points.push({ x, y, connected: [] });
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
    ctx.fillStyle = 'blue';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
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

// Find the closest line end within snap distance
function findClosestLineEnd(point) {
    let closestEnd = null;
    let minDistance = Infinity;
    
    connections.forEach(conn => {
        const distanceToStart = distanceBetweenPoints(point, conn.start);
        const distanceToEnd = distanceBetweenPoints(point, conn.end);
        
        if (distanceToStart < minDistance && distanceToStart <= SNAP_DISTANCE) {
            minDistance = distanceToStart;
            closestEnd = conn.start;
        }
        
        if (distanceToEnd < minDistance && distanceToEnd <= SNAP_DISTANCE) {
            minDistance = distanceToEnd;
            closestEnd = conn.end;
        }
    });
    
    return closestEnd;
}

// Add a new connection
function addConnection(start, end) {
    // Check if start or end is close to existing line ends and snap if necessary
    const snappedStart = findClosestLineEnd(start) || start;
    const snappedEnd = findClosestLineEnd(end) || end;
    
    connections.push({ start: snappedStart, end: snappedEnd });
    totalLength += distanceBetweenPoints(snappedStart, snappedEnd);
    scoreElement.textContent = `Total Length: ${totalLength.toFixed(2)}`;
    
    // Update connected points
    let startPoint = points.find(p => distanceBetweenPoints(p, snappedStart) <= POINT_RADIUS);
    let endPoint = points.find(p => distanceBetweenPoints(p, snappedEnd) <= POINT_RADIUS);
    
    if (startPoint && endPoint) {
        startPoint.connected.push(endPoint);
        endPoint.connected.push(startPoint);
    }
}

// Check if all points are connected
function checkAllConnected() {
    let visited = new Set();
    function dfs(point) {
        visited.add(point);
        point.connected.forEach(connectedPoint => {
            if (!visited.has(connectedPoint)) {
                dfs(connectedPoint);
            }
        });
    }

    dfs(points[0]);

    return visited.size === points.length;
}

// Handle mouse down event
function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    dragStart = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    isDragging = true;
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
