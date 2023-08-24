<template>
  <div class="home">首页</div>
  <button @click="clickHandle">按钮</button>
  <!-- <img src="/image/projection.png" alt=""> -->
</template>

<script lang="ts">
import { defineComponent } from "vue";
import router from "@/router";
export default defineComponent({
  setup() {
    const clickHandle = () => {
      router.push({ path: "/flowField" });
    };

    return { clickHandle };
  },
});
</script>


