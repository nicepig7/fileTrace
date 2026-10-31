/**
 * 리포트 뷰어 프론트엔드 진입점 (Vue 3 앱 초기화 및 마운트)
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './common/router/router.js'
import '@common/style/layer/layer.css'
import '@common/style/common.scss'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
