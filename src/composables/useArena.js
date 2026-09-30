// src/composables/useArena.js
// PvP สนามประลอง — orchestration core: เรต/พลังงาน/สุ่มคู่/บุก+เขียนผล/รางวัลรายวัน
import { computed, ref, onUnmounted } from 'vue'
import { increment, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useMembersStore } from '../stores/members.js'
import { useToast } from './useToast.js'
import { useAppConfig } from './useAppConfig.js'
import { simulateBattle } from '../utils/battleEngine.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import { rosterOpponents } from '../utils/roster.js'
import { rankOfScore } from '../utils/newsFeed.js'
import { useRosterSync } from './useRosterSync.js'
import { bumpGlobalStat } from './useGlobalStats.js'
import {
  nextRating, BOT_RATING_MULT, PVP_RATING_START,
} from '../utils/pvpRating.js'
import { currentSeasonId, applySeasonReset } from '../utils/pvpSeason.js'
import { getFallbackBots } from '../utils/pvpBot.js'
import { pickMatch, pushRecent } from '../utils/pvpMatch.js'
import { energyState, spendEnergy, PVP_ENERGY_MAX } from '../utils/pvpEnergy.js'
import { dailyView, bumpDaily, canClaimDaily, PVP_DAILY_GOAL, PVP_DAILY_REWARD } from '../utils/pvpDaily.js'
import { teamPower, coinForResult } from '../utils/pvpCoins.js'
import { hashStr } from '../utils/seededRng.js'
import { activeWeekly } from '../data/pvpWeekly.js'
import { bumpDailyQuest } from '../utils/dailyQuest.js'
import { buildLoseTip } from '../utils/loseTip.js'
import { ANTI_LOSS, ANTI_LOSS_DAILY, canUseAntiLoss } from '../utils/antiLoss.js'

// คีย์วันที่รายวัน (UTC) — ใช้ toISOString ให้ตรงกับ daily-reset อื่นของแอป
// (quizCoinDate/studyCoinDate/dailyQuest ใช้ UTC เหมือนกันหมด → คงไว้เพื่อความสอดคล้อง)
const todayStr = () => new Date().toISOString().slice(0, 10)

