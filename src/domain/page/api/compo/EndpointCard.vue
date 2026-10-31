<template>
  <div class="endpoint-card glass-panel">
    <!-- Card Header (URL Level) -->
    <div 
      @click="$emit('toggleNode', endpoint.methodId)" 
      :class="['card-header', endpoint.isOpen ? 'is-open' : '']"
    >
      <div class="header-left">
        <span :class="['method-badge', endpoint.httpMethod === 'POST' ? 'is-post' : (endpoint.httpMethod === 'GET' ? 'is-get' : 'is-other')]">
          {{ endpoint.httpMethod || 'POST' }}
        </span>
        <span :class="['project-badge', endpoint.projectId === 'ADM' ? 'is-adm' : (endpoint.projectId === 'COR' ? 'is-cor' : 'is-default')]">
          {{ endpoint.projectId || 'MBW' }}
        </span>
        <div class="url-wrapper">
          <span class="url-text"><HighlightedText :text="endpoint.url" /></span>
        </div>
      </div>
      <div class="header-right">
        <div class="badges-wrapper">
          <!-- IN: DBM/MCI (Data Source) -->
          <div class="badge-group">
            <div class="badge-container">
              <span v-if="endpoint.hasDbm" class="data-badge is-dbm">
                <BaseIcon :icon="IconDatabase" :size="12" class="icon" />
                DBM
              </span>
              <span v-if="endpoint.hasMci" class="data-badge is-mci">
                <BaseIcon :icon="IconMci" :size="12" class="icon" />
                MCI
              </span>
              <span v-if="!endpoint.hasDbm && !endpoint.hasMci" class="data-badge is-empty">
                Empty
              </span>
            </div>
          </div>
          <!-- OUT: WEB/AOS (Client) -->
          <div class="badge-group">
            <div class="badge-container">
              <span v-if="endpoint.vueScreens && endpoint.vueScreens.length > 0" class="client-badge is-web" title="Connected WebView Screens">
                <BaseIcon :icon="IconWeb" :size="12" class="icon" />
                WEB
              </span>
              <span v-if="endpoint.aosScreens && endpoint.aosScreens.length > 0" class="client-badge is-aos" title="Connected Android Screens">
                <BaseIcon :icon="IconAndroid" :size="12" class="icon" />
                AOS
              </span>
              <span v-if="!(endpoint.vueScreens && endpoint.vueScreens.length > 0) && !(endpoint.aosScreens && endpoint.aosScreens.length > 0)" class="client-badge is-empty">
                Empty
              </span>
            </div>
          </div>
        </div>
        <div class="toggle-icon-wrapper">
          <BaseIcon :icon="IconChevronDown" size="md" color="muted" class="toggle-icon" :class="{ 'is-open': endpoint.isOpen }" />
        </div>
      </div>
    </div>
    
    <!-- Card Body (Tree Nodes) -->
    <transition name="slide">
      <div v-show="endpoint.isOpen" class="card-body">
        
        <!-- Backend Processing Section -->
        <div v-if="endpoint.treeData" class="backend-section">
          <h4 class="section-title">
            <BaseIcon :icon="IconFolder" size="sm" color="muted" class="section-icon" />
            Backend Processing Flow
          </h4>
          <div class="tree-nodes">
            <!-- 루트 노드(CTR) 자신이 트리의 시작점이므로 직접 렌더링 -->
            <ApiTreeNode :node="endpoint.treeData" :is-last="true" />
          </div>
        </div>

        <!-- Client Screen Triggers Section -->
        <div v-if="(endpoint.vueScreens && endpoint.vueScreens.length > 0) || (endpoint.aosScreens && endpoint.aosScreens.length > 0)" class="client-section">
          <hr class="divider" />
          <h4 class="section-title">
            <BaseIcon :icon="IconScreen" size="sm" color="muted" class="section-icon" />
            Client Screen Triggers
          </h4>
          <div class="screen-badges">
            <!-- WebView Screens -->
            <span v-for="screen in endpoint.vueScreens" :key="'vue-'+screen" class="screen-badge is-web">
              <BaseIcon :icon="IconWeb" size="sm" class="icon" />
              <HighlightedText :text="screen" />
            </span>
            <!-- Android Screens -->
            <span v-for="screen in endpoint.aosScreens" :key="'aos-'+screen" class="screen-badge is-aos">
              <BaseIcon :icon="IconAndroid" size="sm" class="icon" />
              <HighlightedText :text="screen" />
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import HighlightedText from '@common/compo/text/HighlightedText.vue';
import ApiTreeNode from './ApiTreeNode.vue';
import BaseIcon from '@common/compo/icon/BaseIcon.vue';
import IconChevronDown from '@assets/icon/IconChevronDown.vue';
import IconFolder from '@assets/icon/IconFolder.vue';
import IconWeb from '@assets/icon/IconWeb.vue';
import IconAndroid from '@assets/icon/IconAndroid.vue';
import IconDatabase from '@assets/icon/IconDatabase.vue';
import IconMci from '@assets/icon/IconMci.vue';
import IconScreen from '@assets/icon/IconScreen.vue';

