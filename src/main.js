import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router/index.js'
import { useAuthStore } from './stores/auth.js'
import { useMembersStore } from './stores/members.js'
import App from './App.vue'
import './style.css'

const app   = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialise auth listener & static student list
const authStore    = useAuthStore()
const membersStore = useMembersStore()
authStore.init()
membersStore.initStudents()

app.mount('#app')
