<template>
  <div id="app-root">
    <div id="ticker-text" style="display:none"></div>

    <main id="main-content">
      <RouterView v-if="!authStore.loading" />
      <div v-else class="loading-screen">กำลังโหลด...</div>
    </main>

    <nav id="bottom-nav">
      <RouterLink to="/"        class="bn-item"><span class="bn-icon">🏠</span>Home</RouterLink>
      <RouterLink to="/members" class="bn-item"><span class="bn-icon">👥</span>Members</RouterLink>
      <RouterLink to="/play"    class="bn-item"><span class="bn-icon">🎮</span>Play</RouterLink>
      <RouterLink to="/study"   class="bn-item"><span class="bn-icon">📚</span>Study</RouterLink>
      <RouterLink v-if="authStore.isAdmin" to="/admin" class="bn-item"><span class="bn-icon">⚙️</span>Admin</RouterLink>
    </nav>

    <button
      v-if="authStore.isLoggedIn"
      class="help-fab"
      title="วิธีเล่น"
      @click="openHelp"
    >❓</button>

    <ToastContainer />
    <ConfirmModal />
    <HelpModal />
    <MigrationWelcome />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useHelp } from './composables/useHelp.js'
import { runIntegrityCheck } from './composables/useGuard.js'
import ToastContainer   from './components/layout/ToastContainer.vue'
import ConfirmModal     from './components/layout/ConfirmModal.vue'
import HelpModal        from './components/help/HelpModal.vue'
import MigrationWelcome from './components/onboarding/MigrationWelcome.vue'

const authStore = useAuthStore()
const { openHelp } = useHelp()

// rough integrity trip-wire: scan user data when it loads/changes
watch(() => authStore.userData, (d) => runIntegrityCheck(d), { immediate: true })
</script>

<style scoped>
.help-fab {
  position: fixed;
  right: 14px;
  bottom: 74px; /* sits above the bottom nav */
  z-index: 150;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, .55);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0, 0, 0, .25);
}
.help-fab:active { transform: scale(.92); }
</style>
