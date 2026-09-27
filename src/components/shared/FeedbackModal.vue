<template>
  <!-- Teleport ไป body: #main-content stacking context, z-index สู้ #bottom-nav ไม่ได้ (ดู CLAUDE.md) -->
  <Teleport to="body">
  <div v-if="open" class="fb-ov" @click.self="close">
    <div class="fb-box">
      <div class="fb-head">
        <span><Emoji char="💡" /> ข้อเสนอแนะเพื่อพัฒนา</span>
        <button class="fb-x" @click="close">✕</button>
      </div>
      <div class="fb-cats">
        <button
          v-for="c in FB_CATS" :key="c.key"
          class="fb-cat-btn" :class="{ on: fbCat === c.key }"
          @click="fbCat = c.key"
        >{{ c.label }}</button>
      </div>
      <textarea
        v-model="fbText"
        :maxlength="LIMITS.feedback"
        class="fb-input"
        rows="4"
        :placeholder="placeholder"
      ></textarea>
      <button class="fb-send" :disabled="!fbText.trim() || fbBusy" @click="sendFeedback">
        {{ fbBusy ? 'กำลังส่ง…' : 'ส่งข้อเสนอแนะ' }}
      </button>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
// ── dev feedback → Firestore `feedback` (admin reads in Admin tab) ──
// ใช้ร่วม: หน้าฉัน + จอปิดปรับปรุง (`source` บอกว่าส่งมาจากไหน)
import { ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useEscapeKey } from '../../composables/useEscapeKey.js'
import { cleanText, LIMITS } from '../../utils/text.js'
import Emoji from './Emoji.vue'

const open = defineModel({ type: Boolean, default: false })
const props = defineProps({
  source: { type: String, default: 'me' },
  placeholder: { type: String, default: 'อยากให้เพิ่ม/แก้อะไร เล่าได้เลย เช่น ฟีเจอร์ใหม่ จุดที่ใช้งานยาก หรือบั๊กที่เจอ…' },
})

const auth = useAuthStore()
const { toast } = useToast()

const FB_CATS = [
  { key: 'idea', label: '💡 ไอเดีย' },
  { key: 'bug', label: '🐞 ปัญหา' },
  { key: 'other', label: '📝 อื่นๆ' },
]
const fbCat = ref('idea')
const fbText = ref('')
const fbBusy = ref(false)

function close() { open.value = false }
useEscapeKey(open, close)

async function sendFeedback() {
  const message = cleanText(fbText.value, LIMITS.feedback)
  if (!message || fbBusy.value) return
  fbBusy.value = true
  try {
    await addDoc(collection(db, 'feedback'), {
      category: fbCat.value,
      message,
      source: props.source,
      reporterUid: auth.currentUser?.uid || null,
      reporterName: auth.userData?.nickname || auth.userData?.name || null,
      status: 'open',
      ts: serverTimestamp(),
    })
    fbText.value = ''
    fbCat.value = 'idea'
    close()
    toast('ส่งข้อเสนอแนะแล้ว ขอบคุณมาก', 'success')
  } catch (e) {
    console.error('[feedback]', e)
    toast('ส่งไม่สำเร็จ', 'error')
  } finally {
    fbBusy.value = false
  }
}
</script>

<style scoped>
/* align-items:flex-start + overflow + box margin:auto = จัดกลางเมื่อเตี้ย, เลื่อนได้เมื่อสูงเกินจอ
   สำคัญตอนคีย์บอร์ดมือถือเด้งขึ้น (textarea) — ปุ่มส่งจะไม่จมใต้คีย์บอร์ด เลื่อนถึงได้เสมอ */
.fb-ov { position: fixed; inset: 0; z-index: 240; background: rgba(0,0,0,.5); display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 18px 18px calc(18px + env(safe-area-inset-bottom, 0px)); text-align: left; }
.fb-box { background: #fff; width: 100%; max-width: 380px; border: var(--bw) solid var(--line); border-radius: 18px; box-shadow: var(--pop-lg); padding: 16px; margin: auto 0; }
.fb-head { display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: .92rem; margin-bottom: 12px; }
.fb-x { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 40px; height: 40px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.fb-cats { display: flex; gap: 6px; margin-bottom: 10px; }
.fb-cat-btn { flex: 1; border: 1px solid rgba(0,0,0,.12); background: #fff; border-radius: 10px; padding: 8px 4px; font-family: inherit; font-size: .72rem; font-weight: 700; color: rgba(0,0,0,.5); cursor: pointer; }
.fb-cat-btn.on { background: var(--primary); border-color: var(--ink); color: #fff; }
.fb-input { width: 100%; box-sizing: border-box; border: var(--bw) solid var(--line); border-radius: 12px; padding: 10px 12px; font-family: inherit; font-size: .82rem; resize: vertical; }
.fb-input:focus { outline: none; box-shadow: var(--pop); }
.fb-send { width: 100%; margin-top: 10px; border: var(--bw) solid var(--line); border-radius: 12px; padding: 12px; font-family: inherit; font-size: .85rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; transition: transform .12s, box-shadow .12s; }
.fb-send:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.fb-send:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
</style>
