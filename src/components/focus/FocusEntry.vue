<!-- 🎯 ทางเข้าโหมดโฟกัส — ทดลองหลายแบบให้ user เลือก (22 พ.ย. 2026 · แอดมินเห็นคนเดียว)
     A = การ์ดใหญ่บนสุดหน้าเตรียมสอบ · B = แบนเนอร์บางในแถวเดียวกับข้อสอบประจำวัน · C = ปุ่มลอยมุมขวาล่าง
     H = แถบบนหน้าแรก (ขึ้นเฉพาะเมื่อมีเพื่อนในห้อง)
     จำนวน/ชื่อคนในห้อง = RTDB focus/presence (useFocusPeople) -->
<template>
  <RouterLink v-if="variant === 'A'" to="/focus" class="fe-a">
    <span class="fe-a-top"><b>🎯 Co-working space</b><small>ห้องอ่านหนังสือกับเพื่อน</small><span class="fe-go">{{ fm.state.active ? 'กลับเข้าห้อง' : 'เข้าห้อง' }} →</span></span>
    <span class="fe-count">{{ names.length ? `🟢 ${names.length} คนอยู่ในห้อง` : 'ห้องว่างอยู่' }} · <span class="fe-sub">อ่านหนังสือเพื่อสร้างรายได้</span></span>
  </RouterLink>

  <RouterLink v-else-if="variant === 'B'" to="/focus" class="fe-b">
    <span class="fe-b-em">🎯</span>
    <span class="fe-b-t"><b>Co-working space</b><small>{{ names.length }} คนอยู่ในห้อง · ได้ +{{ house }}/วิ</small></span>
    <span class="fe-b-live" aria-hidden="true"></span>
  </RouterLink>

  <Teleport v-else-if="variant === 'C' && !fm.state.active" to="body">
    <RouterLink to="/focus" class="fe-c" aria-label="เข้า Co-working space">🎯<span>{{ names.length }}</span></RouterLink>
  </Teleport>

  <RouterLink v-else-if="variant === 'H' && names.length" to="/focus" class="fe-h">
    📚 <b>{{ names.slice(0, 2).join(', ') }}</b>{{ names.length > 2 ? ` และอีก ${names.length - 2} คน` : '' }} กำลังโฟกัสอยู่ · <u>ไปนั่งด้วย</u>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { useFocusMode } from '../../composables/useFocusMode.js'
import { useFocusPeople } from '../../composables/useFocusRoom.js'
import { onBeforeUnmount } from 'vue'
import { getAuth } from 'firebase/auth'
import { app } from '../../firebase/config.js'

defineProps({ variant: { type: String, default: 'A' } })
const auth = useAuthStore()
const house = computed(() => auth.userData?.residence?.level || 1)
const fm = useFocusMode(() => house.value)
// คนในห้องตอนนี้ (ทุกโซน · RTDB) — เลิกฟังตอนการ์ดหายจากจอ
const { people, stop } = useFocusPeople()
onBeforeUnmount(stop)
// ไม่นับตัวเอง (เราอยู่ในห้องแล้วไม่ต้องชวนตัวเองไปนั่ง)
const names = computed(() => people.value.filter(p => p.uid !== getAuth(app).currentUser?.uid).map(p => p.name))
const todayLine = 'อ่านหนังสือเพื่อสร้างรายได้'
</script>

<style scoped>
.fe-a { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 16px; color: #1e293b;
  background: linear-gradient(135deg, #e0f2fe, #fce7f3); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
.fe-a-top { display: flex; align-items: baseline; gap: 8px; }
.fe-a-top b { font-size: 1rem; }
.fe-a-top small { font-size: .75rem; color: #475569; }
.fe-go { margin-left: auto; font-size: .8rem; font-weight: 700; color: #fff; background: var(--primary); border-radius: 99px; padding: 3px 10px; }
.fe-count { font-size: .85rem; font-weight: 600; color: #334155; }
.fe-faces i { width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 2px solid #e0f2fe; margin-right: -6px; display: grid; place-items: center; font-style: normal; font-size: .72rem; font-weight: 700; color: #334155; }
.fe-faces em { font-style: normal; font-size: .8rem; margin-left: 12px; color: #334155; }
.fe-sub { font-size: .75rem; color: #475569; }

.fe-b { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); color: var(--text); }
.fe-b-em { font-size: 1.2rem; }
.fe-b-t { flex: 1; display: flex; flex-direction: column; line-height: 1.25; }
.fe-b-t small { font-size: .75rem; color: var(--muted); }
.fe-b-live { width: 9px; height: 9px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 4px #dcfce7; }

.fe-c { position: fixed; z-index: 205; right: 14px; bottom: calc(var(--btm) + 14px); width: 54px; height: 54px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 1.5rem; display: grid; place-items: center; box-shadow: var(--shadow-lg); }
.fe-c span { position: absolute; top: -2px; right: -2px; min-width: 20px; height: 20px; border-radius: 99px; background: #22c55e; font-size: .7rem; font-weight: 800; display: grid; place-items: center; border: 2px solid #fff; }

.fe-h { display: block; padding: 8px 12px; border-radius: 12px; background: #f0f9ff; border: 1px solid #bae6fd; color: #0c4a6e; font-size: .8rem; }
</style>
