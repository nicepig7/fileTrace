<template>
  <span 
    class="base-icon" 
    :class="iconClasses"
    :style="iconStyles"
    aria-hidden="true"
  >
    <component :is="icon" />
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * The icon component imported from @assets/icon/Icon*.vue
   */
  icon: {
    type: [Object, Function],
    required: true
  },
  /**
   * Size presets ('xs' | 'sm' | 'md' | 'lg' | 'xl') or numeric pixel value
   */
  size: {
    type: [String, Number],
    default: 'md'
  },
  /**
   * Semantic color preset or direct CSS color string
   */
  color: {
    type: String,
    default: ''
  },
  /**
   * Whether to apply continuous 360-degree rotation animation
   */
  spin: {
    type: Boolean,
    default: false
  }
});

const PRESET_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];
const PRESET_COLORS = ['primary', 'muted', 'danger', 'error', 'warning', 'success', 'white', 'inherit'];

const iconClasses = computed(() => {
  const classes = [];

  if (typeof props.size === 'string' && PRESET_SIZES.includes(props.size)) {
    classes.push(`base-icon--size-${props.size}`);
  }

  if (props.color && PRESET_COLORS.includes(props.color)) {
    classes.push(`base-icon--color-${props.color}`);
  }

  if (props.spin) {
    classes.push('base-icon--spin');
  }

  return classes;
});

const iconStyles = computed(() => {
  const styles = {};

  // Custom numeric or unit size
  if (typeof props.size === 'number' || (typeof props.size === 'string' && !PRESET_SIZES.includes(props.size))) {
    const sizeVal = typeof props.size === 'number' ? `${props.size}px` : props.size;
    styles.width = sizeVal;
    styles.height = sizeVal;
  }

  // Custom direct CSS color
  if (props.color && !PRESET_COLORS.includes(props.color)) {
    styles.color = props.color;
  }

  return styles;
});
</script>

<style scoped lang="scss">
.base-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  vertical-align: middle;
  flex-shrink: 0;

  :deep(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }

  // --- Size Presets ---
  &--size-xs {
    width: 0.875rem; // 14px
    height: 0.875rem;
  }

  &--size-sm {
    width: 1rem; // 16px
    height: 1rem;
  }

  &--size-md {
    width: 1.25rem; // 20px
    height: 1.25rem;
  }

  &--size-lg {
    width: 1.5rem; // 24px
    height: 1.5rem;
  }

  &--size-xl {
    width: 1.75rem; // 28px
    height: 1.75rem;
  }

  // --- Color Presets ---
  &--color-primary {
    color: var(--accent-brand);
  }

  &--color-muted {
    color: var(--text-muted);
  }

  &--color-danger,
  &--color-error {
    color: var(--text-danger);
  }

  &--color-warning {
    color: var(--accent-primary);
  }

  &--color-success {
    color: var(--text-accent-emerald);
  }

  &--color-white {
    color: var(--text-primary);
  }

  &--color-inherit {
    color: inherit;
  }

  // --- Spin Animation ---
  &--spin {
    animation: icon-spin 1s linear infinite;
  }
}

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
