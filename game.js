const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const resetButton = document.getElementById('resetButton');
const N = 10; // Number of random points
let points = [];
let connections = [];
let totalLength = 0;
let lastPoint = null;
let isDragging = false;
let tempLineStart = null;

// Generate random points
function generateRandomPoints() {
    points = [];
    connections = [];
    for (let i = 0; i < N; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        points.push({ x, y, connected: [] });
    }
}

// Draw all points
function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    if (isDragging && tempLineStart) {
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tempLineStart.x, tempLineStart.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
    }
}

// Calculate distance between two points
function distanceBetweenPoints(p1, p2) {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

// Draw a line between two points
function drawLine(p1, p2) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

// Handle canvas click to start or end a line
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    let clickedPoint = null;
    points.forEach(point => {
        if (Math.abs(point.x - mouseX) < 10 && Math.abs(point.y - mouseY) < 10) {
            clickedPoint = point;
        }
    });

    if (clickedPoint) {
        if (lastPoint && lastPoint !== clickedPoint) {
            drawLine(lastPoint, clickedPoint);
            totalLength += distanceBetweenPoints(lastPoint, clickedPoint);
            scoreElement.textContent = `Total Length: ${totalLength.toFixed(2)}`;
            // Mark the points as connected
            lastPoint.connected.push(clickedPoint);
            clickedPoint.connected.push(lastPoint);
            lastPoint = null;
            if (checkAllConnected()) {
                setTimeout(() => {
                    alert(`Congratulations! You've connected all points. Total Length: ${totalLength.toFixed(2)}`);
                }, 100); // Delay to ensure the last line is rendered
                canvas.removeEventListener('click', handleCanvasClick); // Stop the game
            }
        } else {
            lastPoint = clickedPoint;
        }
    } else {
        if (lastPoint) {
            drawLine(lastPoint, { x: mouseX, y: mouseY });
            totalLength += distanceBetweenPoints(lastPoint, { x: mouseX, y: mouseY });
            scoreElement.textContent = `Total Length: ${totalLength.toFixed(2)}`;
            lastPoint = { x: mouseX, y: mouseY }; // Update lastPoint to new point
        }
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

// Handle mouse down event to start dragging a line
function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    let clickedPoint = null;
    points.forEach(point => {
        if (Math.abs(point.x - mouseX) < 10 && Math.abs(point.y - mouseY) < 10) {
            clickedPoint = point;
        }
    });

    if (clickedPoint) {
        lastPoint = clickedPoint;
        isDragging = true;
        tempLineStart = { x: clickedPoint.x, y: clickedPoint.y };
    }
}

// Handle mouse move event to update the temporary line while dragging
function handleMouseMove(event) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
        drawPoints();
        drawLine(tempLineStart, { x: mouseX, y: mouseY });
    }
}

// Handle mouse up event to finish dragging and draw the final line
function handleMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
        if (lastPoint) {
            drawLine(lastPoint, { x: mouseX, y: mouseY });
            totalLength += distanceBetweenPoints(lastPoint, { x: mouseX, y: mouseY });
            scoreElement.textContent = `Total Length: ${totalLength.toFixed(2)}`;
            lastPoint = { x: mouseX, y: mouseY }; // Update lastPoint to new point
        }
        if (checkAllConnected()) {
            setTimeout(() => {
                alert(`Congratulations! You've connected all points. Total Length: ${totalLength.toFixed(2)}`);
            }, 100); // Delay to ensure the last line is rendered
            canvas.removeEventListener('click', handleCanvasClick); // Stop the game
        }
    }
}

// Reset the game
function resetGame() {
    totalLength = 0;
    lastPoint = null;
    tempLineStart = null;
    isDragging = false;
    scoreElement.textContent = `Total Length: 0`;
    generateRandomPoints();
    drawPoints();
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
}

canvas.addEventListener('click', handleCanvasClick);
resetButton.addEventListener('click', resetGame);

// Initialize the game
resetGame();
