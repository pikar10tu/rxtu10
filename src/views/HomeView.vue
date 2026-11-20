<template>
  <div class="tab-content">
    <header class="home-head">
      <div class="home-head-badge"><Emoji char="🧪" /></div>
      <div class="home-head-txt">
        <h1 class="home-head-title">RxTU10</h1>
        <!-- วันสอบย่อเหลือบรรทัดเดียว (13 พ.ย. 2026 แทนการ์ด ExamCountdown) · จิ้มรัวยังได้ความสำเร็จลับเหมือนเดิม -->
        <p class="home-head-sub">เภสัช มธ. รุ่น 10 · หน้าหลัก</p>
      </div>
      <!-- ปุ่มจดหมาย + เควส มุมขวา (จุดแดงเมื่อมีของค้าง) -->
      <div v-if="authStore.isLoggedIn" class="home-head-actions">
        <HeaderIconButton icon="🔍" label="ค้นหายา เคส CC2 หรือสรุป" @click="searchOpen = true" />
        <HeaderIconButton icon="📬" :dot="mailbox.attention > 0" label="กล่องจดหมาย" @click="showMail = true" />
        <HeaderIconButton icon="🎯" :dot="questPending" label="เควสต์ประจำวัน" @click="showQuest = true" />
        <!-- ☀️ วันนี้ของคุณ + รายได้ ย้ายมาเป็นปุ่ม (user 20 พ.ย. 2026) · จุดแดง = รายได้เกินครึ่ง หรือยังไม่ทำข้อสอบประจำวัน -->
        <HeaderIconButton icon="☀️" :dot="todayDot" label="วันนี้ของคุณ และรายได้" @click="showToday = true" />
      </div>
    </header>

    <template v-if="authStore.isLoggedIn">
      <!-- 🏠 หน้าแรกแบบ B (user เคาะ 20 พ.ย. 2026): ฉากบ้านเต็มกว้าง อวาตาร์ยืนในฉาก · คำทักทายบนแถบฟ้า · แตะอวาตาร์ = ห้องแต่งตัว -->
      <ResidenceScene v-slot="{ headX, headY }" class="home-scene" :scene="homeScene" :eq="homeDoll" doll-to="/doll" label="อวาตาร์ของฉัน">
        <!-- ป้ายทักทาย + วันสอบ (ย้ายจากหัวหน้ามาไว้บนฟ้า) · จิ้มรัวยังได้ความสำเร็จลับเหมือนเดิม -->
        <!-- บับเบิ้ลคำพูด: หางชี้ลงเหนือหัวอวาตาร์ เว้น 14px (ตามจุดยืนของแต่ละฉาก) -->
        <div class="greet-bubble home-greet" :style="{ left: Math.max(8, headX - 27) + 'px', bottom: `calc(100% - ${headY - 14}px)` }">
          <b>{{ greet }} {{ authStore.userData?.nickname || '' }}</b>
          <small>{{ cheer }}</small>
        </div>
        <!-- ป้ายชื่อสถานที่ = ปุ่มเปิดแผงบ้าน (อัปบ้าน + เลือกฉาก) แทนการ์ดอัปบ้านใหญ่ (user 20 พ.ย.) -->
        <button type="button" class="place-tag home-place" :style="{ '--tier': homeTier.frameColor }" @click="homeOpen = true">
          <Emoji :char="homeTier.art" /> {{ homeTier.tierName }} <b>›</b>
        </button>
      </ResidenceScene>
      <ResidenceSheet v-model:open="homeOpen" />
      <!-- จัดหน้าใหม่ (user เคาะ 11 พ.ย. 2026): ผลสอบจำลอง → วันนี้ของคุณ → ประจำวันสนุกๆ → บ้าน → ลิงก์ท้ายหน้า -->
      <!-- ผลสอบจำลอง — โชว์จนกว่าจะเคยเปิดหน้าผล (user 8 พ.ย. 2026) -->
      <MockScoreCard only-unseen class="home" />
      <!-- 🎯 กลางหน้า: นับถอยหลังวันสอบ + ปุ่มไปเรียน (user 20 พ.ย. 2026) · จิ้มตัวเลขรัวยังได้ความสำเร็จลับเหมือนเดิม -->
      <section v-if="nextExam" class="home-go">
        <div class="home-go-cd" :class="{ 'cd-jig': jig === 1, 'cd-panic': jig === 2 }" role="button" tabindex="0" data-sfx="none"
             @click="poke" @keydown.enter="poke" @animationend="jig = 0">
          <small>{{ examShort(nextExam) }} อีก</small>
          <b>{{ nextExam.days > 0 ? nextExam.days : 'วันนี้!' }}</b>
          <small v-if="nextExam.days > 0">วัน</small>
        </div>
        <div class="home-go-r">
          <div class="home-go-sub">
            <span v-for="e in otherExams" :key="e.id">{{ examShort(e) }} อีก {{ e.days }} วัน</span>
            <span>วันนี้ทำแล้ว {{ todayDone }}/2</span>
          </div>
          <RouterLink to="/study" class="home-go-btn"><Emoji char="📚" /> ไปเรียน</RouterLink>
        </div>
      </section>
      <RouterLink v-else to="/study" class="home-go-btn solo"><Emoji char="📚" /> ไปเรียน</RouterLink>

      <!-- ประจำวันสนุกๆ: ดวง → อีเวนต์ → MBTI → เกร็ดความรู้เภสัช (13 พ.ย. แทนสถิติเว็บ — ยังอยู่ที่ /fun-facts) · ข้ามตัวที่ไม่มี · ครบ 4 = เกร็ดฯ ลงการ์ดเต็มกว้าง -->
      <div class="home-sec">ประจำวันสนุกๆ</div>
      <!-- ย่อเป็นแถบเลื่อนข้างแถวเดียว (20 พ.ย. 2026) -->
      <div class="home-fun">
        <HoroCard tile />
        <TreeTile />
        <EventBanner v-if="hasEvent" tile />
        <MbtiPromo v-if="hasMbtiPromo" tile />
        <PharmFactCard tile />
      </div>

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
      <BottomSheet v-model:open="showToday" icon="☀️" title="วันนี้ของคุณ">
        <ContinueCard class="home-today" />
      </BottomSheet>
      <BottomSheet v-model:open="showQuest" icon="🎯" title="เควสต์ประจำวัน">
        <DailyQuestCard />
      </BottomSheet>
    </template>
  </div>
