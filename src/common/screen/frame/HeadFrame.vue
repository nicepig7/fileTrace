<template>
  <header class="head-frame">
    <!-- Global Head Frame: can be used for global actions, profile, or breadcrumbs -->
    <!-- Currently hidden as search and specific headers are moved to the Page components -->
  </header>
</template>

<script setup>
</script>

<style scoped lang="scss">
.head-frame {
  display: none; /* hidden */
  height: 0;
  flex-shrink: 0;
  background-color: var(--bg-base);
  border-bottom: 1px solid var(--border-light);
  align-items: center;
  padding: 0 1rem;
}
</style>