export function useArena() {
  const auth = useAuthStore()
  const members = useMembersStore()
  const { toast } = useToast()
  const { syncRosterRow } = useRosterSync()
  const { rawConfig } = useAppConfig()

  // เรต/สถิติ "ตามซีซั่นปัจจุบัน" — preview soft-reset ก่อนเขียนจริง (เผื่อข้ามเดือน)
  const seasonPvp = computed(() => applySeasonReset(auth.userData?.pvp, currentSeasonId()))
  const rating    = computed(() => seasonPvp.value.rating)
  const wins      = computed(() => seasonPvp.value.wins)
  const losses    = computed(() => seasonPvp.value.losses)

  // พลังงาน (28 ก.ย. 2026 แทนโควตา 5/วัน) — เติม 1 ทุก 20 นาที เต็ม 5 · now เดินทุกวิให้นับถอยหลังขยับ
  const now = ref(Date.now())
  const tick = setInterval(() => { now.value = Date.now() }, 1000)
  onUnmounted(() => clearInterval(tick))
  const energy = computed(() => energyState(auth.userData?.pvpEnergy, auth.userData?.pvpEnergyAt, now.value))
  const attacksLeft = computed(() => energy.value.energy)
  const energyMax = PVP_ENERGY_MAX

  // รางวัลตีครบ 5 ครั้ง/วัน
  const daily = computed(() => dailyView(auth.userData?.pvpDaily, todayStr()))
  const dailyGoal = PVP_DAILY_GOAL
  const dailyReward = PVP_DAILY_REWARD
  const canClaim = computed(() => canClaimDaily(auth.userData?.pvpDaily, todayStr()))

  // ทีมของเรา (activePets slots → battle units)
  const myTeam = computed(() =>
    resolveBattleTeam(auth.userData?.activePets, auth.userData?.pets))

  // พลังทีมเรา — ฐานของทั้งการจ่ายเหรียญและการเล็งบอท
  const myPower = computed(() => teamPower(myTeam.value))

  // สุ่มคู่ 1 คน: คนจริงเรตใกล้ (ไม่ซ้ำคู่ล่าสุด) · ไม่มีเหลือ = บอท 1 ตัว
  function pickOpponent() {
    const uid = auth.currentUser?.uid
    const seed = hashStr(`${uid || ''}|${Date.now()}|${Math.random()}`)
    const human = pickMatch(rosterOpponents(members.rosterRows || {}, uid), rating.value, auth.userData?.pvpRecent, seed)
    if (human) return human
    // gachaEvent สด — กันเพ็ทรุ่นที่ยังไม่เปิดตัวโผล่ในทีมบอท (ดู pvpBot.js)
    return getFallbackBots(myPower.value, rating.value, seed, 1, rawConfig.value?.gachaEvent)[0] || null
  }

  // เขียนผลการสู้เข้า user doc (optimistic + server patch)
  async function applyResult(opp, won) {
    const season = currentSeasonId()
    const base = applySeasonReset(auth.userData?.pvp, season)
    const mult = opp.isBot ? BOT_RATING_MULT : 1
    const newRating = nextRating(base.rating, opp.rating, won, { mult })
    const nextPvp = {
      rating: newRating,
      wins: base.wins + (won ? 1 : 0),
      losses: base.losses + (won ? 0 : 1),
      seasonId: season,
      // ผลซีซั่นก่อน (applySeasonReset แนบมาตอนบุกครั้งแรกของเดือน) — แอดมินใช้แจกรางวัลซีซั่น ห้ามทิ้ง
      ...(base.last ? { last: base.last } : {}),
    }
    const today = todayStr()
    const en = spendEnergy(auth.userData?.pvpEnergy, auth.userData?.pvpEnergyAt, Date.now())
    const pvpDaily = bumpDaily(auth.userData?.pvpDaily, today)
    const pvpRecent = opp.isBot ? (auth.userData?.pvpRecent || []) : pushRecent(auth.userData?.pvpRecent, opp.uid)
    // เหรียญตามส่วนต่างพลังทีม · แพ้ให้คนแกร่งกว่ายังได้ปลอบใจ (ดู pvpCoins)
    const coin = coinForResult(myPower.value, teamPower(opp.team), won)
    // ⚠️ CLAUDE.md ข้อ 9 — หยิบค่าก่อนเรียก patchUser (หลังเรียกแล้ว computed จะเป็นค่าใหม่ทันที)
    // เควสประจำวัน "ลองสู้ในสนามประลอง" — นับทั้งชนะและแพ้ (เป้าคือให้คนเข้ามา ไม่ใช่ให้เก่ง)
    // เกาะไปกับ write ที่เกิดอยู่แล้ว ⇒ 0 write เพิ่ม · เขียนไม่สำเร็จ patchUser rollback ให้ทั้งก้อน
    const dq = bumpDailyQuest(auth.userData?.dailyQuest, 'pvp', today, 1)
    const ok = await auth.patchUser(
      {
        pvp: nextPvp, ...en, pvpDaily, pvpRecent, dailyQuest: dq,
        ...(coin ? { coins: (auth.userData?.coins || 0) + coin } : {}),
        pvpFightsTotal: (auth.userData?.pvpFightsTotal || 0) + 1,   // achievement สู้ตลอดชีพ
        ...(won ? { pvpWinsTotal: (auth.userData?.pvpWinsTotal || 0) + 1 } : {}),   // achievement ชนะตลอดชีพ
      },
      {
        pvp: nextPvp, ...en, pvpDaily, pvpRecent, dailyQuest: dq,
        ...(coin ? { coins: increment(coin) } : {}),
        pvpFightsTotal: increment(1),
        ...(won ? { pvpWinsTotal: increment(1) } : {}),
      },
    )
    // patchUser คืน false เมื่อเขียน Firestore ล้มเหลว (+rollback optimistic แล้ว)
    // → คืน ok=false ให้ fight() ไม่โชว์ replay ลวง
    // เรตเปลี่ยน → อัปแถวตัวเองในบอร์ด · พ่วงประวัติการบุกไปในการเขียนครั้งเดียวกัน
    // บอทข้าม: ไม่มีแถวใน roster และไม่มีใครต้องเห็นฝั่งตั้งรับของบอท
    // ข่าวกระดาน: อันดับเรตในรุ่นดีขึ้นและติด 10 อันดับแรก — เทียบจาก rosterRows ที่ถืออยู่แล้ว (ไม่มี read เพิ่ม)
    const rows = members.rosterRows || {}
    const uid = auth.currentUser?.uid || null
    const pickRating = (r) => r?.r ?? PVP_RATING_START
    const prevRank = rankOfScore(rows, uid, pickRating, base.rating)
    const newRank  = rankOfScore(rows, uid, pickRating, newRating)
    syncRosterRow({
      history: opp.isBot ? null : { u: opp.uid, w: won ? 1 : 0, c: coin, t: Date.now() },
      event: (newRank < prevRank && newRank <= 10) ? { k: 'pv', v: newRank, t: Date.now() } : null,
    })
    if (ok) bumpGlobalStat('pvpTotal', 1)
    // ตั้งรับชนะ → +1 ตัวนับของเจ้าของทีม (achievement ตั้งรับ) · rules เปิดให้คนอื่น +1 ฟิลด์นี้ฟิลด์เดียว
    // พลาดไม่เป็นไร ไม่กระทบผลไฟต์ของเรา
    if (ok && !won && !opp.isBot && opp.uid) {
      updateDoc(doc(db, 'users', opp.uid), { pvpDefWinsTotal: increment(1) })
        .catch(e => console.error('[pvp def win]', e))
    }
    return { ok, newRating, delta: newRating - base.rating, coin }
  }

  // บุก: ตรวจสอบโควต้า+ทีม → จำลองการสู้ → เขียนผล → คืน replayData
  async function fight() {
    if (attacksLeft.value <= 0) {
      const m = Math.ceil(energy.value.nextMs / 60000)
      toast(`พลังงานหมด อีก ${m} นาทีได้เพิ่ม 1 หน่วย`, 'info')
      return null
    }
    if (!myTeam.value.length) {
      toast('จัดทีมก่อนนะ (อย่างน้อย 1 ตัว)', 'info')
      return null
    }
    const opp = pickOpponent()
    // ทั้งบอทและคนจริงมี team resolve มาให้แล้ว (คนจริงมาจาก roster row tm)
    const oppTeam = opp?.team
    if (!oppTeam?.length) {
      toast('ยังหาคู่ต่อสู้ไม่ได้ ลองใหม่อีกครั้งนะ', 'info')
      return null
    }
    // เอฟเฟกต์ประจำสัปดาห์ — เช็คเวลาหมดตอนกดจริง (ไม่ใช่ค่าที่ค้างบนจอ)
    const weekly = activeWeekly(rawConfig.value?.pvpWeekly, Date.now())
    const result = simulateBattle(myTeam.value, oppTeam, Date.now(), { weekly: weekly?.id })
    const won = result.winner === 'A'
    const { ok, delta, coin, newRating } = await applyResult(opp, won)
    // เขียนผลไม่สำเร็จ → toast error + ไม่โชว์ replay (เหมือน useFarm/useDaily)
    if (!ok) { toast('บันทึกผลประลองไม่สำเร็จ', 'error'); return null }
    // บอทมี 2 ตัว (อ่อน/แกร่ง) — ต้องบอกให้ชัดว่าเพิ่งสู้กับตัวไหน
    const name = opp.isBot ? `หุ่นซ้อม${opp.label ? ' (' + opp.label + ')' : ''}` : (opp.nickname || 'คู่ต่อสู้')
    const from = newRating - delta
    return {
      result, playerTeam: myTeam.value, botTeam: oppTeam, won, opp,
      // จอผลโชว์ ±แต้มตัวใหญ่ + เก่า → ใหม่ · loss = ตั๋วใช้ยาแก้แพ้ของตานี้ (ปิดจอ = ทิ้ง)
      rating: { from, to: from + delta, delta },
      loss: won ? null : { from, to: from + delta, season: currentSeasonId() },
      vsLabel: `VS ${name}`,
      winText: 'ชนะ!',   // ±แต้มโชว์ตัวใหญ่ใน br-rate แล้ว
      loseText: 'แพ้',
      // ⚠️ CLAUDE.md ข้อ 9 — userData ตรงนี้เป็นค่า "หลัง" patchUser แล้ว (เหรียญที่เพิ่งได้นับรวมด้วย)
      // ตั้งใจให้เป็นแบบนั้น: ปุ่มต้องสะท้อนว่า "ตอนนี้กดอะไรได้" ไม่ใช่ตอนก่อนเริ่มไฟต์
      loseTip: buildLoseTip('arena', auth.userData),
      rewardText: coin ? `ได้รับ: ${coin.toLocaleString()} เหรียญ` : '',
    }
  }

  const antiLoss = computed(() => auth.userData?.antiLoss || 0)
  const canAntiLoss = (loss) => canUseAntiLoss(loss, seasonPvp.value, antiLoss.value)

  // 💊 ยาแก้แพ้: คืนแต้มที่เพิ่งเสียตานี้ (ตัวนับแพ้ยังนับ — แค่แต้มไม่ลด)
  async function useAntiLoss(loss) {
    if (!canAntiLoss(loss)) return false
    const nextPvp = { ...seasonPvp.value, rating: loss.from }
    const left = antiLoss.value - 1
    const ok = await auth.patchUser(
      { pvp: nextPvp, antiLoss: left },
      { pvp: nextPvp, antiLoss: increment(-1) },
    )
    if (ok) syncRosterRow({})
    toast(ok ? `${ANTI_LOSS.emoji} ใช้${ANTI_LOSS.name}แล้ว แต้มกลับเป็น ${loss.from.toLocaleString()}` : 'ใช้ไม่สำเร็จ ลองอีกครั้งนะ', ok ? 'success' : 'error')
    return ok
  }

  // กดรับรางวัลตีครบ 5 ครั้งวันนี้
  async function claimDaily() {
    const today = todayStr()
    if (!canClaimDaily(auth.userData?.pvpDaily, today)) return false
    const pd = { ...dailyView(auth.userData?.pvpDaily, today), claimed: true }
    const ok = await auth.patchUser(
      { pvpDaily: pd, coins: (auth.userData?.coins || 0) + PVP_DAILY_REWARD, antiLoss: (auth.userData?.antiLoss || 0) + ANTI_LOSS_DAILY },
      { pvpDaily: pd, coins: increment(PVP_DAILY_REWARD), antiLoss: increment(ANTI_LOSS_DAILY) },
    )
    toast(ok ? `รับ ${PVP_DAILY_REWARD.toLocaleString()} เหรียญ + ${ANTI_LOSS.emoji} ${ANTI_LOSS.name} ×${ANTI_LOSS_DAILY} แล้ว!` : 'รับรางวัลไม่สำเร็จ', ok ? 'success' : 'error')
    return ok
  }

  return {
    rating, wins, losses, attacksLeft, energy, energyMax, myTeam, fight,
    daily, dailyGoal, dailyReward, canClaim, claimDaily,
    antiLoss, canAntiLoss, useAntiLoss,
  }
}
