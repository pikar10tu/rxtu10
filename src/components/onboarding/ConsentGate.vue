<template>
  <div class="cg-ov">
    <div class="cg-box">
      <div class="cg-emoji"><Emoji :char="CONSENT.titleEmoji" /></div>
      <div class="cg-title">{{ CONSENT.title }}</div>
      <p class="cg-intro">{{ CONSENT.intro }}</p>
      <p class="cg-lead">{{ CONSENT.lead }}</p>

      <div class="cg-list">
        <div v-for="(it, i) in CONSENT.items" :key="i" class="cg-item">
          <span class="cg-ico"><Emoji :char="it.emoji" /></span>
          <div><b>{{ it.head }}</b> — {{ it.body }}</div>
        </div>
      </div>

      <label class="cg-check">
        <input v-model="agreed" type="checkbox" />
        <span>{{ CONSENT.checkboxLabel }}</span>
      </label>

      <button class="cg-btn" :disabled="!agreed || saving" @click="accept">
        {{ saving ? 'กำลังบันทึก…' : CONSENT.acceptLabel }} →
      </button>
      <button class="cg-logout" @click="auth.logout()">ออกจากระบบ</button>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { CONSENT } from '../../data/consent.js'
import { useToast } from '../../composables/useToast.js'

const auth = useAuthStore()
const { toast } = useToast()
const agreed = ref(false)
const saving = ref(false)

async function accept() {
  if (!agreed.value || saving.value) return
  saving.value = true
  const ok = await auth.acceptConsent()
  saving.value = false
  if (!ok) toast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง', 'error')
  // สำเร็จ → userData.consent อัปเดต → App.vue gate เลื่อนไป wizard เอง
}
</script>

<style scoped>
.cg-ov { position: fixed; inset: 0; z-index: 320; background: linear-gradient(160deg,#eef2ff,#fff); display: flex; align-items: center; justify-content: center; padding: 18px; overflow-y: auto; }
.cg-box { background:#fff; width:100%; max-width:420px; border:2px solid var(--ink); border-radius:20px; box-shadow:var(--pop-lg); padding:22px; max-height:92vh; overflow-y:auto; }
.cg-emoji { font-size:2.2rem; text-align:center; }
.cg-title { font-family:var(--font-display); font-weight:400; font-size:1.4rem; color:var(--ink); text-align:center; margin-top:4px; }
.cg-intro { font-size:.8rem; color:rgba(0,0,0,.6); line-height:1.6; margin:12px 0 8px; }
.cg-lead { font-size:.8rem; font-weight:700; color:var(--ink); margin:0 0 10px; }
.cg-list { display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
.cg-item { display:flex; gap:10px; align-items:flex-start; font-size:.78rem; line-height:1.5; }
.cg-ico { font-size:1.2rem; flex-shrink:0; }
.cg-item b { color:var(--ink); }
.cg-check { display:flex; gap:10px; align-items:center; font-size:.82rem; font-weight:700; color:var(--ink); cursor:pointer; margin-bottom:14px; }
.cg-check input { width:20px; height:20px; flex-shrink:0; }
.cg-btn { width:100%; border:2px solid var(--ink); border-radius:12px; padding:13px; font-family:inherit; font-size:.92rem; font-weight:800; color:#fff; background:var(--gold); box-shadow:var(--pop); cursor:pointer; transition:transform .12s,box-shadow .12s; }
.cg-btn:disabled { opacity:.5; cursor:not-allowed; }
.cg-btn:active:not(:disabled) { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
.cg-logout { width:100%; margin-top:10px; background:none; border:none; color:rgba(0,0,0,.45); font-size:.72rem; cursor:pointer; }
</style>
