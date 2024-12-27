const canvas = document.getElementById("cartesianCanvas");
const ctx = canvas.getContext("2d");
const sidebarWidth = document.getElementById("sidebar").offsetWidth;

canvas.width = window.innerWidth - sidebarWidth;
canvas.height = window.innerHeight;

let gridSpacing = 20;
let offsetX = 0;
let offsetY = 0;
let functions = []; // List to store all functions

let isDragging = false;
let startDragX = 0;
let startDragY = 0;

// Draw the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gridColor = "#ccc";
    const axisColor = "black";
    const textColor = "black";
    const fontSize = 12;

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Center the grid around the origin
    const centerX = canvas.width / 2 - offsetX;
    const centerY = canvas.height / 2 - offsetY;

    const startX = centerX % gridSpacing;
    const startY = centerY % gridSpacing;

    // Dynamically determine the interval for axis numbers
    const baseInterval = 1; // Base interval when gridSpacing is small
    let interval = baseInterval;

    if (gridSpacing < 20) interval = 5;
    if (gridSpacing < 10) interval = 10;

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw vertical grid lines and numbers
    for (let x = startX; x <= canvas.width; x += gridSpacing) {
        const cartesianX = Math.round((x - centerX) / gridSpacing);

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        // Draw X-axis numbers at the specified interval
        if (cartesianX % interval === 0 && cartesianX != 0) {
            ctx.fillText(cartesianX, x, centerY + fontSize + 2);
        }
    }

    // Draw horizontal grid lines and numbers
    for (let y = startY; y <= canvas.height; y += gridSpacing) {
        const cartesianY = Math.round((centerY - y) / gridSpacing);

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        // Draw Y-axis numbers at the specified interval
        if (cartesianY % interval === 0 && cartesianY != 0) {
            ctx.fillText(cartesianY, centerX - fontSize - 2, y);
        }
    }

    // Draw axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;

    // Draw X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    // Draw Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Add origin label (0, 0)
    ctx.fillText("0", centerX + fontSize / 2, centerY + fontSize / 2);
}




// Plot all stored functions
function plotAllFunctions() {
    functions.forEach((func) => plotFunction(func));
}

// Plot a single function
function plotFunction(func) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    ctx.beginPath();
    let firstPoint = true;

    // Iterate over canvas X coordinates with finer steps for smoothness
    for (let canvasX = 0; canvasX <= canvas.width; canvasX++) {
        // Convert canvas X to Cartesian X
        const cartesianX = (canvasX - canvas.width / 2 + offsetX) / gridSpacing;

        let cartesianY;
        try {
            // Safely evaluate the function
            cartesianY = eval(func.replace(/x/g, `(${cartesianX})`));
        } catch (e) {
            console.error("Invalid function:", func);
            return;
        }

        // Convert Cartesian Y back to canvas Y
        const canvasY = canvas.height / 2 - (cartesianY * gridSpacing) - offsetY;

        // Plot the point
        if (firstPoint) {
            ctx.moveTo(canvasX, canvasY);
            firstPoint = false;
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
    }
    ctx.stroke();
}


// Handle mouse dragging for panning
canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    startDragX = e.clientX - offsetX;
    startDragY = e.clientY - offsetY;
    canvas.style.cursor = "grabbing";
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        offsetX = e.clientX - startDragX;
        offsetY = e.clientY - startDragY;
        drawGrid();
        plotAllFunctions();
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
});

canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
});

// Handle zooming
canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    const newSpacing = gridSpacing - delta * 2;

    if (newSpacing >= 10 && newSpacing <= 100) {
        gridSpacing = newSpacing;
    }

    drawGrid();
    plotAllFunctions();
});

// Button click to plot a new function
document.getElementById("plotButton").addEventListener("click", () => {
    const func = document.getElementById("functionInput").value.trim();
    if (func) {
        functions.push(func); // Add the new function to the list
        drawGrid();
        plotAllFunctions();
    }
});

// Button click to clear functions
document.getElementById("clearButton").addEventListener("click", () => {
    functions.length = 0;
    drawGrid();
    plotAllFunctions();
});

// Initial draw
drawGrid();

// Resize canvas on window resize
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth - sidebarWidth;
    canvas.height = window.innerHeight;
    drawGrid();
    plotAllFunctions();
});
