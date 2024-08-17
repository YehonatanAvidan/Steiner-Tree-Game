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
    
    // Mark points as connected
    points.forEach(point => {
        if (distanceBetweenPoints(point, start) <= POINT_RADIUS || 
            distanceBetweenPoints(point, end) <= POINT_RADIUS) {
            point.connected = true;
        }
    });
}

// Check if all points are connected in a single network
function checkAllConnected() {
    if (points.some(point => !point.connected)) {
        return false;  // If any point is not connected, return false
    }

    // Use a flood fill algorithm to check if all connections form a single network
    let visited = new Set();
    let stack = [connections[0].start];  // Start from the first connection

    while (stack.length > 0) {
        let current = stack.pop();
        if (!visited.has(current)) {
            visited.add(current);
            // Add all points connected to the current point to the stack
            connections.forEach(conn => {
                if (conn.start === current && !visited.has(conn.end)) {
                    stack.push(conn.end);
                } else if (conn.end === current && !visited.has(conn.start)) {
                    stack.push(conn.start);
                }
            });
        }
    }

    // Check if all connection endpoints were visited
    return connections.every(conn => visited.has(conn.start) && visited.has(conn.end));
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
                    alert(`Congratulations! You've connected all points in a single network. Total Length: ${totalLength.toFixed(2)}`);
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
