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

    <ToastContainer />
    <ConfirmModal />
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import ToastContainer from './components/layout/ToastContainer.vue'
import ConfirmModal   from './components/layout/ConfirmModal.vue'

const authStore = useAuthStore()
</script>
