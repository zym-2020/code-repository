<template>
  <div class="game-view">
    <div class="title">Breakout!</div>
    <div class="score">得分：<strong>{{ score }}</strong></div>
    <canvas ref="container" class="container" height="600" width="1000"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { GameMain } from "@/utils/simulation";
export default defineComponent({
  setup() {
    const container = ref<HTMLCanvasElement>();
    const score = ref(0);

    onMounted(async () => {
      const gl = container.value?.getContext("webgl2")!;
      gl.viewport(0, 0, container.value!.width, container.value!.height);
      const gameMain = new GameMain(container.value!.height, container.value!.width, gl, score);
      document.onkeydown = (event) => {
        if (event.key === "ArrowLeft") gameMain.bindBoardMoveEvent(-1);
        if (event.key === "ArrowRight") gameMain.bindBoardMoveEvent(1);
      };
      document.onkeyup = (event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") gameMain.bindBoardMoveEvent(0);
      };
      gameMain.render();
    });
    return { container, score };
  },
});
</script>

<style lang="scss" scoped>
.game-view {
  height: 100%;
  background: #0095dd;
  position: relative;
  .title {
    position: absolute;
    text-align: center;
    width: 100%;
    top: calc((100% - 600px) / 2 - 80px);
    height: 80px;
    line-height: 80px;
    color: white;
    font-size: 45px;
    font-weight: 600;
    font-family: Arial, Helvetica, sans-serif;
  }
  .score {
    position: absolute;
    text-align: center;
    color: white;
    font-family: Arial, Helvetica, sans-serif;
    height: 40px;
    line-height: 40px;
    top: calc((100% - 600px) / 2 - 40px);
    right: calc((100% - 1000px) / 2);
    font-size: 20px;
  }
  .container {
    height: 600px;
    width: 1000px;
    background: white;
    position: absolute;
    left: calc((100% - 1000px) / 2);
    top: calc((100% - 600px) / 2);
  }
}
</style>
