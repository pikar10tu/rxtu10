import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { useRosterSync } from './useRosterSync.js'
import { useNewsPost } from './useNewsPost.js'
import { simulateBattle } from '../utils/battleEngine.js'
import { getFloorTeam, getTowerBonus, TOWER_MAX, AUTO_CLIMB_MAX, towerNewsFloor } from '../data/towerFloors.js'
import { resolveBattleTeam } from '../utils/petTeam.js'
import { doc, setDoc, getDoc, increment, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { computeBattleStats } from '../utils/battleStats.js'
import { useUsageStore } from '../stores/usage.js'
import { claimableMilestones, sumRewards, milestonesOpen } from '../data/towerMilestones.js'
import { currentSeasonId } from '../utils/pvpSeason.js'
import { ANTI_LOSS } from '../utils/antiLoss.js'
import { ENERGY_TICKET } from '../utils/pvpEnergy.js'

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
  // ไต่รวดรวมทุกไฟต์เป็น batch เดียว (statsList = ผล computeBattleStats หลายไฟต์)
  async function recordStats(statsList) {
    try {
      const sum = {}
      for (const st of statsList) for (const [id, s] of Object.entries(st)) {
        const t = (sum[id] ||= { battles: 0, wins: 0, kills: 0, deaths: 0, dmgDealt: 0, dmgTaken: 0 })
        for (const k in t) t[k] += s[k] || 0
      }
      const ids = Object.keys(sum)
      if (!ids.length) return
      const batch = writeBatch(db)
      for (const id of ids) {
        const s = sum[id]
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

  /** สู้ชั้นปัจจุบัน 1 ไฟต์ — ซิมอย่างเดียว ยังไม่บันทึก
   *  🔒 ผลนับต่อเมื่อดูรีเพลย์จบถึงหน้าสรุป แล้ว TowerView เรียก `commit()` (user สั่ง 17 ต.ค. 2026)
   *     กดออก/ปิดแอประหว่างรีเพลย์ = ไม่นับ ⇒ ใช้ปุ่มออกข้ามรีเพลย์เพื่อเก็บชัยชนะไม่ได้ · แพ้ไม่มีอะไรให้บันทึกอยู่แล้ว */
  function fight() {
    if (!team.value.length) { toast('จัดทีมก่อนนะ (อย่างน้อย 1 ตัว)', 'info'); return null }
    // ⚠️ หยิบทุกอย่างที่ผูกกับ floor/best ไว้ตอนนี้ — patchUser ใน commit อัปเดต optimistic แบบ synchronous
    //    (บั๊กจริง 24 ส.ค.: อ่าน botTeam ทีหลังได้ทีมชั้นถัดไป จอ replay วาดศัตรูผิดตัว · CLAUDE.md ข้อ 9)
    const cleared = floor.value
    const players = team.value
    const bots = botTeam.value
    const result = simulateBattle(players, bots, Date.now())
    const won = result.winner === 'A'
    let committed = false
    async function commit() {
      if (committed) return
      committed = true
      let stats = null
      try { stats = computeBattleStats(result.log, players, won) } catch (e) { console.error('[battleStats]', e) }
      if (stats) await recordStats([stats])
      if (!won) return
      // อ่าน best สด ณ ตอน commit (กันแท็บอื่น/รีเซตระหว่างดู) · floor ต้องยังเป็นชั้นที่สู้ ไม่งั้นข้าม (กดซ้ำ/สองแท็บ)
      if (floor.value !== cleared) return
      const prevBest = best.value
      const nextFloor = cleared + 1                 // Endless — ไม่ตันที่ TOWER_MAX
      const nextBest = Math.max(prevBest, cleared)
      // 🪨 ศิลาจารึก: ยอดสูงสุดต่อซีซั่นที่เกิน 100 → users.towerRecords[season] (รีเซตซีซั่นไม่แตะ · roster พ่วงเป็น th)
      const season = currentSeasonId()
      const recs = auth.userData?.towerRecords || {}
      const newRec = cleared > TOWER_MAX && cleared > (recs[season] || 0)
      // ข่าวชั้น 100 ซ้ำ (เห็นในแอดมิน 25 ต.ค. 2026: คนเดียวขึ้น 10 ครั้งใน 2 สัปดาห์) ⇒ ล็อกด้วย t100 = ซีซั่นที่โพสต์แล้ว
      const post100 = prevBest < TOWER_MAX && nextBest >= TOWER_MAX && auth.userData?.t100 !== season
      await auth.patchUser(
        { towerFloor: nextFloor, towerBest: nextBest, ...(newRec ? { towerRecords: { ...recs, [season]: cleared } } : {}), ...(post100 ? { t100: season } : {}) },
        { towerFloor: nextFloor, towerBest: nextBest, ...(newRec ? { [`towerRecords.${season}`]: cleared } : {}), ...(post100 ? { t100: season } : {}) },
      )
      // ข่าวกระดาน: เฉพาะสถิติใหม่ข้ามหมุด (towerNewsFloor) · ชั้น 100 ไปเลน news (อยู่ยาว) ครั้งแรกของซีซั่นเท่านั้น
      const nf = towerNewsFloor(prevBest, nextBest)
      syncRosterRow({ event: (nf && nf !== TOWER_MAX) ? { k: 'tw', v: nf, t: Date.now() } : null })
      if (post100) postNews({ type: 'tower100', icon: '🏰', msg: `${myName()} พิชิตหอคอยชั้น ${TOWER_MAX} สำเร็จ` })
    }
    return { result, botTeam: bots, playerTeam: players, won, cleared, commit }
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
        ...(r.energy ? { [ENERGY_TICKET.field]: (u[ENERGY_TICKET.field] || 0) + r.energy } : {}),
      },
      {
        towerClaims: nextClaims,
        ...(r.coins ? { coins: increment(r.coins) } : {}),
        ...(r.tickets ? { freeGachaTickets: increment(r.tickets) } : {}),
        ...(r.antiLoss ? { antiLoss: increment(r.antiLoss) } : {}),
        ...(r.energy ? { [ENERGY_TICKET.field]: increment(r.energy) } : {}),
      },
    )
    const parts = [r.coins && `🪙 ${r.coins.toLocaleString()}`, r.tickets && `🎟️ ×${r.tickets}`, r.antiLoss && `${ANTI_LOSS.emoji} ×${r.antiLoss}`, r.energy && `${ENERGY_TICKET.emoji} ×${r.energy}`].filter(Boolean)
    toast(ok ? `รับรางวัลขั้นแล้ว ${parts.join(' · ')}` : 'รับรางวัลไม่สำเร็จ', ok ? 'success' : 'error')
    return ok
  }

  return { floor, best, team, botTeam, bonus, fight, TOWER_MAX, AUTO_CLIMB_MAX, claims, claimable, claimMilestones, msOpen, loadMsOpen }
}
