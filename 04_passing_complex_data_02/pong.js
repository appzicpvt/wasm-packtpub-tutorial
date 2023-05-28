const BLACK = "#000000";
const RED = "#ff0000";
const BLUE = "#0000ff";
const WHITE = "#ffffff";

function setupGameState() {
    MOVE = Module.Move
    gameState = Module.createInitialGameState();

    timings = new Array(1000);
    move = MOVE.STATIONARY;

    fps = 0;
    frames = 0;
    totalFrames = 0;
    time = Date.now();

    window.addEventListener("keydown", function (event) {
        if (event.key === "ArrowDown") {
            gameState.move = MOVE.DOWN;
        }
        if (event.key === "ArrowUp") {
            gameState.move = MOVE.UP;
        }
    });

    window.addEventListener("keyup", function (event) {
        gameState.move = MOVE.STATIONARY;
    });
}


function calculateFps() {
    frames += 1;
    totalFrames += 1;
    if (Date.now() - time > 1000) {
        fps = frames / ((Date.now() - time) / 1000)
        frames = 0;
        time = Date.now();
    }
}

function update() {
    gameState = Module.updatePosition(gameState);
}

function drawBlackBackground(ctx) {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, 800, 600);
}

function drawDottedLine(ctx) {
    ctx.strokeStyle = WHITE;
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 600);
    ctx.lineWidth = 10;
    ctx.stroke();

    // reset line
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
}

function drawPaddles(ctx) {
    ctx.fillStyle = RED;
    ctx.fillRect(gameState.left.xpos, gameState.left.ypos - 50, 25, 100);
    ctx.fillStyle = BLUE;
    ctx.fillRect(gameState.right.xpos, gameState.right.ypos - 50, 25, 100);
}

function drawBall(ctx) {
    ctx.fillStyle = WHITE;
    ctx.fillRect(gameState.ball.xpos, gameState.ball.ypos, 10, 10);
}

function drawScore(ctx) {
    ctx.font = "60px Arial";
    ctx.strokeStyle = RED;
    ctx.strokeText(gameState.leftScore, 250, 50);
    ctx.strokeStyle = BLUE;
    ctx.strokeText(gameState.rightScore, 550, 50);
}

function drawFps(ctx) {
    ctx.font = "16px Arial";
    ctx.fillStyle = WHITE;
    ctx.fillText(`${fps.toFixed()} Frames/Second`, 650, 560);
}

function drawTimings(ctx) {
    ctx.font = "16px Arial";
    ctx.fillStyle = WHITE;
    const timing = timings.reduce((a, b) => { return a + b }, 0) / timings.length;
    ctx.fillText(`${timing.toFixed(2)} ms render`, 650, 580);
}

function draw() {
    const ctx = document.getElementById("canvasId").getContext("2d");
    drawBlackBackground(ctx);
    drawDottedLine(ctx);
    drawPaddles(ctx);
    drawBall(ctx);
    drawScore(ctx);
    drawFps(ctx);
    drawTimings(ctx);
}

function render() {
    const lastTiming = Date.now();
    calculateFps();
    update();
    draw();
    timings[totalFrames % timings.length] = Date.now() - lastTiming;
    this.setTimeout(render, 0);
}