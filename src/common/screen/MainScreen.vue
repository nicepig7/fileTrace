<template>
  <div class="main-screen">
    <LeftFrame />
    <div class="main-content">
      <HeadFrame />
      <BodyFrame />
    </div>
  </div>
</template>

<script setup>
import LeftFrame from './frame/LeftFrame.vue';
import HeadFrame from './frame/HeadFrame.vue';
import BodyFrame from './frame/BodyFrame.vue';
</script>

<style scoped lang="scss">
.main-screen {
  display: flex;
  height: 100vh;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-surface);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>
