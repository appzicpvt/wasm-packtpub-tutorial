const BLACK = "#000000";
const RED = "#ff0000";
const BLUE = "#0000ff";
const WHITE = "#ffffff";

let ball = {
    xpos: 395,
    ypos: 295,
    xspeed: 0,
    yspeed: 0,
}

const leftPaddle = {
    xpos: 25,
    ypos: 300
}

const rightPaddle = {
    xpos: 750,
    ypos: 300
}

const initialPosition = { ...ball };

const MOVE = {
    STATIONARY: 0,
    UP: 1,
    DOWN: 2
}

const timings = new Array(1000);

let move = MOVE.STATIONARY;

let fps = 0;
let frames = 0;
let totalFrames = 0;
let time = Date.now();

let leftScore = 0;
let rightScore = 0;

window.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown") {
        move = MOVE.DOWN;
    }
    if (event.key === "ArrowUp") {
        move = MOVE.UP;
    }
});

window.addEventListener("keyup", function (event) {
    move = MOVE.STATIONARY;
});


function calculateFps() {
    frames += 1;
    totalFrames += 1;
    if (Date.now() - time > 1000) {
        fps = frames / ((Date.now() - time) / 1000)
        frames = 0;
        time = Date.now();
    }
}

function getAIMove() {

    let idealPosition;

    if (ball.xspeed > 0) {
        idealPosition = ball.ypos;
    } else {
        turns = (ball.xpos - 50) / (-1 * ball.xspeed);
        idealPosition = ball.ypos + (ball.yspeed * turns);
    }

    if (idealPosition < leftPaddle.ypos) {
        return MOVE.UP;
    }
    if (idealPosition > leftPaddle.ypos) {
        return MOVE.DOWN;
    }
    return MOVE.STATIONARY;
}

function ballCollidesWithTopOrBottom() {
    return ball.ypos - 5 < 0 || ball.ypos + 5 > 595;
}

function ballCollidesWithLeftPaddle() {
    return (
        ball.xpos - 5 < leftPaddle.xpos + 5 &&
        ball.ypos - 5 < leftPaddle.ypos + 50 &&
        ball.ypos + 5 > leftPaddle.ypos - 50
    );
}

function ballCollidesWithRightPaddle() {
    return (
        ball.xpos + 5 > rightPaddle.xpos &&
        ball.ypos - 5 < rightPaddle.ypos + 50 &&
        ball.ypos + 5 > rightPaddle.ypos - 50
    );
}

function ballCollidesWithPaddle() {
    return ballCollidesWithLeftPaddle() || ballCollidesWithRightPaddle();
}

function calculateReflectionFactor() {
    let paddle = leftPaddle;
    if (ball.xpos > 400) {
        paddle = rightPaddle;
    };

    const factor = ball.ypos - paddle.ypos;
    return factor / 100;
}

function ballScoreOnRight() {
    return ball.xpos > 775;
}

function ballScoreOnLeft() {
    return ball.xpos < 25;
}

function update() {
    if (ball.xspeed === 0 && ball.yspeed === 0) {
        ball.xspeed = 1;
        ball.yspeed = (Math.random() * 2) - 1;
    }

    if (move === MOVE.UP && rightPaddle.ypos > 50) {
        rightPaddle.ypos -= 1;
    }
    if (move === MOVE.DOWN && rightPaddle.ypos < 550) {
        rightPaddle.ypos += 1;
    }

    const AIMove = getAIMove();
    console.log(AIMove);
    if (AIMove === MOVE.UP && leftPaddle.ypos > 50) {
        leftPaddle.ypos -= 1;
    }
    if (AIMove === MOVE.DOWN && leftPaddle.ypos < 550) {
        leftPaddle.ypos += 1;
    }

    // ball touch on sides and paddles
    if (ballCollidesWithTopOrBottom()) {
        ball.yspeed = -ball.yspeed;
    }
    if (ballCollidesWithPaddle()) {
        ball.xspeed = -ball.xspeed;
        ball.xspeed *= 1.05;
        ball.yspeed += calculateReflectionFactor();
    }

    // create score
    if (ballScoreOnRight()) {
        ball = { ...initialPosition };
        leftScore += 1;
    }
    if (ballScoreOnLeft()) {
        ball = { ...initialPosition };
        rightScore += 1;
    }

    ball.xpos += ball.xspeed;
    ball.ypos += ball.yspeed;

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
    ctx.fillRect(leftPaddle.xpos, leftPaddle.ypos - 50, 25, 100);
    ctx.fillStyle = BLUE;
    ctx.fillRect(rightPaddle.xpos, rightPaddle.ypos - 50, 25, 100);
}

function drawBall(ctx) {
    ctx.fillStyle = WHITE;
    ctx.fillRect(ball.xpos, ball.ypos, 10, 10);
}

function drawScore(ctx) {
    ctx.font = "60px Arial";
    ctx.strokeStyle = RED;
    ctx.strokeText(leftScore, 250, 50);
    ctx.strokeStyle = BLUE;
    ctx.strokeText(rightScore, 550, 50);
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