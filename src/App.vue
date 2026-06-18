<template>
  <div id="app-root">
    <div id="ticker-text" style="display:none"></div>

    <div v-if="authStore.loading || !configLoaded" class="loading-screen">กำลังโหลด...</div>

    <!-- Launch gate (config/app.maintenance, live from Firestore — see
         composables/useAppConfig.js). While maintenance is ON, only the admin +
         academic team see the live app (academics manage the question bank);
         everyone else gets the maintenance screen. Admin flips it from the
         Admin tab — no redeploy needed. -->
    <template v-else-if="authStore.isLoggedIn && (authStore.isAcademic || !maintenance)">
      <main id="main-content"><ErrorBoundary><RouterView /></ErrorBoundary></main>

      <nav id="bottom-nav">
        <RouterLink to="/"        class="bn-item"><span class="bn-icon"><Emoji char="🏠" /></span>Home</RouterLink>
        <RouterLink to="/members" class="bn-item"><span class="bn-icon"><Emoji char="👥" /></span>Members</RouterLink>
        <RouterLink to="/play"    class="bn-item"><span class="bn-icon"><Emoji char="🎮" /></span>Play</RouterLink>
        <RouterLink to="/study"   class="bn-item"><span class="bn-icon"><Emoji char="📚" /></span>Study</RouterLink>
        <!-- นักศึกษา → ทำข้อสอบ (/quiz) · ทีมวิชาการ → จัดการคลังข้อสอบ (/questions) -->
        <RouterLink :to="authStore.isAcademic ? '/questions' : '/quiz'" class="bn-item"><span class="bn-icon"><Emoji char="📝" /></span>ข้อสอบ</RouterLink>
        <RouterLink v-if="authStore.isAdmin" to="/admin" class="bn-item"><span class="bn-icon"><Emoji char="⚙️" /></span>Admin</RouterLink>
      </nav>

      <HelpModal />
      <MigrationWelcome />
    </template>

    <MaintenanceScreen v-else />

    <ToastContainer />
    <ConfirmModal />
    <AchievementBalloon />
  </div>
</template>

<script setup>
import Emoji from './components/shared/Emoji.vue'
import { watch, onMounted } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useUsageStore } from './stores/usage.js'
import { useAppConfig } from './composables/useAppConfig.js'
import { runIntegrityCheck } from './composables/useGuard.js'
import { initAchievements } from './composables/useAchievements.js'
import ToastContainer   from './components/layout/ToastContainer.vue'
import ConfirmModal     from './components/layout/ConfirmModal.vue'
import HelpModal        from './components/help/HelpModal.vue'
import MigrationWelcome from './components/onboarding/MigrationWelcome.vue'
import MaintenanceScreen from './components/layout/MaintenanceScreen.vue'
import ErrorBoundary     from './components/layout/ErrorBoundary.vue'
import AchievementBalloon from './components/shared/AchievementBalloon.vue'

const authStore = useAuthStore()
const usage = useUsageStore()
const { maintenance, configLoaded } = useAppConfig()
initAchievements()

// rough integrity trip-wire: scan user data when it loads/changes
watch(() => authStore.userData, (d) => runIntegrityCheck(d), { immediate: true })

// flush ตัวนับ usage ครั้งเดียวตอนแอปถูกซ่อน/ปิด (มือถือ: visibilitychange เชื่อถือสุด)
onMounted(() => {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') usage.flush()
  })
  window.addEventListener('pagehide', () => usage.flush())
})
</script>

