<template>
  <PageLayout>
    <!-- Header Actions -->
    <template #actions>
      <MciHeader
        v-model="searchQuery"
        v-model:show-only-used="showOnlyUsed"
        @openSource="openMciSource"
      />
    </template>

    <!-- Content (Master-Detail) -->
    <div class="main-area">
      <!-- Left Panel: MCI Master List -->
      <MciMasterSection
        :filtered-mcis="filteredMcis"
        :selected-mci="selectedMci"
        :mci-map="mciMap"
        @select="selectMci"
      />

      <!-- Right Panel: MCI Details -->
      <MciDetailSection
        :selected-mci="selectedMci"
        :selected-mci-data="selectedMciData"
        @goToApi="goToApiPage"
        @openSvc="openSvcGitlab"
      />
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useMciStore } from '@domain/store/useMciStore';
import { CONFIG } from '@common/config/config.js';
import { openGitlabSource } from '@common/utils/gitlabUtils.js';
import PageLayout from '@common/compo/layout/PageLayout.vue';
import MciHeader from './section/MciHeader.vue';
import MciMasterSection from './section/MciMasterSection.vue';
import MciDetailSection from './section/MciDetailSection.vue';

const mciV2Store = useMciStore();
const router = useRouter();

const { mciMap, mcis } = storeToRefs(mciV2Store);

const selectedMci = ref(null);
const searchQuery = ref('');
const showOnlyUsed = ref(false);

// Reactive selectedMciData
const selectedMciData = computed(() => {
  if (!selectedMci.value || !mciMap.value[selectedMci.value]) return null;
  return mciMap.value[selectedMci.value];
});

// Select MCI and trigger store fetch
const selectMci = (mci) => {
  selectedMci.value = mci;
  mciV2Store.fetchMciDetail(mci);
};

// Route to API Flow page with target endpoint URL
const goToApiPage = (url) => {
  if (!url) return;
  router.push({ path: '/api-flow', query: { q: url } });
};

// Open GitLab source for service method line
const openSvcGitlab = (svcFile, line) => {
  openGitlabSource(svcFile, line, 'java');
};

// Open source dictionary file in repo
const openMciSource = () => {
  const targetUrl = CONFIG.REPO_CONFIG?.RAW_META_URL || 'https://github.com/nicepig7/fileTrace';
  window.open(targetUrl, '_blank');
};

// Sync selection to local storage
watch(selectedMci, (newVal) => {
  if (newVal) {
    localStorage.setItem('lastSelectedMciV2', newVal);
  }
});

// Filter MCI list based on search term and toggle
const filteredMcis = computed(() => {
  let list = mcis.value;
  
  // 1. Filter by API presence if toggle is ON
  if (showOnlyUsed.value) {
    list = list.filter(m => {
      const counts = mciMap.value[m]?.apiCounts;
      return counts && (counts.inbound > 0 || counts.outbound > 0);
    });
  }

  // 2. Filter by search query
  if (!searchQuery.value) return list;
  
  const q = searchQuery.value.toLowerCase();
  return list.filter(m => {
    if (m.toLowerCase().includes(q)) return true;
    const info = mciMap.value[m]?.info;
    if (info) {
      if (info.asisId?.toLowerCase().includes(q)) return true;
      if (info.nameKr?.toLowerCase().includes(q)) return true;
      if (info.nameEn?.toLowerCase().includes(q)) return true;
      if (info.nameVi?.toLowerCase().includes(q)) return true;
    }
    return false;
  });
});

// Keyboard navigation (ArrowUp / ArrowDown)
const handleKeydown = (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (filteredMcis.value.length === 0) return;
    
    e.preventDefault();
    
    if (!selectedMci.value) {
      selectMci(filteredMcis.value[0]);
    } else {
      const currentIndex = filteredMcis.value.indexOf(selectedMci.value);
      let nextIndex = currentIndex + (e.key === 'ArrowDown' ? 1 : -1);
      
      if (nextIndex < 0) nextIndex = 0;
      else if (nextIndex >= filteredMcis.value.length) nextIndex = filteredMcis.value.length - 1;
      
      selectMci(filteredMcis.value[nextIndex]);
    }
    
    nextTick(() => {
      const selectedBtn = document.querySelector(`button[data-mci-id="${selectedMci.value}"]`);
      if (selectedBtn) {
        selectedBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }
};

onMounted(async () => {
  await mciV2Store.init();
  
  const savedMci = localStorage.getItem('lastSelectedMciV2');
  if (savedMci && mcis.value.includes(savedMci)) {
    selectMci(savedMci);
    nextTick(() => {
      const selectedBtn = document.querySelector(`button[data-mci-id="${savedMci}"]`);
      if (selectedBtn) {
        selectedBtn.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    });
  }
  
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped lang="scss">
.main-area {
  flex: 1 1 0%;
  display: flex;
  overflow: hidden;
  width: 100%;
}
</style>
