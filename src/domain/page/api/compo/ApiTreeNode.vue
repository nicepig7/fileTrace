<template>
  <div class="tree-node-item">
    <!-- Vertical Line -->
    <div v-if="!isLast" class="tree-line"></div>
    
    <!-- Horizontal branch line -->
    <div class="branch-line"></div>
    
    <!-- Node Content -->
    <div @click="toggle" :class="['node-content group', hasChildren ? 'is-clickable' : 'is-default']">
        
        <!-- Toggle Icon -->
        <div class="toggle-icon-wrapper">
            <BaseIcon v-if="hasChildren" :icon="IconChevronRight" size="xs" class="chevron-icon" :class="{ 'is-open': isOpen }" />
            <div v-else class="dot-icon"></div>
        </div>
        
        <!-- Type Badge -->
        <span :class="['type-badge', 'badge-' + (node.type || 'CLASS')]">
            {{ node.type || 'CLASS' }}
        </span>
        
        <!-- Label (Class.Method) -->
        <span class="node-label">
            <!-- Circular warning -->
            <span v-if="node.isCircular" class="circular-badge" title="Circular Reference Detected" style="margin-right: 4px; display: inline-flex;">
              <BaseIcon :icon="IconWarning" :size="12" style="color: var(--accent-warning, #f59e0b);" />
            </span>
            <span class="class-name"><HighlightedText :text="className" /></span>
            <span class="dot-separator">.</span>
            <a v-if="gitlabUrl && !node.isCircular" :href="gitlabUrl" target="_blank" @click.stop class="method-name-link" title="Open in GitLab">
              <span class="method-name"><HighlightedText :text="methodName" /></span>
              <BaseIcon :icon="IconGitLab" :size="12" class="link-icon" style="margin-left: 0.25rem; vertical-align: text-top; color: var(--text-disabled);" />
            </a>
            <template v-else>
              <span class="method-name"><HighlightedText :text="methodName" /></span>
            </template>
        </span>

        <!-- DBM Query Info (if any) -->
        <DbmNodeBadge v-if="node.queryName" :node="node" />

        <!-- MCI Badges (if any) -->
        <MciNodeBadge v-if="node.mciAsisId" :node="node" />
        
    </div>

    <!-- Children (Collapsible) -->
    <transition name="slide">
        <div v-show="isOpen && hasChildren" class="children-container">
            <!-- Children Tree Nodes -->
            <div v-if="node.children && node.children.length > 0 && !node.isCircular">
                <ApiTreeNode v-for="(child, idx) in node.children" :key="child.methodId || idx" :node="child" :is-last="idx === node.children.length - 1" />
            </div>
        </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconChevronRight from '@assets/icon/IconChevronRight.vue';
import IconWarning from '@assets/icon/IconWarning.vue';
import IconGitLab from '@assets/icon/IconGitLab.vue';
import DbmNodeBadge from './node/DbmNodeBadge.vue';
import MciNodeBadge from './node/MciNodeBadge.vue';
import HighlightedText from '@common/compo/text/HighlightedText.vue';
import { CONFIG } from '@common/config/config.js';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  isLast: {
    type: Boolean,
    default: false
  }
});

const isOpen = ref(true); // Default open for inner nodes

const hasChildren = computed(() => {
  return Boolean(
    props.node.children && props.node.children.length > 0
  );
});

const toggle = () => {
  if (hasChildren.value) {
    isOpen.value = !isOpen.value;
  }
};

const className = computed(() => {
  if (!props.node.className) return 'Unknown';
  const parts = props.node.className.split('.');
  return parts[parts.length - 1];
});

const methodName = computed(() => props.node.methodName || '');

const gitlabUrl = computed(() => {
  if (!props.node.className || !props.node.projectId) return null;
  
  const project = CONFIG.PROJECTS.find(p => p.id === props.node.projectId && p.type === 'ONLINE');
  if (!project || !project.gitlabBase) return null;
  
  let path = '';
  if (props.node.packageName) {
    path += props.node.packageName.replace(/\./g, '/') + '/';
  }
  path += props.node.className + '.java';
  
  let url = project.gitlabBase + path;
  
  if (props.node.lineNumber) {
      url += `#L${props.node.lineNumber}`;
  }
  
  return url;
});

</script>

<style scoped lang="scss">
.tree-node-item {
  position: relative;
  padding-left: 1.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  
  .tree-line {
    position: absolute;
    left: 0;
    top: 1rem;
    bottom: -1rem; // connect to next node
    width: 1px;
    background-color: var(--border-input);
  }

  .branch-line {
    position: absolute;
    left: 0;
    top: 1rem;
    width: 1.25rem;
    height: 1px;
    background-color: var(--border-input);
  }

  .node-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: fit-content;
    height: 2rem;
    padding: 0 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.15s;
    
    &:hover {
      background-color: var(--bg-input);
      
      .toggle-icon-wrapper {
        color: var(--text-tertiary);
      }
      
      .node-label {
        color: var(--text-primary);
      }
    }

    &.is-clickable {
      cursor: pointer;
    }

    &.is-default {
      cursor: default;
    }
  }

  .toggle-icon-wrapper {
    width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-disabled);
    transition: color 0.15s;
    
    .chevron-icon {
      transition: transform 0.2s;
      
      &.is-open {
        transform: rotate(90deg);
      }
    }
    
    .dot-icon {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 9999px;
      background-color: var(--border-input);
    }
  }

  .type-badge {
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .node-label {
    color: var(--text-tertiary);
    transition: color 0.15s;
    display: flex;
    align-items: center;

    .method-name-link {
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      
      &:hover {
        .method-name {
          text-decoration: underline;
          color: var(--accent-primary, #3b82f6);
        }
        .link-icon {
          color: var(--accent-primary, #3b82f6) !important;
        }
      }
    }

    .class-name {
      color: var(--text-class-name);
      margin-right: 0.25rem;
      transition: color 0.15s;
    }

    .dot-separator {
      color: var(--text-disabled);
    }
    
    .method-name {
      color: var(--text-method-name);
    }
  }

  .children-container {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-top: 0.125rem;
  }
}
</style>
