<template>
  <div class="tab-content">
    <div class="page-title me-pagetitle"><Emoji char="👤" /> ฉัน</div>

    <div v-if="!auth.isLoggedIn" class="me-empty">กรุณาเข้าสู่ระบบ</div>

    <template v-else>
      <!-- การ์ดโปรไฟล์: พื้นย้อมสีกรอบบ้าน (frameColor ของเลเวล) · ชื่อบ้าน · ทีมเฝ้าบ้าน · ตัวเลขหลัก -->
      <section class="me-card" :class="{ 'me-darkbg': myBg?.dark }" :style="{ '--tier': tier.frameColor }">
      <CosBg :id="myCos.g" />
      <div class="me-avatar-row">
        <CosFrame :id="myCos.f">
          <img class="me-avatar" :src="previewPhoto" alt="me" referrerpolicy="no-referrer" @error="(e) => fallbackAvatar(e, auth.userData?.nickname)" />
        </CosFrame>
        <div class="me-av-actions">
          <div class="me-nick"><CosName :name="auth.userData?.nickname || 'ฉัน'" :cos="myCos" /></div>
          <RouterLink to="/shop?tab=style" class="me-shoplink">🎀 ตกแต่ง</RouterLink>
          <div class="me-home"><Emoji :char="tier.art" /> {{ tier.tierName }} · Lv.{{ tier.level }}</div>
          <button class="me-title" :class="{ empty: !auth.userData?.equipTitle }" @click="tab = 'ach'">
            {{ auth.userData?.equipTitle ? '🎖️ ' + titleLabel : '🎖️ ยังไม่ได้เลือกฉายา — แตะเพื่อเลือก' }}
          </button>
          <button class="me-btn-sm" @click="fileEl?.click()"><Emoji char="📷" /> เปลี่ยนรูป</button>
          <input ref="fileEl" type="file" accept="image/*" hidden @change="onFile" />
          <!-- ปุ่มบันทึกต้องอยู่ตรงนี้ ไม่ใช่ในกล่อง "ข้อมูลติดต่อ" ที่พับอยู่ —
               เดิมเลือกรูปแล้วเห็นรูปเปลี่ยนบนจอ แต่หาปุ่มบันทึกไม่เจอ ⇒ รีเฟรชแล้วรูปเด้งกลับ -->
          <div v-if="newPhoto" class="me-photo-save">
            <button class="me-btn-sm on" :disabled="saving" @click="save">
              {{ saving ? 'กำลังบันทึก…' : '💾 บันทึกรูปนี้' }}
            </button>
            <button class="me-btn-sm ghost" :disabled="saving" @click="cancelPhoto">ยกเลิก</button>
          </div>
        </div>
      </div>

      <div v-if="guard.length" class="me-guard">
        <span class="me-guard-cap">ทีมเฝ้าบ้าน</span>
        <span v-for="(g, i) in guard" :key="i" class="me-guard-pet"><Emoji :char="g" /></span>
      </div>

      <div class="me-stats">
        <div class="me-stat"><span><Emoji char="🪙" /></span><b>{{ (auth.userData?.coins || 0).toLocaleString() }}</b><small>เหรียญ</small></div>
        <div class="me-stat"><span><Emoji char="🐾" /></span><b>{{ (auth.userData?.pets || []).length }}</b><small>สัตว์เลี้ยง</small></div>
        <div class="me-stat"><span><Emoji char="🏅" /></span><b>{{ auth.userData?.achievementCount || 0 }}</b><small>ความสำเร็จ</small></div>
        <div class="me-stat"><span><Emoji char="⚔️" /></span><b>{{ (auth.userData?.pvp?.rating || 1000).toLocaleString() }}</b><small>แต้มประลอง</small></div>
      </div>
      <TagChips :member="auth.userData" class="me-tags" />
      </section>

      <!-- แท็บ: ประวัติการต่อสู้ (รวมท้าสู้กระชับมิตร) · ข่าวรุ่น · ความสำเร็จ -->
      <div class="me-tabs" role="tablist">
        <button v-for="t in TABS" :key="t.k" class="me-tab" :class="{ on: tab === t.k }" role="tab" :aria-selected="tab === t.k" @click="tab = t.k">
          <Emoji :char="t.icon" /> {{ t.label }}
        </button>
      </div>
      <PvpHistory v-if="tab === 'fight'" start-open class="me-panel" @open="openProfile" />
      <NewsBoard v-else-if="tab === 'news'" start-open class="me-panel" />
      <template v-else>
        <p class="me-ach-hint">แตะความสำเร็จเพื่อใช้เป็นฉายา หรือปักขึ้นตู้โชว์ (ได้ 3 อัน) ให้เพื่อนเห็นในหน้าโปรไฟล์</p>
        <AchievementGrid :uid="auth.currentUser?.uid" owner class="me-panel" />
      </template>
      <ProfileModal :member="profileOf" @close="profileOf = null" />

      <RouterLink to="/quiz?view=history" class="me-link"><Emoji char="📊" /> ประวัติการทำข้อสอบ</RouterLink>
      <RouterLink to="/fun-facts" class="me-link"><Emoji char="🌐" /> สถิติรวมทั้งเว็บ</RouterLink>
      <!-- เปิด/ปิดเสียง — จำในเครื่องนี้ (localStorage) ไม่แตะ Firestore -->
      <button class="me-link me-sound" data-sfx="none" :aria-pressed="soundOn" @click="toggleSound">
        <Emoji :char="soundOn ? '🔊' : '🔇'" /> เสียงในเว็บ
        <span class="me-sound-state">{{ soundOn ? 'เปิดอยู่' : 'ปิดอยู่' }}</span>
      </button>

      <!-- ข้อมูลติดต่อ (งานธุรการ → พับเก็บล่าง) -->
      <details class="me-contact-fold">
        <summary><Emoji char="📞" /> ข้อมูลติดต่อ</summary>
        <div class="me-contact">
          <div class="me-crow"><span><Emoji char="📞" /></span><input v-model="phone" :maxlength="LIMITS.contact" class="me-input" placeholder="เบอร์โทร" /></div>
          <div class="me-crow"><span><Emoji char="📷" /></span><input v-model="ig" :maxlength="LIMITS.contact" class="me-input" placeholder="Instagram" /></div>
          <div class="me-crow"><span><Emoji char="💬" /></span><input v-model="line" :maxlength="LIMITS.contact" class="me-input" placeholder="LINE ID" /></div>
        </div>
        <button class="me-save" :disabled="saving" @click="save">{{ saving ? 'กำลังบันทึก…' : '💾 บันทึก' }}</button>
      </details>

      <button class="me-feedback" @click="fbOpen = true"><Emoji char="💡" /> ส่งข้อเสนอแนะ / รายงานปัญหา</button>
      <button class="me-logout" @click="auth.logout()">ออกจากระบบ</button>
    </template>

    <!-- ── feedback modal ── — Teleport ไป body: #main-content stacking context, z-index สู้ #bottom-nav ไม่ได้ (ดู CLAUDE.md) -->
    <Teleport to="body">
    <div v-if="fbOpen" class="fb-ov" @click.self="fbOpen = false">
      <div class="fb-box">
        <div class="fb-head">
          <span><Emoji char="💡" /> ข้อเสนอแนะเพื่อพัฒนา</span>
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
    </Teleport>
  </div>
