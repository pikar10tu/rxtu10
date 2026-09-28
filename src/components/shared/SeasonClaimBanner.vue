<!--
  <SeasonClaimBanner> — แถบกดรับรางวัลซีซั่นที่จบแล้ว ใช้ทั้งหน้าหอคอยและอารีน่า (Task 5)
  วางเหนือ <SeasonCountdown> เสมอ: ถ้ามีรางวัลค้างรับ โชว์แถบนี้ก่อนนับถอยหลังของซีซั่นใหม่
  ไม่โชว์เมื่อไม่ล็อกอิน (mailbox.load() no-op เงียบถ้าไม่มี uid — ดู stores/mailbox.js)
  claim สำเร็จ → เปิด <SeasonClaimReveal> (อนิเมชันเปิดกล่อง, ไม่แตะ Firestore)
-->
<template>
  <div v-if="mail || justClaimed" class="scb" :class="{ done: justClaimed }">
    <p class="scb-t">ซีซั่น {{ label }} จบแล้ว</p>
    <p class="scb-s">{{ mode === 'tower' ? 'รางวัลตามชั้นที่ไต่ถึง' : 'รางวัลตามอันดับอารีน่า' }}</p>
    <div class="scb-line">
      <div class="scb-big">{{ bigText }}</div>
      <div class="scb-d">
        {{ mode === 'tower' ? 'ชั้นสูงสุดของคุณ' : `อันดับจบซีซั่น · ${(tier.rating || 0).toLocaleString()} แต้ม` }}<br>
        <span class="scb-mute">ขั้น {{ tier.name }}</span>
      </div>
    </div>
    <div v-if="justClaimed" class="scb-ok">✓ รับแล้ว</div>
    <button v-else type="button" class="scb-btn" :disabled="busy" @click="onClaim">
      <Emoji char="🎁" /> {{ busy ? 'กำลังรับ…' : 'รับรางวัล' }}
    </button>
  </div>
  <SeasonClaimReveal v-if="revealMail" :mail="revealMail" @close="revealMail = null" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Emoji from './Emoji.vue'
import SeasonClaimReveal from './SeasonClaimReveal.vue'
import { useMailbox } from '../../stores/mailbox.js'
import { seasonMonthLabel } from '../../utils/pvpSeason.js'
import { useToast } from '../../composables/useToast.js'

const props = defineProps({ mode: { type: String, required: true } })
const mailbox = useMailbox()
const { toast } = useToast()

const justClaimed = ref(null)   // mail ที่เพิ่งรับในรอบนี้ (โชว์ ✓ จนออกจากหน้า)
const revealMail = ref(null)
const busy = ref(false)

const mail = computed(() => justClaimed.value ? null : mailbox.seasonPending(props.mode))
const shownMail = computed(() => justClaimed.value || mail.value)
const tier = computed(() => shownMail.value?.tier || {})
const label = computed(() => shownMail.value?.season ? seasonMonthLabel(shownMail.value.season) : '')
const bigText = computed(() => props.mode === 'tower' ? String(tier.value.best ?? '') : `#${tier.value.rank ?? ''}`)

// banner นี้ mount เฉพาะตอน authStore.isLoggedIn อยู่แล้ว (ทั้ง TowerView/ArenaView ห่อด้วย v-if
// ที่ระดับหน้า) — load() เองก็ no-op เงียบถ้าไม่มี uid (ดู stores/mailbox.js) กันซ้อนไว้อีกชั้น
onMounted(() => { mailbox.load() })

async function onClaim() {
  const m = mail.value
  if (!m || busy.value) return
  busy.value = true
  const res = await mailbox.claim(m.id)
  busy.value = false
  if (res === false) { toast('รับไม่สำเร็จ ลองใหม่อีกครั้ง', 'error'); return }
  justClaimed.value = m
  // store คืน {coins, tickets, arena} ไม่มี ach ตรงๆ — แต่ทุก tier ของซีซั่น (seasonRewards.js
  // TOWER_TIERS/ARENA_TIERS) มี coins>0 และ tickets>0 เสมอ ดังนั้นเช็คแค่สามค่านี้ก็พอแยก
  // "รับสำเร็จจริง" ออกจาก "รับไปแล้ว/ไม่มีรางวัล" (ที่คืนศูนย์ทั้งหมด) ได้แม่นยำ 100%
  if (res.coins > 0 || res.tickets > 0 || res.arena) revealMail.value = m
  else toast('รางวัลนี้รับไปแล้ว', 'info')
}
</script>

<style scoped>
.scb{border-radius:18px;padding:14px;margin-bottom:12px;background:linear-gradient(135deg,#3a2d6b,#261d49);border:1px solid #ffcf5a55;color:#f3eefc;animation:scb-glow 2.4s infinite}
.scb.done{animation:none}
@keyframes scb-glow{50%{box-shadow:0 0 22px 2px #ffcf5a44}}
.scb-t{margin:0;font-family:var(--font-display);font-weight:400;font-size:17px}
.scb-s{margin:2px 0 10px;color:#b3a8d4;font-size:13px}
.scb-line{display:flex;gap:10px;align-items:center;background:#0006;border-radius:12px;padding:10px}
.scb-big{font-family:var(--font-display);font-weight:400;font-size:26px;color:#ffcf5a;min-width:64px;text-align:center;font-variant-numeric:tabular-nums}
.scb-d{font-size:13px}
.scb-mute{color:#b3a8d4}
.scb-btn{margin-top:10px;width:100%;border:0;border-radius:12px;padding:12px;font-family:var(--font-display);font-weight:400;font-size:16px;color:#3b2300;background:linear-gradient(#ffe08a,#f59e0b);cursor:pointer}
.scb-btn:disabled{opacity:.6;cursor:default}
.scb-ok{margin-top:10px;text-align:center;color:#86efac;font-size:14px}
</style>
