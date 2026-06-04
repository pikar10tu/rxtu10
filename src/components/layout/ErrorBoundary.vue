<template>
  <slot v-if="!err" />
  <div v-else class="eb">
    <div class="eb-emoji">😵‍💫</div>
    <div class="eb-title">อุ๊ปส์ หน้านี้มีปัญหา</div>
    <div class="eb-msg">เกิดข้อผิดพลาดบางอย่าง — ข้อมูลของคุณยังปลอดภัย ลองใหม่หรือโหลดหน้าใหม่ได้เลย</div>
    <div class="eb-actions">
      <button class="eb-btn" @click="reset">ลองใหม่</button>
      <button class="eb-btn ghost" @click="reload">โหลดหน้าใหม่</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured, watch } from 'vue'
import { useRoute } from 'vue-router'

// Catch render/lifecycle errors from any descendant so one broken component
// shows a local fallback instead of unmounting (white-screening) the whole app.
const err = ref(null)
onErrorCaptured((e) => {
  console.error('[ErrorBoundary]', e)
  err.value = e
  return false // stop the error from propagating up and crashing the app
})

// auto-recover when the user navigates elsewhere
const route = useRoute()
watch(() => route.fullPath, () => { err.value = null })

function reset() { err.value = null }
function reload() { window.location.reload() }
</script>

<style scoped>
.eb { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 24px; gap: 8px; min-height: 50vh; }
.eb-emoji { font-size: 2.6rem; }
.eb-title { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
.eb-msg { font-size: .8rem; color: rgba(0,0,0,.5); max-width: 300px; line-height: 1.6; }
.eb-actions { display: flex; gap: 8px; margin-top: 14px; }
.eb-btn { border: none; border-radius: 11px; padding: 10px 18px; font-family: inherit; font-size: .82rem; font-weight: 800; color: #fff; background: linear-gradient(135deg,#4f46e5,#6366f1); cursor: pointer; }
.eb-btn.ghost { background: #fff; color: #4f46e5; border: 1px solid rgba(99,102,241,.35); }
</style>
