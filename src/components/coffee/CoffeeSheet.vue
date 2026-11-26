<!-- ☕ เลี้ยงกาแฟผู้พัฒนา (27 พ.ย. 2026) — 2 หน้า: (1) แจ้งเรื่อง → (2) บัญชี + ยอดที่โอน + ข้อความถึงผู้พัฒนา
     ส่งเข้า feedback (category 'coffee' | 'coffee-msg') → แอดมินดูเวลาแจ้ง+ยอดในแอปธนาคารแล้วกดอนุมัติ (AdminView) = จดหมายขอบคุณ
     ยอดให้เพื่อนกรอกเอง (ไม่มีขั้นต่ำ) แนะนำให้ใส่เศษสตางค์ที่ไม่ซ้ำ เพื่อเทียบในแอปธนาคารง่าย · เลี้ยงกี่ครั้งก็ได้ แจ้งทีละครั้ง
     ⚠️ ห้ามบอกเรื่องของขอบคุณในแผ่นนี้ (user: เป็นเซอร์ไพรส์ ไม่อยากล่อด้วยของแจก) -->
<template>
  <BottomSheet v-model:open="coffeeOpen" icon="☕" title="เลี้ยงกาแฟผู้พัฒนา">
    <div class="cf">
      <!-- หน้า 1: แจ้งเรื่อง -->
      <template v-if="step === 'intro'">
        <p>ขอแจ้งตามตรงว่า ไม่ได้เขียนของบในส่วนของเว็บไซต์ไว้ ตอนนี้ค่าเซิร์ฟเวอร์กับค่า AI ที่ช่วยดูแลฐานข้อมูลและคลังข้อสอบ ผู้พัฒนาออกเองอยู่</p>
        <p>ถ้าใครสะดวกและอยากช่วยให้เว็บไปต่อได้ เลี้ยงกาแฟสักแก้วก็ดีใจมากแล้ว</p>
        <p class="cf-kind">แต่เกรงใจทุกคนมากๆ เลยนะ ไม่ต้องโดเนทก็ได้จริงๆ ทุกฟีเจอร์ยังใช้ได้เหมือนเดิมทุกอย่าง ไม่มีอะไรล็อกไว้</p>
        <button class="cf-btn" @click="go('pay')">☕ เลี้ยงกาแฟ</button>
        <button class="cf-btn ghost" @click="go('msg')">💬 ส่งข้อความถึงผู้พัฒนาอย่างเดียว</button>
      </template>

      <!-- หน้า 2: บัญชี + ยอด + ข้อความ / หรือข้อความอย่างเดียว -->
      <template v-else-if="step === 'pay' || step === 'msg'">
        <button class="cf-back" @click="go('intro')">‹ กลับ</button>
        <template v-if="step === 'pay'">
          <div class="cf-pay">
            <div class="cf-row"><span class="cf-k">พร้อมเพย์</span><b class="cf-num">{{ PP_SHOW }}</b>
              <button class="cf-copy" @click="copy(PROMPTPAY_ID, 'คัดลอกเลขพร้อมเพย์แล้ว')">คัดลอก</button></div>
            <div class="cf-row"><span class="cf-k">ชื่อบัญชี</span><span>{{ PROMPTPAY_NAME }}</span></div>
          </div>
          <label class="cf-lbl" for="cf-baht">โอนไปเท่าไหร่ (บาท)</label>
          <input id="cf-baht" v-model.trim="baht" class="cf-in" type="text" inputmode="decimal" placeholder="เช่น 50.67" />
          <p class="cf-note">ใส่เศษสตางค์ที่ไม่ซ้ำใคร (เช่น 50.67) จะช่วยให้หายอดเจอไวขึ้น ยอดเท่าไหร่ก็ได้ ไม่มีขั้นต่ำ</p>
        </template>
        <label class="cf-lbl" for="cf-msg">ข้อความถึงผู้พัฒนา / เสนอฟีเจอร์{{ step === 'pay' ? ' (ไม่บังคับ)' : '' }}</label>
        <textarea id="cf-msg" v-model="msg" class="cf-in" rows="3" :maxlength="LIMITS.feedback" placeholder="อยากได้โหมด... / ขอบคุณที่ทำเว็บ..."></textarea>
        <p class="cf-note">ผู้พัฒนาอ่านเองทุกข้อความ ฟีเจอร์ที่เสนออาจต้องใช้เวลาหน่อย ถ้าเกินกำลังจริงๆ ขอโทษล่วงหน้านะ</p>
        <button v-if="step === 'pay'" class="cf-btn" :disabled="busy || !amountOk" @click="send('coffee')">โอนแล้ว แจ้งผู้พัฒนา</button>
        <button v-else class="cf-btn" :disabled="busy || !msg.trim()" @click="send('coffee-msg')">ส่งข้อความ</button>
      </template>

      <!-- เสร็จ -->
      <div v-else class="cf-done">
        <template v-if="step === 'sent-coffee'">ขอบคุณมากๆ เลยนะ ☕<br>ขอเวลาเช็คยอดสักพักนะ แล้วจะส่งจดหมายขอบคุณไปที่กล่องจดหมาย</template>
        <template v-else>ได้รับข้อความแล้ว ขอบคุณที่ทักมานะ</template>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import BottomSheet from '../shared/BottomSheet.vue'
