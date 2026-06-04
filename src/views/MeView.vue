<template>
  <div class="tab-content">
    <div class="me-head">
      <button class="me-back" @click="$router.back()">‹</button>
      <span>โปรไฟล์ของฉัน</span>
    </div>

    <div v-if="!auth.isLoggedIn" class="me-empty">กรุณาเข้าสู่ระบบ</div>

    <template v-else>
      <!-- avatar -->
      <div class="me-avatar-row">
        <img class="me-avatar" :src="previewPhoto" alt="me" @error="(e) => fallbackAvatar(e, auth.userData?.nickname)" />
        <div class="me-av-actions">
          <div class="me-nick">{{ auth.userData?.nickname || 'ฉัน' }}</div>
          <button class="me-btn-sm" @click="fileEl?.click()">📷 เปลี่ยนรูป</button>
          <input ref="fileEl" type="file" accept="image/*" hidden @change="onFile" />
        </div>
      </div>

      <label class="me-label">ข้อมูลติดต่อ</label>
      <div class="me-contact">
        <div class="me-crow"><span>📞</span><input v-model="phone" :maxlength="LIMITS.contact" class="me-input" placeholder="เบอร์โทร" /></div>
        <div class="me-crow"><span>📷</span><input v-model="ig" :maxlength="LIMITS.contact" class="me-input" placeholder="Instagram" /></div>
        <div class="me-crow"><span>💬</span><input v-model="line" :maxlength="LIMITS.contact" class="me-input" placeholder="LINE ID" /></div>
      </div>

      <button class="me-save" :disabled="saving" @click="save">{{ saving ? 'กำลังบันทึก…' : '💾 บันทึก' }}</button>

      <!-- read-only stats -->
      <div class="me-stats">
        <div class="me-stat"><span>🪙</span><b>{{ (auth.userData?.coins || 0).toLocaleString() }}</b><small>เหรียญ</small></div>
        <div class="me-stat"><span>🏠</span><b>Lv.{{ auth.userData?.residence?.level || 1 }}</b><small>ที่อยู่อาศัย</small></div>
        <div class="me-stat"><span>🐾</span><b>{{ (auth.userData?.pets || []).length }}</b><small>สัตว์เลี้ยง</small></div>
      </div>
      <TagChips :member="auth.userData" class="me-tags" />

      <button class="me-feedback" @click="fbOpen = true">💡 ส่งข้อเสนอแนะ / รายงานปัญหา</button>
      <button class="me-logout" @click="auth.logout()">ออกจากระบบ</button>
    </template>

    <!-- ── feedback modal ── -->
    <div v-if="fbOpen" class="fb-ov" @click.self="fbOpen = false">
      <div class="fb-box">
        <div class="fb-head">
          <span>💡 ข้อเสนอแนะเพื่อพัฒนา</span>
          <button class="fb-x" @click="fbOpen = false">✕</button>
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
          placeholder="อยากให้เพิ่ม/แก้อะไร เล่าได้เลย เช่น ฟีเจอร์ใหม่ จุดที่ใช้งานยาก หรือบั๊กที่เจอ…"
        ></textarea>
        <button class="fb-send" :disabled="!fbText.trim() || fbBusy" @click="sendFeedback">
          {{ fbBusy ? 'กำลังส่ง…' : 'ส่งข้อเสนอแนะ' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { letterAvatar, fallbackAvatar } from '../utils/avatar.js'
import { cleanText, LIMITS } from '../utils/text.js'
import TagChips from '../components/shared/TagChips.vue'

const auth = useAuthStore()
const { toast } = useToast()

const fileEl = ref(null)
const newPhoto = ref(null)   // freshly picked (base64) before save
const phone = ref(''); const ig = ref(''); const line = ref('')
const saving = ref(false)

// populate contact form from userData (loads async)
function fill(u) {
  if (!u) return
  phone.value = u.contact?.phone || ''
  ig.value = u.contact?.ig || ''
  line.value = u.contact?.line || ''
}
watch(() => auth.userData, fill, { immediate: true })

const previewPhoto = computed(() =>
  newPhoto.value || auth.userData?.customPhoto || auth.userData?.googlePhoto ||
  letterAvatar(auth.userData?.nickname)
)

// ── dev feedback → Firestore `feedback` (admin reads in Admin tab) ──
const FB_CATS = [
  { key: 'idea', label: '💡 ไอเดีย' },
  { key: 'bug', label: '🐞 ปัญหา' },
  { key: 'other', label: '📝 อื่นๆ' },
]
const fbOpen = ref(false)
const fbCat = ref('idea')
const fbText = ref('')
const fbBusy = ref(false)

async function sendFeedback() {
  const message = cleanText(fbText.value, LIMITS.feedback)
  if (!message || fbBusy.value) return
  fbBusy.value = true
  try {
    await addDoc(collection(db, 'feedback'), {
      category: fbCat.value,
      message,
      reporterUid: auth.currentUser?.uid || null,
      reporterName: auth.userData?.nickname || auth.userData?.name || null,
      status: 'open',
      ts: serverTimestamp(),
    })
    fbText.value = ''
    fbCat.value = 'idea'
    fbOpen.value = false
    toast('ส่งข้อเสนอแนะแล้ว ขอบคุณมากครับ 🙏', 'success')
  } catch (e) {
    console.error('[feedback]', e)
    toast('ส่งไม่สำเร็จ', 'error')
  } finally {
    fbBusy.value = false
  }
}

function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const max = 256
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      newPhoto.value = c.toDataURL('image/jpeg', 0.82)
    }
    img.src = reader.result
  }
  reader.readAsDataURL(file)
}

