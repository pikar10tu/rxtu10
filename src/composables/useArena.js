// src/composables/useArena.js
// PvP สนามประลอง — orchestration core: เรต/โควต้า/พูลคู่/บุก+เขียนผล
import { computed } from 'vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useMembersStore } from '../stores/members.js'
import { useToast } from './useToast.js'
import { simulateBattle } from '../utils/battleEngine.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import {
  nextRating, BOT_RATING_MULT, PVP_DAILY_ATTACKS, PVP_WIN_COIN, PVP_BOT_COIN,
} from '../utils/pvpRating.js'
import { currentSeasonId, applySeasonReset } from '../utils/pvpSeason.js'
import { getPvpBot } from '../utils/pvpBot.js'
import { pickHumanOpponents } from '../utils/pvpMatch.js'

// วันที่วันนี้ตามเวลาเครื่อง YYYY-MM-DD
const todayStr = () => new Date().toISOString().slice(0, 10)

export function useArena() {
  const auth = useAuthStore()
  const members = useMembersStore()
  const { toast } = useToast()

  // เรต/สถิติ "ตามซีซั่นปัจจุบัน" — preview soft-reset ก่อนเขียนจริง (เผื่อข้ามเดือน)
  const seasonPvp = computed(() => applySeasonReset(auth.userData?.pvp, currentSeasonId()))
  const rating    = computed(() => seasonPvp.value.rating)
  const wins      = computed(() => seasonPvp.value.wins)
  const losses    = computed(() => seasonPvp.value.losses)

  // โควต้าบุกวันนี้: รีเมื่อ pvpAttackDate != วันนี้
  const attacksLeft = computed(() => {
    const used = auth.userData?.pvpAttackDate === todayStr()
      ? (auth.userData?.pvpAttacksUsed || 0)
      : 0
    return Math.max(0, PVP_DAILY_ATTACKS - used)
  })

  // ทีมของเรา (activePets slots → battle units)
  const myTeam = computed(() =>
    resolveBattleTeam(auth.userData?.activePets, auth.userData?.pets))

  // พูลคู่ต่อสู้ = คนจริงเรตใกล้ 4 คน + บอท 1 ตัว
  // seed รายชั่วโมง → บอทเปลี่ยนทุก 1 ชม. ไม่สุ่มใหม่ทุก render
  const opponents = computed(() => {
    const flat = [...Object.values(members.fbUsers || {}), ...(members.guestUsers || [])]
    const humans = pickHumanOpponents(auth.currentUser?.uid, rating.value, flat, 4)
    const bot = getPvpBot(rating.value, Math.floor(Date.now() / 3600000))
    return [...humans, bot]
  })

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
    }
    const today = todayStr()
    const usedBefore = auth.userData?.pvpAttackDate === today
      ? (auth.userData?.pvpAttacksUsed || 0)
      : 0
    // เหรียญ: ชนะคนจริง = PVP_WIN_COIN, ชนะบอท = PVP_BOT_COIN, แพ้ = 0
    const coin = won ? (opp.isBot ? PVP_BOT_COIN : PVP_WIN_COIN) : 0
    await auth.patchUser(
      {
        pvp: nextPvp, pvpAttackDate: today, pvpAttacksUsed: usedBefore + 1,
        ...(coin ? { coins: (auth.userData?.coins || 0) + coin } : {}),
      },
      {
        pvp: nextPvp, pvpAttackDate: today, pvpAttacksUsed: usedBefore + 1,
        ...(coin ? { coins: increment(coin) } : {}),
      },
    )
    return { newRating, delta: newRating - base.rating, coin }
  }

  // บุก: ตรวจสอบโควต้า+ทีม → จำลองการสู้ → เขียนผล → คืน replayData
  async function fight(opp) {
    if (attacksLeft.value <= 0) {
      toast('โควต้าโจมตีวันนี้หมดแล้ว พรุ่งนี้มาใหม่นะ', 'info')
      return null
    }
    if (!myTeam.value.length) {
      toast('จัดทีมก่อนนะ (อย่างน้อย 1 ตัว)', 'info')
      return null
    }
    // บอทมีทีมในตัว; คนจริงต้อง resolve จาก activePets+pets
    const oppTeam = opp.isBot
      ? opp.team
      : resolveBattleTeam(opp.activePets, opp.pets)
    if (!oppTeam.length) {
      toast('คู่ต่อสู้ยังไม่ได้จัดทีม', 'info')
      return null
    }
    const result = simulateBattle(myTeam.value, oppTeam, Date.now())
    const won = result.winner === 'A'
    const { delta, coin } = await applyResult(opp, won)
    const name = opp.isBot ? 'หุ่นซ้อม' : (opp.nickname || 'คู่ต่อสู้')
    const sign = delta >= 0 ? '+' : ''
    return {
      result, playerTeam: myTeam.value, botTeam: oppTeam, won, opp,
      vsLabel: `VS ${name}`,
      winText: `ชนะ! ${sign}${delta} แต้มประลอง`,
      loseText: `แพ้ ${delta} แต้มประลอง`,
      rewardText: coin ? `ได้รับ: ${coin.toLocaleString()} เหรียญ` : '',
    }
  }

  return { rating, wins, losses, attacksLeft, myTeam, opponents, fight }
}
