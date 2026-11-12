<template>
  <div class="tab-content">
    <header class="home-head">
      <div class="home-head-badge"><Emoji char="🧪" /></div>
      <div class="home-head-txt">
        <h1 class="home-head-title">RxTU10</h1>
        <!-- วันสอบย่อเหลือบรรทัดเดียว (13 พ.ย. 2026 แทนการ์ด ExamCountdown) · จิ้มรัวยังได้ความสำเร็จลับเหมือนเดิม -->
        <p v-if="examLine" class="home-head-sub home-cd" :class="{ 'cd-jig': jig === 1, 'cd-panic': jig === 2 }" role="button" tabindex="0" data-sfx="none"
           @click="poke" @keydown.enter="poke" @animationend="jig = 0"><Emoji char="🎯" /> {{ examLine }}</p>
        <p v-else class="home-head-sub">เภสัช มธ. รุ่น 10 · หน้าหลัก</p>
      </div>
      <!-- ปุ่มจดหมาย + เควส มุมขวา (จุดแดงเมื่อมีของค้าง) -->
      <div v-if="authStore.isLoggedIn" class="home-head-actions">
        <HeaderIconButton icon="🔍" label="ค้นหายา เคส CC2 หรือสรุป" @click="searchOpen = true" />
        <HeaderIconButton icon="📬" :dot="mailbox.attention > 0" label="กล่องจดหมาย" @click="showMail = true" />
        <HeaderIconButton icon="🎯" :dot="questPending" label="เควสต์ประจำวัน" @click="showQuest = true" />
      </div>
    </header>

    <template v-if="authStore.isLoggedIn">
      <!-- จัดหน้าใหม่ (user เคาะ 11 พ.ย. 2026): ผลสอบจำลอง → วันนี้ของคุณ → ประจำวันสนุกๆ → บ้าน → ลิงก์ท้ายหน้า -->
      <!-- ผลสอบจำลอง — โชว์จนกว่าจะเคยเปิดหน้าผล (user 8 พ.ย. 2026) -->
      <MockScoreCard only-unseen class="home" />
      <!-- วันนี้ของคุณ = ข้อสอบประจำวัน · ข้อที่เคยผิด · รายได้ + รายละเอียดเดิมพับไว้ -->
      <ContinueCard @sheet="onCardSheet" />

      <!-- ประจำวันสนุกๆ: ดวง → อีเวนต์ → MBTI → เกร็ดความรู้เภสัช (13 พ.ย. แทนสถิติเว็บ — ยังอยู่ที่ /fun-facts) · ข้ามตัวที่ไม่มี · ครบ 4 = เกร็ดฯ ลงการ์ดเต็มกว้าง -->
      <div class="home-sec">ประจำวันสนุกๆ</div>
      <div class="home-fun" :style="{ gridTemplateColumns: `repeat(${funCols}, minmax(0, 1fr))` }">
        <HoroCard tile />
        <EventBanner v-if="hasEvent" tile />
        <MbtiPromo v-if="hasMbtiPromo" tile />
        <PharmFactCard v-if="!factsWide" tile />
      </div>
      <PharmFactCard v-if="factsWide" />

      <!-- ที่อยู่อาศัย (residence) — แกน prestige/coin-sink -->
      <ResidenceCard />
      <!-- ส่งผจญภัยพับเก็บ 25 ก.ย. 2026 — โค้ด/route/ข้อมูลเก็บไว้ ไม่ลบ -->

      <!-- ลิงก์บรรทัดเดียวท้ายหน้า -->
      <button type="button" class="home-link" @click="fbOpen = true"><span><Emoji char="💬" /> ส่งข้อเสนอแนะ / รายงานปัญหา</span><span>›</span></button>
      <RouterLink v-if="authStore.isAdmin" to="/admin" class="home-link"><span><Emoji char="⚙️" /> แผงผู้ดูแลระบบ</span><span>›</span></RouterLink>
      <FeedbackModal v-model="fbOpen" />
      <!-- ค้นหารวม (overlay Teleport ในตัว) -->
      <GlobalSearchPanel v-if="searchOpen" v-model="searchQuery" overlay autofocus @close="searchOpen = false" />

      <!-- กล่องจดหมาย / เควส — bottom-sheet เปิดจากปุ่ม header -->
      <BottomSheet v-model:open="showMail" icon="📬" title="กล่องจดหมาย">
        <template #actions>
          <button class="mb-refresh" aria-label="รีเฟรชจดหมาย" :disabled="mailbox.loading" @click="mailbox.load({ force: true })">↻</button>
        </template>
        <MailboxCard />
      </BottomSheet>
      <BottomSheet v-model:open="showQuest" icon="🎯" title="เควสต์ประจำวัน">
        <DailyQuestCard />
      </BottomSheet>
    </template>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import MockScoreCard from '../components/me/MockScoreCard.vue'
import FeedbackModal from '../components/shared/FeedbackModal.vue'
import { RouterLink } from 'vue-router'
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useMailbox } from '../stores/mailbox.js'
import { questNotClaimed } from '../utils/dailyQuest.js'
import { pendingAnnounce } from '../utils/mailbox.js'
import ResidenceCard from '../components/residence/ResidenceCard.vue'
import ContinueCard from '../components/home/ContinueCard.vue'
import GlobalSearchPanel from '../components/search/GlobalSearchPanel.vue'
const HoroCard = defineAsyncComponent(() => import('../components/horo/HoroCard.vue'))
import PharmFactCard from '../components/home/PharmFactCard.vue'
import DailyQuestCard from '../components/home/DailyQuestCard.vue'
import EventBanner from '../components/shared/EventBanner.vue'
import MbtiPromo from '../components/home/MbtiPromo.vue'
import MailboxCard from '../components/home/MailboxCard.vue'
import { EXAMS } from '../data/exams.js'
import { upcomingExams } from '../utils/countdown.js'
import { activeEvent } from '../utils/event.js'
import { makeStreak } from '../utils/gags.js'
import { grantSecret } from '../composables/useAchievements.js'
import { sfx } from '../utils/sfx.js'
import BottomSheet from '../components/shared/BottomSheet.vue'
import HeaderIconButton from '../components/home/HeaderIconButton.vue'

