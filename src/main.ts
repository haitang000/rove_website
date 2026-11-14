import { createApp } from 'vue'
import './fonts.css'
import 'lenis/dist/lenis.css'
import './style.css'
import App from './App.vue'
import { initializeI18n } from './i18n'

const disposeI18n = initializeI18n()
createApp(App).mount('#app')

if (import.meta.hot) import.meta.hot.dispose(disposeI18n)
