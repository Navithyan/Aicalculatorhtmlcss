const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const customCursor = document.getElementById('customCursor');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawCanvas();  // Ensure previous drawings are restored after resize
});

// Drawing Variables
let isDrawing = false;
let isErasing = false;
let brushColor = '#ffffff';
let brushSize = 3;

// Undo/Redo History
let drawingHistory = [];
let redoStack = [];

canvas.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    customCursor.style.left = `${x - brushSize}px`;
    customCursor.style.top = `${y - brushSize}px`;
    customCursor.style.width = `${brushSize * 2}px`;
    customCursor.style.height = `${brushSize * 2}px`;
    customCursor.style.display = 'block';

    if (isErasing) {
        customCursor.classList.add('eraser-cursor');
    } else {
        customCursor.classList.remove('eraser-cursor');
    }
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

function startDrawing(e) {
    isDrawing = true;
    saveToHistory();
    ctx.beginPath();
    draw(e);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!isDrawing) return;

    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isErasing ? '#000' : brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Save drawing state for Undo/Redo
function saveToHistory() {
    drawingHistory.push(canvas.toDataURL());
    redoStack = [];  // Clear redo history after a new drawing action
}

// Undo Action
document.getElementById('undoBtn').addEventListener('click', () => {
    if (drawingHistory.length > 0) {
        redoStack.push(drawingHistory.pop());
        redrawCanvas();
    }
});

// Redo Action
document.getElementById('redoBtn').addEventListener('click', () => {
    if (redoStack.length > 0) {
        drawingHistory.push(redoStack.pop());
        redrawCanvas();
    }
});

// Redraw Canvas
function redrawCanvas() {
    const img = new Image();
    img.src = drawingHistory[drawingHistory.length - 1];
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

// Reset Canvas
document.getElementById('resetBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistory = [];
    redoStack = [];
});

// Color Selection
const colorBoxes = document.querySelectorAll('.color-box');
colorBoxes.forEach(box => {
    box.addEventListener('click', () => {
        brushColor = box.getAttribute('data-color');
        isErasing = false;

        colorBoxes.forEach(b => b.classList.remove('active'));
        box.classList.add('active');
    });
});

// Brush Size
document.getElementById('brushSize').addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
});

// Eraser Tool
document.getElementById('eraserBtn').addEventListener('click', () => {
    isErasing = true;
});
