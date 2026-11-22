<template>
  <div class="gp">
    <div class="gp-emoji"><Emoji :char="rejected ? '🙏' : '⏳'" /></div>
    <div class="gp-title">{{ rejected ? 'ยังเข้าไม่ได้ตอนนี้' : 'รอแอดมินอนุมัติแป๊บนะ' }}</div>
    <p class="gp-msg">
      {{ rejected
        ? 'ขออภัย คำขอเข้าชมยังไม่ได้รับอนุมัติ ถ้าคิดว่าผิดพลาด ทักแอดมินได้เลย'
        : 'คำขอเข้าชมของคุณส่งให้แอดมินแล้ว เดี๋ยวอนุมัติเสร็จจะเข้าเล่นได้เลย ลองเข้ามาใหม่อีกทีนะ' }}
    </p>
    <p v-if="instructor && !rejected" class="gp-note">
      <Emoji char="🩺" /> สำหรับอาจารย์: รบกวนแจ้งผู้ดูแลเว็บโดยตรงอีกทางด้วยนะครับ จะได้อนุมัติให้เร็วขึ้น
    </p>
    <button class="gp-btn" @click="auth.logout()">ออกจากระบบ</button>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
const auth = useAuthStore()
const rejected = computed(() => auth.userData?.guestStatus === 'rejected')
const instructor = computed(() => auth.userData?.instructorClaim === true)
</script>

<style scoped>
.gp { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:28px; gap:10px; background:linear-gradient(160deg,#fef3c7,#fff); }
.gp-emoji { font-size:3rem; }
.gp-title { font-size:1.4rem; font-weight:800; color:#92400e; }
.gp-msg { font-size:.86rem; color:rgba(0,0,0,.6); max-width:320px; line-height:1.6; }
.gp-note { font-size:.82rem; font-weight:700; color:#92400e; background:#fff; border:var(--bw) solid var(--line); border-radius:12px; padding:10px 14px; max-width:320px; line-height:1.6; box-shadow:var(--pop); }
.gp-btn { margin-top:12px; border:var(--bw) solid var(--line); border-radius:12px; padding:11px 22px; font-family:inherit; font-size:.88rem; font-weight:800; background:#fff; box-shadow:var(--pop); cursor:pointer; }
.gp-btn:active { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
</style>
