<template>
  <div>
    <div v-for="item in msgs" :key="item">{{ item }}</div>
  </div>
</template>


<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
export default defineComponent({
  setup() {
    const msgs = ref<string[]>([]);

    const sseInit = () => {
      const source = new EventSource("http://localhost:8005/SSE/subscribe/123");

      source.addEventListener("msg", (e) => {
        console.log(e);
        msgs.value.push(e.data);
      });

      source.onopen = (e) => {
        msgs.value.push("开启");
        console.log(e);
      };

      source.onerror = (e) => {
        console.log(e);
        msgs.value.push("连接关闭");
        source.close()
      };

      
    };

    onMounted(() => {
      sseInit();
      
    });
    return { msgs };
  },
});
</script>


<style lang="scss" scoped>
</style>