</template>

<script setup>
import { useDaily } from '../composables/useDaily.js'
import { dayKey } from '../utils/dailyChallenge.js'
import { dueCount as qcardsDueCount } from '../utils/srsQuestions.js'
import ResidenceScene from '../components/residence/ResidenceScene.vue'
import ResidenceSheet from '../components/residence/ResidenceSheet.vue'
import { getTier, sceneOf } from '../data/residence.js'
import { dollOf } from '../utils/doll.js'
import Emoji from '../components/shared/Emoji.vue'
import MockScoreCard from '../components/me/MockScoreCard.vue'
import FeedbackModal from '../components/shared/FeedbackModal.vue'
import { RouterLink } from 'vue-router'
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useMailbox } from '../stores/mailbox.js'
import { questNotClaimed } from '../utils/dailyQuest.js'
import { pendingAnnounce } from '../utils/mailbox.js'
import ContinueCard from '../components/home/ContinueCard.vue'
import GlobalSearchPanel from '../components/search/GlobalSearchPanel.vue'
const HoroCard = defineAsyncComponent(() => import('../components/horo/HoroCard.vue'))
import PharmFactCard from '../components/home/PharmFactCard.vue'
import DailyQuestCard from '../components/home/DailyQuestCard.vue'
import EventBanner from '../components/shared/EventBanner.vue'
import MbtiPromo from '../components/home/MbtiPromo.vue'
import TreeTile from '../components/home/TreeTile.vue'
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
const homeOpen = ref(false)
const homeScene = computed(() => sceneOf(authStore.userData?.residence))
const homeTier = computed(() => getTier(homeScene.value))
const homeDoll = computed(() => dollOf(authStore.userData).eq)
const greet = (() => { const h = new Date().getHours(); return h < 11 ? 'สวัสดีตอนเช้า' : h < 16 ? 'สวัสดีตอนบ่าย' : h < 19 ? 'สวัสดีตอนเย็น' : 'ราตรีสวัสดิ์' })()

