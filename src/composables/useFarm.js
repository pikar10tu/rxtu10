import { computed } from 'vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { residencePlots } from '../data/residence.js'
import {
  getCrop, cropsForLevel, nextUnlock, growMs,
} from '../data/crops.js'
import { nextPlotInfo, MAX_PLOTS } from '../data/farmPlots.js'
import { rollGold, goldPrice } from '../data/farmMastery.js'
import { bumpDailyQuest } from '../utils/dailyQuest.js'
import { sfx } from '../utils/sfx.js'

/**
 * Farming logic bound to the logged-in user.
 *   farm = { plots: [ null | {seedId, plantedAt, watered, fertilized} ], inventory: {cropId:qty} }
 * Plot count is derived from residence level. Plot actions write the whole
 * plots array (Firestore can't patch an array index) + coins via increment.
 */
export function useFarm() {
  const auth = useAuthStore()
  const { toast } = useToast()

  const level     = computed(() => auth.userData?.residence?.level || 1)
  // เพดานตามเลเวลบ้าน (เดิม = จำนวนแปลงจริง → เปลี่ยนเป็น "เพดานสูงสุดที่ปลดได้")
  const ceiling   = computed(() => residencePlots(level.value))
  // แปลงที่ปลดแล้ว (เริ่ม 1) clamp 1..MAX_PLOTS
  const plotsUnlocked = computed(() => {
    const raw = Math.floor(Number(auth.userData?.farm?.plotsUnlocked))
    return Math.max(1, Math.min(Number.isFinite(raw) ? raw : 1, MAX_PLOTS))
  })
  // แปลงที่เห็น/ปลูกได้จริง = min(ปลดแล้ว, เพดานบ้าน)
  // กัน edge case: admin ลดเลเวลบ้าน → เพดานต่ำกว่าที่ปลด → ซ่อนแปลงส่วนเกิน
  // (⚠️ พืชในแปลงที่ถูกซ่อนจะถูกตัดทิ้งเมื่อทำ action ฟาร์มครั้งถัดไป — commit เขียนทับทั้ง array)
  const plotCount = computed(() => Math.min(plotsUnlocked.value, ceiling.value))
  // สถานะปลดแปลงถัดไป (pure logic จาก farmPlots)
  const nextPlot  = computed(() => nextPlotInfo({
    plotsUnlocked: plotsUnlocked.value,
    ceiling: ceiling.value,
    coins: auth.userData?.coins || 0,
  }))

  const inventory = computed(() => auth.userData?.farm?.inventory || {})
  // ดาว+พืชทอง (data/farmMastery.js) — harvests = จำนวนครั้งที่เก็บต่อพืช · gold = คลังพืชทอง · goldFound = เคยได้ทองแล้ว
  const harvests  = computed(() => auth.userData?.farm?.harvests || {})
  const gold      = computed(() => auth.userData?.farm?.gold || {})
  const goldFound = computed(() => auth.userData?.farm?.goldFound || {})

  // normalized plots array of length plotCount (null = empty)
  const plots = computed(() => {
    const raw = auth.userData?.farm?.plots || []
    return Array.from({ length: plotCount.value }, (_, i) => raw[i] || null)
  })

  const seedChoices  = computed(() => cropsForLevel(level.value))
  const upcomingSeed = computed(() => nextUnlock(level.value))

  // ── plot status (pass a live `now` ms for reactivity) ──
  function status(plot, now) {
    if (!plot) return { empty: true }
    const crop = getCrop(plot.seedId)
    const total = growMs(plot.seedId)
    const elapsed = now - (plot.plantedAt || now)
    const ready = elapsed >= total
    const progress = Math.max(0, Math.min(1, total ? elapsed / total : 1))
    const remainingMs = Math.max(0, total - elapsed)
    return { empty: false, crop, ready, progress, remainingMs }
  }

  // ── persistence helper: optimistic + Firestore ──
  // extra = ฟิลด์อื่นใต้ farm ที่เขียนทั้งก้อน (harvests / gold / goldFound)
  async function commit(newPlots, { coinDelta = 0, inventory: newInv, salesGain = 0, dailyQuest = null, extra = null } = {}) {
    const farm = { ...(auth.userData?.farm || {}), plots: newPlots }
    if (newInv) farm.inventory = newInv
    if (extra) Object.assign(farm, extra)
    const optimistic = { farm, ...(coinDelta ? { coins: (auth.userData?.coins || 0) + coinDelta } : {}) }
    if (salesGain) optimistic.farmSalesTotal = (auth.userData?.farmSalesTotal || 0) + salesGain
    if (dailyQuest) optimistic.dailyQuest = dailyQuest
    const patch = { 'farm.plots': newPlots }
    if (newInv) patch['farm.inventory'] = newInv
    if (extra) for (const [k, v] of Object.entries(extra)) patch['farm.' + k] = v
    if (coinDelta) patch.coins = increment(coinDelta)
    if (salesGain) patch.farmSalesTotal = increment(salesGain)
    if (dailyQuest) patch.dailyQuest = dailyQuest
    const ok = await auth.patchUser(optimistic, patch)
    if (!ok) toast('บันทึกฟาร์มไม่สำเร็จ', 'error')
  }

  function clonePlots() { return plots.value.map(p => (p ? { ...p } : null)) }

  async function plant(i, seedId) {
    const crop = getCrop(seedId)
    if (!crop) return
    if (plots.value[i]) { toast('แปลงนี้มีพืชอยู่แล้ว', 'info'); return }
    if ((auth.userData?.coins || 0) < crop.seedCost) {
      toast(`เหรียญไม่พอ! เมล็ด ${crop.name} ราคา ${crop.seedCost} เหรียญ`, 'error'); return
    }
    const next = clonePlots()
    next[i] = { seedId, plantedAt: Date.now() }
    // นับเข้าเควสรายวัน "ปลูกพืช" (นับตอนปลูก 1 แปลง = +1)
    const today = new Date().toISOString().slice(0, 10)
    const dq = bumpDailyQuest(auth.userData?.dailyQuest, 'farm', today, 1)
    await commit(next, { coinDelta: -crop.seedCost, dailyQuest: dq })
    sfx('plant')
    toast(`ปลูก ${crop.name} แล้ว`, 'success')
  }

  // onCollected({ gold }) ถูกเรียกทันทีที่รู้ผล ก่อนรอ Firestore — ให้จอยิงของลอยได้ไม่ดีเลย์
  async function harvest(i, onCollected) {
    const p = plots.value[i]
    if (!p) return
    const st = status(p, Date.now())
    if (!st.ready) { toast('ยังโตไม่เต็มที่', 'info'); return }
    const next = clonePlots()
    next[i] = null
    const inv = { ...inventory.value }
    const bag = newHarvestBag()
    const isGold = collect(p.seedId, inv, bag)
    onCollected?.({ gold: isGold })
    await commit(next, { inventory: inv, extra: bag.extra() })
    sfx('harvest')
    if (isGold) toast(`✨ ได้${st.crop.name}ทอง! ขายได้ราคา ×3`, 'success')
    else toast(`เก็บเกี่ยว ${st.crop.name}!`, 'success')
    return { gold: isGold }
  }

  // ถุงรวมการเก็บในรอบเดียว — ก๊อป map ครั้งเดียว แล้วเขียนทีเดียวใน commit
  function newHarvestBag() {
    const h = { ...harvests.value }, g = { ...gold.value }, f = { ...goldFound.value }
    let goldHit = false
    return {
      h, g, f,
      markGold() { goldHit = true },
      extra() { return goldHit ? { harvests: h, gold: g, goldFound: f } : { harvests: h } },
    }
  }
  // เก็บ 1 ผล: สุ่มทองจากดาว "ก่อน" เก็บครั้งนี้ แล้วนับครั้ง · คืน true ถ้าได้ทอง (ทองไม่เข้า inventory ปกติ)
  function collect(seedId, inv, bag) {
    const before = bag.h[seedId] || 0
    const isGold = rollGold(before)
    bag.h[seedId] = before + 1
    if (isGold) {
      bag.g[seedId] = (bag.g[seedId] || 0) + 1
      bag.f[seedId] = true
      bag.markGold()
    } else {
      inv[seedId] = (inv[seedId] || 0) + 1
    }
    return isGold
  }

  // เก็บทุกแปลงที่พร้อมใน write เดียว (roadmap #6)
  // คืน { n, golds } — n = จำนวนที่เก็บ (0 = ไม่มีแปลงพร้อม) · golds = index แปลงที่ออกทอง
  async function harvestAll(onCollected) {
    const now = Date.now()
    const next = clonePlots()
    const inv = { ...inventory.value }
    const bag = newHarvestBag()
    const golds = []
    let n = 0
    next.forEach((p, i) => {
      if (!p || !status(p, now).ready) return
      if (collect(p.seedId, inv, bag)) golds.push(i)
      next[i] = null
      n++
    })
    if (!n) { toast('ยังไม่มีแปลงที่พร้อมเก็บ', 'info'); return { n: 0, golds } }
    onCollected?.({ n, golds })
    await commit(next, { inventory: inv, extra: bag.extra() })
    sfx('harvest')
    toast(golds.length ? `เก็บเกี่ยวทั้งหมด ${n} แปลง · ✨ ได้พืชทอง ${golds.length} ผล!` : `เก็บเกี่ยวทั้งหมด ${n} แปลง!`, 'success')
    return { n, golds }
  }

  async function sell(cropId, qty = null) {
    const have = inventory.value[cropId] || 0
    const n = qty == null ? have : Math.min(qty, have)
    if (n <= 0) return
    const crop = getCrop(cropId)
    const gain = crop.sellPrice * n
    const inv = { ...inventory.value }
    inv[cropId] = have - n
    if (inv[cropId] <= 0) delete inv[cropId]
    await commit(clonePlots(), { coinDelta: gain, inventory: inv, salesGain: gain })
    toast(`ขาย ${crop.name} ×${n} = +${gain.toLocaleString()} เหรียญ`, 'success')
  }

  // ขายพืชทอง (ราคา ×3) · qty ว่าง = ทั้งกอง
  async function sellGold(cropId, qty = null) {
    const have = gold.value[cropId] || 0
    const n = qty == null ? have : Math.min(qty, have)
    if (n <= 0) return
    const crop = getCrop(cropId)
    const gain = goldPrice(crop) * n
    const g = { ...gold.value }
    g[cropId] = have - n
    if (g[cropId] <= 0) delete g[cropId]
    await commit(clonePlots(), { coinDelta: gain, salesGain: gain, extra: { gold: g } })
    toast(`ขาย ${crop.name}ทอง ×${n} = +${gain.toLocaleString()} เหรียญ`, 'success')
  }

  async function sellAll() {
    const inv = inventory.value
    let gain = 0
    for (const [id, qty] of Object.entries(inv)) {
      const c = getCrop(id); if (c) gain += c.sellPrice * qty
    }
    for (const [id, qty] of Object.entries(gold.value)) {
      const c = getCrop(id); if (c) gain += goldPrice(c) * qty
    }
    if (gain <= 0) { toast('ไม่มีผลผลิตให้ขาย', 'info'); return }
    await commit(clonePlots(), { coinDelta: gain, inventory: {}, salesGain: gain, extra: { gold: {} } })
    toast(`ขายทั้งหมด +${gain.toLocaleString()} เหรียญ`, 'success')
  }

  async function unlockPlot() {
    const info = nextPlot.value
    if (info.reason === 'maxed')    { toast('ปลดครบทุกแปลงแล้ว', 'info'); return }
    if (info.reason === 'atCeiling'){ toast('อัปเลเวลบ้านเพื่อปลดแปลงเพิ่ม', 'info'); return }
    if (info.reason === 'notEnoughCoins') {
      toast(`เหรียญไม่พอ! ปลดแปลงราคา ${info.cost.toLocaleString()} เหรียญ`, 'error'); return
    }
    const newUnlocked = plotsUnlocked.value + 1
    const optimistic = {
      farm: { ...(auth.userData?.farm || {}), plotsUnlocked: newUnlocked },
      coins: (auth.userData?.coins || 0) - info.cost,
    }
    const patch = { 'farm.plotsUnlocked': newUnlocked, coins: increment(-info.cost) }
    const ok = await auth.patchUser(optimistic, patch)
    if (ok) toast(`ปลดแปลงที่ ${newUnlocked} แล้ว!`, 'success')
    else toast('ปลดแปลงไม่สำเร็จ', 'error')
  }

  return {
    level, ceiling, plotsUnlocked, plotCount, nextPlot,
    plots, inventory, harvests, gold, goldFound, seedChoices, upcomingSeed,
    status,
    plant, harvest, harvestAll, sell, sellGold, sellAll, unlockPlot,
  }
}
