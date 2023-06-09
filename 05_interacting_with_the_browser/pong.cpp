#include <emscripten/emscripten.h>
#include <emscripten/bind.h>

EM_JS(void, drawCanvas, (int width, int height), {
    const body = document.getElementsByTagName("body")[0];
    const canvas = document.createElement("canvas");
    canvas.id = "canvasId";
    canvas.width = width;
    canvas.height = height;
    body.appendChild(canvas);
});

enum class Move
{
    STATIONARY = 0,
    UP,
    DOWN
};

struct Paddle
{
    float xpos;
    float ypos;

    void moveUp()
    {
        if (ypos > 50)
        {
            ypos--;
        }
    }

    void moveDown()
    {
        if (ypos < 550)
        {
            ypos++;
        }
    }

    bool isAtPaddleLevel(float ball_ypos)
    {
        return (ball_ypos - 5 < ypos + 50) && (ball_ypos + 5 > ypos - 50);
    }
};

struct Ball
{
    float xpos = 395;
    float ypos = 295;
    float xspeed = 1;
    float yspeed = static_cast<float>(rand()) / static_cast<float>(RAND_MAX);

    bool isAtTopOrBottom()
    {
        return ypos - 5 < 0 || ypos + 5 > 595;
    }

    bool scoresOnRight()
    {
        return xpos > 775;
    }

    bool scoresOnLeft()
    {
        return xpos < 25;
    }

    bool doesHitPaddle(Paddle left, Paddle right)
    {
        return (xpos - 5 < 50 && left.isAtPaddleLevel(ypos)) || (xpos + 5 > 750 && right.isAtPaddleLevel(ypos));
    }

    void update()
    {
        xpos += xspeed;
        ypos += yspeed;
    }
};

struct GameState
{
    Ball ball{};
    Paddle left{25, 300};
    Paddle right{750, 300};
    Move move = Move::STATIONARY;
    int leftScore = 0;
    int rightScore = 0;
};

float calculateReflectionFactor(Ball ball, Paddle left, Paddle right)
{
    Paddle paddle = (ball.xpos > 400) ? right : left;
    const float factor = ball.ypos - paddle.ypos;
    return factor / 100;
}

void makeAIMove(Ball ball, Paddle &leftPaddle)
{
    int idealPosition = ball.ypos;
    if (ball.xspeed <= 0)
    {
        float turns = (ball.xpos - 50) / (-1 * ball.xspeed);
        idealPosition = ball.ypos + (ball.yspeed * turns);
    }

    if (idealPosition < leftPaddle.ypos)
    {
        leftPaddle.moveUp();
    }
    if (idealPosition > leftPaddle.ypos)
    {
        leftPaddle.moveDown();
    }
};

GameState createInitialGameState()
{
    drawCanvas(800, 600);
    return GameState{};
}

GameState updatePosition(GameState gameState)
{

    if (gameState.ball.xspeed == 0 && gameState.ball.yspeed == 0)
    {
        gameState.ball.xspeed = 1;
    }

    if (gameState.move == Move::UP)
    {
        gameState.right.moveUp();
    }
    if (gameState.move == Move::DOWN)
    {
        gameState.right.moveDown();
    }

    makeAIMove(gameState.ball, gameState.left);

    // ball touch on sides and paddles
    if (gameState.ball.isAtTopOrBottom())
    {
        gameState.ball.yspeed = -gameState.ball.yspeed;
    }
    if (gameState.ball.doesHitPaddle(gameState.left, gameState.right))
    {
        gameState.ball.xspeed = -gameState.ball.xspeed;
        gameState.ball.xspeed *= 1.05;
        gameState.ball.yspeed += calculateReflectionFactor(gameState.ball, gameState.left, gameState.right);
    }

    // create score
    if (gameState.ball.scoresOnRight())
    {
        gameState.ball = Ball{};
        gameState.leftScore += 1;
    }
    if (gameState.ball.scoresOnLeft())
    {
        gameState.ball = Ball{};
        gameState.rightScore += 1;
    }

    gameState.ball.update();

    return gameState;
}

EMSCRIPTEN_BINDINGS(gameState)
{

    // enum
    emscripten::enum_<Move>("Move")
        .value("STATIONARY", Move::STATIONARY)
        .value("UP", Move::UP)
        .value("DOWN", Move::DOWN);

    // struct
    emscripten::value_object<Ball>("Ball")
        .field("xpos", &Ball::xpos)
        .field("ypos", &Ball::ypos)
        .field("xspeed", &Ball::xspeed)
        .field("yspeed", &Ball::yspeed);

    emscripten::value_object<Paddle>("Paddle")
        .field("xpos", &Paddle::xpos)
        .field("ypos", &Paddle::ypos);

    emscripten::value_object<GameState>("GameState")
        .field("ball", &GameState::ball)
        .field("left", &GameState::left)
        .field("right", &GameState::right)
        .field("move", &GameState::move)
        .field("leftScore", &GameState::leftScore)
        .field("rightScore", &GameState::rightScore);

    // function
    emscripten::function("updatePosition", &updatePosition);
    emscripten::function("createInitialGameState", &createInitialGameState);
}
