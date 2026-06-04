import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router/index.js'
import { useAuthStore } from './stores/auth.js'
import { useMembersStore } from './stores/members.js'
import App from './App.vue'
import './style.css'

const app   = createApp(App)
const pinia = createPinia()

// ── global safety net: never swallow errors silently ──
app.config.errorHandler = (err, _instance, info) => {
  console.error('[vue:error]', info, err)
}
window.addEventListener('unhandledrejection', (e) => {
  console.error('[unhandledrejection]', e.reason)
})
window.addEventListener('error', (e) => {
  console.error('[window:error]', e.error || e.message)
})

app.use(pinia)
app.use(router)

// Initialise auth listener & static student list
const authStore    = useAuthStore()
const membersStore = useMembersStore()
authStore.init()
membersStore.initStudents()

app.mount('#app')
