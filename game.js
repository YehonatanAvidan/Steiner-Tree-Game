// Connect-the-Dots Game v6.34

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

// Generate random points
function generateRandomPoints() {
    points = [];
    connections = [];
    const minDistance = POINT_RADIUS * 2; // Minimum distance between points to avoid overlap

    while (points.length < N) {
        const x = Math.random() * (canvas.width - 2 * POINT_RADIUS) + POINT_RADIUS;
        const y = Math.random() * (canvas.height - 2 * POINT_RADIUS) + POINT_RADIUS;
        const newPoint = { x, y, connected: false, id: points.length, isIntermediate: false };

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
        if (conn.intermediate) {
            ctx.lineTo(conn.intermediate.x, conn.intermediate.y);
        }
        ctx.lineTo(conn.end.x, conn.end.y);
        ctx.stroke();

        // Draw small dot for intermediate point
        if (conn.intermediate) {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(conn.intermediate.x, conn.intermediate.y, SMALL_POINT_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw points
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = connectedGraph.includes(point) ? 'green' : 'blue';
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

    connections.forEach(conn => {
        if (conn.intermediate) {
            const distanceToIntermediate = distanceBetweenPoints(point, conn.intermediate);
            if (distanceToIntermediate < minDistance && distanceToIntermediate <= SNAP_DISTANCE) {
                minDistance = distanceToIntermediate;
                closestPoint = conn.intermediate;
            }
        }
        const distanceToEnd = distanceBetweenPoints(point, conn.end);
        if (distanceToEnd < minDistance && distanceToEnd <= SNAP_DISTANCE) {
            minDistance = distanceToEnd;
            closestPoint = conn.end;
        }
    });

    return closestPoint;
}

// Add a new connection
function addConnection(start, end) {
    // Snap start and end to closest points if within range
    const snappedStart = findClosestPoint(start) || start;
    const snappedEnd = findClosestPoint(end) || end;

    // Create a new connection
    const newConnection = { start: snappedStart, end: snappedEnd };

    // Add intermediate point if snappedEnd is not an existing point
    if (!points.some(p => p.x === snappedEnd.x && p.y === snappedEnd.y)) {
        newConnection.intermediate = { ...snappedEnd, connected: false, isIntermediate: true, id: points.length };
    }

    // Ensure that the connection starts from an existing point
    if (points.some(p => p.x === snappedStart.x && p.y === snappedStart.y)) {
        connections.push(newConnection);
        totalLength += distanceBetweenPoints(snappedStart, snappedEnd);
        scoreElement.textContent = `Total Length: ${totalLength.toFixed(2)}`;

        // Check if the end point should be added to the connected graph
        if (connectedGraph.includes(snappedStart)) {
            if (newConnection.intermediate) {
                connectedGraph.push(newConnection.intermediate);
            }
            if (!connectedGraph.includes(snappedEnd)) {
                connectedGraph.push(snappedEnd);
            }
            colorConnectedPoints(snappedEnd);
        }

        // New logic: if the end point is in connectedGraph, add the start point too
        if (connectedGraph.includes(snappedEnd) && !connectedGraph.includes(snappedStart)) {
            connectedGraph.push(snappedStart);
            if (newConnection.intermediate) {
                connectedGraph.push(newConnection.intermediate);
            }
            colorConnectedPoints(snappedStart);
        }

        // Ensure all connected points are in connectedGraph
        ensureAllConnectedPoints();

        updateConnectedPoints();
    }
}

// Ensure all connected points are in connectedGraph
function ensureAllConnectedPoints() {
    let added;
    do {
        added = false;
        let currentConnectedGraph = [...connectedGraph]; // Clone the current state of connectedGraph

        currentConnectedGraph.forEach(point => {
            connections.forEach(conn => {
                if (conn.start === point) {
                    if (conn.intermediate && !connectedGraph.includes(conn.intermediate)) {
                        connectedGraph.push(conn.intermediate);
                        added = true;
                    }
                    if (!connectedGraph.includes(conn.end)) {
                        connectedGraph.push(conn.end);
                        added = true;
                    }
                } else if (conn.end === point) {
                    if (conn.intermediate && !connectedGraph.includes(conn.intermediate)) {
                        connectedGraph.push(conn.intermediate);
                        added = true;
                    }
                    if (!connectedGraph.includes(conn.start)) {
                        connectedGraph.push(conn.start);
                        added = true;
                    }
                }
            });
        });
    } while (added);
}

// Color all points connected to the given point
function colorConnectedPoints(startPoint) {
    const visited = new Set();
    const queue = [startPoint];

    while (queue.length > 0) {
        const point = queue.shift();
        if (!visited.has(point)) {
            visited.add(point);
            if (!connectedGraph.includes(point)) {
                connectedGraph.push(point);
            }

            // Add connected points to the queue
            connections.forEach(conn => {
                if (conn.start === point) {
                    if (conn.intermediate) queue.push(conn.intermediate);
                    if (!visited.has(conn.end)) queue.push(conn.end);
                } else if (conn.end === point) {
                    if (conn.intermediate) queue.push(conn.intermediate);
                    if (!visited.has(conn.start)) queue.push(conn.start);
                }
            });
        }
    }
}

// Update connected status of all points
function updateConnectedPoints() {
    // Check if all points are in the connected graph
    if (checkAllConnected()) {
        setTimeout(() => {
            alert(`Congratulations! You've connected all points. Total Length: ${totalLength.toFixed(2)}`);
        }, 100);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
    }
}

// Check if all points are in the connected graph
function checkAllConnected() {
    return points.every(point => connectedGraph.includes(point));
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
    scoreElement.textContent = `Total Length: 0`;
    connectedGraph = []; // Reset connected graph
    generateRandomPoints();
    connections = [];
    draw();
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
}

// Initialize the game
function init() {
    generateRandomPoints();
    draw();
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    resetButton.addEventListener('click', resetGame);
}

// Start the game
init();