</template>

<script setup>
import { useEscapeKey } from '../composables/useEscapeKey.js'
import Emoji from '../components/shared/Emoji.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { avatarUrl, fallbackAvatar } from '../utils/avatar.js'
import { makePhotoMini } from '../utils/photo.js'
import { useRosterSync } from '../composables/useRosterSync.js'
import { cleanText, LIMITS } from '../utils/text.js'
import TagChips from '../components/shared/TagChips.vue'
import AchievementGrid from '../components/shared/AchievementGrid.vue'
import PvpHistory from '../components/battle/PvpHistory.vue'
import NewsBoard from '../components/home/NewsBoard.vue'
import ProfileModal from '../components/members/ProfileModal.vue'
import { useMembersStore } from '../stores/members.js'
import { getTier } from '../data/residence.js'
import { getPetDef } from '../data/index.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import { toMember } from '../utils/roster.js'
import CosFrame from '../components/cosmetics/CosFrame.vue'
import CosName from '../components/cosmetics/CosName.vue'
import CosBg from '../components/cosmetics/CosBg.vue'
import { cosOf } from '../utils/cosmetics.js'
import { getCosmetic } from '../data/cosmetics.js'
import { getAchievement } from '../data/achievements.js'
import { achievementTitle } from '../utils/achievements.js'
import { sfx, sfxOn, setSfxOn } from '../utils/sfx.js'

const auth = useAuthStore()
const members = useMembersStore()

