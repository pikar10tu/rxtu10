import { computed } from 'vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { residencePlots } from '../data/residence.js'
import {
  getCrop, cropsForLevel, nextUnlock, growMs,
} from '../data/crops.js'

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
  const plotCount = computed(() => residencePlots(level.value))

  const inventory = computed(() => auth.userData?.farm?.inventory || {})

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
  async function commit(newPlots, { coinDelta = 0, inventory: newInv, salesGain = 0 } = {}) {
    const farm = { ...(auth.userData?.farm || {}), plots: newPlots }
    if (newInv) farm.inventory = newInv
    const optimistic = { farm, ...(coinDelta ? { coins: (auth.userData?.coins || 0) + coinDelta } : {}) }
    if (salesGain) optimistic.farmSalesTotal = (auth.userData?.farmSalesTotal || 0) + salesGain
    const patch = { 'farm.plots': newPlots }
    if (newInv) patch['farm.inventory'] = newInv
    if (coinDelta) patch.coins = increment(coinDelta)
    if (salesGain) patch.farmSalesTotal = increment(salesGain)
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
    await commit(next, { coinDelta: -crop.seedCost })
    toast(`ปลูก ${crop.name} แล้ว`, 'success')
  }

  async function harvest(i) {
    const p = plots.value[i]
    if (!p) return
    const st = status(p, Date.now())
    if (!st.ready) { toast('ยังโตไม่เต็มที่', 'info'); return }
    const next = clonePlots()
    next[i] = null
    const inv = { ...inventory.value }
    inv[p.seedId] = (inv[p.seedId] || 0) + 1
    await commit(next, { inventory: inv })
    toast(`เก็บเกี่ยว ${st.crop.name}!`, 'success')
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

  async function sellAll() {
    const inv = inventory.value
    let gain = 0
    for (const [id, qty] of Object.entries(inv)) {
      const c = getCrop(id); if (c) gain += c.sellPrice * qty
    }
    if (gain <= 0) { toast('ไม่มีผลผลิตให้ขาย', 'info'); return }
    await commit(clonePlots(), { coinDelta: gain, inventory: {}, salesGain: gain })
    toast(`ขายทั้งหมด +${gain.toLocaleString()} เหรียญ`, 'success')
  }

  return {
    level, plotCount, plots, inventory, seedChoices, upcomingSeed,
    status,
    plant, harvest, sell, sellAll,
  }
}