const showMail = ref(false)
const showQuest = ref(false)
const showToday = ref(false)
const { fillPct } = useDaily()
const playedToday = computed(() => authStore.userData?.dc?.last === dayKey())
const redoLeft = computed(() => qcardsDueCount(authStore.userData?.study?.qcards, Date.now()))
const todayDone = computed(() => (playedToday.value ? 1 : 0) + (redoLeft.value ? 0 : 1))
const todayDot = computed(() => fillPct.value >= 50 || !playedToday.value)
const exams = computed(() => upcomingExams(EXAMS))
const nextExam = computed(() => exams.value[0] || null)
const otherExams = computed(() => exams.value.slice(1, 2))
const cheer = computed(() => {
  const d = nextExam.value?.days
  if (d == null) return 'วันนี้ก็สู้ๆ นะ'
  if (d <= 0) return 'วันสอบแล้ว! ทำเต็มที่นะ'
  if (d <= 30) return 'ใกล้สอบแล้ว สู้ๆ นะ'
  return 'ค่อยๆ เก็บทีละนิด สู้ๆ นะ'
})
const examShort = (e) => (e.id === 'ple-cc2' ? 'สอบ CC2' : e.id === 'ple-cc1' ? 'สอบ CC1' : e.label)
const searchOpen = ref(false)
const searchQuery = ref('')
const fbOpen = ref(false)

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
// ต้นไม้รุ่น 10 อยู่แถวนี้ด้วย (15 พ.ย.) · แถวละไม่เกิน 4 ช่อง → ครบ 4 แล้วเกร็ดฯ ค่อยลงการ์ดเต็มกว้าง

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
</script>

<style scoped>
/* 🏠 ฉากบ้านหัวหน้าแรก — ชิดขอบจอซ้ายขวา (ลบ padding ของ .tab-content) */
.home-scene { margin: -12px -12px 14px; width: calc(100% + 24px); }
.home-greet { position: absolute; z-index: 2; max-width: calc(100% - 24px); }
.home-place { position: absolute; right: 12px; bottom: 8px; z-index: 2; }
/* ── จัดหน้าใหม่ 13 พ.ย. 2026 ── */
.home-sec { font-size: .8rem; font-weight: 800; color: var(--muted); margin: 4px 2px 8px; }
.home-fun { display: flex; gap: 8px; margin: 0 -12px 12px; padding: 2px 12px 6px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.home-fun::-webkit-scrollbar { display: none; }
.home-fun > * { flex: 0 0 116px; scroll-snap-align: start; }
/* 🎯 นับถอยหลัง + ไปเรียน */
.home-go { display: flex; align-items: center; gap: 12px; background: #fff; border: var(--bw) solid var(--line); border-radius: 20px; padding: 12px 14px; margin-bottom: 14px; box-shadow: var(--pop); }
.home-go-cd { flex: none; width: 84px; display: flex; flex-direction: column; align-items: center; border-radius: 16px; padding: 6px 0; background: linear-gradient(160deg, var(--accent-light), var(--primary-light)); cursor: pointer; user-select: none; }
.home-go-cd b { font-size: 2rem; font-weight: 800; line-height: 1.05; color: var(--ink); font-variant-numeric: tabular-nums; }
.home-go-cd small { font-size: .7rem; font-weight: 700; color: var(--muted); }
.home-go-r { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.home-go-sub { display: flex; flex-direction: column; gap: 1px; font-size: .76rem; font-weight: 700; color: var(--muted); }
.home-go-btn { display: block; text-align: center; padding: 11px; border-radius: 14px; background: var(--primary); color: #fff; font-weight: 800; font-size: .95rem; text-decoration: none; box-shadow: var(--pop); }
.home-go-btn.solo { margin-bottom: 14px; }
.home-go-btn:active { transform: translateY(1px); }
.home-today { margin: 0; border: 0; box-shadow: none; padding: 0; }
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
