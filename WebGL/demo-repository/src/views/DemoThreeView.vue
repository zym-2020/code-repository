<template>
  <div>
    <canvas class="canvas" ref="canvas" width="400" height="300"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { GlHandle } from "@/utils/glUtil";
import axios from "axios";
export default defineComponent({
  setup() {
    const canvas = ref<HTMLCanvasElement>();
    let gl: WebGL2RenderingContext;
    let feedbackHandle: GlHandle;
    let drawHandle: GlHandle;

    let tf: WebGLTransformFeedback;

    const initWebGL = () => {
      gl = canvas.value?.getContext("webgl2")!;
      gl.viewport(0, 0, canvas.value!.clientWidth, canvas.value!.clientHeight);
      feedbackHandle = new GlHandle(gl);
      drawHandle = new GlHandle(gl);
    };

    const initResource = async () => {
      const feedbackVertexScript = await axios
        .get("./shader/feedback.vert.glsl")
        .then((res) => res.data);
      const feedbackFragmentScript = await axios
        .get("./shader/feedback.frag.glsl")
        .then((res) => res.data);
      const drawVertexScript = await axios
        .get(`./shader/feedbackDraw.vert.glsl`)
        .then((res) => res.data);
      const drawFragmentScript = await axios
        .get(`./shader/feedbackDraw.frag.glsl`)
        .then((res) => res.data);
      feedbackHandle.bindShader(feedbackVertexScript, "vertex");
      feedbackHandle.bindShader(feedbackFragmentScript, "fragment");
      drawHandle.bindShader(drawVertexScript, "vertex");
      drawHandle.bindShader(drawFragmentScript, "fragment");

      feedbackHandle.createFeedback(["position", "color"]);
      drawHandle.createProgram();
      drawHandle.bindVBO(
        gl.ARRAY_BUFFER,
        gl.DYNAMIC_DRAW,
        24 * 2 * 4,
        0,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );
      drawHandle.bindVBO(
        gl.ARRAY_BUFFER,
        gl.DYNAMIC_DRAW,
        24 * 4 * 4,
        1,
        4,
        gl.FLOAT,
        false,
        0,
        0
      );
      drawHandle.setDefaultVAO();

      /**
       * feedback相关状态设置
       */
      tf = gl.createTransformFeedback()!;
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
      gl.bindBufferBase(
        gl.TRANSFORM_FEEDBACK_BUFFER,
        0,
        drawHandle.getVBOList()[0]
      );
      gl.bindBufferBase(
        gl.TRANSFORM_FEEDBACK_BUFFER,
        1,
        drawHandle.getVBOList()[1]
      );
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

      // no need to call the fragment shader
      gl.enable(gl.RASTERIZER_DISCARD);

      // unbind the buffers so we don't get errors.
      gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };

    const draw = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      feedbackHandle.useProgram();

      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
      gl.beginTransformFeedback(gl.POINTS);
      gl.uniform1i(feedbackHandle.getUniformLocation("numPoints"), 24);
      gl.drawArrays(gl.POINTS, 0, 24);
      gl.endTransformFeedback();
      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

      gl.disable(gl.RASTERIZER_DISCARD);
      drawHandle.useProgram();
      drawHandle.bindVAO();
      gl.drawArrays(gl.POINTS, 0, 24);
    };

    onMounted(async () => {
      initWebGL();
      await initResource();
      draw();
    });

    return { canvas };
  },
});
</script>

<style lang="scss" scoped>
.canvas {
  width: 400px;
  height: 300px;
}
</style>