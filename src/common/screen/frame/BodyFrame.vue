<template>
  <div class="body-frame">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
// Body frame acts as the main content area router-view wrapper
</script>

<style scoped lang="scss">
.body-frame {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
