#include <emscripten.h>
#include <emscripten/bind.h>

enum class Move
{
    STATIONARY = 0,
    UP = 1,
    DOWN = 2
};

struct Paddle
{
    float xpos;
    float ypos;
};

class Ball
{
public:
    Ball() : xpos(395), ypos(295), xspeed(0), yspeed(0) {}
    float xspeed;
    float yspeed;
    float xpos;
    float ypos;
};

Move getAIMove(Ball ball, Paddle paddle)
{
    int idealPosition = ball.ypos;
    if (ball.xspeed <= 0)
    {
        auto turns = (ball.xpos - 50) / (-1 * ball.xspeed);
        idealPosition = ball.ypos + (ball.yspeed * turns);
    }

    if (idealPosition < paddle.ypos)
    {
        return Move::UP;
    }
    if (idealPosition > paddle.ypos)
    {
        return Move::DOWN;
    }

    return Move::STATIONARY;
};

EMSCRIPTEN_BINDINGS(pong)
{
    // function
    emscripten::function("getAIMove", &getAIMove);

    // enum
    emscripten::enum_<Move>("Move")
        .value("STATIONARY", Move::STATIONARY)
        .value("UP", Move::UP)
        .value("DOWN", Move::DOWN);

    // struct
    emscripten::value_object<Paddle>("Paddle")
        .field("xpos", &Paddle::xpos)
        .field("ypos", &Paddle::ypos);

    // class
    emscripten::class_<Ball>("Ball")
        .constructor<>()
        .property("xpos", &Ball::xpos)
        .property("ypos", &Ball::ypos)
        .property("xspeed", &Ball::xspeed)
        .property("yspeed", &Ball::yspeed);
}
