<template>
  <div 
    class="tooltip-wrapper" :class="wrapperClass"
    ref="triggerRef" 
    @mouseenter="show" 
    @mouseleave="hide"
  >
    <!-- Trigger Area -->
    <slot name="trigger"></slot>
  </div>
    
  <Teleport to="body">
    <!-- Popover Content -->
    <div 
      v-if="isVisible"
      class="tooltip-popover" 
      :class="[widthClass, `is-${position}`]"
      :style="tooltipStyle"
    >
      <slot></slot>
      <!-- Arrow -->
      <div class="tooltip-arrow"></div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue';

const props = defineProps({
  widthClass: {
    type: String,
    default: 'w-64'
  },
  wrapperClass: {
    type: String,
    default: 'inline-block'
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'right', 'left'].includes(value)
  }
});

const isVisible = ref(false);
const triggerRef = ref(null);
const tooltipStyle = ref({});

const updatePosition = () => {
  if (!triggerRef.value || !isVisible.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  
  // Calculate based on current scroll position
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  
  if (props.position === 'top') {
    tooltipStyle.value = {
      top: `${rect.top + scrollY - 8}px`,
      left: `${rect.left + scrollX}px`,
      transform: 'translateY(-100%)'
    };
  } else if (props.position === 'right') {
    tooltipStyle.value = {
      top: `${rect.top + scrollY}px`,
      left: `${rect.right + scrollX + 8}px`
    };
  } else if (props.position === 'left') {
    tooltipStyle.value = {
      top: `${rect.top + scrollY}px`,
      left: `${rect.left + scrollX - 8}px`,
      transform: 'translateX(-100%)'
    };
  } else {
    tooltipStyle.value = {
      top: `${rect.bottom + scrollY + 8}px`,
      left: `${rect.left + scrollX}px`
    };
  }
};

const show = async () => {
  isVisible.value = true;
  await nextTick();
  updatePosition();
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
};

const hide = () => {
  isVisible.value = false;
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
};

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
});
</script>

<style scoped lang="scss">
.tooltip-wrapper {
  position: relative;
}

.tooltip-popover {
  position: absolute;
  z-index: 9999; /* z-[9999] */
  background-color: var(--bg-tooltip); /* bg-slate-800 */
  border: 1px solid var(--border-tooltip); /* border-slate-600 */
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); /* shadow-xl */
  padding: 0.75rem; /* p-3 */
  text-align: left; /* text-left */
  cursor: default; /* cursor-default */
  pointer-events: none; /* pointer-events-none */

  .tooltip-arrow {
    position: absolute;
    width: 0.5rem; /* w-2 */
    height: 0.5rem; /* h-2 */
    background-color: var(--bg-tooltip); /* bg-slate-800 */
    transform: rotate(45deg); /* transform rotate-45 */
    pointer-events: none; /* pointer-events-none */
  }

  &.is-top {
    .tooltip-arrow {
      left: 1rem; /* left-4 */
      bottom: -0.25rem; /* -bottom-1 */
      border-bottom: 1px solid var(--border-tooltip); /* border-b border-slate-600 */
      border-right: 1px solid var(--border-tooltip); /* border-r border-slate-600 */
    }
  }

  &.is-bottom {
    .tooltip-arrow {
      left: 1rem; /* left-4 */
      top: -0.25rem; /* -top-1 */
      border-top: 1px solid var(--border-tooltip); /* border-t border-slate-600 */
      border-left: 1px solid var(--border-tooltip); /* border-l border-slate-600 */
    }
  }

  &.is-right {
    .tooltip-arrow {
      left: -0.25rem;
      top: 1rem;
      border-bottom: 1px solid var(--border-tooltip);
      border-left: 1px solid var(--border-tooltip);
    }
  }

  &.is-left {
    .tooltip-arrow {
      right: -0.25rem;
      top: 1rem;
      border-top: 1px solid var(--border-tooltip);
      border-right: 1px solid var(--border-tooltip);
    }
  }
}
</style>
