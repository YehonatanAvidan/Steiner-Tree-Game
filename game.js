// Connect-the-Dots Game v5.6

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
let firstConnectedPoint = null; // Track the first connected point

// Generate random points
function generateRandomPoints() {
    points = [];
    connections = [];
    for (let i = 0; i < N; i++) {
        const x = Math.random() * (canvas.width - 2 * POINT_RADIUS) + POINT_RADIUS;
        const y = Math.random() * (canvas.height - 2 * POINT_RADIUS) + POINT_RADIUS;
        points.push({ x, y, connected: false, id: i, isOriginal: true });
    }
}

// ... (keep other functions unchanged)

// Update connected status of all points
function updateConnectedPoints() {
    // Initialize an adjacency list to represent the graph
    let adjacencyList = points.map(() => []);

    connections.forEach(conn => {
        let startPoint = points.find(p => distanceBetweenPoints(p, conn.start) <= POINT_RADIUS);
        let endPoint = points.find(p => distanceBetweenPoints(p, conn.end) <= POINT_RADIUS);

        if (startPoint && endPoint) {
            adjacencyList[startPoint.id].push(endPoint.id);
            adjacencyList[endPoint.id].push(startPoint.id);
        }
    });

    // Perform DFS to find all connected points starting from the first connected point
    let visited = new Set();
    function dfs(pointId) {
        visited.add(pointId);
        adjacencyList[pointId].forEach(neighborId => {
            if (!visited.has(neighborId)) {
                dfs(neighborId);
            }
        });
    }

    if (firstConnectedPoint) {
        dfs(firstConnectedPoint.id);
    }

    // Mark points as connected if they are in the visited set
    points.forEach(point => {
        point.connected = visited.has(point.id);
    });

    // Check if all original points are connected and stop the game if true
    if (checkAllOriginalPointsConnected()) {
        setTimeout(() => {
            alert(`Congratulations! You've connected all points. Total Length: ${totalLength.toFixed(2)}`);
        }, 100);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
    }
}

// Check if all original points are connected
function checkAllOriginalPointsConnected() {
    return points.filter(point => point.isOriginal).every(point => point.connected);
}

// Add a new connection
function addConnection(start, end) {
    // Snap start and end to closest points if within range
    const snappedStart = findClosestPoint(start) || start;
    const snappedEnd = findClosestPoint(end) || end;

    // Add intermediate points if necessary
    if (!points.some(p => p.x === snappedStart.x && p.y === snappedStart.y)) {
        const newPoint = { ...snappedStart, connected: false, isOriginal: false, id: points.length };
        points.push(newPoint);
        firstConnectedPoint = firstConnectedPoint || newPoint; // Set the first connected point
    }
    if (!points.some(p => p.x === snappedEnd.x && p.y === snappedEnd.y)) {
        const newPoint = { ...snappedEnd, connected: false, isOriginal: false, id: points.length };
        points.push(newPoint);
        firstConnectedPoint = firstConnectedPoint || newPoint; // Set the first connected point
    }

    connections.push({ start: snappedStart, end: snappedEnd });
    totalLength += distanceBetweenPoints(snappedStart, snappedEnd);
    scoreElement.textContent = `Total Length: ${totalLength.toFixed(2)}`;

    updateConnectedPoints();
}

// ... (keep other functions unchanged)

// Reset the game
function resetGame() {
    totalLength = 0;
    scoreElement.textContent = `Total Length: 0`;
    firstConnectedPoint = null;
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