// ── การ์ดโปรไฟล์ ──
const tier = computed(() => getTier(auth.userData?.residence?.level || 1))
const myCos = computed(() => cosOf(auth.userData))
const myBg = computed(() => getCosmetic(myCos.value.g))
const guard = computed(() => resolveBattleTeam(auth.userData?.activePets, auth.userData?.pets)
  .map(p => getPetDef(p.id)?.emoji).filter(Boolean))

// ── แท็บ ── (ประวัติต่อสู้อ่าน roster ที่ต้องโหลดเอง — หน้านี้เข้าตรงได้โดยไม่ผ่านหน้าที่โหลดให้)
const TABS = [
  { k: 'fight', icon: '⚔️', label: 'ประวัติต่อสู้' },
  { k: 'news', icon: '📢', label: 'ข่าวรุ่น' },
  { k: 'ach', icon: '🏅', label: 'ความสำเร็จ' },
]
const tab = ref('fight')
// ชื่อฉายา: docId = achId หรือ achId__date → แปลงกลับเป็นชื่อที่อ่านได้โดยไม่ต้องโหลด subcollection
const titleLabel = computed(() => {
  const id = auth.userData?.equipTitle || ''
  const [achId, date] = id.split('__')
  const def = getAchievement(achId)
  return def ? achievementTitle(def, date || null) : ''
})
onMounted(() => { if (!members.rosterReady) members.loadRoster() })

// กดชื่อในประวัติ → เปิดโปรไฟล์คนนั้น (มีปุ่มท้าสู้ในนั้นอยู่แล้ว = ท้ากลับ)
const profileOf = ref(null)
function openProfile(uid) {
  const row = members.rosterRows?.[uid]
  if (row) profileOf.value = toMember(uid, row)
}
const soundOn = ref(sfxOn())
function toggleSound() {
  setSfxOn(!soundOn.value); soundOn.value = sfxOn()
  sfx('coin')   // เปิดแล้วได้ยินทันทีว่าเสียงมา (ปิดอยู่ sfx เงียบเอง)
}
const { toast } = useToast()
const { syncRosterRow } = useRosterSync()

const fileEl = ref(null)
const newPhoto = ref(null)      // freshly picked (base64) before save
const newPhotoMini = ref(null)  // ตัวจิ๋วของรูปเดียวกัน — ตัวที่จะไปโผล่หน้าเพื่อน/หอคอย
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
  newPhoto.value || avatarUrl(auth.userData, auth.userData?.nickname)
)

// ── dev feedback → Firestore `feedback` (admin reads in Admin tab) ──
const FB_CATS = [
  { key: 'idea', label: '💡 ไอเดีย' },
  { key: 'bug', label: '🐞 ปัญหา' },
  { key: 'other', label: '📝 อื่นๆ' },
]
const fbOpen = ref(false)
useEscapeKey(fbOpen, () => { fbOpen.value = false })
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
    toast('ส่งข้อเสนอแนะแล้ว ขอบคุณมาก', 'success')
  } catch (e) {
    console.error('[feedback]', e)
    toast('ส่งไม่สำเร็จ', 'error')
  } finally {
    fbBusy.value = false
  }
}

// ── Backfill: คนที่อัปรูปไว้ก่อนมีฟิลด์ photoMini ──
// ตัวเต็มอยู่ใน doc อยู่แล้ว แค่ไม่เคยมีตัวจิ๋ว ⇒ เพื่อนเลยเห็นเป็นตัวอักษรย่อมาตลอด
// ย่อจากตัวเต็มในเครื่องแล้วเขียนกลับครั้งเดียว — ไม่ต้องให้เจ้าตัวอัปรูปใหม่
// ทำครั้งเดียวต่อการเปิดหน้า (รูปที่ย่อยังไงก็ไม่ลอดเพดานจะได้ไม่วนเขียนรัวๆ)
let backfilled = false
async function backfillMini() {
  const u = auth.userData
  if (backfilled || !u || !u.customPhoto || u.photoMini) return
  backfilled = true
  const mini = await makePhotoMini(u.customPhoto)
  if (!mini) return
  if (await auth.patchUser({ photoMini: mini })) syncRosterRow()
}
onMounted(backfillMini)
watch(() => auth.userData?.customPhoto, backfillMini)

function cancelPhoto() {
  newPhoto.value = null
  newPhotoMini.value = null
  if (fileEl.value) fileEl.value.value = ''   // เลือกไฟล์เดิมซ้ำต้องยิง change ได้อีก
}