const authStore = useAuthStore()
const mailbox = useMailbox()

const showMail = ref(false)
const showQuest = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')
const fbOpen = ref(false)

// ── บรรทัดวันสอบใต้ชื่อแอป ──
const examLine = computed(() => upcomingExams(EXAMS)
  .map(e => `${e.id === 'ple-cc2' ? 'CC2' : e.id === 'ple-cc1' ? 'CC1' : e.label} ${e.days > 0 ? `อีก ${e.days} วัน` : 'วันนี้ สู้ๆ!'}`)
  .join(' · '))
// จิ้มรัว (ความสำเร็จลับ ตื่นเต้นล่ะสิ / PANIC ATTACK — ย้ายมาจาก ExamCountdown)
const taps = makeStreak(700)
const jig = ref(0)
function poke() {
  const n = taps.hit()
  sfx('tap')
  jig.value = 0
  requestAnimationFrame(() => { jig.value = n >= 10 ? 2 : 1 })
  if (n === 3) grantSecret('gag_excited')
  if (n === 10) { grantSecret('gag_panic'); sfx('wrong') }
}

// ── แถวประจำวันสนุกๆ ──
const hasEvent = !!activeEvent()
const hasMbtiPromo = computed(() => !!authStore.userData && !authStore.userData.mbti)
const factsWide = computed(() => 1 + (hasEvent ? 1 : 0) + (hasMbtiPromo.value ? 1 : 0) >= 3)
const funCols = computed(() => 1 + (hasEvent ? 1 : 0) + (hasMbtiPromo.value ? 1 : 0) + (factsWide.value ? 0 : 1))

// จุดแดงเควส = วันนี้ยังไม่กดรับรางวัล
const questPending = computed(() =>
  questNotClaimed(authStore.userData?.dailyQuest, new Date().toISOString().slice(0, 10))
  || (authStore.isLoggedIn && !authStore.userData?.mbtiQuest)   // เควสครั้งเดียว MBTI ยังไม่ทำ
)

// โหลดจดหมายตั้งแต่เข้า Home เพื่อให้จุดแดงโชว์ได้โดยไม่ต้องเปิดแผงก่อน
// แล้วถ้ามีประกาศใหม่จากแอดมินที่ยังไม่เคยเด้งให้ดู → เปิดกล่องจดหมายเอง 1 ครั้ง
let alive = true
onUnmounted(() => { alive = false })

onMounted(async () => {
  if (!authStore.isLoggedIn) return
  await mailbox.load()
  if (!alive) return                          // ออกจากหน้า Home ไปก่อนโหลดเสร็จ
  if (!authStore.userData?.welcomeBoxSeen) return  // ยังติด onboarding/WelcomeBox อยู่ อย่าไปแทรก
  const ann = pendingAnnounce(mailbox.mails, authStore.userData?.announceSeen)
  if (!ann) return
  showMail.value = true
  // ติดธง "เด้งให้ดูแล้ว" อย่างเดียว — ไม่แตะ read เพื่อให้จุดแดงค้างจนกว่าจะกดจดหมายจริง
  authStore.patchUser({ announceSeen: ann.id }, { announceSeen: ann.id })
})

// การ์ดงานถัดไปสั่งเปิด bottom-sheet ได้ (เควสไม่มีหน้าแยก)
function onCardSheet(name) { if (name === 'quest') showQuest.value = true }
</script>

<style scoped>
/* ── จัดหน้าใหม่ 13 พ.ย. 2026 ── */
.home-sec { font-size: .8rem; font-weight: 800; color: var(--muted); margin: 4px 2px 8px; }
.home-fun { display: grid; gap: 8px; margin-bottom: 12px; }
.home-link { all: unset; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 12px 4px; border-top: 1px solid var(--line); font-family: inherit; font-size: .85rem; color: var(--muted); text-decoration: none; cursor: pointer; }
.home-link:first-of-type { margin-top: 6px; }
.home-link:focus-visible, .home-cd:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.home-cd { cursor: pointer; display: inline-block; color: var(--primary-dark); font-weight: 700; }
.cd-jig { animation: cd-jig .25s ease-out; }
.cd-panic { animation: cd-panic .6s ease-in-out; }
@keyframes cd-jig { 40% { transform: scale(.96) rotate(-1deg); } 70% { transform: scale(1.02) rotate(.6deg); } }
@keyframes cd-panic { 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); } 20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); } }
/* ── header: display font + sticker badge ── */
.home-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.home-head-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }
.mb-refresh { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 28px; height: 28px; font-size: .8rem; cursor: pointer; color: rgba(0,0,0,.55); }
.mb-refresh:disabled { opacity: .5; }
.home-head-badge {
  width: 50px; height: 50px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.7rem; border-radius: 16px;
  background: var(--gold); border: var(--bw) solid var(--line); box-shadow: var(--pop);
  transform: rotate(-6deg);
}
.home-head-txt { min-width: 0; }
.home-head-title {
  font-family: var(--font-display); font-weight: 400;
  font-size: 1.85rem; line-height: 1; color: var(--ink); margin: 0;
  letter-spacing: .5px;
}
.home-head-sub { font-size: .7rem; color: var(--muted); margin: 4px 0 0; font-weight: 600; }

</style>
