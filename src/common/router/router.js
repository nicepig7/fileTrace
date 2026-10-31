import { createRouter, createWebHashHistory } from 'vue-router';
import ApiPage from '@domain/page/api/ApiPage.vue';
import TablePage from '@domain/page/table/TablePage.vue';
import MciPage from '@domain/page/mci/MciPage.vue';
import SqliteViewerPage from '@domain/page/sqlite/SqliteViewerPage.vue';
import { MENU_CONFIG } from '@common/config/menuConfig.js';

const componentMap = {
  ApiFlow: ApiPage,
  DbTable: TablePage,
  Mci: MciPage,
  SqliteViewer: SqliteViewerPage,
};

const routes = [
  {
    path: '/',
    redirect: '/api-flow'
  },
  ...MENU_CONFIG.map(item => ({
    path: item.path,
    name: item.name,
    component: componentMap[item.name],
    meta: {
      title: item.title,
      icon: item.icon,
      activeKey: item.activeKey
    }
  }))
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - TraceFile`;
  }
});

export default router;
