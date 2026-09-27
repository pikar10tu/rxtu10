<template>
  <div class="maint">
    <div class="maint-emoji"><Emoji char="🌀" /><Emoji char="🔧" /></div>
    <div class="maint-title">เว็บกำลังปรับปรุง</div>
    <div class="maint-msg">{{ line }}</div>

    <button v-if="!auth.isLoggedIn" class="maint-btn" @click="auth.login()">
      เข้าสู่ระบบ
    </button>
    <template v-else>
      <button class="maint-fb" @click="fbOpen = true"><Emoji char="💡" /> ระหว่างรอ ฝากข้อเสนอแนะไว้ได้นะ</button>
      <div class="maint-foot">
      เข้าสู่ระบบในชื่อ {{ auth.userData?.nickname || auth.currentUser?.email }}
      · <a href="#" @click.prevent="auth.logout()">ออกจากระบบ</a>
      </div>
    </template>

    <FeedbackModal
      v-model="fbOpen"
      source="maintenance"
      placeholder="นั่งรอประตูมิติเปิดอยู่ใช่มั้ย 😆 อยากให้เพิ่ม/แก้อะไร หรือเจอบั๊กตรงไหน เล่ามาได้เลย…"
    />
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref } from 'vue'
import FeedbackModal from '../shared/FeedbackModal.vue'
import { useAuthStore } from '../../stores/auth.js'

const auth = useAuthStore()

const LINES = [
  'ประตูมิติ Pharmaverse ปิดซ่อมชั่วคราว 🌀 เพ็ททุกตัวถูกพักไว้อีกฝั่ง เดี๋ยวเปิดแล้วจะเรียกนะ!',
  'ซอลกับลูน่ากำลังจัดวงโคจรใหม่ ☀️🌙 ขืนเข้าไปตอนนี้อาจโดนดาวเคราะห์ชนได้',
  'เภสัชกรประจำ Pharmaverse กำลังชั่งตวงผสมสูตรอัปเดตอยู่ 💊 ห้ามเขย่าขวด!',
  'หนูแฮมสเตอร์ที่ปั่นเซิร์ฟเวอร์ขอพักกินเมล็ดแป๊บนึง 🐹 เดี๋ยวกลับมาปั่นต่อ',
  'กำลังย้ายเฟอร์นิเจอร์ข้ามมิติ อย่าเพิ่งเข้ามาเดี๋ยวสะดุดสายไฟ ⚡',
]
const fbOpen = ref(false)
const line = ref(LINES[Math.floor(Math.random() * LINES.length)])
</script>

<style scoped>
.maint {
  position: fixed; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 28px; gap: 10px;
  background: linear-gradient(160deg, #fef3c7, #fff);
}
.maint-emoji { font-size: 3rem; animation: bob 2s ease-in-out infinite; }
@keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
.maint-title { font-size: 1.4rem; font-weight: 800; color: #92400e; }
.maint-msg { font-size: .9rem; color: rgba(0,0,0,.6); max-width: 320px; line-height: 1.6; }
.maint-btn {
  margin-top: 12px; border: none; border-radius: 12px; padding: 11px 22px;
  font-family: inherit; font-size: .9rem; font-weight: 800; color: #fff;
  background: linear-gradient(135deg, #f59e0b, #d97706); cursor: pointer;
}
.maint-btn:active { transform: scale(.97); }
.maint-fb {
  margin-top: 14px; border: var(--bw, 2px) solid var(--line, #2b3550); border-radius: 12px; padding: 11px 18px;
  font-family: inherit; font-size: .85rem; font-weight: 800; color: #92400e;
  background: #fff; box-shadow: var(--pop, 2px 2px 0 #2b3550); cursor: pointer;
}
.maint-fb:active { transform: translate(2px,2px); box-shadow: none; }
.maint-foot { font-size: .7rem; color: rgba(0,0,0,.45); margin-top: 14px; }
.maint-foot a { color: #b45309; }
</style>