import { useCoffee } from '../../composables/useCoffee.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { cleanText, LIMITS } from '../../utils/text.js'
import { PROMPTPAY_ID, PROMPTPAY_NAME, parseBaht } from '../../utils/supporter.js'

const { coffeeOpen } = useCoffee()
const auth = useAuthStore()
const { toast } = useToast()
const PP_SHOW = PROMPTPAY_ID.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
const step = ref('intro')   // intro → pay | msg → sent-coffee | sent-msg
const baht = ref('')
const msg = ref('')
const busy = ref(false)
const amountOk = computed(() => parseBaht(baht.value) !== null)
watch(coffeeOpen, (o) => { if (o) step.value = 'intro' })
function go(s) { step.value = s }

async function copy(text, done) {
  try { await navigator.clipboard.writeText(String(text)); toast(done, 'success') }
  catch { toast(`คัดลอกไม่ได้ พิมพ์เอง: ${text}`, 'info') }
}

async function send(category) {
  if (busy.value) return
  const message = cleanText(msg.value, LIMITS.feedback)
  const amount = parseBaht(baht.value)
  if (category === 'coffee' && amount === null) return
  if (category === 'coffee-msg' && !message) return
  busy.value = true
  try {
    await addDoc(collection(db, 'feedback'), {
      category,
      message: message || '',
      ...(category === 'coffee' ? { amount } : {}),
      source: 'coffee',
      reporterUid: auth.currentUser?.uid || null,
      reporterName: auth.userData?.nickname || auth.userData?.name || null,
      status: 'open',
      ts: serverTimestamp(),   // เวลาแจ้ง — แอดมินใช้เทียบกับเวลาเงินเข้าในแอปธนาคาร
    })
    step.value = category === 'coffee' ? 'sent-coffee' : 'sent-msg'
    msg.value = ''
    baht.value = ''
  } catch (e) {
    console.error('[coffee]', e)
    toast('ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะ', 'error')
  } finally { busy.value = false }
}
</script>

<style scoped>
.cf { display: grid; gap: 10px; padding: 2px 2px 8px; font-size: .9rem; line-height: 1.6; }
.cf p { margin: 0; }
.cf-kind { padding: 8px 10px; border-radius: 12px; background: var(--mint-light); font-size: .86rem; }
.cf-back { justify-self: start; font: inherit; font-size: .82rem; border: 0; background: none; color: var(--muted); padding: 0; cursor: pointer; }
.cf-pay { display: grid; gap: 6px; padding: 10px 12px; border-radius: 14px; background: #f6ece4; border: var(--bw) solid var(--line); }
.cf-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cf-k { color: var(--muted); font-size: .8rem; min-width: 64px; }
.cf-num { font-variant-numeric: tabular-nums; letter-spacing: .02em; }
.cf-copy { margin-left: auto; font: inherit; font-size: .78rem; font-weight: 600; border: var(--bw) solid var(--line); background: #fff; color: #8a5a3b; border-radius: 999px; padding: 3px 12px; cursor: pointer; }
.cf-lbl { font-size: .82rem; font-weight: 600; }
.cf-in { font: inherit; font-size: .9rem; width: 100%; padding: 8px 10px; border-radius: 12px; border: var(--bw) solid var(--line); box-sizing: border-box; }
textarea.cf-in { resize: vertical; }
.cf-note { color: var(--muted); font-size: .78rem; }
.cf-btn { font: inherit; font-weight: 600; border: 0; border-radius: 12px; padding: 10px; background: #8a5a3b; color: #fff; cursor: pointer; }
.cf-btn.ghost { background: #f6ece4; color: #8a5a3b; }
.cf-btn:disabled { opacity: .5; cursor: default; }
.cf-done { text-align: center; padding: 16px 10px; border-radius: 14px; background: var(--mint-light); font-weight: 500; }
</style>