defineProps({
  endpoint: {
    type: Object,
    required: true
  }
});

defineEmits(['toggleNode']);
</script>

<style scoped lang="scss">
.endpoint-card {
  border-radius: 0.75rem;
  transition: all 0.3s;
  
  &:hover {
    border-color: var(--border-hover);
  }

  .card-header {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 1rem 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background-color 0.15s;
    border-radius: 0.75rem;
    
    &:hover {
      background-color: var(--bg-card-header-hover);
      .url-text {
        color: var(--accent-svc);
      }
    }

    &.is-open {
      background-color: var(--bg-card-header-open);
      backdrop-filter: blur(12px);
      border-radius: 0.75rem 0.75rem 0 0;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .method-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 700;
    width: 4rem;
    text-align: center;
    
    &.is-post {
      background-color: var(--badge-post-bg);
      color: var(--text-primary);
    }
    &.is-get {
      background-color: var(--badge-get-bg);
      color: var(--text-primary);
    }
    &.is-other {
      background-color: var(--badge-other-bg);
      color: var(--text-primary);
    }
  }

  .project-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 700;
    width: 4rem;
    text-align: center;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border-width: 1px;
    border-style: solid;
    
    &.is-adm {
      background-color: var(--badge-adm-bg);
      color: var(--badge-adm-text);
      border-color: var(--badge-adm-border);
    }
    &.is-cor {
      background-color: var(--badge-cor-bg);
      color: var(--badge-cor-text);
      border-color: var(--badge-cor-border);
    }
    &.is-default {
      background-color: var(--badge-default-bg);
      color: var(--text-tertiary);
      border-color: var(--badge-default-border);
    }
  }

  .url-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .url-text {
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.15s;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .badges-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    align-items: flex-end;
  }

  .badge-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .badge-container {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 22px;
  }

  .data-badge, .client-badge {
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border-width: 1px;
    border-style: solid;

    &.is-empty {
      border-style: dashed;
      border-color: var(--border-empty);
      color: var(--text-disabled);
      font-weight: 500;
    }
  }

  .data-badge {
    &.is-dbm {
      background-color: var(--badge-dbm-bg);
      color: var(--badge-dbm-text);
      border-color: var(--badge-dbm-border);
    }
    &.is-mci {
      background-color: var(--badge-mci-bg);
      color: var(--badge-mci-text);
      border-color: var(--badge-mci-border);
    }
  }

  .client-badge {
    &.is-web {
      background-color: var(--badge-web-bg);
      color: var(--badge-web-text);
      border-color: var(--badge-web-border);
    }
    &.is-aos {
      background-color: var(--badge-aos-bg);
      color: var(--badge-aos-text);
      border-color: var(--badge-aos-border);
    }
  }

  .toggle-icon-wrapper {
    padding-left: 0.5rem;
    border-left: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    height: 100%;
  }

  .toggle-icon {
    transition: transform 0.3s;
    &.is-open {
      transform: rotate(180deg);
    }
  }

  .card-body {
    background-color: var(--bg-panel);
    border-top: 1px solid var(--border-light);
    padding: 1.25rem 1.5rem 1.5rem;
    overflow-x: auto;
    border-radius: 0 0 0.75rem 0.75rem;
  }

  .backend-section {
    margin-bottom: 0.5rem;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-tertiary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tree-nodes {
    padding-left: 0.5rem;
  }

  .client-section {
    margin-top: 2rem;
  }

  .divider {
    border-color: var(--border-light);
    margin-bottom: 1.25rem;
    border-top-width: 1px;
    border-style: solid;
  }

  .screen-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-left: 0.5rem;
  }

  .screen-badge {
    padding: 0.375rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.025em;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: background-color 0.15s;
    cursor: default;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    border-width: 1px;
    border-style: solid;

    &.is-web {
      background-color: var(--badge-web-bg);
      color: var(--badge-web-text);
      border-color: var(--badge-web-border-screen);
      
      &:hover {
        background-color: var(--badge-web-hover-bg);
      }
    }
    
    &.is-aos {
      background-color: var(--badge-aos-bg);
      color: var(--badge-aos-text);
      border-color: var(--badge-aos-border-screen);
      
      &:hover {
        background-color: var(--badge-aos-hover-bg);
      }
    }
  }
}
</style>
