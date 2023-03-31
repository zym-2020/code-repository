<template>
  <div class="home">
    <div class="content">
      <div class="title">Breakout!</div>
      <!-- canvas 的宽高不要使用 CSS 来设置, 会有拉伸的问题. 应该直接使用属性设置 -->
      <canvas height="600" width="800" ref="canvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { Ball, Paddle, Brick, Score } from "@/class";
export default defineComponent({
  setup() {
    const canvas = ref<HTMLCanvasElement>();
    let horizontal: "left" | "right" = "left";
    let vertical: "top" | "bottom" = "top";
    const ball = new Ball(400, 570, 10, "#0095dd", "#0095dd");
    const paddle = new Paddle(360, 580, 0, 80, 10, "#0095dd", "#0095dd");
    let bricks: Brick[][] = [];
    const score = new Score(
      "20px sans-serif",
      755,
      40,
      2,
      "#0095dd",
      "#0095dd",
      0
    );

    const initData = () => {
      ball.x = Math.ceil(Math.random() * canvas.value!.width);
      ball.y = 570;
      horizontal = Math.ceil(Math.random() * 100) % 2 === 1 ? "left" : "right";
      vertical = "top";
      score.score = 0;
    };

    const drawBall = (ball: Ball) => {
      const context = canvas.value?.getContext("2d");
      if (context) {
        context.beginPath();
        context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        context.fillStyle = ball.fillColor;
        context.fill();
        context.strokeStyle = ball.strokeColor;
        context.stroke();
        context.closePath();
      }
    };

    const drawPaddle = (paddle: Paddle) => {
      const context = canvas.value?.getContext("2d");
      if (context) {
        context.beginPath();
        context.rect(paddle.x, paddle.y, paddle.width, paddle.height);
        context.fillStyle = paddle.fillColor;
        context.fill();
        context.strokeStyle = paddle.strokeColor;
        context.stroke();
        context.closePath();
      }
    };

    const drawBricks = (bricks: Brick[][]) => {
      const context = canvas.value?.getContext("2d");
      if (context) {
        for (let i = 0; i < bricks.length; i++) {
          for (let j = 0; j < bricks[0].length; j++) {
            if (bricks[i][j].visual) {
              context.beginPath();
              context.rect(
                bricks[i][j].x,
                bricks[i][j].y,
                bricks[i][j].width,
                bricks[i][j].height
              );
              context.fillStyle = bricks[i][j].fillColor;
              context.fill();
              context.strokeStyle = bricks[i][j].strokeColor;
              context.stroke();
              context.closePath();
            }
          }
        }
      }
    };

    const drwaScore = (score: Score) => {
      const context = canvas.value?.getContext("2d");
      if (context) {
        context.font = score.font;
        context.textAlign = "end";
        context.fillStyle = score.fillColor;
        context.strokeStyle = score.strokeColor;
        context.lineWidth = score.lineWidth;
        context.fillText(`得分：${score.score}`, score.x, score.y);
      }
    };

    const initBricks = () => {
      const startX = 45;
      const startY = 60;
      bricks = [];
      for (let row = 0; row < 5; row++) {
        const temp = [];
        for (let col = 0; col < 9; col++) {
          const brick = new Brick(
            true,
            startX + 80 * col,
            startY + 30 * row,
            0,
            70,
            20,
            "#0095dd",
            "#0095dd"
          );
          temp.push(brick);
        }
        bricks.push(temp);
      }
    };

    const draw = () => {
      const context = canvas.value?.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
        drawBall(ball);
        drawPaddle(paddle);
        drawBricks(bricks);
        drwaScore(score);
      }
    };

    /**
     * 球与矩形碰撞事件
     */
    const crash = (paddleParam: Paddle | Brick) => {
      let paddleDistance;
      let paddleFlag = true;
      let paddleDirection;
      if (
        ball.x >= paddleParam.x &&
        ball.x <= paddleParam.x + paddleParam.width
      ) {
        paddleFlag = false;
        Math.abs(paddleParam.y - ball.y) <
        Math.abs(paddleParam.y + paddleParam.height - ball.y)
          ? ((paddleDistance = Math.abs(paddleParam.y - ball.y)),
            (paddleDirection = "top"))
          : ((paddleDistance = Math.abs(
              paddleParam.y + paddleParam.height - ball.y
            )),
            (paddleDirection = "bottom"));
      }
      if (
        ball.y >= paddleParam.y &&
        ball.y <= paddleParam.y + paddleParam.height
      ) {
        paddleFlag = false;

        Math.abs(paddleParam.x - ball.x) <
        Math.abs(paddleParam.x + paddleParam.width - ball.x)
          ? ((paddleDistance = Math.abs(paddleParam.x - ball.x)),
            (paddleDirection = "left"))
          : ((paddleDistance = Math.abs(
              paddleParam.x + paddleParam.width - ball.x
            )),
            (paddleDirection = "right"));
      }
      if (paddleFlag) {
        let value1 = Math.sqrt(
          Math.pow(ball.x - paddleParam.x, 2) +
            Math.pow(ball.y - paddleParam.y, 2)
        );
        let value2 = Math.sqrt(
          Math.pow(ball.x - (paddleParam.x + paddleParam.width), 2) +
            Math.pow(ball.y - paddleParam.y, 2)
        );
        let value3 = Math.sqrt(
          Math.pow(ball.x - (paddleParam.x + paddleParam.width), 2) +
            Math.pow(ball.y - (paddleParam.y + paddleParam.height), 2)
        );
        let value4 = Math.sqrt(
          Math.pow(ball.x - paddleParam.x, 2) +
            Math.pow(ball.y - (paddleParam.y + paddleParam.height), 2)
        );
        const value = [value1, value2, value3, value4];
        let min = value[0];
        let index = 0;
        for (let i = 1; i < 4; i++) {
          if (min < value[i]) {
            min = value[i];
            index = i;
          }
        }
        paddleDistance = min;
        if (index === 0) {
          paddleDirection =
            Math.abs(ball.x - paddleParam.x) < Math.abs(ball.y - paddleParam.y)
              ? "left"
              : "top";
        } else if (index === 1) {
          paddleDirection =
            Math.abs(ball.x - (paddleParam.x + paddleParam.width)) <
            Math.abs(ball.y - paddleParam.y)
              ? "right"
              : "top";
        } else if (index === 2) {
          paddleDirection =
            Math.abs(ball.x - (paddleParam.x + paddleParam.width)) <
            Math.abs(ball.y - (paddleParam.y + paddleParam.height))
              ? "right"
              : "bottom";
        } else {
          paddleDirection =
            Math.abs(ball.x - paddleParam.x) <
            Math.abs(ball.y - (paddleParam.y + paddleParam.height))
              ? "left"
              : "bottom";
        }
      }

      if (paddleDistance && paddleDirection) {
        if (paddleDistance < ball.r) {
          switch (paddleDirection) {
            case "left":
              horizontal = "left";
              break;
            case "right":
              horizontal = "right";
              break;
            case "top":
              vertical = "top";
              break;
            case "bottom":
              vertical = "bottom";
              break;
          }

          if ("visual" in paddleParam) {
            score.score += 1;
            paddleParam.visual = false;
          }
        }
      }
    };

    const updatePaddle = () => {
      let temp = paddle.x + paddle.dx;
      if (temp > canvas.value!.width - paddle.width) {
        temp = canvas.value!.width - paddle.width;
      } else if (temp < 0) {
        temp = 0;
      }
      paddle.x = temp;
    };

    const updateBall = () => {
      /**
       * 碰撞paddle
       */
      crash(paddle);

      /**
       * 碰撞brick
       */
      bricks.forEach((item) => {
        item.forEach((brick) => {
          if (brick.visual) {
            crash(brick);
          }
        });
      });

      if (horizontal === "left") {
        if (ball.x - 4 < ball.r) {
          ball.x = ball.r;
          horizontal = "right";
        } else {
          ball.x = ball.x - 4;
        }
      } else {
        if (ball.x + 4 > canvas.value!.width - ball.r) {
          ball.x = canvas.value!.width - ball.r;
          horizontal = "left";
        } else {
          ball.x = ball.x + 4;
        }
      }
      if (vertical === "top") {
        if (ball.y - 4 < ball.r) {
          ball.y = ball.r;
          vertical = "bottom";
        } else {
          ball.y = ball.y - 4;
        }
      } else {
        if (ball.y + 4 > canvas.value!.height - ball.r) {
          init();
        } else {
          ball.y = ball.y + 4;
        }
      }
    };

    const update = () => {
      updatePaddle();
      updateBall();
      draw();
      window.requestAnimationFrame(update);
    };

    const movePaddle = () => {
      window.addEventListener("keydown", (e) => {
        if (e.key === "Right" || e.key === "ArrowRight") {
          paddle.dx = 8;
        }
        if (e.key === "Left" || e.key === "ArrowLeft") {
          paddle.dx = -8;
        }
      });
      window.addEventListener("keyup", (e) => {
        if (
          e.key === "Right" ||
          e.key === "ArrowRight" ||
          e.key === "Left" ||
          e.key === "ArrowLeft"
        ) {
          paddle.dx = 0;
        }
      });
    };

    const init = () => {
      initData();
      initBricks();
      draw();
    };

    onMounted(() => {
      init();
      update();
      movePaddle();
    });

    return { canvas };
  },
});
</script>


<style lang="scss" scoped>
.home {
  height: 100%;
  position: relative;
  background: #0095dd;
  .content {
    height: 700px;
    position: absolute;
    left: calc((100vw - 800px) / 2);
    top: calc((100vh - 700px) / 2);
    .title {
      height: 100px;
      line-height: 100px;
      color: white;
      text-align: center;
      font-size: 45px;
      font-weight: 600;
      font-family: Arial, Helvetica, sans-serif;
    }
    canvas {
      background: white;
      border-radius: 5px;
    }
  }
}
</style>
