import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { useRosterSync } from './useRosterSync.js'
import { useNewsPost } from './useNewsPost.js'
import { simulateBattle } from '../utils/battleEngine.js'
import { getFloorTeam, getTowerBonus, TOWER_MAX } from '../data/towerFloors.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import { doc, setDoc, getDoc, increment, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { computeBattleStats } from '../utils/battleStats.js'
import { useUsageStore } from '../stores/usage.js'
import { claimableMilestones, sumRewards, milestonesOpen } from '../data/towerMilestones.js'
import { currentSeasonId } from '../utils/pvpSeason.js'
import { ANTI_LOSS } from '../utils/antiLoss.js'

export function useTower() {
  const auth = useAuthStore()
  const { toast } = useToast()
  const { syncRosterRow } = useRosterSync()
  const { postNews, myName } = useNewsPost()

  const floor = computed(() => auth.userData?.towerFloor || 1)
  const best  = computed(() => auth.userData?.towerBest || 0)
  const team  = computed(() => resolveBattleTeam(auth.userData?.activePets, auth.userData?.pets))
  const botTeam = computed(() => getFloorTeam(floor.value))
  const bonus = computed(() => getTowerBonus(best.value))

  // best-effort: เขียนสถิติราย species (increment-only) — fail เงียบ ไม่ขวางการเล่น
  async function recordStats(result, playerTeam, won) {
    try {
      const stats = computeBattleStats(result.log, playerTeam, won)
      const ids = Object.keys(stats)
      if (!ids.length) return
      const batch = writeBatch(db)
      for (const id of ids) {
        const s = stats[id]
        batch.set(doc(db, 'battleStats', id), {
          battles: increment(s.battles), wins: increment(s.wins),
          kills: increment(s.kills), deaths: increment(s.deaths),
          dmgDealt: increment(s.dmgDealt), dmgTaken: increment(s.dmgTaken),
        }, { merge: true })
      }
      await batch.commit()
      useUsageStore().track(0, ids.length)
    } catch (e) { console.error('[battleStats]', e) }
  }

  async function fight() {
    if (!team.value.length) { toast('จัดทีมก่อนนะ (อย่างน้อย 1 ตัว)', 'info'); return null }
    const cleared = floor.value
    // ⚠️ ต้องหยิบทีมบอทออกมาเก็บไว้ "ก่อน" patchUser — botTeam เป็น computed ที่ผูกกับ floor
    //    ซึ่ง patchUser อัปเดต optimistic แบบ synchronous ⇒ อ่าน botTeam.value อีกทีตอน return
    //    จะได้ทีมของ "ชั้นถัดไป" ไม่ใช่ชั้นที่เพิ่งสู้
    //    อาการ: ชนะชั้น 1 (บอท 1 ตัว) แล้วจอ replay วาดการ์ดศัตรู 2 ใบของชั้น 2 ทั้งที่ log มีแค่ B0
    //    → ตี B0 ตาย log จบทันที = "ศัตรูมีสองตัว ตีตายตัวเดียวเกมจบเลย" (เจอจริง 24 ส.ค.)
    //    ชั้นสูงกว่านั้นจำนวนเท่ากันเลยไม่สะดุดตา แต่สปีชีส์/ธาตุ/maxHp ที่วาดก็ผิดตัวเหมือนกัน
    //    (หลอดเลือดหดผิดสัดส่วน เพราะ maxHp มาจากเพ็ทคนละตัวกับที่ engine คำนวณ)
    const bots = botTeam.value
    const seed = Date.now()
    const result = simulateBattle(team.value, bots, seed)
    const won = result.winner === 'A'
    await recordStats(result, team.value, won)
    if (won) {
      const nextFloor = Math.min(TOWER_MAX, cleared + 1)
      const nextBest = Math.max(best.value, cleared)
      await auth.patchUser(
        { towerFloor: nextFloor, towerBest: nextBest },
        { towerFloor: nextFloor, towerBest: nextBest },
      )
      // ข่าวกระดาน: ชั้นลงท้าย 0 เข้าเลน roster · ชั้นสุดท้ายไปเลน news (อยู่ยาว) และไม่ยิงซ้ำ
      // ⚠️ ใช้ `cleared` ที่หยิบไว้ก่อน patchUser — floor.value ตอนนี้เป็นชั้นถัดไปแล้ว (CLAUDE.md ข้อ 9)
      const topFloor = cleared === TOWER_MAX
      syncRosterRow({ event: (!topFloor && cleared % 10 === 0) ? { k: 'tw', v: cleared, t: Date.now() } : null })
      if (topFloor) postNews({ type: 'tower100', icon: '🏰', msg: `${myName()} พิชิตหอคอยชั้น ${TOWER_MAX} สำเร็จ` })
    }
    return { result, botTeam: bots, playerTeam: team.value, won, cleared }
  }

  // รางวัลขั้น (ทุก 10 ชั้น) — รับทุกขั้นที่ถึงแล้วในครั้งเดียว · towerClaims ถูกล้างตอนแอดมินรีเซตหอคอย
  // เปิดเมื่อแอดมินแจก+รีเซตซีซั่นก่อนแล้ว (config/seasonPayouts · 1 read ต่อการเปิดหน้า)
  const msOpen = ref(false)
  async function loadMsOpen() {
    try {
      const snap = await getDoc(doc(db, 'config', 'seasonPayouts'))
      useUsageStore().track(1)
      msOpen.value = milestonesOpen(currentSeasonId(), snap.data() || null)
    } catch (e) { console.error('[tower ms]', e) }
  }
  const claims = computed(() => auth.userData?.towerClaims || [])
  const claimable = computed(() => msOpen.value ? claimableMilestones(best.value, claims.value) : [])
  async function claimMilestones() {
    await loadMsOpen()   // เช็คสดตอนกด
    const list = claimable.value
    if (!list.length) return false
    const r = sumRewards(list)
    const u = auth.userData || {}
    const nextClaims = [...claims.value, ...list.map(m => m.f)].sort((a, b) => a - b)
    const ok = await auth.patchUser(
      {
        towerClaims: nextClaims,
        ...(r.coins ? { coins: (u.coins || 0) + r.coins } : {}),
        ...(r.tickets ? { freeGachaTickets: (u.freeGachaTickets || 0) + r.tickets } : {}),
        ...(r.antiLoss ? { antiLoss: (u.antiLoss || 0) + r.antiLoss } : {}),
      },
      {
        towerClaims: nextClaims,
        ...(r.coins ? { coins: increment(r.coins) } : {}),
        ...(r.tickets ? { freeGachaTickets: increment(r.tickets) } : {}),
        ...(r.antiLoss ? { antiLoss: increment(r.antiLoss) } : {}),
      },
    )
    const parts = [r.coins && `🪙 ${r.coins.toLocaleString()}`, r.tickets && `🎟️ ×${r.tickets}`, r.antiLoss && `${ANTI_LOSS.emoji} ×${r.antiLoss}`].filter(Boolean)
    toast(ok ? `รับรางวัลขั้นแล้ว ${parts.join(' · ')}` : 'รับรางวัลไม่สำเร็จ', ok ? 'success' : 'error')
    return ok
  }

  return { floor, best, team, botTeam, bonus, fight, TOWER_MAX, claims, claimable, claimMilestones, msOpen, loadMsOpen }
}