async function save() {
  if (!auth.currentUser) return
  saving.value = true
  const patch = {
    contact: {
      phone: cleanText(phone.value, LIMITS.contact),
      ig: cleanText(ig.value, LIMITS.contact),
      line: cleanText(line.value, LIMITS.contact),
    },
  }
  if (newPhoto.value) patch.customPhoto = newPhoto.value

  auth.blockSnapshot()
  auth.setUserDataOptimistic(patch)
  try {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), patch)
    newPhoto.value = null
    toast('บันทึกโปรไฟล์แล้ว ✅', 'success')
  } catch (e) {
    console.error('[me save]', e)
    toast('บันทึกไม่สำเร็จ', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.me-head { display: flex; align-items: center; gap: 8px; font-size: 1.15rem; font-weight: 800; margin-bottom: 16px; }
.me-back { border: none; background: rgba(0,0,0,.05); width: 30px; height: 30px; border-radius: 9px; font-size: 1.2rem; cursor: pointer; line-height: 1; }
.me-empty { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; }
.me-avatar-row { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
.me-avatar { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary, #b58df1); background: #eee; }
.me-av-actions { display: flex; flex-direction: column; gap: 6px; }
.me-nick { font-size: 1rem; font-weight: 800; color: var(--text, #4a3f5e); }
.me-btn-sm { border: none; background: var(--primary-light, #f4edff); color: var(--primary, #b58df1); border-radius: 9px; padding: 7px 12px; font-family: inherit; font-size: .76rem; font-weight: 700; cursor: pointer; }
.me-btn-sm.ghost { background: rgba(0,0,0,.05); color: rgba(0,0,0,.5); }
.me-label { display: block; font-size: .72rem; font-weight: 700; color: var(--muted, #9b8fb0); margin: 14px 0 6px; }
.me-input { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--border, #efe7fb); border-radius: 11px; font-family: inherit; font-size: .85rem; background: #fff; }
.me-input:focus { outline: 2px solid #b58df188; border-color: transparent; }
.me-contact { display: flex; flex-direction: column; gap: 8px; }
.me-crow { display: flex; align-items: center; gap: 8px; }
.me-crow span { font-size: 1rem; width: 22px; text-align: center; }
.me-save { width: 100%; margin-top: 18px; border: none; border-radius: 12px; padding: 12px; font-family: inherit; font-size: .9rem; font-weight: 800; color: #fff; background: linear-gradient(135deg, #c4a5f5, #f7a8c4); cursor: pointer; }
.me-save:disabled { opacity: .6; }
.me-stats { display: flex; margin-top: 22px; background: #fff; border: 1px solid var(--border, #efe7fb); border-radius: 16px; overflow: hidden; }
.me-stat { flex: 1; text-align: center; padding: 14px 4px; border-right: 1px solid var(--border, #efe7fb); }
.me-stat:last-child { border-right: none; }
.me-stat span { font-size: 1.1rem; }
.me-stat b { display: block; font-size: 1rem; font-weight: 800; }
.me-stat small { font-size: .6rem; color: var(--muted, #9b8fb0); }
.me-tags { display: flex; justify-content: center; margin-top: 12px; }
.me-feedback { width: 100%; margin-top: 22px; border: 1px solid rgba(99,102,241,.35); background: #eef2ff; color: #4f46e5; border-radius: 11px; padding: 11px; font-family: inherit; font-size: .82rem; font-weight: 700; cursor: pointer; }
.me-feedback:active { transform: scale(.99); }
.me-logout { width: 100%; margin-top: 10px; border: 1px solid #fca5a5; background: #fff; color: #ef4444; border-radius: 11px; padding: 10px; font-family: inherit; font-size: .82rem; font-weight: 700; cursor: pointer; }

/* feedback modal */
.fb-ov { position: fixed; inset: 0; z-index: 240; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 18px; }
.fb-box { background: #fff; width: 100%; max-width: 380px; border-radius: 18px; padding: 16px; }
.fb-head { display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: .92rem; margin-bottom: 12px; }
.fb-x { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 30px; height: 30px; cursor: pointer; }
.fb-cats { display: flex; gap: 6px; margin-bottom: 10px; }
.fb-cat-btn { flex: 1; border: 1px solid rgba(0,0,0,.12); background: #fff; border-radius: 10px; padding: 8px 4px; font-family: inherit; font-size: .72rem; font-weight: 700; color: rgba(0,0,0,.5); cursor: pointer; }
.fb-cat-btn.on { background: #4f46e5; border-color: #4f46e5; color: #fff; }
.fb-input { width: 100%; box-sizing: border-box; border: 1px solid rgba(0,0,0,.12); border-radius: 12px; padding: 10px 12px; font-family: inherit; font-size: .82rem; resize: vertical; }
.fb-input:focus { outline: 2px solid #6366f1aa; border-color: transparent; }
.fb-send { width: 100%; margin-top: 10px; border: none; border-radius: 12px; padding: 12px; font-family: inherit; font-size: .85rem; font-weight: 800; color: #fff; background: linear-gradient(135deg,#4f46e5,#6366f1); cursor: pointer; }
.fb-send:disabled { background: #cbd5e1; cursor: default; }
</style>
