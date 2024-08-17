// Connect-the-Dots Game v5.1

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

// Generate random points
function generateRandomPoints() {
    points = [];
    connections = [];
    for (let i = 0; i < N; i++) {
        const x = Math.random() * (canvas.width - 2 * POINT_RADIUS) + POINT_RADIUS;
        const y = Math.random() * (canvas.height - 2 * POINT_RADIUS) + POINT_RADIUS;
        points.push({ x, y, connected: false, id: i, isIntermediate: false });
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

        // Draw small dot at the end of the line if it's not on a blue or green dot
        if (!points.some(p => distanceBetweenPoints(p, conn.end) <= POINT_RADIUS)) {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(conn.end.x, conn.end.y, SMALL_POINT_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw points
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.isIntermediate ? SMALL_POINT_RADIUS : POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = point.connected ? 'green' : (point.isIntermediate ? 'black' : 'blue');
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

    // Add intermediate points if necessary
    if (!points.some(p => p.x === snappedStart.x && p.y === snappedStart.y)) {
        points.push({ ...snappedStart, connected: false, isIntermediate: true });
    }
    if (!points.some(p => p.x === snappedEnd.x && p.y === snappedEnd.y)) {
        points.push({ ...snappedEnd, connected: false, isIntermediate: true });
    }

    connections.push({ start: snappedStart, end: snappedEnd });
    totalLength += distanceBetweenPoints(snappedStart, snappedEnd);
    scoreElement.textContent = `Total Length: ${totalLength.toFixed(2)}`;

    updateConnectedPoints();
}

// Update connected status of all points
function updateConnectedPoints() {
    let connectedGroups = [];

    // Create initial groups for each connection
    connections.forEach(conn => {
        let startPoint = points.find(p => distanceBetweenPoints(p, conn.start) <= POINT_RADIUS);
        let endPoint = points.find(p => distanceBetweenPoints(p, conn.end) <= POINT_RADIUS);

        if (startPoint && endPoint) {
            let group = connectedGroups.find(g => g.includes(startPoint) || g.includes(endPoint));
            if (group) {
                group.push(startPoint, endPoint);
            } else {
                connectedGroups.push([startPoint, endPoint]);
            }
        }
    });

    // Merge overlapping groups
    let merged;
    do {
        merged = false;
        for (let i = 0; i < connectedGroups.length; i++) {
            for (let j = i + 1; j < connectedGroups.length; j++) {
                if (connectedGroups[i].some(p => connectedGroups[j].includes(p))) {
                    connectedGroups[i] = [...new Set([...connectedGroups[i], ...connectedGroups[j]])];
                    connectedGroups.splice(j, 1);
                    merged = true;
                    break;
                }
            }
            if (merged) break;
        }
    } while (merged);

    // Mark points as connected
    points.forEach(point => {
        point.connected = connectedGroups.some(group => group.includes(point));
    });
}

// Check if all points are connected
function checkAllConnected() {
    return points.every(point => point.connected);
}

// Check if all lines are connected to points or other lines
function checkAllLinesConnected() {
    return connections.every(conn =>
        points.some(p => distanceBetweenPoints(p, conn.start) <= POINT_RADIUS) &&
        (points.some(p => distanceBetweenPoints(p, conn.end) <= POINT_RADIUS) ||
            connections.some(c => c !== conn && (
                distanceBetweenPoints(c.start, conn.end) <= SMALL_POINT_RADIUS ||
                distanceBetweenPoints(c.end, conn.end) <= SMALL_POINT_RADIUS
            )))
    );
}

// Handle mouse down event
function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const clickPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    dragStart = findClosestPoint(clickPoint) || clickPoint;
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
            if (checkAllConnected() && checkAllLinesConnected()) {
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
