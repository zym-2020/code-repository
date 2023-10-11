<template>
  <div ref="container" class="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import * as THREE from "three";
export default defineComponent({
  setup() {
    const container = ref<HTMLDivElement>();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    onMounted(() => {
      renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
      container.value?.appendChild(renderer.domElement);
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      // const material = new THREE.M
      const material = new THREE.MeshBasicMaterial({ color: "white" });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      camera.position.z = 5;

      function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
      }

      animate();
    });

    return { container };
  },
});
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
