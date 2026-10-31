import { markRaw } from 'vue';
import IconCpu from '@assets/icon/IconCpu.vue';
import IconDatabase from '@assets/icon/IconDatabase.vue';
import IconLink from '@assets/icon/IconLink.vue';

export const MENU_CONFIG = [
  {
    path: '/api-flow',
    name: 'ApiFlow',
    title: 'API Flow',
    icon: markRaw(IconCpu),
    activeKey: 'api',
  },
  {
    path: '/db-table',
    name: 'DbTable',
    title: 'DB Table',
    icon: markRaw(IconDatabase),
    activeKey: 'db',
  },
  {
    path: '/mci',
    name: 'Mci',
    title: 'MCI Interface',
    icon: markRaw(IconLink),
    activeKey: 'mci',
  },
  {
    path: '/sqlite-viewer',
    name: 'SqliteViewer',
    title: 'SQLite DB Viewer',
    icon: markRaw(IconDatabase),
    activeKey: 'sqlite',
  }
];