function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  // ไฟล์รูปที่เบราว์เซอร์ถอดรหัสไม่ได้ (เช่น HEIC จากไอโฟนบางรุ่น) เดิมเงียบสนิท
  // ไม่มีอะไรขึ้นบนจอเลย ⇒ ผู้ใช้อ่านว่า "ปุ่มเสีย"
  reader.onerror = () => toast('อ่านไฟล์รูปไม่ได้ ลองเลือกรูปอื่น', 'error')
  reader.onload = () => {
    const img = new Image()
    img.onerror = () => toast('ไฟล์นี้ไม่ใช่รูปที่เปิดได้ ลองบันทึกเป็น JPG/PNG ก่อน', 'error')
    img.onload = () => {
      const max = 256
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      const full = c.toDataURL('image/jpeg', 0.82)
      newPhoto.value = full
      // ตัวจิ๋วสำหรับแถว roster — ตัวเต็มใหญ่เกินกว่าที่ทั้งรุ่นจะโหลดไหว (utils/photo.js)
      makePhotoMini(full).then((mini) => { newPhotoMini.value = mini })
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
  if (newPhoto.value) {
    patch.customPhoto = newPhoto.value
    // เขียนคู่กันเสมอ — ตัวจิ๋วคือตัวเดียวที่เพื่อนจะได้เห็นในตารางสมาชิก/หอคอย
    patch.photoMini = newPhotoMini.value ?? await makePhotoMini(newPhoto.value)
  }

  auth.blockSnapshot()
  auth.setUserDataOptimistic(patch)
  try {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), patch)
    cancelPhoto()   // ล้าง input ด้วย ไม่งั้นเลือกไฟล์เดิมซ้ำจะไม่ยิง change
    syncRosterRow()  // แถว roster ถือรูปจิ๋วอยู่ → เปลี่ยนรูปแล้วเพื่อนต้องเห็นทันที
    toast('บันทึกโปรไฟล์แล้ว', 'success')
  } catch (e) {
    console.error('[me save]', e)
    toast('บันทึกไม่สำเร็จ', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.me-pagetitle { margin-bottom: 16px; }
.me-empty { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; }
.me-card > :not(.cz-bgl) { position: relative; z-index: 1; }
.me-card.me-darkbg .me-nick, .me-card.me-darkbg .me-home, .me-card.me-darkbg .me-guard { color: #fff; }
.me-shoplink { display: inline-block; font-size: .72rem; font-weight: 700; color: var(--primary-dark); text-decoration: none; margin: 2px 0 4px; }
.me-card { position: relative; padding: 16px 14px 14px; border-radius: 22px; box-shadow: var(--pop);
  border: var(--bw) solid var(--line); overflow: hidden;
  background: linear-gradient(150deg, color-mix(in srgb, var(--tier) 26%, #fff) 0%, #ffffff 58%, var(--primary-light) 100%); }
.me-avatar-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.me-home { font-size: .76rem; font-weight: 700; color: var(--muted); margin: 2px 0 6px; }
.me-guard { display: flex; align-items: center; gap: 6px; font-size: .74rem; font-weight: 700; color: var(--muted); }
.me-guard-cap { margin-right: 2px; }
.me-guard-pet { width: 34px; height: 34px; display: grid; place-items: center; font-size: 1.25rem; background: rgba(255,255,255,.8); border: var(--bw) solid var(--line); border-radius: 10px; }
.me-tabs { display: flex; gap: 6px; margin: 16px 0 0; background: var(--primary-light); padding: 4px; border-radius: 14px; }
.me-tab { flex: 1; font: inherit; font-size: .78rem; font-weight: 700; color: var(--muted); background: transparent; border: 0; border-radius: 10px; padding: 8px 2px; cursor: pointer; }
.me-tab.on { background: var(--surface); color: var(--primary-dark); box-shadow: 0 1px 3px rgba(43,53,80,.14); }
.me-panel { margin-top: 10px; }
.me-title { font: inherit; font-size: .74rem; font-weight: 800; color: #a23b6c; background: var(--accent-light); border: 1px solid var(--accent); border-radius: 999px; padding: 2px 10px; cursor: pointer; margin-bottom: 6px; max-width: 100%; text-align: left; }
.me-title.empty { color: var(--muted); background: rgba(255,255,255,.7); border-style: dashed; border-color: var(--line); font-weight: 600; }
.me-ach-hint { font-size: .72rem; color: var(--muted); margin: 10px 2px 0; line-height: 1.5; }
.me-avatar { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: var(--bw) solid var(--line); background: #eee; box-shadow: var(--pop); }
.me-av-actions { display: flex; flex-direction: column; gap: 6px; }
.me-nick { font-size: 1rem; font-weight: 800; color: var(--text, #4a3f5e); }
.me-btn-sm { border: none; background: var(--primary-light, #f4edff); color: var(--primary, #b58df1); border-radius: 9px; padding: 7px 12px; font-family: inherit; font-size: .76rem; font-weight: 700; cursor: pointer; }
.me-btn-sm.ghost { background: rgba(0,0,0,.05); color: rgba(0,0,0,.5); }
.me-btn-sm.on { background: var(--primary, #b58df1); color: #fff; }
.me-btn-sm:disabled { opacity: .6; cursor: default; }
.me-photo-save { display: flex; gap: 6px; }
.me-input { width: 100%; box-sizing: border-box; padding: 10px 12px; border: var(--bw) solid var(--line); border-radius: 11px; font-family: inherit; font-size: .85rem; background: #fff; }
.me-input:focus { outline: none; box-shadow: var(--pop); }
.me-contact { display: flex; flex-direction: column; gap: 8px; }
.me-crow { display: flex; align-items: center; gap: 8px; }
.me-crow span { font-size: 1rem; width: 22px; text-align: center; }
.me-save { width: 100%; margin-top: 18px; border: var(--bw) solid var(--line); border-radius: 12px; padding: 12px; font-family: inherit; font-size: .9rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; transition: transform .12s, box-shadow .12s; }
.me-save:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.me-save:disabled { opacity: .6; box-shadow: none; }
.me-contact-fold { margin: 14px 0; border: var(--bw) solid var(--line); border-radius: 14px; box-shadow: var(--pop); background: #fff; padding: 10px 12px; }
.me-contact-fold summary { font-weight: 800; font-size: .85rem; color: var(--ink); cursor: pointer; list-style: none; }
.me-contact-fold summary::-webkit-details-marker { display: none; }
.me-contact-fold[open] summary { margin-bottom: 10px; }
.me-stats { display: flex; margin-top: 12px; background: rgba(255,255,255,.85); border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); overflow: hidden; }
.me-stat { flex: 1; text-align: center; padding: 14px 4px; border-right: 1px solid var(--border, #efe7fb); }
.me-stat:last-child { border-right: none; }
.me-stat span { font-size: 1.1rem; }
.me-stat b { display: block; font-size: 1rem; font-weight: 800; }
.me-stat small { font-size: .7rem; color: var(--muted, #9b8fb0); }
.me-tags { display: flex; justify-content: center; margin-top: 12px; }
.me-sound { width: 100%; font-family: inherit; cursor: pointer; text-align: left; }
.me-sound-state { margin-left: auto; font-size: .75rem; color: #64748b; }
.me-link { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border: var(--bw) solid var(--line); border-radius: 14px; background: #fff; box-shadow: var(--pop); font-weight: 700; font-size: .85rem; color: var(--ink); text-decoration: none; margin-top: 12px; }
.me-link:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.me-feedback { width: 100%; margin-top: 22px; border: var(--bw) solid var(--line); background: var(--primary-light); color: var(--primary); border-radius: 11px; padding: 11px; font-family: inherit; font-size: .82rem; font-weight: 800; cursor: pointer; box-shadow: var(--pop); transition: transform .12s, box-shadow .12s; }
.me-feedback:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.me-logout { width: 100%; margin-top: 10px; border: var(--bw) solid var(--line); background: #fff; color: var(--accent); border-radius: 11px; padding: 10px; font-family: inherit; font-size: .82rem; font-weight: 800; cursor: pointer; box-shadow: var(--pop); transition: transform .12s, box-shadow .12s; }
.me-logout:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }

/* feedback modal */
/* align-items:flex-start + overflow + box margin:auto = จัดกลางเมื่อเตี้ย, เลื่อนได้เมื่อสูงเกินจอ
   สำคัญตอนคีย์บอร์ดมือถือเด้งขึ้น (textarea) — ปุ่มส่งจะไม่จมใต้คีย์บอร์ด เลื่อนถึงได้เสมอ */
.fb-ov { position: fixed; inset: 0; z-index: 240; background: rgba(0,0,0,.5); display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 18px 18px calc(18px + env(safe-area-inset-bottom, 0px)); }
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
